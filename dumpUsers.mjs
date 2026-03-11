import mongoose from 'mongoose';
import Agent from './models/Agent.js';
import User from './models/User.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://prpzoestate:z9m3vJ6fPz4q6vL@atlascluster.kxlzv1y.mongodb.net/test?retryWrites=true&w=majority&appName=AtlasCluster");

        const agents = await Agent.find();
        const users = await User.find();

        const report = {
            agents: agents.map(a => ({ email: a.email, role: a.role, id: a._id })),
            users: users.map(u => ({ email: u.email, role: u.role, id: u._id }))
        };

        fs.writeFileSync('user_dump.json', JSON.stringify(report, null, 2));
        console.log("Dump saved to user_dump.json");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
