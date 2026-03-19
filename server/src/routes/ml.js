import { Router } from "express";
import { buildAnalyticsSnapshot } from "../services/analyticsSnapshot.js";

export function createMlRouter({ store, onnxService }) {
  const router = Router();
  const buildSnapshot = () =>
    store.getOrBuildSnapshot((records) => buildAnalyticsSnapshot(records, onnxService, store.getDamagedProducts()));

  router.get("/forecast", async (_req, res, next) => {
    try {
      const snapshot = await buildSnapshot();
      res.json(snapshot.forecast);
    } catch (error) {
      next(error);
    }
  });

  router.get("/trends", async (_req, res, next) => {
    try {
      const snapshot = await buildSnapshot();
      res.json(snapshot.trends);
    } catch (error) {
      next(error);
    }
  });

  router.get("/recommendations", async (_req, res, next) => {
    try {
      const snapshot = await buildSnapshot();
      res.json(snapshot.recommendations);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
