import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || '';

const start = async () => {
    try {
        if (MONGO_URI) {
            await mongoose.connect(MONGO_URI);
            console.log('Connected to MongoDB');
        } else {
            console.warn('MONGO_URI is not defined, skipping DB connection for now.');
        }

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

start();
