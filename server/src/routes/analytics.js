import { Router } from "express";
import { Product } from "../models/Product.js";
import { buildDamagedProductsFromCatalog, mergeDamagedProducts } from "../services/damagedProducts.js";
import { buildAnalyticsSnapshot } from "../services/analyticsSnapshot.js";
import { SalesRecord } from "../models/SalesRecord.js";
import { requireAuth } from "../middleware/auth.js";

export function createAnalyticsRouter({ store, onnxService, dbEnabled }) {
  const router = Router();
  router.use(requireAuth);

  const getDamagedProducts = async (userId) => {
    const baseDamagedProducts = store.getDamagedProducts(userId);
    if (!dbEnabled) {
      return baseDamagedProducts;
    }

    const manualProducts = await Product.find().select({ _id: 0, __v: 0 }).lean();

    return mergeDamagedProducts(
      baseDamagedProducts,
      buildDamagedProductsFromCatalog(manualProducts.map((product) => ({ ...product, source: "manual" })))
    );
  };

  const buildSnapshot = async (userId) => {
    if (dbEnabled) {
      const records = await SalesRecord.find({ userId }).lean();
      return buildAnalyticsSnapshot(records, onnxService, await getDamagedProducts(userId));
    }

    return store.getOrBuildSnapshot(
      (records) => buildAnalyticsSnapshot(records, onnxService, store.getDamagedProducts(userId)),
      userId
    );
  };

  const requireSnapshot = async (req, res, next, callback) => {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: "Missing user identity" });
        return;
      }

      const snapshot = await buildSnapshot(userId);
      callback(snapshot);
    } catch (error) {
      next(error);
    }
  };

  router.get("/dashboard/stats", async (req, res, next) => {
    await requireSnapshot(req, res, next, (snapshot) => {
      res.json(snapshot.dashboardStats);
    });
  });

  router.get("/sales/monthly", async (req, res, next) => {
    await requireSnapshot(req, res, next, (snapshot) => {
      res.json(snapshot.monthlySales);
    });
  });

  router.get("/sales/yearly", async (req, res, next) => {
    await requireSnapshot(req, res, next, (snapshot) => {
      res.json(snapshot.yearlySales);
    });
  });

  router.get("/sales/weekly", async (req, res, next) => {
    await requireSnapshot(req, res, next, (snapshot) => {
      res.json(snapshot.weeklySales);
    });
  });

  router.get("/sales/by-category", async (req, res, next) => {
    await requireSnapshot(req, res, next, (snapshot) => {
      res.json(snapshot.salesByCategory);
    });
  });

  router.get("/stock/alerts", async (req, res, next) => {
    await requireSnapshot(req, res, next, (snapshot) => {
      res.json(snapshot.stockAlerts);
    });
  });

  router.get("/stock/damaged", async (req, res, next) => {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: "Missing user identity" });
        return;
      }
      res.json(await getDamagedProducts(userId));
    } catch (error) {
      next(error);
    }
  });

  router.get("/insights/business", async (req, res, next) => {
    await requireSnapshot(req, res, next, (snapshot) => {
      res.json({
        insights: snapshot.businessInsights,
        profitMargins: snapshot.profitMargins,
      });
    });
  });

  router.get("/insights/recommendations", async (req, res, next) => {
    await requireSnapshot(req, res, next, (snapshot) => {
      res.json({
        predictions: snapshot.demandPredictions,
        recommendations: snapshot.topRecommendations,
        suggestions: snapshot.businessExpansionSuggestions,
      });
    });
  });

  return router;
}
