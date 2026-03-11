import express from "express";
import multer from "multer";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import History from "../models/history.js";
import {
  getUserProfileStats,
  getUserBookings,
  updateUserProfile,
  updateUserPassword
} from "../controllers/userController.js";

const router = express.Router();

// ================= TEST ROUTE =================
router.get("/test", (req, res) => res.json({ message: "User routes are working" }));

// ================= GET ALL USERS =================
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= USER PROFILE STATS =================
router.get("/:id/profile-stats", protect, (req, res, next) => {
  console.log("HITTING PROFILE STATS ROUTE for ID:", req.params.id);
  next();
}, getUserProfileStats);

// ================= USER BOOKINGS =================
router.get("/:id/bookings", protect, getUserBookings);

// ================= USER SALE LISTINGS =================
router.get("/:id/sales", protect, async (req, res) => {
  try {
    const SaleProperty = (await import("../models/SaleProperty.js")).default;
    const properties = await SaleProperty.find({ createdBy: req.params.id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ================= GET USER BY ID =================
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // only owner or admin can fetch
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

import upload from "../middleware/uploadMiddleware.js";

// ================= UPDATE USER PROFILE =================
router.put("/:id", protect, updateUserProfile);

// ================= UPLOAD AVATAR =================
router.post("/:id/upload-avatar", protect, (req, res) => {
  upload.single("avatar")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.error("Multer Error:", err);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      console.error("Upload Error:", err);
      return res.status(400).json({ message: err.message });
    }

    // Everything went fine.
    console.log("POST /upload-avatar for ID:", req.params.id);
    if (!req.file) {
      console.log("No file received");
      return res.status(400).json({ message: "No file uploaded" });
    }
    console.log("File uploaded successfully:", req.file.filename);
    const filePath = `uploads/profile/${req.file.filename}`;
    res.status(200).json({ filePath });
  });
});

// ================= UPDATE USER PASSWORD =================
router.put("/:id/password", protect, updateUserPassword);

// ================= USER HISTORY =================
router.get("/:id/history", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const hist = await History.find({ user: req.params.id }).populate("property");
    res.json(hist);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
