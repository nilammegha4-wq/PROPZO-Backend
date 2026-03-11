import mongoose from 'mongoose';
import Property from './models/Property.js';
import SaleProperty from './models/SaleProperty.js';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://prpzoestate:z9m3vJ6fPz4q6vL@atlascluster.kxlzv1y.mongodb.net/test?retryWrites=true&w=majority&appName=AtlasCluster");

        const propId = "69ae8149619f0f92ee96ca0c";
        let p = await Property.findById(propId);
        if (p) {
            console.log("Found in Property collection");
        } else {
            let sp = await SaleProperty.findById(propId);
            if (sp) {
                console.log("Found in SaleProperty collection");
            } else {
                console.log("Not found anywhere");
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
