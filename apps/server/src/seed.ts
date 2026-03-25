import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedChicorunProblems } from './utils/chicorun-problem-seeder';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/miki-labs';

const runSeed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        await seedChicorunProblems();

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Seed script failed:', error);
        process.exit(1);
    }
};

runSeed();
