import express from "express";
import PremiumService from "../models/premiumservice.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendPremiumServiceApprovalEmail } from "../utils/emailService.js";

const router = express.Router();

// @route   POST /api/premium-services
// @desc    Submit a new premium service request
router.post("/", async (req, res) => {
    try {
        const { name, email, phone, packageName, message, serviceType } = req.body;

        if (!name || !email || !phone || !packageName || !serviceType) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const newRequest = new PremiumService({
            name,
            email,
            phone,
            packageName,
            message,
            serviceType,
        });

        await newRequest.save();

        // 🔔 Notify Admins
        try {
            const admins = await User.find({ role: "admin" });
            if (admins.length > 0) {
                const adminNotifications = admins.map(admin => ({
                    userId: admin._id,
                    title: "New Premium Service Request 💎",
                    message: `${name} has requested "${serviceType}" (${packageName}). Needs approval.`,
                    type: "premium_service_request",
                    link: `/admin/premium-services`
                }));
                await Notification.insertMany(adminNotifications);
            }
        } catch (notifErr) {
            console.error("Premium Service Admin Notification Error:", notifErr);
        }

        res.status(201).json({ success: true, message: "Request submitted successfully", data: newRequest });
    } catch (error) {
        console.error("Error submitting premium service request:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// @route   GET /api/premium-services
// @desc    Get all premium service requests
router.get("/", async (req, res) => {
    console.log("💎 Fetching All Premium Service Requests...");
    try {
        const requests = await PremiumService.find().sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching premium service requests:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// @route   PATCH /api/premium-services/approve/:id
// @desc    Approve a request and send email
router.patch("/approve/:id", async (req, res) => {
    try {
        const request = await PremiumService.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        request.status = "Approved";
        await request.save();

        // Send approval email
        const emailSent = await sendPremiumServiceApprovalEmail(request.email, request.name, request.packageName, request.serviceType);

        res.status(200).json({
            success: true,
            message: "Request approved and email sent",
            data: request,
            emailSent
        });
    } catch (error) {
        console.error("Error approving premium service request:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// @route   PATCH /api/premium-services/reject/:id
// @desc    Reject a request
router.patch("/reject/:id", async (req, res) => {
    try {
        const request = await PremiumService.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        request.status = "Rejected";
        await request.save();

        res.status(200).json({ success: true, message: "Request rejected", data: request });
    } catch (error) {
        console.error("Error rejecting premium service request:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
