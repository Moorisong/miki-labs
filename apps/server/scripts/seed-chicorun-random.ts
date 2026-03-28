
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ChicorunStudentModel } from '../src/models/chicorun-student.model';

const ADJECTIVES = ['멋진', '똑똑한', '빠른', '강한', '빛나는', '신비한', '즐거운', '상냥한', '용감한', '행복한', '차분한', '날카로운', '유연한', '푸른', '붉은', '노란', '초록색', '검은', '하얀', '투명한'];
const NOUNS = ['사자', '호랑이', '토끼', '여우', '늑대', '독수리', '부엉이', '펭귄', '돌고래', '고래', '상어', '사슴', '판다', '두루미', '거북이', '코끼리', '원숭이', '다람쥐', '햄스터', '강아지', '고양이', '독수리', '피닉스', '드래곤', '유니콘'];

async function generateNickname() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${adj}${noun}${num}`;
}

async function main() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected!');

        const passwordHash = await bcrypt.hash('1234', 10);
        const students = [];

        console.log('Generating 100 students...');
        for (let i = 0; i < 100; i++) {
            let nickname = await generateNickname();
            // Ensure unique nickname
            let exists = await ChicorunStudentModel.findOne({ nickname });
            while (exists) {
                nickname = await generateNickname();
                exists = await ChicorunStudentModel.findOne({ nickname });
            }

            students.push({
                nickname,
                passwordHash,
                point: Math.floor(Math.random() * 5000),
                currentLevel: Math.floor(Math.random() * 10) + 1,
                achievedMaxLevel: 10,
                progressIndex: Math.floor(Math.random() * 100),
            });
        }

        console.log('Inserting into DB...');
        await ChicorunStudentModel.insertMany(students);
        console.log('Successfully added 100 students!');
    } catch (err) {
        console.error('Error seeding students:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

main();
