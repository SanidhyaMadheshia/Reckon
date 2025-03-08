import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Otp, User } from "../models/temp.js"; // Ensure this path is correct
import { sendOtp } from "../utils/sendOtp.js";
import { addEntryExpense } from "../controllers/user.controller.js";

const router = express.Router();
router.use(express.json());

// User Registration
router.post("/register", async (req, res) => {
    try {
        const { firstname, lastName, age, gender, course,otp , email, phoneNumber, password, college } = req.body;

        // Check if user already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });
        let userVerified = await Otp.findOne({
            email : email,
            otp 
        });
        if(!userVerified) return  res.status(400).json({ message: "User Not verified " });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name: `${firstname} ${lastName}`,
            age,
            gender,
            course,
            email,
            phoneNumber,
            password: hashedPassword,
            college
        });

        await newUser.save();
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });
        res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});
router.post("/generateOtp",async (req,res)=>{
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: "Email is required" });

        const response = await sendOtp(email);

        if (response.success) {
            res.status(200).json({ message: response.message });
        } else {
            res.status(500).json({ message: response.message });
        }

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
})
router.post("/verifyOtp", async (req, res) => {
    try {
        const { email, otp } = req.body;

        let otpRecord = await Otp.findOne({ email, otp });

        if (!otpRecord) return res.status(400).json({ message: "Invalid or expired OTP" });

        if (otpRecord.expiresAt < new Date()) {
            await Otp.deleteOne({ email }); // Remove expired OTP
            return res.status(400).json({ message: "OTP expired" });
        }

        res.status(200).json({ message: "OTP verified successfully" });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});
// User Login
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});
router.post("/addEntry",addEntryExpense);
export default router;
