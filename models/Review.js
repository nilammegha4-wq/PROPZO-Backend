// // import mongoose from "mongoose";

// // const reviewSchema = new mongoose.Schema({
// //   name: {
// //     type: String,
// //     required: true,
// //   },
// //   rating: {
// //     type: Number,
// //     required: true,
// //   },
// //   feedback: {
// //     type: String,
// //     required: true,
// //   },
// //   status: {
// //     type: String,
// //     default: "Pending",
// //   },
// //   date: {
// //     type: String,
// //   },
// // }, { timestamps: true });

// // const Review = mongoose.model("Review", reviewSchema);

// // export default Review;   // ✅ VERY IMPORTANT

// import mongoose from "mongoose";

// const bookingSchema = new mongoose.Schema({
//   property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
//   buyer: {
//     fullName: String,
//     email: String,
//     phone: String,
//     address: String,
//   },
//   paymentMethod: String,
//   bookingId: String,
//   bookingDate: Date,
//   status: String,
// });

// export default mongoose.model("Booking", bookingSchema);

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    feedback: { type: String, required: true },
    status: { type: String, default: "Pending" },
    date: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);