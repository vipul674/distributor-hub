import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { createAnalyticsRouter } from "./routes/analytics.js";
import { createAuthRouter } from "./routes/auth.js";
import { createBillsRouter } from "./routes/bills.js";
import { createMlRouter } from "./routes/ml.js";
import { createProductsRouter } from "./routes/products.js";

export function createApp({ store, onnxService, dbEnabled }) {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", dataMode: dbEnabled ? "mongo" : "memory" });
  });

  app.use("/api/auth", createAuthRouter({ store, dbEnabled }));
  app.use("/api/products", createProductsRouter({ store, dbEnabled }));
  app.use("/api/bills", createBillsRouter({ store, onnxService, dbEnabled }));
  app.use("/api/ml", createMlRouter({ store, onnxService }));
  app.use("/api", createAnalyticsRouter({ store, onnxService, dbEnabled }));

  app.use((error, _req, res, _next) => {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    res.status(500).json({ message });
  });

  return app;
}
