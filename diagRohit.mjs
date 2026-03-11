import mongoose from 'mongoose';
import Agent from './models/Agent.js';
import Booking from './models/Booking.js';
import RentalBooking from './models/RentalBooking.js';
import PreRentBooking from './models/PreRentBooking.js';
import Property from './models/Property.js';
import SaleProperty from './models/SaleProperty.js';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://prpzoestate:z9m3vJ6fPz4q6vL@atlascluster.kxlzv1y.mongodb.net/test?retryWrites=true&w=majority&appName=AtlasCluster");

        const id = new mongoose.Types.ObjectId("69ab0e4252d8567dcf550203");
        const agent = await Agent.findById(id);
        console.log(`Target Agent: ${agent.fullName}`);

        const agentProps = await Property.find({ agent: id }).select("_id title");
        console.log(`Properties in 'Property': ${agentProps.length}`);
        agentProps.forEach(p => console.log(` - ${p.title} (${p._id})`));

        const agentSaleProps = await SaleProperty.find({ agent: id }).select("_id title");
        console.log(`Properties in 'SaleProperty': ${agentSaleProps.length}`);
        agentSaleProps.forEach(p => console.log(` - ${p.title} (${p._id})`));

        const propIds = [
            ...agentProps.map(p => p._id),
            ...agentSaleProps.map(p => p._id)
        ];

        const bCount = await Booking.countDocuments({
            $or: [
                { agent: id },
                { propertyId: { $in: propIds } }
            ]
        });

        const rCount = await RentalBooking.countDocuments({
            $or: [
                { agent: id },
                { propertyId: { $in: propIds } }
            ]
        });

        const prCount = await PreRentBooking.countDocuments({ property: { $in: propIds } });

        console.log(`RESULTS for Rohit:`);
        console.log(` - Buy Bookings (Booking): ${bCount}`);
        console.log(` - Rent Bookings (RentalBooking): ${rCount}`);
        console.log(` - PreRent Bookings: ${prCount}`);
        console.log(` - Total Deals: ${bCount + rCount + prCount}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
