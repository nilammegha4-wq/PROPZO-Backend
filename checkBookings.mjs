import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import RentalBooking from './models/RentalBooking.js';
import PreRentBooking from './models/PreRentBooking.js';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://prpzoestate:z9m3vJ6fPz4q6vL@atlascluster.kxlzv1y.mongodb.net/test?retryWrites=true&w=majority&appName=AtlasCluster");

        const b = await Booking.find().limit(10);
        console.log(`--- Standard Bookings (${await Booking.countDocuments()}) ---`);
        b.forEach(x => console.log(`ID: ${x._id}, Agent: ${x.agent}, Property: ${x.propertyId}`));

        const rb = await RentalBooking.find().limit(10);
        console.log(`--- Rental Bookings (${await RentalBooking.countDocuments()}) ---`);
        rb.forEach(x => console.log(`ID: ${x._id}, Agent: ${x.agent}, Property: ${x.propertyId}`));

        const prb = await PreRentBooking.find().limit(10);
        console.log(`--- PreRent Bookings (${await PreRentBooking.countDocuments()}) ---`);
        prb.forEach(x => console.log(`ID: ${x._id}, Property: ${x.property}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
