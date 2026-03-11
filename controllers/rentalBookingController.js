import RentalBooking from "../models/RentalBooking.js";
import Property from "../models/Property.js";
import { transporter } from "../utils/emailService.js";

export const createRentalBooking = async (req, res) => {
    try {
        const { propertyId } = req.body;

        // Fetch property to get the assigned agent
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        const agentId = property.agent;
        if (!agentId) {
            return res.status(400).json({ message: "No agent assigned to this property." });
        }

        const newBooking = new RentalBooking({
            ...req.body,
            agent: agentId
        });
        await newBooking.save();

        // --- Start Rental Confirmation Email ---
        try {
            const { propertyId, name, email, phone, visitDate, visitTime, people, message } = req.body;
            const property = await Property.findById(propertyId);

            if (property) {
                console.log(`📨 Attempting to send RENTAL confirmation email to: ${email}`);

                const propertyPrice = property.price ? `₹${property.price.toLocaleString()}` : "Price on request";
                const propertyImage = (property.images && property.images.length > 0) ? property.images[0] : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1073";

                const rentEmailTemplate = `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #0f172a; padding: 40px 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">PropZo</h1>
                        <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 16px;">Rental Appointment Confirmation</p>
                    </div>
                    
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Hello ${name},</h2>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Thank you for booking a rental property appointment on <strong>PropZo</strong>. Your request has been successfully submitted and our agent will contact you shortly.</p>
                        
                        <!-- Property Card -->
                        <div style="margin: 30px 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
                            <img src="${propertyImage}" alt="${property.title}" style="width: 100%; height: 200px; object-fit: cover;">
                            <div style="padding: 20px; background-color: #f8fafc;">
                                <div style="display: inline-block; padding: 4px 10px; background-color: #e0e7ff; color: #6366f1; font-size: 11px; font-weight: 700; border-radius: 6px; text-transform: uppercase; margin-bottom: 12px;">Rental Appointment</div>
                                <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 18px;">${property.title}</h3>
                                <p style="margin: 0; color: #64748b; font-size: 14px;">${property.location}</p>
                                <div style="margin-top: 15px; font-size: 20px; font-weight: 800; color: #0f172a;">${propertyPrice}<span style="font-size: 14px; color: #64748b; font-weight: 400;"> / month</span></div>
                            </div>
                        </div>

                        <!-- Appointment Details -->
                        <div style="background-color: #f1f5f9; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                            <h3 style="margin: 0 0 15px 0; color: #0f172a; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Visit Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 40%;">Visit Date:</td>
                                    <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${visitDate}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Visit Time:</td>
                                    <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${visitTime}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Number of Visitors:</td>
                                    <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${people}</td>
                                </tr>
                                ${message ? `
                                <tr>
                                    <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">Message:</td>
                                    <td style="padding: 10px 0; color: #0f172a; font-size: 14px; line-height: 1.5;">"${message}"</td>
                                </tr>` : ""}
                            </table>
                        </div>

                        <div style="text-align: center; margin-top: 40px;">
                            <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Want to track your property interactions?</p>
                            <a href="http://localhost:5173/my-activity" style="background-color: #6366f1; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">View My Activity</a>
                        </div>
                    </div>
                    
                    <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0; color: #94a3b8; font-size: 13px;">© 2026 PropZo Real Estate. All rights reserved.</p>
                    </div>
                </div>
                `;

                await transporter.sendMail({
                    from: `"PropZo Notifications" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: "Your Rental Property Appointment is Confirmed",
                    html: rentEmailTemplate,
                });

                console.log(`✉️ Rental confirmation email successfully sent to ${email}`);

                // --- Start Admin Notification Email (for Rent appointments) ---
                const adminEmail = process.env.ADMIN_EMAIL || "prpzoestate@gmail.com";
                const adminSubject = `New Rental Appointment Booking: ${name}`;

                const adminEmailTemplate = `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #ef4444; padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">PropZo Admin</h1>
                        <p style="color: #fee2e2; margin: 10px 0 0 0; font-size: 16px;">New Rental Appointment Booking</p>
                    </div>
                    
                    <div style="padding: 40px 30px;">
                        <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Hello PropZo Team,</p>
                        <p style="font-size: 16px; color: #475569; line-height: 1.6;">A new <strong>Rental</strong> property appointment has been booked. Please review the details below.</p>
                        
                        <!-- User Details -->
                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 30px 0;">
                            <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; border-bottom: 2px solid #ef4444; padding-bottom: 8px; display: inline-block;">User Information</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 35%;">Name:</td>
                                    <td style="padding: 8px 0; color: #0f172a;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email:</td>
                                    <td style="padding: 8px 0; color: #0f172a;">${email}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone:</td>
                                    <td style="padding: 8px 0; color: #0f172a;">${phone}</td>
                                </tr>
                            </table>
                        </div>

                        <!-- Property Details -->
                        <div style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 30px 0;">
                            <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; border-bottom: 2px solid #ef4444; padding-bottom: 8px; display: inline-block;">Property Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 35%;">Title:</td>
                                    <td style="padding: 8px 0; color: #0f172a;">${property.title}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Location:</td>
                                    <td style="padding: 8px 0; color: #0f172a;">${property.location}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Rent:</td>
                                    <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${propertyPrice} / mo</td>
                                </tr>
                            </table>
                        </div>

                        <!-- Visit Details -->
                        <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 24px;">
                            <h3 style="margin: 0 0 16px 0; color: #9f1239; font-size: 18px; border-bottom: 2px solid #e11d48; padding-bottom: 8px; display: inline-block;">Visit Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #9f1239; font-weight: 600; width: 35%;">Date:</td>
                                    <td style="padding: 8px 0; color: #0f172a;">${visitDate}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #9f1239; font-weight: 600;">Time:</td>
                                    <td style="padding: 8px 0; color: #0f172a;">${visitTime}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #9f1239; font-weight: 600;">Visitors:</td>
                                    <td style="padding: 8px 0; color: #0f172a;">${people}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="margin-top: 40px; text-align: center;">
                            <a href="http://localhost:5174/admin/bookings" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block;">View Booking in Admin Dashboard</a>
                        </div>
                    </div>
                    
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0; color: #94a3b8; font-size: 13px;">This is an automated system alert from PropZo.</p>
                    </div>
                </div>
                `;

                await transporter.sendMail({
                    from: `"PropZo Admin Alerts" <${process.env.EMAIL_USER}>`,
                    to: adminEmail,
                    subject: adminSubject,
                    html: adminEmailTemplate,
                });

                console.log(`✉️ Admin notification email successfully sent to ${adminEmail}`);
                // --- End Admin Notification Email ---
            }
        } catch (emailError) {
            console.error("❌ Rental Email Dispatch Error:", emailError);
            // Non-blocking
        }
        // --- End Rental Confirmation Email ---

        res.status(201).json({ message: "Rental appointment request submitted successfully.", booking: newBooking });
    } catch (error) {
        console.error("Error creating rental booking:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getRentalBookings = async (req, res) => {
    try {
        const bookings = await RentalBooking.find().populate("propertyId", "title location price images").sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching rental bookings:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
