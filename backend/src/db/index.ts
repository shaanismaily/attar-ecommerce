
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

let connectionPromise: Promise<typeof mongoose> | null = null;

const assertTransactionSupport = async () => {
  const database = mongoose.connection.db;

  if (!database) {
    throw new Error(
      "MongoDB connection was established without a database handle"
    );
  }

  const hello = await database.admin().command({ hello: 1 });

  const isReplicaSet = typeof hello.setName === "string";
  const isMongos = hello.msg === "isdbgrid";

  if (!isReplicaSet && !isMongos) {
    throw new Error(
      "MongoDB transactions require a replica set or sharded cluster"
    );
  }
};

const connectDB = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectionPromise) {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not configured");
    }

    connectionPromise = mongoose
      .connect(mongoUri, {
        dbName: DB_NAME,
      })
      .then(async () => {
        await assertTransactionSupport();

        console.log(
          `MongoDB connected! DB host: ${mongoose.connection.host}`
        );

        return mongoose;
      })
      .catch(async (error: unknown) => {
        connectionPromise = null;

        // Close the connection if transaction validation failed after MongoDB had already connected.
        if (mongoose.connection.readyState === 1) {
          await mongoose.disconnect().catch(() => undefined);
        }

        throw error;
      });
  }

  return connectionPromise;
};

export default connectDB;
