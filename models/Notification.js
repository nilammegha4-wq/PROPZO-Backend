import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["property_added", "property_bought", "property_rented", "property_prerented", "contact_message", "premium_service_request", "system_alert"], default: "property_added" },
    isRead: { type: Boolean, default: false },
    link: { type: String }, // optional link to the property
    createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
