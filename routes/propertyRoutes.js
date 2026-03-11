import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getProperties,
  addProperty,
  getPropertyById,
  deleteProperty,
  getPropertiesByAgent,
  updateProperty
} from "../controllers/propertyController.js";

const router = express.Router();

router.get("/", getProperties);
router.post("/", protect, addProperty);
router.post("/create", protect, addProperty);
router.get("/agent/:agentId", getPropertiesByAgent);
router.get("/:id", getPropertyById);
router.put("/:id", protect, updateProperty);
router.delete("/:id", protect, deleteProperty);

export default router;