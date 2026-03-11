import mongoose from "mongoose";

const salePropertySchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        displayPrice: { type: String },
        propertyType: {
            type: String,
            enum: ["Buy", "Rent", "PerRent"],
            required: true
        },
        type: { type: String, default: "Apartment" },
        category: { type: String, default: "sale" },

        // Property Details (Standardized)
        beds: { type: Number },
        baths: { type: Number },
        bhk: { type: String }, // support legacy
        bathrooms: { type: String }, // support legacy
        area: { type: String },
        size: { type: String },
        furnishing: { type: String },
        furnishingStatus: { type: String },
        floor: { type: String },
        floorNumber: { type: Number },
        totalFloors: { type: String },
        propertyAge: { type: String },
        balconies: { type: Number },
        parking: { type: String },
        facing: { type: String },
        availableFrom: { type: String },
        rentDuration: { type: String },

        // Location
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String },
        pincode: { type: String },
        map: { type: String },
        mapEmbed: { type: String },

        // Media
        amenities: [String],
        images: [String],
        image: { type: String },

        // Owner Info (Nested Object for consistency)
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // Legacy Seller Fields (for backward compatibility if any)
        sellerName: { type: String },
        phone: { type: String },
        email: { type: String },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        agent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Agent",
            default: null
        },
    },
    {
        timestamps: true,
        collection: "sell",
    }
);

const SaleProperty = mongoose.model("SaleProperty", salePropertySchema);
export default SaleProperty;
