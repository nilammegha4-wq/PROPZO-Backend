import mongoose from 'mongoose';
import Property from './models/Property.js';
import SaleProperty from './models/SaleProperty.js';
import Agent from './models/Agent.js';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://prpzoestate:z9m3vJ6fPz4q6vL@atlascluster.kxlzv1y.mongodb.net/test?retryWrites=true&w=majority&appName=AtlasCluster");

        const propId = "69ae8149619f0f92ee96ca0c";
        let p = await Property.findById(propId);
        if (!p) p = await SaleProperty.findById(propId);

        if (p) {
            console.log(`Property Found: ${p.title}`);
            console.log(`- Agent ID: ${p.agent}`);
            console.log(`- CreatedBy ID: ${p.createdBy}`);

            if (p.agent) {
                const agent = await Agent.findById(p.agent);
                console.log(`- Agent Info: ${agent ? agent.fullName : "Agent not found in DB"}`);
            }
        } else {
            console.log("Property not found.");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
