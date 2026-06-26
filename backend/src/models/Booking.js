import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    providerId: { type: String, required: true, index: true },
    providerName: { type: String, required: true },
    serviceId: { type: String, required: true, index: true },
    serviceName: { type: String, required: true },
    bookingDate: { type: String, required: true },
    status: {
      type: String,
      enum: ["Requested", "Accepted", "In Progress", "Completed", "Rejected"],
      default: "Requested",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);
