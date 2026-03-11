import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const propertySchema = new mongoose.Schema({}, { strict: false });
const Property = mongoose.model('Property', propertySchema);

async function debug() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const properties = await Property.find({ title: /Event Hall/i }).limit(5);
        console.log('Found properties:', JSON.stringify(properties, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

debug();
