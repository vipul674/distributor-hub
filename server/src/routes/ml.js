import { Router } from "express";
import { SalesRecord } from "../models/SalesRecord.js";
import { buildAnalyticsSnapshot } from "../services/analyticsSnapshot.js";
import { requireAuth } from "../middleware/auth.js";

export function createMlRouter({ store, onnxService, dbEnabled }) {
  const router = Router();
  router.use(requireAuth);

  const buildSnapshot = async (userId) => {
    if (dbEnabled) {
      const records = await SalesRecord.find({ userId }).lean();
      return buildAnalyticsSnapshot(records, onnxService, store.getDamagedProducts(userId));
    }

    return store.getOrBuildSnapshot((records) => buildAnalyticsSnapshot(records, onnxService, store.getDamagedProducts(userId)), userId);
  };

  router.get("/forecast", async (req, res, next) => {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: "Missing user identity" });
        return;
      }
      const snapshot = await buildSnapshot(userId);
      res.json(snapshot.forecast);
    } catch (error) {
      next(error);
    }
  });

  router.get("/trends", async (req, res, next) => {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: "Missing user identity" });
        return;
      }
      const snapshot = await buildSnapshot(userId);
      res.json(snapshot.trends);
    } catch (error) {
      next(error);
    }
  });

  router.get("/recommendations", async (req, res, next) => {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: "Missing user identity" });
        return;
      }
      const snapshot = await buildSnapshot(userId);
      res.json(snapshot.recommendations);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
