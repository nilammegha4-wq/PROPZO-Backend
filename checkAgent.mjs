import mongoose from 'mongoose';
import Agent from './models/Agent.js';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://prpzoestate:z9m3vJ6fPz4q6vL@atlascluster.kxlzv1y.mongodb.net/test?retryWrites=true&w=majority&appName=AtlasCluster");
        console.log("Connected to MongoDB");

        const agents = await Agent.find({ email: "admin@gmail.com" });
        if (agents.length === 0) {
            console.log("Agent admin@gmail.com NOT found.");
        } else {
            agents.forEach(a => {
                console.log(`Found Agent: ${a.email}, ID: ${a._id}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
