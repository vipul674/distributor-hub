import { Router } from "express";
import { buildAnalyticsSnapshot } from "../services/analyticsSnapshot.js";
import { OnnxService } from "../services/onnxService.js";
import { DataStore } from "../services/store.js";

interface MlRouterDeps {
  store: DataStore;
  onnxService: OnnxService;
}

export function createMlRouter({ store, onnxService }: MlRouterDeps): Router {
  const router = Router();

  router.get("/forecast", async (_req, res, next) => {
    try {
      const snapshot = await store.getOrBuildSnapshot((records) => buildAnalyticsSnapshot(records, onnxService));
      res.json(snapshot.forecast);
    } catch (error) {
      next(error);
    }
  });

  router.get("/trends", async (_req, res, next) => {
    try {
      const snapshot = await store.getOrBuildSnapshot((records) => buildAnalyticsSnapshot(records, onnxService));
      res.json(snapshot.trends);
    } catch (error) {
      next(error);
    }
  });

  router.get("/recommendations", async (_req, res, next) => {
    try {
      const snapshot = await store.getOrBuildSnapshot((records) => buildAnalyticsSnapshot(records, onnxService));
      res.json(snapshot.recommendations);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
