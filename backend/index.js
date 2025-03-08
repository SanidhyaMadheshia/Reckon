import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectToDatabase } from "./db/db.js";
import userRouter from "./routes/user.route.js"

dotenv.config();

const app = express();

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173','http://localhost:8000'], 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

app.use(cors(corsOptions));
app.use(express.json());

connectToDatabase();

app.get('/', (req, res) => {
  res.send('Welcome to the patyient Booking API');
});

app.use('/api/user', userRouter);


const PORT = process.env.PORT || 5000;

mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});