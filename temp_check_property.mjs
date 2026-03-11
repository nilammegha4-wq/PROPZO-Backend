import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const propertySchema = new mongoose.Schema({}, { strict: false });
const Property = mongoose.model('Property', propertySchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const p = await Property.findOne({ title: /House/i, location: /Andheri/i });
        if (p) {
            console.log('FOUND:', JSON.stringify(p, null, 2));
        } else {
            console.log('NOT FOUND');
        }
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
