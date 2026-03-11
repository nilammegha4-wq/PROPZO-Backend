import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://prpzoestate:z9m3vJ6fPz4q6vL@atlascluster.kxlzv1y.mongodb.net/test?retryWrites=true&w=majority&appName=AtlasCluster");
        console.log("Connected to MongoDB");

        const users = await User.find({ email: "admin@gmail.com" });
        if (users.length === 0) {
            console.log("User admin@gmail.com NOT found.");
        } else {
            users.forEach(u => {
                console.log(`Found User: ${u.email}, Role: ${u.role}, ID: ${u._id}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
