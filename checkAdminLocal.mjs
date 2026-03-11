import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import util from 'util';

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/propzo");
        console.log("Connected to:", mongoose.connection.host, mongoose.connection.name);

        const adminUser = await User.findOne({ email: "admin@gmail.com" });
        if (adminUser) {
            console.log("Admin User found!");
            console.log(util.inspect(adminUser.toObject(), false, null, true));
        } else {
            console.log("Admin user NOT found by email.");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
