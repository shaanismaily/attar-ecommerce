import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const assertTransactionSupport = async () => {
  const database = mongoose.connection.db;

  if (!database) {
    throw new Error("MongoDB connection was established without a database handle");
  }

  const hello = await database.admin().command({ hello: 1 });
  const isReplicaSet = typeof hello.setName === "string";
  const isMongos = hello.msg === "isdbgrid";

  if (!isReplicaSet && !isMongos) {
    throw new Error(
      "MongoDB transactions require a replica set or sharded cluster; the connected deployment does not support them"
    );
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  try {
    // `dbName` selects the database without modifying the connection string,
    // even when the URI already contains a database path.
    const connectionInstance = await mongoose.connect(mongoUri, { dbName: DB_NAME });
    await assertTransactionSupport();
    console.log(`\n MongoDB connected !! DB host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log(`MongoDB connection failed ${error}`);
    process.exit(1);
  }
};

export default connectDB;
