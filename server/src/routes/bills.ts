import { Router } from "express";
import multer from "multer";
import { parseBillFiles } from "../services/billParser.js";
import { buildAnalyticsSnapshot } from "../services/analyticsSnapshot.js";
import { OnnxService } from "../services/onnxService.js";
import { DataStore } from "../services/store.js";

const upload = multer({ storage: multer.memoryStorage() });

interface BillsRouterDeps {
  store: DataStore;
  onnxService: OnnxService;
}

export function createBillsRouter({ store, onnxService }: BillsRouterDeps): Router {
  const router = Router();

  router.post("/upload", upload.array("files", 20), async (req, res, next) => {
    try {
      const files = (req.files ?? []) as Express.Multer.File[];

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
        categories: snapshot.monthlyCategory.map((row) => row.productCategory).filter((item, index, arr) => arr.indexOf(item) === index),
        forecastCount: snapshot.forecast.length,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
