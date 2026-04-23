import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/miki-labs';

async function check() {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    if (db) {
        const docs = await db.collection('chicorunproblems').find({ level: 45, orderIndex: 1 }).toArray();
        console.log('Docs for Level 45, Order 1:');
        docs.forEach(d => {
            console.log(`- Passage: ${d.passage.substring(0, 30)}...`);
        });
    }
    await mongoose.disconnect();
}

check();
