import { createApp } from "./app.js";
import { config } from "./config.js";
import connectDB from "./db/connectDB.js";
import { seedIfEmpty } from "./db/seed.js";
import { OnnxService } from "./services/onnxService.js";
import { DataStore } from "./services/store.js";

async function bootstrap() {
  await connectDB();
  await seedIfEmpty();
  const store = new DataStore();
  const onnxService = new OnnxService(config.modelDir);
  await onnxService.initialize();

  const app = createApp({ store, onnxService });

  app.listen(config.port, () => {
    console.log(`Distributor Hub API listening on http://localhost:${config.port}`);
    console.log(`Using model directory: ${config.modelDir}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
