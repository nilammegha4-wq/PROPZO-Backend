import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import saleUpload from "../middleware/saleUploadMiddleware.js";
import {
    createSaleProperty,
    getSaleProperties,
    deleteSaleProperty
} from "../controllers/saleController.js";

const router = express.Router();

router.post("/create", protect, saleUpload.array("images", 10), createSaleProperty);
router.get("/", getSaleProperties);
router.delete("/:id", protect, adminOnly, deleteSaleProperty);

export default router;
