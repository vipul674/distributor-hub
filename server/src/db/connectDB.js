import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (mongoose.connection.listenerCount("connected") === 0) {
      mongoose.connection.on("connected", () => {
        console.log("Database connected.");
      });
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing. Set it in an env file before starting the server.");
    }

    await mongoose.connect(`${process.env.MONGODB_URI}/supplyDesk`);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

export default connectDB;

