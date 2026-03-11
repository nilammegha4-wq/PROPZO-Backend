import jwt from "jsonwebtoken";
import User from "../models/User.js";



export const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

/* ======================
   PROTECT ROUTE
====================== */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ================= HANDLE STATIC ADMIN =================
    if (decoded.id === "static-admin-id") {
      req.user = {
        _id: "static-admin-id",
        name: "PropZo Admin",
        email: process.env.ADMIN_EMAIL || "admin@gmail.com",
        role: "admin"
      };
      return next();
    }

    // ================= REGULAR USER =================
    req.user = await User.findById(decoded.id);

    // Handle deleted users (ghost sessions in localStorage)
    if (!req.user) {
      return res.status(401).json({ message: "User account no longer exists. Please re-login." });
    }

    next();

  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* ======================
   ADMIN ONLY
====================== */
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};
