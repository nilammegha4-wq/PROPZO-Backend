import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Property from './models/Property.js';
import SaleProperty from './models/SaleProperty.js';

dotenv.config();

const updateAdminName = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // 1. Update all users with admin email
        const userUpdate = await User.updateMany(
            { email: { $in: ["prpzoestate@gmail.com", "admin@propzo.com", "support@propzo.com"] } },
            { $set: { name: "Admin" } }
        );
        console.log(`Updated ${userUpdate.modifiedCount} users by email.`);

        // 2. Update any user specifically named "Patel Mahi"
        const nameUpdate = await User.updateMany(
            { name: "Patel Mahi" },
            { $set: { name: "Admin" } }
        );
        console.log(`Updated ${nameUpdate.modifiedCount} users by name.`);

        // 3. Update SaleProperty legacy sellerName fields
        const sellerUpdate = await SaleProperty.updateMany(
            { sellerName: "Patel Mahi" },
            { $set: { sellerName: "Admin" } }
        );
        console.log(`Updated ${sellerUpdate.modifiedCount} sale properties legacy sellerNames.`);

        // 4. Update any hardcoded owner.name if it exists as a string (handling old schema versions)
        // We do this via raw collection to avoid Mongoose schema validation if the schema changed
        const rawSell = mongoose.connection.collection('sell');
        const legacyOwnerUpdate = await rawSell.updateMany(
            { "owner.name": "Patel Mahi" },
            { $set: { "owner.name": "Admin" } }
        );
        console.log(`Updated ${legacyOwnerUpdate.modifiedCount} legacy owner names in sell collection.`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
updateAdminName();
