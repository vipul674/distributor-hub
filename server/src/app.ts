import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { createAnalyticsRouter } from "./routes/analytics.js";
import { createBillsRouter } from "./routes/bills.js";
import { createMlRouter } from "./routes/ml.js";
import { OnnxService } from "./services/onnxService.js";
import { DataStore } from "./services/store.js";

interface CreateAppOptions {
  store: DataStore;
  onnxService: OnnxService;
}

export function createApp({ store, onnxService }: CreateAppOptions) {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/bills", createBillsRouter({ store, onnxService }));
  app.use("/api/ml", createMlRouter({ store, onnxService }));
  app.use("/api", createAnalyticsRouter({ store, onnxService }));

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    res.status(500).json({ message });
  });

  return app;
}
