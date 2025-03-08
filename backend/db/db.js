import mongoose from 'mongoose';

export async function connectToDatabase() {
  try {
    const dbURI = process.env.MONGODB_URI;

    if (!dbURI) {
      console.error(
        'MongoDB URI is not defined in the environment variables.'
      );
      process.exit(1);
    }

    await mongoose.connect(dbURI);

    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}