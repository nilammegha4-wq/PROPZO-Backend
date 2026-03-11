import express from "express";
import multer from "multer";
import path from "path";
import Agent from "../models/Agent.js";
import Booking from "../models/Booking.js";
import RentalBooking from "../models/RentalBooking.js";
import PreRentBooking from "../models/PreRentBooking.js";
import Property from "../models/Property.js";
import SaleProperty from "../models/SaleProperty.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/agents");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, '-'));
  }
});

const upload = multer({ storage: storage });

/* CREATE Agent */
router.post("/", upload.single('image'), async (req, res) => {
  try {
    const agentData = { ...req.body };

    // If an image was uploaded via multer, save its path
    if (req.file) {
      agentData.image = `/uploads/agents/${req.file.filename}`;
    }

    const newAgent = new Agent(agentData);
    await newAgent.save();
    res.status(201).json(newAgent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* GET All Agents */
router.get("/", async (req, res) => {
  try {
    const agents = await Agent.find().sort({ createdAt: -1 });
    // Map fullName to name for frontend compatibility
    const normalizedAgents = agents.map(agent => ({
      ...agent.toObject(),
      name: agent.fullName
    }));
    res.json(normalizedAgents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET Single Agent */
router.get("/:id", async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ error: "Not found" });

    // --- Dynamic Stats Logic ---
    const agentId = req.params.id;

    // 1. Find all properties linked to this agent (Assigned OR Created)
    const [agentProps, agentSaleProps] = await Promise.all([
      Property.find({ $or: [{ agent: agentId }, { createdBy: agentId }] }).select("_id"),
      SaleProperty.find({ $or: [{ agent: agentId }, { createdBy: agentId }] }).select("_id")
    ]);

    const propIds = [
      ...agentProps.map(p => p._id),
      ...agentSaleProps.map(p => p._id)
    ];

    // 2. Count Bookings (Appointments/Transactions)
    const [bookingCount, rentalBookingCount, preRentCount] = await Promise.all([
      Booking.countDocuments({
        $or: [{ agent: agentId }, { propertyId: { $in: propIds } }]
      }),
      RentalBooking.countDocuments({
        $or: [{ agent: agentId }, { propertyId: { $in: propIds } }]
      }),
      PreRentBooking.countDocuments({ property: { $in: propIds } })
    ]);

    const totalDealsClosed = bookingCount + rentalBookingCount + preRentCount;

    // 3. Count Active Listings (Properties not sold)
    const [activeProps, activeSaleProps] = await Promise.all([
      Property.countDocuments({
        $or: [{ agent: agentId }, { createdBy: agentId }],
        isSold: { $ne: true }
      }),
      SaleProperty.countDocuments({
        $or: [{ agent: agentId }, { createdBy: agentId }],
        isSold: { $ne: true }
      })
    ]);

    res.json({
      ...agent.toObject(),
      name: agent.fullName,
      dealsClosed: totalDealsClosed,
      propertiesCount: activeProps + activeSaleProps,
      reviewsCount: agent.rating > 0 ? 1 : 0 // Fallback or real count if Review model linked
    });
  } catch (err) {
    res.status(404).json({ error: "Invalid ID" });
  }
});

/* UPDATE Agent */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Agent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* DELETE Agent */
router.delete("/:id", async (req, res) => {
  try {
    await Agent.findByIdAndDelete(req.params.id);
    res.json({ message: "Agent deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ================== AGENT LOGIN ================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const agent = await Agent.findOne({ email });

    if (!agent) {
      return res.status(400).json({ message: "Agent not found" });
    }

    if (agent.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // --- Dynamic Stats Inclusion for Login ---
    const agentId = agent._id;
    const [agentProps, agentSaleProps] = await Promise.all([
      Property.find({ $or: [{ agent: agentId }, { createdBy: agentId }] }).select("_id"),
      SaleProperty.find({ $or: [{ agent: agentId }, { createdBy: agentId }] }).select("_id")
    ]);
    const propIds = [...agentProps.map(p => p._id), ...agentSaleProps.map(p => p._id)];

    const [bBtn, rBtn, prBtn] = await Promise.all([
      Booking.countDocuments({ $or: [{ agent: agentId }, { propertyId: { $in: propIds } }] }),
      RentalBooking.countDocuments({ $or: [{ agent: agentId }, { propertyId: { $in: propIds } }] }),
      PreRentBooking.countDocuments({ property: { $in: propIds } })
    ]);

    const [aP, aSP] = await Promise.all([
      Property.countDocuments({ $or: [{ agent: agentId }, { createdBy: agentId }], isSold: { $ne: true } }),
      SaleProperty.countDocuments({ $or: [{ agent: agentId }, { createdBy: agentId }], isSold: { $ne: true } })
    ]);

    const enrichedAgent = {
      ...agent.toObject(),
      dealsClosed: bBtn + rBtn + prBtn,
      propertiesCount: aP + aSP
    };

    res.json({
      message: "Login successful",
      agent: enrichedAgent,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

