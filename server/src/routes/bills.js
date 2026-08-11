import { Router } from "express";
import multer from "multer";
import { parseBillFiles } from "../services/billParser.js";
import { buildAnalyticsSnapshot } from "../services/analyticsSnapshot.js";
import { Bill } from "../models/Bill.js";
import { SalesRecord } from "../models/SalesRecord.js";
import { buildUploadedCatalog } from "../services/productCatalog.js";
import { requireAuth } from "../middleware/auth.js";

const upload = multer({ storage: multer.memoryStorage() });

export function createBillsRouter({ store, onnxService, dbEnabled }) {
  const router = Router();
  router.use(requireAuth);

  router.get("/recent", async (req, res, next) => {
    try {
      const userId = req.user?.sub;

      if (store.hasUploadedBills(userId)) {
        if (!dbEnabled) {
          res.json(store.getRecentBills(userId));
          return;
        }

        const persistedBills = await Bill.find({ userId })
          .sort({ createdAt: -1 })
          .limit(20)
          .select({ _id: 0, __v: 0 })
          .lean();

        const recentBills = [...store.getUploadedRecentBills(userId), ...persistedBills]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .filter((bill, index, bills) => bills.findIndex((item) => item.id === bill.id) === index)
          .slice(0, 20);

        res.json(recentBills);
        return;
      }

      if (!dbEnabled) {
        res.json(store.getRecentBills(userId));
        return;
      }

      const bills = await Bill.find({ userId }).sort({ createdAt: -1 }).limit(20).select({ _id: 0, __v: 0 }).lean();
      res.json(bills);
    } catch (error) {
      next(error);
    }
  });

  router.post("/manual", async (req, res, next) => {
    try {
      const payload = req.body ?? {};
      const userId = req.user?.sub;

      if (!userId) {
        res.status(401).json({ message: "Missing user identity" });
        return;
      }

      if (!dbEnabled) {
        const created = store.createManualBill(payload, userId);
        res.status(201).json(created);
        return;
      }

      const createdDoc = await Bill.create({
        userId,
        id: payload.id,
        customer: payload.customer,
        amount: payload.amount,
        date: payload.date,
        items: payload.items,
      });
      const created = await Bill.findOne({ userId, id: createdDoc.id }).select({ _id: 0, __v: 0 }).lean();
      res.status(201).json(created);
    } catch (error) {
      if (error?.code === 11000) {
        res.status(409).json({ message: "Bill already exists" });
        return;
      }
      next(error);
    }
  });

  router.post("/upload", upload.array("files", 20), async (req, res, next) => {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: "Missing user identity" });
        return;
      }

      const files = req.files ?? [];
      if (files.length === 0) {
        res.status(400).json({ message: "No files provided. Use multipart field name 'files'." });
        return;
      }

      const parsedRecords = parseBillFiles(files).map((record) => ({ ...record, userId }));
      if (parsedRecords.length === 0) {
        res.status(400).json({ message: "No valid billing rows were found in the uploaded file(s)." });
        return;
      }

      store.setUploadedBills(parsedRecords, userId);

      if (dbEnabled) {
        await SalesRecord.deleteMany({ userId });
        await SalesRecord.insertMany(parsedRecords);
      }

      const uploadedCatalogProducts = buildUploadedCatalog(parsedRecords);

      res.status(201).json({
        uploadedFiles: files.length,
        parsedRows: parsedRecords.length,
        totalRows: store.getAllBills(userId).length,
        uploadedRows: store.getUploadCount(userId),
        catalogMode: store.getUploadCatalogMode(userId),
        catalogProducts: uploadedCatalogProducts.length,
        damagedProducts: store.getDamagedProducts(userId).length,
      });
    } catch (error) {
      if (error?.statusCode === 400) {
        res.status(400).json({ message: error.message });
        return;
      }
      next(error);
    }
  });

  router.post("/process", async (req, res, next) => {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: "Missing user identity" });
        return;
      }

      const records = dbEnabled
        ? await SalesRecord.find({ userId }).lean()
        : store.getAllBills(userId);

      const snapshot = await buildAnalyticsSnapshot(records, onnxService, store.getDamagedProducts(userId));

      res.json({
        message: "Bills processed successfully",
        totalRecords: records.length,
        uploadedRecords: store.getUploadCount(userId),
        catalogMode: store.getUploadCatalogMode(userId),
        catalogProducts: buildUploadedCatalog(records).length,
        categories: snapshot.monthlyCategory
          .map((row) => row.productCategory)
          .filter((item, index, arr) => arr.indexOf(item) === index),
        forecastCount: snapshot.forecast.length,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
