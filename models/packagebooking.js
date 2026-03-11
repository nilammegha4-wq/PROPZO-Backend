import mongoose from "mongoose";

const packageBookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    packageName: {
      type: String,
      required: true,
    },

    message: {
      type: String,
    },

    serviceType: {
      type: String,
      required: true,
      enum: ["Interior Design", "Home Maintenance", "Legal Services", "Property Financing"],
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PackageBooking", packageBookingSchema);