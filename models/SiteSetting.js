import mongoose from "mongoose";

const siteSettingSchema = new mongoose.Schema(
    {
        siteName: {
            type: String,
            default: "PropZo",
        },
        supportEmail: {
            type: String,
            default: "prpzoestate@gmail.com",
        },
        currency: {
            type: String,
            default: "INR",
        },
    },
    { timestamps: true }
);

const SiteSetting = mongoose.model("SiteSetting", siteSettingSchema);

export default SiteSetting;
