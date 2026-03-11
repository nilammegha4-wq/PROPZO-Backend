import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function fixImages() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Fix "Event Hall"
        const result1 = await mongoose.connection.db.collection('properties').updateMany(
            { title: /Event Hall/i },
            { $set: { images: ["/Eventhall.jpg"] } }
        );
        console.log(`Updated ${result1.modifiedCount} "Event Hall" properties.`);

        // 2. Fix other suspicious paths if found
        const suspicious = await mongoose.connection.db.collection('properties').find({
            images: { $regex: /^\/event\d\.jpg/i }
        }).toArray();

        console.log('Other suspicious properties:', suspicious.length);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

fixImages();
