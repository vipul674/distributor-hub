import { Router } from "express";
import { buildAnalyticsSnapshot } from "../services/analyticsSnapshot.js";

export function createMlRouter({ store, onnxService }) {
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
