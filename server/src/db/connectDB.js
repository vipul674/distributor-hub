import mongoose from "mongoose";
import { config } from "../config.js";

const connectDB = async () => {
  if (config.dataMode === "memory") {
    console.log("DATA_MODE=memory, starting backend with in-memory demo data.");
    return false;
  }

  if (!config.hasMongoUri || config.mongoUriIsPlaceholder) {
    if (config.dataMode === "mongo") {
      throw new Error("DATA_MODE=mongo requires a real MONGODB_URI value.");
    }

    console.log("MongoDB is not configured, starting backend with in-memory demo data.");
    return false;
  }

  if (!config.mongoUriHasValidScheme) {
    throw new Error('Invalid MONGODB_URI. Expected it to start with "mongodb://" or "mongodb+srv://".');
  }

  try {
    if (mongoose.connection.listenerCount("connected") === 0) {
      mongoose.connection.on("connected", () => {
        console.log("Database connected.");
      });
    }

    await mongoose.connect(config.mongoUri, { dbName: config.mongoDbName });
    return true;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

export default connectDB;
