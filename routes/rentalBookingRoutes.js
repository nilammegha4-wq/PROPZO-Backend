import express from "express";
import { createRentalBooking, getRentalBookings } from "../controllers/rentalBookingController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createRentalBooking);
router.get("/", protect, adminOnly, getRentalBookings);

export default router;
