import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "prpzoestate@gmail.com",
        pass: "mmnmwhrucjuaglbx", // hardcoded pass from authRoutes.js
    },
});

async function test() {
    try {
        console.log("Sending email...");
        await transporter.sendMail({
            from: "prpzoestate@gmail.com",
            to: "nilammegha4@gmail.com",
            subject: "Your Login OTP",
            text: `Your OTP is 123456`,
        });
        console.log("Email sent successfully!");
    } catch (err) {
        console.error("Email error:", err.message);
        console.error(err.stack);
    }
}

test();
