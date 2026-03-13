// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import authRoutes from "./routes/authRoutes.js";
// import agentRoutes from "./routes/agentRoutes.js";
// import userRoutes from "./routes/userRoutes.js";  // ✅ Add this line
// import propertyRoutes from "./routes/propertyRoutes.js";  // ✅ Add this line
// import reviewRoutes from "./routes/reviewRoutes.js";
// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ✅ Correct Mongoose connection (no deprecated options)
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.log(err));

// // Existing routes
// app.use("/api/auth", authRoutes);
// app.use("/api/agents", agentRoutes);
// app.use("/api/properties", propertyRoutes);  // ✅ Add this line
// app.use("/api/reviews", reviewRoutes);
// // ✅ Mount userRoutes
// app.use("/api/users", userRoutes);  // <-- Add this line

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));






import dotenv from "dotenv";
dotenv.config(); // ✅ MUST BE BEFORE ROUTES

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import bookingRoutes from "./routes/bookingRoute.js"; // ✅ Add this line
import adminRoutes from "./routes/adminRoutes.js"; // ✅ Add this line
import notificationRoutes from "./routes/notificationRoutes.js"; // ✅ Add this line
import contactRoutes from "./routes/contactRoutes.js"; // ✅ Add this line
import premiumServiceRoutes from "./routes/premiumServiceRoutes.js"; // ✅ Add this line
import saleRoutes from "./routes/saleRoutes.js"; // ✅ Add this line
import rentalBookingRoutes from "./routes/rentalBookingRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

/* ✅ FIX FOR __dirname (because you are using ES Modules) */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ✅ MAKE UPLOADS FOLDER PUBLIC */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/premium-services", premiumServiceRoutes); // ✅ Add this line
app.use("/api/sales", saleRoutes); // ✅ Add this line
app.use("/api/rental-bookings", rentalBookingRoutes);

console.log("✅ API Routes Initialized: /api/users, /api/bookings, /api/payments, /api/admin, /api/contact");

// Final catch-all for any unhandled API routes
app.use("/api", (req, res) => {
  if (!res.headersSent) {
    res.status(404).json({ success: false, message: `API route ${req.method} ${req.originalUrl} not found` });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));