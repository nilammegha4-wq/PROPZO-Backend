import mongoose from 'mongoose';
import Property from './models/Property.js';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://prpzoestate:z9m3vJ6fPz4q6vL@atlascluster.kxlzv1y.mongodb.net/test?retryWrites=true&w=majority&appName=AtlasCluster");

        const propId = "69ae8149619f0f92ee96ca0c";
        let p = await Property.findById(propId).lean(); // Use lean to see raw data

        if (p) {
            console.log(`Property Found: ${p.title}`);
            console.log(`- Raw Agent: ${p.agent}`);
            console.log(`- Raw Agent Type: ${typeof p.agent}`);
            console.log(`- Is Agent ObjectId? ${p.agent instanceof mongoose.Types.ObjectId}`);
            console.log(`- agent.toString(): ${p.agent ? p.agent.toString() : 'null'}`);
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
