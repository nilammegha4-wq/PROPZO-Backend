import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

console.log("MONGO_URI from env:", process.env.MONGO_URI);

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to:", mongoose.connection.host, mongoose.connection.name);

        // Seed admin
        const email = "admin@gmail.com";
        let admin = await User.findOne({ email });
        if (!admin) {
            console.log("Creating admin@gmail.com...");
            const hashed = await bcrypt.hash("admin123", 10);
            admin = await User.create({ name: "PropZo Admin", email, password: hashed, role: "admin" });
            console.log("CREATED ID:", admin._id);
        } else {
            console.log("Admin exists. Setting password to admin123");
            admin.password = await bcrypt.hash("admin123", 10);
            admin.role = "admin";
            await admin.save();
        }

        // Test find
        const check = await User.findOne({ email: "admin@gmail.com" });
        console.log("Check:", check ? check.email : "NULL");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
