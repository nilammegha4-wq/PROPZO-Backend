import express from "express";
import {
  getReviews,
  createReview,
  updateReviewStatus,
  deleteReview
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", getReviews);
router.post("/", createReview);
router.put("/:id", updateReviewStatus);
router.delete("/:id", deleteReview);

export default router;