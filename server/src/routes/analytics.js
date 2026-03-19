import { Router } from "express";
import { Product } from "../models/Product.js";
import { buildDamagedProductsFromCatalog, mergeDamagedProducts } from "../services/damagedProducts.js";
import { buildAnalyticsSnapshot } from "../services/analyticsSnapshot.js";

export function createAnalyticsRouter({ store, onnxService, dbEnabled }) {
  const router = Router();
  const buildSnapshot = () =>
    store.getOrBuildSnapshot((records) => buildAnalyticsSnapshot(records, onnxService, store.getDamagedProducts()));
  const getDamagedProducts = async () => {
    const baseDamagedProducts = store.getDamagedProducts();
    if (!dbEnabled) {
      return baseDamagedProducts;
    }

    const manualProducts = await Product.find()
      .select({ _id: 0, __v: 0 })
      .lean();

    return mergeDamagedProducts(
      baseDamagedProducts,
      buildDamagedProductsFromCatalog(manualProducts.map((product) => ({ ...product, source: "manual" })))
    );
  };

  router.get("/dashboard/stats", async (_req, res, next) => {
    try {
      const snapshot = await buildSnapshot();
      res.json(snapshot.dashboardStats);
    } catch (error) {
      next(error);
    }
  });

  router.get("/sales/monthly", async (_req, res, next) => {
    try {
      const snapshot = await buildSnapshot();
      res.json(snapshot.monthlySales);
    } catch (error) {
      next(error);
    }
  });

  router.get("/sales/yearly", async (_req, res, next) => {
    try {
      const snapshot = await buildSnapshot();
      res.json(snapshot.yearlySales);
    } catch (error) {
      next(error);
    }
  });

  router.get("/sales/weekly", async (_req, res, next) => {
    try {
      const snapshot = await buildSnapshot();
      res.json(snapshot.weeklySales);
    } catch (error) {
      next(error);
    }
  });

  router.get("/sales/by-category", async (_req, res, next) => {
    try {
      const snapshot = await buildSnapshot();
      res.json(snapshot.salesByCategory);
    } catch (error) {
      next(error);
    }
  });

  router.get("/stock/alerts", async (_req, res, next) => {
    try {
      const snapshot = await buildSnapshot();
      res.json(snapshot.stockAlerts);
    } catch (error) {
      next(error);
    }
  });

  router.get("/stock/damaged", async (_req, res, next) => {
    try {
      res.json(await getDamagedProducts());
    } catch (error) {
      next(error);
    }
  });

  router.get("/insights/business", async (_req, res, next) => {
    try {
      const snapshot = await buildSnapshot();
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
      const snapshot = await buildSnapshot();
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
