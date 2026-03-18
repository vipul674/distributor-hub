import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

// Prefer env/.env (requested structure), but also support server/.env
dotenv.config({ path: path.resolve(process.cwd(), "env/.env") });
dotenv.config();

function resolveModelDir() {
  const envDir = process.env.MODEL_DIR ? path.resolve(process.cwd(), process.env.MODEL_DIR) : undefined;
  const candidates = [
    envDir,
    path.resolve(process.cwd(), "Retail_Models_Onnx"),
    path.resolve(process.cwd(), "../Retail_Models_Onnx"),
    path.resolve(process.cwd(), "../../Retail_Models_Onnx"),
  ].filter(Boolean);

  const requiredModel = "demand_forecast_rf.onnx";
  const found = candidates.find((candidate) => fs.existsSync(path.join(candidate, requiredModel)));

  if (!found) {
    throw new Error(
      `Unable to resolve model directory. Checked: ${candidates.join(", ")}. Set MODEL_DIR in server/.env or server/env/.env.`
    );
  }

  return found;
}

export const config = {
  port: Number(process.env.PORT ?? 5000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:8080",
  modelDir: resolveModelDir(),
};
