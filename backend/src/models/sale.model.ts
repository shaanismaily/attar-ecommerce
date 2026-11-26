import mongoose, { Schema } from "mongoose";

export interface ISaleItem {
  product: mongoose.Types.ObjectId;
  variant: mongoose.Types.ObjectId;
  productName: string;
  volume: number;
  listedPrice: number;
  sellingPrice: number;
  quantity: number;
  subtotal: number;

  // Cost snapshot at the time of sale
  unitCost: number;
  totalCost: number;
  grossProfit: number;
}

export interface ISale {
  receiptNumber: string;
  items: ISaleItem[];
  subtotal: number;
  totalAmount: number;

  // Sale-level cost and profit
  totalCost: number;
  grossProfit: number;

  paymentMethod: "CASH" | "UPI" | "CARD";
  amountReceived: number;
  changeReturned: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  soldBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      type: Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    volume: {
      type: Number,
      required: true,
      enum: [3, 6, 12],
    },
    listedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0.01,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isInteger,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    grossProfit: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const saleSchema = new Schema<ISale>(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    items: {
      type: [saleItemSchema],
      required: true,
      validate: {
        validator: (items: ISaleItem[]) => items.length > 0,
        message: "A sale must contain at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    grossProfit: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "UPI", "CARD"],
      required: true,
    },
    amountReceived: {
      type: Number,
      required: true,
      min: 0,
    },
    changeReturned: {
      type: Number,
      default: 0,
      min: 0,
    },
    customerName: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    soldBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

saleSchema.index({ createdAt: -1 });
saleSchema.index({ customerPhone: 1, createdAt: -1 });

export const Sale =
  mongoose.models.Sale || mongoose.model<ISale>("Sale", saleSchema);
