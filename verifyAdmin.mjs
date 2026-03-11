import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://prpzoestate:z9m3vJ6fPz4q6vL@atlascluster.kxlzv1y.mongodb.net/test?retryWrites=true&w=majority&appName=AtlasCluster");

        const user = await User.findOne({ email: "admin@gmail.com" });
        console.log("Found user:", user);

        // Test the exact auth route query
        const authQueryUser = await User.findOne({ email: "admin@gmail.com", role: "admin" });
        console.log("Auth query result:", authQueryUser ? "SUCCESS" : "FAILED");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
