import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import User from "../models/User.js";




const router = express.Router();

/* ================== EMAIL TRANSPORTER ================== */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "propzoestate@gmail.com",
    pass: process.env.EMAIL_PASS || "mmnmwhrucjuaglbx",
  },
});

/* ================== REGISTER ================== */

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    res.json({ message: "Registered successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================== LOGIN (SEND OTP) ================== */

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // ================= ADMIN LOGIN STATIC =================
    if (role === "admin") {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

      if (email === adminEmail && password === adminPassword) {
        const token = jwt.sign(
          { id: "static-admin-id" },
          process.env.JWT_SECRET,
          { expiresIn: "10d" }
        );

        return res.json({
          success: true,
          message: "Admin login successful",
          user: {
            id: "static-admin-id",
            name: "PropZo Admin",
            email: adminEmail,
            role: "admin",
            token,
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid admin credentials",
        });
      }
    }

    // ================= NORMAL USER LOGIN =================
    const user = await User.findOne({ email, role });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 min
    await user.save();

    console.log(`\n\n[DEV MODE] Generated Login OTP: ${otp}\n\n`);

    // Send mail
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || "prpzoestate@gmail.com",
        to: email,
        subject: "Your Login OTP",
        text: `Your OTP is ${otp}`,
      });
      return res.json({
        success: true,
        message: "OTP sent to your email",
      });
    } catch (emailErr) {
      console.error("Nodemailer Error:", emailErr.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send email. The Google App Password might be revoked. (Check server logs for the OTP to login manually!)",
      });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* ================== VERIFY OTP ================== */

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


/* ================== FORGOT PASSWORD (SEND OTP) ================== */

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    console.log(`\n\n************************************`);
    console.log(`[FORGOT PASS] OTP for ${email}: ${otp}`);
    console.log(`************************************\n\n`);

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || "prpzoestate@gmail.com",
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is ${otp}. It expires in 10 minutes.`,
      });
      res.json({
        success: true,
        message: "Reset OTP sent to your email",
      });
    } catch (err) {
      console.error("Nodemailer Error:", err.message);
      res.status(500).json({
        success: false,
        message: "Failed to send reset email. Check server logs for OTP.",
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================== RESET PASSWORD ================== */

router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    
    // Clear OTP
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful. You can now login.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
