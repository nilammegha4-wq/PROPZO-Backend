import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const existingAdmin = await User.findOne({ email: "prpzoestate@gmail.com" });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            await User.create({
                name: "Admin",
                email: "prpzoestate@gmail.com",
                password: hashedPassword,
                role: "admin"
            });
            console.log("Admin seeded successfully");
        } else {
            // Guarantee role just in case
            Object.assign(existingAdmin, { role: "admin" });
            existingAdmin.password = await bcrypt.hash("admin123", 10);
            await existingAdmin.save();
            console.log("Admin already exists, force updated role and password");
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
seedAdmin();
