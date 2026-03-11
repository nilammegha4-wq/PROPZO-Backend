import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  deleteUser,
  getAllPropertiesAdmin,
  updatePropertyStatus,
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
  getSiteSettings,
  updateSiteSettings,
} from "../controllers/adminController.js";
import { getAdminDashboardData } from "../controllers/dashboardController.js";
import { getAdminReportsData, deleteReportData } from "../controllers/reportController.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/dashboard", getAdminDashboardData);
router.get("/reports", getAdminReportsData);
router.delete("/reports/:type/:id", deleteReportData);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

router.get("/properties", getAllPropertiesAdmin);
router.put("/properties/:id/status", updatePropertyStatus);

// Admin Profile and Settings
router.get("/profile", getAdminProfile);
router.put("/profile", updateAdminProfile);
router.put("/password", updateAdminPassword);

router.get("/settings/site", getSiteSettings);
router.put("/settings/site", updateSiteSettings);

export default router;
