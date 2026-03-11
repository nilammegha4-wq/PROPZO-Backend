import multer from "multer";
import path from "path";
import fs from "fs";

// Create directory if it doesn't exist
const uploadDir = "uploads/sales/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `sale-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// File filter (only JPG/PNG)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, JPEG, and PNG files are allowed!"), false);
    }
};

const saleUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
    fileFilter,
});

export default saleUpload;
