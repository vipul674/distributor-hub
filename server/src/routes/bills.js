import { Router } from "express";
import multer from "multer";
import { parseBillFiles } from "../services/billParser.js";
import { buildAnalyticsSnapshot } from "../services/analyticsSnapshot.js";
import { Bill } from "../models/Bill.js";

const upload = multer({ storage: multer.memoryStorage() });

export function createBillsRouter({ store, onnxService }) {
  const router = Router();

  router.get("/recent", async (_req, res, next) => {
    try {
      const bills = await Bill.find().sort({ createdAt: -1 }).limit(20).select({ _id: 0, __v: 0 }).lean();
      res.json(bills);
    } catch (error) {
      next(error);
    }
  });

  router.post("/manual", async (req, res, next) => {
    try {
      const payload = req.body ?? {};
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
      store.addUploadedBills(parsedRecords);

      res.status(201).json({
        uploadedFiles: files.length,
        parsedRows: parsedRecords.length,
        totalRows: store.getAllBills().length,
        uploadedRows: store.getUploadCount(),
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/process", async (_req, res, next) => {
    try {
      const snapshot = await store.getOrBuildSnapshot((records) => buildAnalyticsSnapshot(records, onnxService));
      res.json({
        message: "Bills processed successfully",
        totalRecords: store.getAllBills().length,
        uploadedRecords: store.getUploadCount(),
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
