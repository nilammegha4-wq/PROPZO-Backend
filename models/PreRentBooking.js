import mongoose from "mongoose";

const preRentBookingSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: true
    },
    tenant: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    bookingId: { type: String, required: true, unique: true },
    bookingDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["Pending", "Confirmed", "Failed", "Completed"], default: "Pending" },
    amount: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.PreRentBooking || mongoose.model("PreRentBooking", preRentBookingSchema);
