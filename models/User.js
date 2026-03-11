import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  phone: String,          // 📱 user phone number
  address: String,        // 🏠 residential address
  avatar: String,         // 📸 optional profile image (legacy url/base64)
  profileImage: String,   // 🖼️ persistent profile image path (uploads/profile/...)
  otp: String,
  otpExpires: Date,
  notificationPreferences: {
    emailAlerts: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    smsUpdates: { type: Boolean, default: false },
    marketingEmails: { type: Boolean, default: false },
  },
  appearancePreferences: {
    accentColor: { type: String, default: "#3b82f6" },
    sidebarStyle: { type: String, default: "full" },
    density: { type: String, default: "comfortable" },
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
