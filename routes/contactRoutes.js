// // // import express from "express";
// // // import Contact from "../models/Contact.js";

// // // const router = express.Router();

// // // // ================= CREATE MESSAGE =================
// // // router.post("/", async (req, res) => {
// // //   try {

// // //     const contact = new Contact(req.body);
// // //     await contact.save();

// // //     res.status(201).json({ message: "Message sent successfully" });

// // //   } catch (error) {
// // //     res.status(500).json({ error: error.message });
// // //   }
// // // });


// // // // ================= GET ALL MESSAGES (ADMIN) =================
// // // router.get("/", async (req, res) => {
// // //   try {

// // //     const contacts = await Contact.find().sort({ createdAt: -1 });

// // //     res.json(contacts);

// // //   } catch (error) {
// // //     res.status(500).json({ error: error.message });
// // //   }
// // // });

// // // export default router;


// // import express from "express";
// // import Contact from "../models/Contact.js";
// // import nodemailer from "nodemailer";

// // const router = express.Router();

// // /* ================================
// //    EMAIL TRANSPORTER (GMAIL)
// // ================================ */
// // const transporter = nodemailer.createTransport({
// //   service: "gmail",
// //   auth: {
// //     user: process.env.EMAIL_USER,   // your gmail
// //     pass: process.env.EMAIL_PASS    // gmail app password
// //   }
// // });

// // /* ================================
// //    1️⃣ USER SEND CONTACT MESSAGE
// // ================================ */
// // router.post("/", async (req, res) => {
// //   try {

// //     const { name, email, phone, message } = req.body;

// //     if (!name || !email || !message) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Name, email and message are required"
// //       });
// //     }

// //     const newContact = new Contact({
// //       name,
// //       email,
// //       phone,
// //       message
// //     });

// //     await newContact.save();

// //     res.status(201).json({
// //       success: true,
// //       message: "Message sent successfully"
// //     });

// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: error.message
// //     });
// //   }
// // });


// // /* ================================
// //    2️⃣ ADMIN GET ALL MESSAGES
// // ================================ */
// // router.get("/", async (req, res) => {
// //   try {

// //     const contacts = await Contact.find().sort({ createdAt: -1 });

// //     res.json({
// //       success: true,
// //       data: contacts
// //     });

// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: error.message
// //     });
// //   }
// // });


// // /* ================================
// //    3️⃣ ADMIN GET SINGLE MESSAGE
// // ================================ */
// // router.get("/:id", async (req, res) => {
// //   try {

// //     const contact = await Contact.findById(req.params.id);

// //     if (!contact) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Message not found"
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       data: contact
// //     });

// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: error.message
// //     });
// //   }
// // });


// // /* ================================
// //    4️⃣ ADMIN APPROVE MESSAGE
// // ================================ */
// // router.put("/approve/:id", async (req, res) => {
// //   try {

// //     const contact = await Contact.findById(req.params.id);

// //     if (!contact) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Message not found"
// //       });
// //     }

// //     contact.status = "approved";

// //     await contact.save();

// //     res.json({
// //       success: true,
// //       message: "Message approved"
// //     });

// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: error.message
// //     });
// //   }
// // });


// // /* ================================
// //    5️⃣ ADMIN RESPOND + SEND EMAIL
// // ================================ */
// // router.put("/respond/:id", async (req, res) => {
// //   try {

// //     const { response } = req.body;

// //     const contact = await Contact.findById(req.params.id);

// //     if (!contact) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Message not found"
// //       });
// //     }

// //     contact.adminResponse = response;
// //     contact.status = "responded";
// //     contact.respondedAt = new Date();

// //     await contact.save();

// //     /* SEND EMAIL */
// //     await transporter.sendMail({
// //       from: process.env.EMAIL_USER,
// //       to: contact.email,
// //       subject: "Response from Propzo Support",
// //       html: `
// //         <h2>Hello ${contact.name}</h2>
// //         <p>Thank you for contacting <b>Propzo</b>.</p>
// //         <p><b>Your Message:</b></p>
// //         <p>${contact.message}</p>
// //         <hr>
// //         <p><b>Our Response:</b></p>
// //         <p>${response}</p>
// //         <br>
// //         <p>Regards,<br>Propzo Team</p>
// //       `
// //     });

// //     res.json({
// //       success: true,
// //       message: "Response sent and email delivered"
// //     });

// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: error.message
// //     });
// //   }
// // });


// // /* ================================
// //    6️⃣ ADMIN DELETE MESSAGE
// // ================================ */
// // router.delete("/:id", async (req, res) => {
// //   try {

// //     const contact = await Contact.findByIdAndDelete(req.params.id);

// //     if (!contact) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Message not found"
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       message: "Message deleted"
// //     });

// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: error.message
// //     });
// //   }
// // });

// // export default router;


// import express from "express";
// import Contact from "../models/Contact.js";
// import nodemailer from "nodemailer";

// const router = express.Router();
// /* ================= EMAIL CONFIG ================= */

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });



// // CREATE CONTACT MESSAGE
// router.post("/", async (req, res) => {
//   try {
//     const { name, email, phone, message } = req.body;

//     const newContact = new Contact({
//       name,
//       email,
//       phone,
//       message,
//     });

//     await newContact.save();

//     res.status(201).json({
//       success: true,
//       message: "Message sent successfully",
//       contact: newContact,
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });


// /* ================= GET ALL CONTACTS ================= */

// router.get("/contacts", async (req, res) => {
//   try {

//     const contacts = await Contact.find().sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       contacts,
//     });

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });

//   }
// });


// /* ================= RESPOND TO CONTACT ================= */

// router.put("/contacts/:id/respond", async (req, res) => {

//   try {

//     const { adminResponse } = req.body;

//     const contact = await Contact.findById(req.params.id);

//     if (!contact) {
//       return res.status(404).json({
//         success: false,
//         message: "Contact not found",
//       });
//     }

//     contact.adminResponse = adminResponse;
//     contact.status = "responded";
//     contact.respondedAt = new Date();

//     await contact.save();

//     /* ================= SEND EMAIL ================= */

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: contact.email,
//       subject: "Response from Propzo Support",
//       html: `
//         <h2>Hello ${contact.name}</h2>

//         <p>Thank you for contacting <b>Propzo</b>.</p>

//         <p><b>Your Message:</b></p>
//         <p>${contact.message}</p>

//         <hr/>

//         <p><b>Admin Response:</b></p>
//         <p>${adminResponse}</p>

//         <br/>

//         <p>Regards,<br/>Propzo Team</p>
//       `,
//     });

//     res.json({
//       success: true,
//       message: "Response sent successfully",
//     });

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });

//   }

// });

// export default router;


import express from "express";
import Contact from "../models/Contact.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";

const router = express.Router();

/* ================= EMAIL CONFIG ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= CREATE CONTACT ================= */

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const newContact = new Contact({
      name,
      email,
      phone,
      message,
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      contact: newContact,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* ================= GET ALL CONTACTS ================= */

router.get("/", async (req, res) => {
  try {

    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      contacts,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
});

/* ================= RESPOND TO CONTACT ================= */

router.put("/:id/respond", async (req, res) => {

  try {

    const { adminResponse } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    contact.adminResponse = adminResponse;
    contact.status = "responded";
    contact.respondedAt = new Date();

    await contact.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: contact.email,
      subject: "Update Regarding Your Inquiry - Propzo Support",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #e0e0e0;">
          <div style="text-align: center; padding-bottom: 20px;">
            <h1 style="color: #1a73e8; margin: 0;">Propzo</h1>
            <p style="color: #5f6368; font-size: 14px; margin: 5px 0 0;">Real Estate Group</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h2 style="color: #202124; margin-top: 0;">Hello ${contact.name},</h2>
            <p style="color: #3c4043; line-height: 1.6;">Thank you for reaching out to us. We have reviewed your message and would like to provide an update.</p>
            
            <div style="margin: 25px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #1a73e8; border-radius: 4px;">
              <p style="margin: 0; font-weight: bold; color: #1a73e8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Message:</p>
              <p style="margin: 8px 0 0; color: #5f6368; font-style: italic;">"${contact.message}"</p>
            </div>
            
            <div style="margin: 25px 0;">
              <p style="margin: 0; font-weight: bold; color: #202124;">Our Response:</p>
              <p style="margin: 10px 0 0; color: #3c4043; line-height: 1.6; white-space: pre-line;">${adminResponse}</p>
            </div>
            
            <p style="color: #3c4043; line-height: 1.6; margin-top: 30px;">
              Thank you for choosing <b>Propzo</b>. We appreciate your interest and look forward to assisting you further.
            </p>
            
            <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
              <p style="margin: 0; color: #5f6368; font-size: 14px;">Regards,<br><b>Propzo Support Team</b></p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #9aa0a6; font-size: 12px;">© ${new Date().getFullYear()} Propzo Real Estate. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    res.json({
      success: true,
      message: "Response sent successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

});

export default router;