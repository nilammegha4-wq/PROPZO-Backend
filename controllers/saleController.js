import SaleProperty from "../models/SaleProperty.js";
import { transporter } from "../utils/emailService.js";

export const createSaleProperty = async (req, res) => {
    try {
        console.log("📥 Incoming Sell Request (Files):", req.files?.length);
        console.log("📥 Incoming Sell Body:", JSON.stringify(req.body, null, 2));

        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => `/uploads/sales/${file.filename}`);
        }

        // Standardize fields for MongoDB save
        const finalData = {
            ...req.body,
            propertyType: req.body.propertyType || req.body.category || "Buy",
            images: imagePaths,
            image: imagePaths[0] || "",
            createdBy: req.user._id,

            // Map nested owner object
            owner: {
                name: req.body.sellerName || req.body.owner?.name || "Admin",
                phone: req.body.phone || req.body.owner?.phone || "+91 98765 43210",
                email: req.body.email || req.body.owner?.email || "prpzoestate@gmail.com",
            },

            // Normalize for internal use & save to model
            beds: parseInt(req.body.bhk) || parseInt(req.body.beds) || 0,
            baths: parseInt(req.body.bathrooms) || parseInt(req.body.baths) || 0,
            size: req.body.area || req.body.size,
            furnishingStatus: req.body.furnishing || req.body.furnishingStatus || "N/A",
            floorNumber: parseInt(req.body.floor) || parseInt(req.body.floorNumber) || 0,

            // New Fields
            balconies: Number(req.body.balconies) || 0,
            parking: req.body.parking || "N/A",
            facing: req.body.facing || "East",
            availableFrom: req.body.availableFrom || "Immediately",
            rentDuration: req.body.rentDuration || "month",
        };

        console.log("📝 Final Data for MongoDB Save:", JSON.stringify(finalData, null, 2));

        const saleProperty = await SaleProperty.create(finalData);
        console.log("✅ Saved to 'sell' collection:", saleProperty._id);

        // --- Start Email Dispatch ---
        try {
            const userName = req.user?.name || finalData.owner.name || "User";
            const userEmail = req.user?.email || finalData.owner.email;
            const propertyTitle = finalData.title;
            const propertyLocation = finalData.city;
            const propertyPrice = finalData.price.toLocaleString("en-IN", { style: "currency", currency: "INR" });
            const propertyType = finalData.propertyType;
            const submitDate = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

            if (userEmail && userEmail !== "support@propzo.com" && userEmail !== "admin@propzo.com") {
                const emailTemplate = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
                            <h2 style="color: #ffffff; margin: 0; font-size: 24px;">PropZo</h2>
                            <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">Thank you for listing your property on our platform.</p>
                        </div>
                        <div style="padding: 30px; background-color: #ffffff;">
                            <p style="font-size: 16px; color: #334155; margin-top: 0;">Hello <strong>${userName}</strong>,</p>
                            <p style="font-size: 16px; color: #334155;">Thank you for listing your property with us.</p>
                            <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">Your property has been successfully submitted and is now under review.</p>
                            
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                                <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Property Details</h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b; font-weight: bold; width: 40%;">Title:</td>
                                        <td style="padding: 8px 0; color: #0f172a;">${propertyTitle}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Location:</td>
                                        <td style="padding: 8px 0; color: #0f172a;">${propertyLocation}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Price:</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${propertyPrice}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Property Type:</td>
                                        <td style="padding: 8px 0; color: #0f172a;">${propertyType}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Date Submitted:</td>
                                        <td style="padding: 8px 0; color: #0f172a;">${submitDate}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="font-size: 16px; color: #334155;">Our team will review your property and make it available on the platform shortly.</p>
                            <p style="font-size: 16px; color: #334155; margin-bottom: 0;">Best regards,<br><strong>Real Estate Team</strong></p>
                        </div>
                    </div>
                `;

                console.log("📨 Attempting to send user confirmation email to:", userEmail);
                await transporter.sendMail({
                    from: `"PropZo Real Estate" <${process.env.EMAIL_USER}>`,
                    to: userEmail,
                    subject: "Your Property Has Been Successfully Listed",
                    html: emailTemplate
                });
                console.log(`✉️ User confirmation email successfully sent to: ${userEmail}`);
            }

            // --- Admin Notification Email ---
            const adminEmail = process.env.ADMIN_EMAIL || "prpzoestate@gmail.com";
            console.log("📨 Attempting to send admin notification email to:", adminEmail);
            // ... (rest remains the same but inside the try block)
            const adminEmailTemplate = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #ef4444; padding: 20px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0; font-size: 24px;">PropZo Admin Alert</h2>
                        <p style="color: #fee2e2; margin: 8px 0 0 0; font-size: 14px;">New Property Listing Notification</p>
                    </div>
                    <div style="padding: 30px; background-color: #ffffff;">
                        <p style="font-size: 16px; color: #334155;">Hello PropZo Team,</p>
                        <p style="font-size: 16px; color: #334155;">A new property has been listed on the platform by a user.</p>
                        
                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">User Details</h3>
                            <p style="margin: 8px 0; color: #334155;"><strong>Name:</strong> ${userName}</p>
                            <p style="margin: 8px 0; color: #334155;"><strong>Email:</strong> ${userEmail}</p>
                        </div>

                        <div style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Property Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-weight: bold; width: 40%;">Title:</td>
                                    <td style="padding: 8px 0; color: #0f172a;">${propertyTitle}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Type:</td>
                                    <td style="padding: 8px 0; color: #0f172a;">${propertyType}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Location:</td>
                                    <td style="padding: 8px 0; color: #0f172a;">${propertyLocation}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Price:</td>
                                    <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${propertyPrice}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Submission Date:</td>
                                    <td style="padding: 8px 0; color: #0f172a;">${submitDate}</td>
                                </tr>
                            </table>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:5174/admin/properties" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Property</a>
                        </div>
                        
                        <p style="font-size: 14px; color: #64748b; text-align: center;">This is an automated notification from the PropZo platform.</p>
                    </div>
                </div>
            `;

            await transporter.sendMail({
                from: `"PropZo Noreply" <${process.env.EMAIL_USER}>`,
                to: adminEmail,
                subject: "New Property Listed on PropZo Platform",
                html: adminEmailTemplate
            });
            console.log(`✉️ Admin notification email successfully sent to: ${adminEmail}`);

        } catch (emailError) {
            console.error("❌ Email Dispatch Error:", emailError);
            console.error("⚠️ Failed to dispatch confirmation email:", emailError.message);
            // Non-blocking: We catch silently to avoid disrupting the property listing completion
        }
        // --- End Email Dispatch ---

        res.status(201).json(saleProperty);
    } catch (error) {
        console.error("❌ Create Sale Property Error:", error);
        res.status(500).json({
            message: "Validation or Server Error",
            error: error.message,
            details: error.errors // validation errors
        });
    }
};

export const getSaleProperties = async (req, res) => {
    try {
        const sales = await SaleProperty.find().sort({ createdAt: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSaleProperty = async (req, res) => {
    try {
        await SaleProperty.findByIdAndDelete(req.params.id);
        res.json({ message: "Sale request deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
