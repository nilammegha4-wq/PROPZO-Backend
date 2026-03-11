import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function purgeAdminDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/propzo");
        console.log("Connected to MongoDB");

        // Drop the admins collection entirely
        await mongoose.connection.db.dropCollection("admins");
        console.log("Successfully deleted the 'admins' collection. No admin data is stored in the database.");

        process.exit(0);
    } catch (error) {
        if (error.code === 26) {
            console.log("The 'admins' collection does not exist anyway.");
        } else {
            console.error("Purge error:", error);
        }
        process.exit(1);
    }
}

purgeAdminDB();
