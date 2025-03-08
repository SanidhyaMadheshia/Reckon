import mailgun from "mailgun-js";
import dotenv from "dotenv";
import { Otp } from "../models/temp.js"; // Ensure this path is correct

dotenv.config();

// Initialize Mailgun
const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,  // Mailgun API key from .env
    domain: process.env.MAILGUN_DOMAIN   // Your Mailgun domain from .env
});

// Function to generate and send OTP
export const sendOtp = async (email) => {
    try {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        
        // Set OTP expiry to 1 hour from now
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        // Save OTP to database
        await Otp.findOneAndUpdate(
            { email },
            { otp, expiresAt },
            { upsert: true, new: true }
        );

        // Email details
        const emailData = {
            from: "YourApp <no-reply@yourdomain.com>",
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}. It will expire in 1 hour.`
        };

        // Send email using Mailgun
        await mg.messages().send(emailData);

        return { success: true, message: "OTP sent successfully" };

    } catch (err) {
        return { success: false, message: "Error sending OTP", error: err.message };
    }
};
