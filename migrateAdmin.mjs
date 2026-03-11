import mongoose from "mongoose";
import User from "./models/User.js";
import Admin from "./models/Admin.js";
import dotenv from "dotenv";

dotenv.config();

async function migrateAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/propzo");
        console.log("Connected to MongoDB for migration");

        const userAdmin = await User.findOne({ email: "admin@gmail.com" });
        if (userAdmin) {
            // Check if already in Admin
            const existingAdmin = await Admin.findOne({ email: "admin@gmail.com" });
            if (!existingAdmin) {
                await Admin.create({
                    name: userAdmin.name || "PropZo Admin",
                    email: userAdmin.email,
                    password: userAdmin.password,
                    role: "admin"
                });
                console.log("Admin copied to new Admin collection.");
            } else {
                console.log("Admin already exists in Admin collection.");
            }

            // Remove from User collection
            await User.deleteOne({ email: "admin@gmail.com" });
            console.log("Admin removed from User collection.");
        } else {
            console.log("Admin not found in User collection (might be already migrated).");
        }

        process.exit(0);
    } catch (error) {
        console.error("Migration error:", error);
        process.exit(1);
    }
}

migrateAdmin();
