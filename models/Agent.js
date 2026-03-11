import mongoose from "mongoose";

// const agentSchema = new mongoose.Schema({
//   fullName: String,
//   email: String,
//   phone: String,
//   role: String,
//   status: String,
//   password: String,
//   image: String,
//   experience: String,
//   rating: Number,

//   // NEW FIELDS
//   bio: String,
//   achievements: [String],
//   location: String,
//   dealsClosed: {
//     type: Number,
//     default: 0
//   }
// }, { timestamps: true });
// export default mongoose.model("Agent", agentSchema);



const agentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    role: String,
    status: String,
    password: String,
    image: String,
    experience: String,
    rating: { type: Number, default: 0 },

    // ✅ ADD THESE
    bio: { type: String, default: "" },
    achievements: { type: [String], default: [] },
    location: { type: String, default: "" },
    dealsClosed: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Agent", agentSchema);