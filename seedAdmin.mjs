import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://prpzoestate:z9m3vJ6fPz4q6vL@atlascluster.kxlzv1y.mongodb.net/test?retryWrites=true&w=majority&appName=AtlasCluster");

        const email = "admin@gmail.com";
        const password = "admin123";

        // Check if user exists
        let adminUser = await User.findOne({ email });

        if (adminUser) {
            console.log("Admin user already exists. Updating password to admin123...");
            adminUser.password = await bcrypt.hash(password, 10);
            adminUser.role = "admin";
            await adminUser.save();
            console.log("Password updated.");
        } else {
            console.log("Creating new admin user...");
            const hashed = await bcrypt.hash(password, 10);
            await User.create({
                name: "PropZo Admin",
                email: email,
                password: hashed,
                role: "admin"
            });
            console.log("Admin user created.");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createAdmin();
