import express from "express";
import multer from "multer";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import saleUpload from "../middleware/saleUploadMiddleware.js";
import {
    createSaleProperty,
    getSaleProperties,
    deleteSaleProperty
} from "../controllers/saleController.js";

const router = express.Router();

// Wrapper to handle Multer errors gracefully
const uploadWithErrorHandling = (req, res, next) => {
    saleUpload.array("images", 10)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    message: "One or more images are too large. Please upload images under 20MB each.",
                    error: err.message
                });
            }
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

router.post("/create", protect, uploadWithErrorHandling, createSaleProperty);
router.get("/", getSaleProperties);
router.delete("/:id", protect, adminOnly, deleteSaleProperty);

export default router;
