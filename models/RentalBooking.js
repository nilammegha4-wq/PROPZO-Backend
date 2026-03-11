import mongoose from "mongoose";

const rentalBookingSchema = new mongoose.Schema({
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
    propertyType: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    visitDate: {
        type: String,
        required: true
    },
    visitTime: {
        type: String,
        required: true
    },
    stayDuration: {
        type: String
    },
    people: {
        type: Number,
        required: true
    },
    message: {
        type: String
    },
    budget: {
        type: String
    },
    virtualTour: {
        type: Boolean,
        default: false
    },
    agentCall: {
        type: Boolean,
        default: false
    },
    status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const RentalBooking = mongoose.model("RentalBooking", rentalBookingSchema);
export default RentalBooking;
