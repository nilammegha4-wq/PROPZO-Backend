import express from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import SaleProperty from "../models/SaleProperty.js";
import RentalBooking from "../models/RentalBooking.js";
import { transporter } from "../utils/emailService.js";

const router = express.Router();

router.use(express.json());

/* ============================= */
/* GET BOOKINGS FOR AGENT'S PROPERTIES */
/* ============================= */
router.get("/agent/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({ message: "Invalid agent ID" });
    }

    // 1. Find all properties assigned to this agent (to catch old bookings)
    const [agentProps, agentSaleProps] = await Promise.all([
      Property.find({ agent: agentId }).select("_id"),
      SaleProperty.find({ agent: agentId }).select("_id")
    ]);

    const propertyIds = [
      ...agentProps.map(p => p._id),
      ...agentSaleProps.map(p => p._id)
    ];

    // 2. Fetch from both collections (Booking and RentalBooking)
    // We search by agent field OR by propertyId (for old data)
    const [standardBookings, rentalBookings] = await Promise.all([
      Booking.find({
        $or: [
          { agent: agentId },
          { propertyId: { $in: propertyIds } }
        ]
      }).populate("propertyId").lean(),
      RentalBooking.find({
        $or: [
          { agent: agentId },
          { propertyId: { $in: propertyIds } }
        ]
      }).populate("propertyId").lean()
    ]);

    // 3. Merge and Normalize
    // Standardize RentalBooking fields to match Booking if needed (like 'people' -> 'visitors')
    const normalizedRental = rentalBookings.map(b => ({
      ...b,
      visitors: b.people, // normalize
      type: "Rent"
    }));

    const allBookings = [...standardBookings, ...normalizedRental].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    res.json(allBookings);
  } catch (err) {
    console.error("GET AGENT BOOKINGS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================= */
/* CREATE BOOKING (APPOINTMENT)  */
/* ============================= */
router.post("/", async (req, res) => {
  try {
    const {
      propertyId,
      name,
      email,
      phone,
      visitDate,
      visitTime,
      visitors,
      message,
      virtualTour,
      agentCall
    } = req.body;

    // Basic validation
    if (!propertyId || !name || !email || !phone || !visitDate || !visitTime || !visitors) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // --- Dynamic Agent Assignment ---
    let property = await Property.findById(propertyId);
    if (!property) {
      property = await SaleProperty.findById(propertyId);
    }

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const bookingAgentId = property.agent;
    if (!bookingAgentId) {
      return res.status(400).json({ message: "Error: No agent assigned to this property." });
    }

    const booking = new Booking({
      propertyId,
      agent: bookingAgentId,
      name,
      email,
      phone,
      visitDate,
      visitTime,
      visitors,
      message,
      virtualTour,
      agentCall
    });

    await booking.save();

    // --- Start Email Dispatch ---
    try {
      console.log(`🔍 Attempting to fetch property for appointment: ${propertyId}`);
      let property = await Property.findById(propertyId);

      if (!property) {
        property = await SaleProperty.findById(propertyId);
      }

      if (property) {
        console.log(`✅ Property found: "${property.title}". Category: ${property.category}`);

        // Dynamic Subject and Labels based on category
        let subject = "Your Property Appointment is Confirmed";
        let displayCategory = property.category || "Property";
        let categoryColor = "#6366f1"; // Default Indigo

        if (property.category === "Buy") {
          subject = "Your Property Visit Appointment is Confirmed";
          displayCategory = "Purchase Appointment";
          categoryColor = "#4f46e5";
        } else if (property.category === "Rent") {
          subject = "Your Rental Property Appointment is Confirmed";
          displayCategory = "Rental Appointment";
          categoryColor = "#6366f1";
        } else if (property.category === "PerRent") {
          subject = "Your Pre-Rent Property Appointment is Confirmed";
          displayCategory = "Pre-Rent Arrangement";
          categoryColor = "#818cf8";
        }

        const propertyPrice = property.price ? `₹${property.price.toLocaleString("en-IN")}` : "N/A";
        const propertyImage = (property.images && property.images.length > 0) ? property.images[0] : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1073";

        const emailTemplate = `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #0f172a; padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">PropZo</h1>
              <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 16px;">Appointment Confirmation</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <p style="font-size: 17px; color: #1e293b; margin-top: 0;">Hello <strong>${name}</strong>,</p>
              <p style="font-size: 16px; color: #475569; line-height: 1.6;">Thank you for booking a property appointment on <strong>PropZo</strong>. Your request has been successfully submitted and our team will contact you shortly.</p>
              
              <!-- Property Card -->
              <div style="margin: 30px 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
                <img src="${propertyImage}" alt="${property.title}" style="width: 100%; height: 200px; object-fit: cover;">
                <div style="padding: 20px; background-color: #f8fafc;">
                  <div style="display: inline-block; padding: 4px 10px; background-color: #e0e7ff; color: ${categoryColor}; font-size: 11px; font-weight: 700; border-radius: 6px; text-transform: uppercase; margin-bottom: 12px;">${displayCategory}</div>
                  <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 18px;">${property.title}</h3>
                  <p style="margin: 0; color: #64748b; font-size: 14px;">${property.location}</p>
                  <div style="margin-top: 15px; font-size: 20px; font-weight: 800; color: #0f172a;">${propertyPrice}</div>
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
                    <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${visitors}</td>
                  </tr>
                  ${message ? `
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">Message:</td>
                    <td style="padding: 10px 0; color: #0f172a; font-size: 14px; line-height: 1.5;">"${message}"</td>
                  </tr>
                  ` : ''}
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

        console.log(`📨 Attempting to send appointment confirmation email to: ${email}`);
        await transporter.sendMail({
          from: `"PropZo Appointments" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: subject,
          html: emailTemplate,
        });

        console.log(`✉️ Appointment confirmation email successfully sent to ${email}`);

        // --- Start Admin Notification Email ---
        const adminEmail = process.env.ADMIN_EMAIL || (property.category === "Buy" ? "admin@propzo.com" : "prpzoestate@gmail.com");
        console.log(`📨 Attempting to send admin notification for ${property.category} appointment to: ${adminEmail}`);

        const adminSubject = `New ${property.category} Appointment Booking: ${name}`;

        const adminEmailTemplate = `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #ef4444; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">PropZo Admin</h1>
              <p style="color: #fee2e2; margin: 10px 0 0 0; font-size: 16px;">New ${property.category} Appointment Booking</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Hello PropZo Team,</p>
              <p style="font-size: 16px; color: #475569; line-height: 1.6;">A new <strong>${property.category}</strong> property appointment has been booked. Please review the details below.</p>
              
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
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Price:</td>
                    <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${propertyPrice}</td>
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
                    <td style="padding: 8px 0; color: #0f172a;">${visitors}</td>
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

      } else {
        console.warn(`⚠️ Property not found for ID: ${propertyId}. Skipping email confirmation.`);
      }
    } catch (emailError) {
      console.error("❌ Appointment Email Error:", emailError);
      console.error("⚠️ Failed to send appointment confirmation email:", emailError.message);
      // Non-blocking: Booking is already saved
    }
    // --- End Email Dispatch ---

    res.status(201).json({ success: true, booking });

  } catch (err) {
    console.error("CREATE BOOKING ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ============================= */
/* GET ALL BOOKINGS */
/* ============================= */
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("propertyId") // 🔥 IMPORTANT
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (err) {
    console.error("GET BOOKINGS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ============================= */
/* GET SINGLE BOOKING */
/* ============================= */
router.get("/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate("propertyId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);

  } catch (err) {
    console.error("GET SINGLE BOOKING ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
