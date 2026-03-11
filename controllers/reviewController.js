import Review from "../models/Review.js";

// CREATE REVIEW
export const createReview = async (req, res) => {
  try {
    const { name, rating, feedback } = req.body;

    const newReview = new Review({
      name,
      rating,
      feedback,
      status: "Pending", // optional
      date: new Date().toISOString(),
    });

    const savedReview = await newReview.save();

    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL REVIEWS
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.status = status; // e.g. Approved / Rejected
    await review.save();

    res.json({
      message: "Review status updated successfully",
      review,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};