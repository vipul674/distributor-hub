import { Router } from "express";
import multer from "multer";
import { parseBillFiles } from "../services/billParser.js";
import { buildAnalyticsSnapshot } from "../services/analyticsSnapshot.js";
import { Bill } from "../models/Bill.js";
import { SalesRecord } from "../models/SalesRecord.js";
import { buildUploadedCatalog } from "../services/productCatalog.js";

const upload = multer({ storage: multer.memoryStorage() });

export function createBillsRouter({ store, onnxService, dbEnabled }) {
  const router = Router();

  router.get("/recent", async (_req, res, next) => {
    try {
      if (store.hasUploadedBills()) {
        if (!dbEnabled) {
          res.json(store.getRecentBills());
          return;
        }

        const persistedBills = await Bill.find().sort({ createdAt: -1 }).limit(20).select({ _id: 0, __v: 0 }).lean();
        const recentBills = [...store.getUploadedRecentBills(), ...persistedBills]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .filter((bill, index, bills) => bills.findIndex((item) => item.id === bill.id) === index)
          .slice(0, 20);

        res.json(recentBills);
        return;
      }

      if (!dbEnabled) {
        res.json(store.getRecentBills());
        return;
      }

      const bills = await Bill.find().sort({ createdAt: -1 }).limit(20).select({ _id: 0, __v: 0 }).lean();
      res.json(bills);
    } catch (error) {
      next(error);
    }
  });

  router.post("/manual", async (req, res, next) => {
    try {
      const payload = req.body ?? {};

      if (!dbEnabled) {
        const created = store.createManualBill(payload);
        res.status(201).json(created);
        return;
      }

      const createdDoc = await Bill.create({
        id: payload.id,
        customer: payload.customer,
        amount: payload.amount,
        date: payload.date,
        items: payload.items,
      });
      const created = await Bill.findOne({ id: createdDoc.id }).select({ _id: 0, __v: 0 }).lean();
      res.status(201).json(created);
    } catch (error) {
      // Duplicate invoice ids should not crash UI flows
      if (error?.code === 11000) {
        res.status(409).json({ message: "Bill already exists" });
        return;
      }
      next(error);
    }
  });

  router.post("/upload", upload.array("files", 20), async (req, res, next) => {
    try {
      const files = req.files ?? [];

      if (files.length === 0) {
        res.status(400).json({ message: "No files provided. Use multipart field name 'files'." });
        return;
      }

      const parsedRecords = parseBillFiles(files);
      if (parsedRecords.length === 0) {
        res.status(400).json({ message: "No valid billing rows were found in the uploaded file(s)." });
        return;
      }

      store.setUploadedBills(parsedRecords);

      if (dbEnabled) {
        await SalesRecord.deleteMany({});
        await SalesRecord.insertMany(parsedRecords);
      }

      const uploadedCatalogProducts = buildUploadedCatalog(parsedRecords);

      res.status(201).json({
        uploadedFiles: files.length,
        parsedRows: parsedRecords.length,
        totalRows: store.getAllBills().length,
        uploadedRows: store.getUploadCount(),
        catalogMode: store.getUploadCatalogMode(),
        catalogProducts: uploadedCatalogProducts.length,
        damagedProducts: store.getDamagedProducts().length,
      });
    } catch (error) {
      if (error?.statusCode === 400) {
        res.status(400).json({ message: error.message });
        return;
      }
      next(error);
    }
  });

  router.post("/process", async (_req, res, next) => {
    try {
      const snapshot = await store.getOrBuildSnapshot((records) =>
        buildAnalyticsSnapshot(records, onnxService, store.getDamagedProducts())
      );
      res.json({
        message: "Bills processed successfully",
        totalRecords: store.getAllBills().length,
        uploadedRecords: store.getUploadCount(),
        catalogMode: store.getUploadCatalogMode(),
        catalogProducts: buildUploadedCatalog(store.getAllBills()).length,
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
