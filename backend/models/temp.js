import mongoose  from "mongoose";
const categories = [
    "Food",
    "Entertainment",
    "Tuition",
    "Rent",
    "Shopping",
    "Travel",
    "Healthcare",
    "Utilities",
    "Miscellaneous",
    "Subscriptions"
];
const CollegeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    domain: { type: String, required: true },
    locationCoordinates: {
        lat: { type: Number, required: true },
        long: { type: Number, required: true }
    }
});

import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    course: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },
    tags: [{ type: String }],
    money: { type: Number, default: 0 }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


const OtpSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 10 * 60000) } // 10 min expiry
});

// Automatically remove expired OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


const EntrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String,enum : categories, required: true },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    doneAt: { type: Date },
    notes: {
        summary: [{ type: String }],
        userNote: { type: String }
    }
});

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    entryId: { type: mongoose.Schema.Types.ObjectId, ref: "Entry", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["expense", "borrow", "lend", "received"], required: true },
    description: { type: String, required: true },
    closingBalance: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const SubscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, enum: categories, required: true },
    name: { type: String, required: true }, // Subscription name (e.g., Netflix, Gym, Spotify)
    amount: { type: Number, required: true },
    durationMonths: { type: Number, required: true }, // Duration in months
    autoRenew: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: ["Card", "UPI", "Bank Transfer", "Cash"], required: true },
    status: { type: String, enum: ["Active", "Cancelled", "Expired"], default: "Active" }
}, { timestamps: true });

// Virtual field to calculate next renewal date
SubscriptionSchema.virtual("renewalDate").get(function () {
    return new Date(this.updatedAt.getTime() + this.durationMonths * 30 * 24 * 60 * 60 * 1000);
});


export const College = mongoose.model("College", CollegeSchema);
export const User = mongoose.model("User", UserSchema);
export const Otp = mongoose.model("Otp", OtpSchema);
export const Entry = mongoose.model("Entry", EntrySchema);
export const Transaction = mongoose.model("Transaction", TransactionSchema);
export const Subscription = mongoose.model("Subscription", SubscriptionSchema);

