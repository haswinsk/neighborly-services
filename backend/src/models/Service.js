import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    serviceName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    providerId: { type: String, required: true, index: true },
    providerName: { type: String, required: true },
    providerLocation: { type: String, required: true },
    providerLatitude: { type: Number, default: null },
    providerLongitude: { type: Number, default: null },
    category: { type: String, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    image: { type: String, default: "" },
    availability: { type: String, enum: ["Available", "Busy", "Offline"], default: "Available" },
  },
  { timestamps: true }
);

export const Service = mongoose.model("Service", serviceSchema);
