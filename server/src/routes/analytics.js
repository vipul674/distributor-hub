import { Router } from "express";
import { buildAnalyticsSnapshot } from "../services/analyticsSnapshot.js";

export function createAnalyticsRouter({ store, onnxService }) {
  const router = Router();

  router.get("/dashboard/stats", async (_req, res, next) => {
    try {
      const snapshot = await store.getOrBuildSnapshot((records) => buildAnalyticsSnapshot(records, onnxService));
      res.json(snapshot.dashboardStats);
    } catch (error) {
      next(error);
    }
  });

  router.get("/sales/monthly", async (_req, res, next) => {
    try {
      const snapshot = await store.getOrBuildSnapshot((records) => buildAnalyticsSnapshot(records, onnxService));
      res.json(snapshot.monthlySales);
    } catch (error) {
      next(error);
    }
  });

  router.get("/sales/yearly", async (_req, res, next) => {
    try {
      const snapshot = await store.getOrBuildSnapshot((records) => buildAnalyticsSnapshot(records, onnxService));
      res.json(snapshot.yearlySales);
    } catch (error) {
      next(error);
    }
  });

  router.get("/sales/weekly", async (_req, res, next) => {
    try {
      const snapshot = await store.getOrBuildSnapshot((records) => buildAnalyticsSnapshot(records, onnxService));
      res.json(snapshot.weeklySales);
    } catch (error) {
      next(error);
    }
  });

  router.get("/sales/by-category", async (_req, res, next) => {
    try {
      const snapshot = await store.getOrBuildSnapshot((records) => buildAnalyticsSnapshot(records, onnxService));
      res.json(snapshot.salesByCategory);
    } catch (error) {
      next(error);
    }
  });

  router.get("/stock/alerts", async (_req, res, next) => {
    try {
      const snapshot = await store.getOrBuildSnapshot((records) => buildAnalyticsSnapshot(records, onnxService));
      res.json(snapshot.stockAlerts);
    } catch (error) {
      next(error);
    }
  });

  router.get("/stock/damaged", async (_req, res, next) => {
    try {
      const snapshot = await store.getOrBuildSnapshot((records) => buildAnalyticsSnapshot(records, onnxService));
      res.json(snapshot.damagedProducts);
    } catch (error) {
      next(error);
    }
  });

  router.get("/insights/business", async (_req, res, next) => {
    try {
      const snapshot = await store.getOrBuildSnapshot((records) => buildAnalyticsSnapshot(records, onnxService));
      res.json({
        insights: snapshot.businessInsights,
        profitMargins: snapshot.profitMargins,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/insights/recommendations", async (_req, res, next) => {
    try {
      const snapshot = await store.getOrBuildSnapshot((records) => buildAnalyticsSnapshot(records, onnxService));
      res.json({
        predictions: snapshot.demandPredictions,
        recommendations: snapshot.topRecommendations,
        suggestions: snapshot.businessExpansionSuggestions,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
