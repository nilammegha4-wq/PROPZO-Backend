import express from "express";
import PackageBooking from "../models/packagebooking.js";
import { sendPackageApprovalEmail } from "../utils/emailService.js";

const router = express.Router();

// @route   POST /api/package-bookings
// @desc    Submit a new package booking
router.post("/", async (req, res) => {
    try {
        const { name, email, phone, packageName, message } = req.body;

        if (!name || !email || !phone || !packageName) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const newBooking = new PackageBooking({
            name,
            email,
            phone,
            packageName,
            message,
        });

        await newBooking.save();

        res.status(201).json({ success: true, message: "Booking request submitted successfully", booking: newBooking });
    } catch (error) {
        console.error("Error submitting package booking:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// @route   GET /api/package-bookings
// @desc    Get all package bookings (Admin only - middleware should be added here)
router.get("/", async (req, res) => {
    try {
        const bookings = await PackageBooking.find().sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching package bookings:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// @route   PATCH /api/package-bookings/approve/:id
// @desc    Approve a package booking and send email
router.patch("/approve/:id", async (req, res) => {
    try {
        const booking = await PackageBooking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        booking.status = "Approved";
        await booking.save();

        // Send approval email
        const emailSent = await sendPackageApprovalEmail(booking.email, booking.name, booking.packageName);

        res.status(200).json({
            success: true,
            message: "Booking approved and email sent",
            booking,
            emailSent
        });
    } catch (error) {
        console.error("Error approving package booking:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// @route   PATCH /api/package-bookings/reject/:id
// @desc    Reject a package booking
router.patch("/reject/:id", async (req, res) => {
    try {
        const booking = await PackageBooking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        booking.status = "Rejected";
        await booking.save();

        res.status(200).json({ success: true, message: "Booking rejected", booking });
    } catch (error) {
        console.error("Error rejecting package booking:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
