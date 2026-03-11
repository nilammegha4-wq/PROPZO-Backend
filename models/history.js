import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
  action: {
    type: String,
    enum: ["view", "buy", "rent", "contact_agent"]
  }
}, { timestamps: true });

export default mongoose.model("History", historySchema);
