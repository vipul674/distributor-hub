import { spawn } from "node:child_process";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const healthUrl = process.env.DEV_HEALTH_URL ?? "http://127.0.0.1:5000/health";
const healthRetryMs = Number.parseInt(process.env.DEV_HEALTH_RETRY_MS ?? "500", 10);
const healthTimeoutMs = Number.parseInt(process.env.DEV_HEALTH_TIMEOUT_MS ?? "120000", 10);

const childProcesses = new Map();
let shuttingDown = false;

function maybeExit() {
  const hasRunningChildren = [...childProcesses.values()].some((child) => child.exitCode === null);

  if (!hasRunningChildren) {
    process.exit(process.exitCode ?? 0);
  }
}

function stopChild(name, signal = "SIGINT") {
  const child = childProcesses.get(name);

  if (!child || child.exitCode !== null || child.killed) {
    return;
  }

  child.kill(signal);
}

function initiateShutdown(exitCode = 0, exitedChildName) {
  if (!shuttingDown) {
    shuttingDown = true;
    process.exitCode = exitCode;

    for (const name of childProcesses.keys()) {
      if (name !== exitedChildName) {
        stopChild(name);
      }
    }
  }

  maybeExit();
}

function handleChildExit(name, code, signal) {
  if (!shuttingDown) {
    const status = signal ? `signal ${signal}` : `code ${code ?? 0}`;
    process.stderr.write(`[dev] ${name} exited with ${status}. Stopping the other process.\n`);
    initiateShutdown(signal ? 1 : (code ?? 0), name);
    return;
  }

  maybeExit();
}

function spawnLoggedProcess(name, args) {
  const child = spawn(npmCommand, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });

  childProcesses.set(name, child);

  child.on("error", (error) => {
    process.stderr.write(`[dev] Failed to start ${name}: ${error.message}\n`);
    initiateShutdown(1);
  });

  child.on("exit", (code, signal) => {
    handleChildExit(name, code, signal);
  });

  return child;
}

async function waitForServerReady(serverProcess) {
  const deadline = Date.now() + healthTimeoutMs;

  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error("Backend exited before it became ready.");
    }

    try {
      const response = await fetch(healthUrl);

      if (response.ok) {
        return;
      }
    } catch {
      // Backend is still starting up.
    }

    await delay(healthRetryMs);
  }

  throw new Error(`Backend was not ready within ${Math.ceil(healthTimeoutMs / 1000)} seconds.`);
}

async function main() {
  const serverProcess = spawnLoggedProcess("server", ["--prefix", "server", "run", "dev"]);

  process.stdout.write(`[dev] Waiting for backend readiness at ${healthUrl}...\n`);
  await waitForServerReady(serverProcess);

  if (shuttingDown) {
    return;
  }

  process.stdout.write("[dev] Backend is ready. Starting frontend dev server.\n");
  spawnLoggedProcess("client", ["run", "client:dev"]);
}

process.on("SIGINT", () => {
  initiateShutdown(0);
});

process.on("SIGTERM", () => {
  initiateShutdown(0);
});

main().catch((error) => {
  process.stderr.write(`[dev] ${error instanceof Error ? error.message : String(error)}\n`);
  initiateShutdown(1);
});
