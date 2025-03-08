import mongoose from "mongoose";
import Entry from "../models/Entry.js";
import { Transaction,User,Entry } from "../models/temp.js"; 
// import User from "../models/User.js";

export const addEntryExpense = async (req, res) => {
    const session = await mongoose.startSession(); // Start a session for atomicity
    session.startTransaction(); // Start transaction

    try {
        const { userId, title, amount, category, tags, entryDate } = req.body;

        // Validate input
        if (!userId || !title || !amount || !category ) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Find the user and lock the document for update
        const user = await User.findById(userId).session(session);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Calculate the new balance
        let newBalance = user.money;
        newBalance-=amount;
        // Ensure user has sufficient balance for expense
        const date = entryDate ? new Date(entryDate) : new Date();

        // Create a new Entry
        const newEntry = await Entry.create(
            [
                {
                    userId,
                    title,
                    amount,
                    category,
                    tags,
                    createdAt: date, // Use the provided date or default to now
                    updatedAt: date,
                },
            ],
            { session }
        );

        // Create a related Transaction
        const newTransaction = await Transaction.create(
            [
                {
                    userId,
                    entryId: newEntry[0]._id, // Reference the created entry
                    amount,
                    type,
                    title,
                    closingBalance: newBalance,
                    createdAt: date, // Use the provided date or default to now
                    updatedAt: date,
                },
            ],
            { session }
        );

        // Update user balance
        user.money = newBalance;
        await user.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({ 
            message: "Entry added successfully", 
            entry: newEntry[0], 
            transaction: newTransaction[0], 
            balance: newBalance 
        });
    } catch (error) {
        await session.abortTransaction(); // Rollback on error
        session.endSession();
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
