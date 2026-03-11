import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter using environment variables
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email (Nodemailer) Verification Failed:", error.message);
    if (error.code === 'EAUTH') {
      console.error("💡 Recommendation: Check if your EMAIL_PASS is a valid Gmail App Password.");
    }
  } else {
    console.log("✅ Email (Nodemailer) is ready to send messages");
  }
});

/**
 * Generates an HTML email template for Premium Service Approval.
 */
const generatePremiumServiceApprovalEmailTemplate = (userName, packageName, serviceType) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; color: #333333; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #4f46e5; color: #ffffff; padding: 30px 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px; }
        .greeting { font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 20px; }
        .message { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 30px; }
        .details-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin-bottom: 30px; }
        .footer { background-color: #f1f5f9; padding: 30px 40px; text-align: center; font-size: 13px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Request Approved!</h1>
        </div>
        <div class="content">
          <div class="greeting">Hello ${userName},</div>
          <div class="message">
            We are excited to inform you that your request for <strong>${packageName}</strong> (${serviceType}) has been <strong>Approved</strong> by our administration team.
          </div>
          <div class="details-card">
            <p style="margin:0;">A representative from our <strong>${serviceType}</strong> team will reach out to you within the next 24 business hours to discuss the next steps.</p>
          </div>
          <div class="message">
            Thank you for choosing us for your premium service needs!
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Premium Real Estate Services. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Sends a premium service approval confirmation email.
 */
export const sendPremiumServiceApprovalEmail = async (userEmail, userName, packageName, serviceType) => {
  try {
    if (!userEmail) return false;

    const htmlContent = generatePremiumServiceApprovalEmailTemplate(userName, packageName, serviceType);

    const mailOptions = {
      from: `"Premium Services" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Your ${serviceType} Request is Approved!`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Premium service approval email sent: ", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending premium service approval email: ", error);
    return false;
  }
};
