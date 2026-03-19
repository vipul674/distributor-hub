import { createApp } from "./app.js";
import { config } from "./config.js";
import connectDB from "./db/connectDB.js";
import { SalesRecord } from "./models/SalesRecord.js";
import { OnnxService } from "./services/onnxService.js";
import { DataStore } from "./services/store.js";

async function bootstrap() {
  const dbEnabled = await connectDB();
  const store = new DataStore({ useDemoData: !dbEnabled });
  if (dbEnabled) {
    const uploadedRecords = await SalesRecord.find().select({ _id: 0, __v: 0 }).sort({ date: 1, createdAt: 1 }).lean();
    if (uploadedRecords.length > 0) {
      store.setUploadedBills(uploadedRecords);
    }
  }

  const onnxService = new OnnxService(config.modelDir);
  await onnxService.initialize();

  const app = createApp({ store, onnxService, dbEnabled });

  app.listen(config.port, () => {
    console.log(`Distributor Hub API listening on http://localhost:${config.port}`);
    console.log(`Using model directory: ${config.modelDir}`);
    console.log(`Using data source: ${dbEnabled ? "MongoDB" : "in-memory demo data"}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
