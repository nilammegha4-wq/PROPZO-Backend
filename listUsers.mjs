import mongoose from 'mongoose';
import Agent from './models/Agent.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://prpzoestate:z9m3vJ6fPz4q6vL@atlascluster.kxlzv1y.mongodb.net/test?retryWrites=true&w=majority&appName=AtlasCluster");
        console.log("Connected to MongoDB");

        const agents = await Agent.find();
        console.log(`--- AGENTS (${agents.length}) ---`);
        agents.forEach(a => console.log(`${a.email} | ${a.role}`));

        const users = await User.find();
        console.log(`--- USERS (${users.length}) ---`);
        users.forEach(u => console.log(`${u.email} | ${u.role}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
