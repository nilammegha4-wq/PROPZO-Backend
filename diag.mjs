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
        console.log("Connected to MongoDB");

        const agents = await Agent.find();
        console.log(`Found ${agents.length} agents`);

        for (const agent of agents) {
            const id = agent._id;

            const agentProps = await Property.find({ agent: id }).select("_id");
            const agentSaleProps = await SaleProperty.find({ agent: id }).select("_id");
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

            console.log(`Agent: ${agent.fullName} (${id})`);
            console.log(` - Property IDs: ${propIds.length}`);
            console.log(` - Buy Bookings: ${bCount}`);
            console.log(` - Rent Bookings: ${rCount}`);
            // Check if there are ANY PreRent bookings in the system
            const totalPreRent = await PreRentBooking.countDocuments();
            console.log(` - PreRent Bookings for Agent: ${prCount} (Total in System: ${totalPreRent})`);
            console.log(` - Total Deals: ${bCount + rCount + prCount}`);
            console.log('-------------------');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
