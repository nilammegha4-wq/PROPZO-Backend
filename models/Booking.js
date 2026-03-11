import mongoose from "mongoose";
const bookingSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  visitDate: { type: String, required: true },
  visitTime: { type: String, required: true },
  visitors: { type: Number, required: true },
  message: { type: String },
  virtualTour: { type: Boolean, default: false },
  agentCall: { type: Boolean, default: false },
  status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
