import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ChicorunProblemService } from './services/chicorun-problem.service';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/miki-labs';

async function test() {
    await mongoose.connect(MONGODB_URI);

    // Level 45 starts at index 570
    const progressIndex = 570;

    console.log('Testing Level 45 (progressIndex 570):');

    const diffs: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];

    for (const d of diffs) {
        const q = await ChicorunProblemService.getQuestion('test-student', 'test-class', progressIndex, d);
        console.log(`- Difficulty: ${d} -> Passage: ${q.passage.substring(0, 40)}... (ID: ${q.id})`);
    }

    await mongoose.disconnect();
}

test();
