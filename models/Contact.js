import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "responded"],
    default: "pending",
  },
  adminResponse: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: {
    type: Date,
  },
});

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;