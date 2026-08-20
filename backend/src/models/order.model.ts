import mongoose, { Schema, Types, Model } from "mongoose";

type OrderStatus = "pending" | "packed" | "shipped" | "delivered" | "cancelled";

type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

interface IShippingAddressSnapshot {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  addressType: "home" | "work" | "other";
}

interface IOrderItem {
  product: Types.ObjectId;
  variant: Types.ObjectId;

  productName: string;
  volume: number;
  price: number;
  quantity: number;
}

interface IOrder {
  _id: Types.ObjectId,

  orderedBy: Types.ObjectId;

  totalAmount: number;

  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;

  shippingAddressSnapshot: IShippingAddressSnapshot;

  orderItems: IOrderItem[];

  createdAt?: Date;
  updatedAt?: Date;
}

const shippingAddressSnapshotSchema = new Schema<IShippingAddressSnapshot>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    street: {
      type: String,
      required: true,
      trim: true,
    },

    landmark: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      default: "India",
      trim: true,
    },

    zipCode: {
      type: String,
      required: true,
    },

    addressType: {
      type: String,
      enum: ["home", "work", "other"],
      required: true,
    },
  },
  { _id: false }
);

const orderItemSchema = new Schema<IOrderItem>(
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
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder, Model<IOrder>>(
  {
    orderedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    orderStatus: {
      type: String,
      enum: ["pending", "packed", "shipped", "delivered", "cancelled"],
      default: "pending",
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      required: true,
    },

    shippingAddressSnapshot: {
      type: shippingAddressSnapshotSchema,
      required: true,
    },

    orderItems: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: (items: IOrderItem[]) =>
          Array.isArray(items) && items.length > 0,

        message: "Order must contain at least one item.",
      },
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ orderedBy: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

export const Order = mongoose.model<IOrder>("Order", orderSchema);
