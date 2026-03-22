
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { ChicorunStudentModel } from '../src/models/chicorun-student.model';

dotenv.config({ path: path.join(__dirname, '../.env') });

const ALL_CHICORUN_ITEMS = [
    { id: 'bg-white', category: 'background', value: 'white' },
    { id: 'bg-grad-1', category: 'background', value: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%)' },
    { id: 'bg-grad-2', category: 'background', value: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)' },
    { id: 'bg-grad-3', category: 'background', value: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' },
    { id: 'bg-grad-4', category: 'background', value: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
    { id: 'bg-grad-5', category: 'background', value: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' },
    { id: 'bg-grad-6', category: 'background', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'bg-grad-7', category: 'background', value: 'linear-gradient(to right, #fa709a 0%, #fee140 100%)' },
    { id: 'bg-grad-8', category: 'background', value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
    { id: 'bg-grad-9', category: 'background', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'bg-grad-10', category: 'background', value: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)' },
    { id: 'bg-grad-11', category: 'background', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: 'bg-grad-12', category: 'background', value: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
    { id: 'bg-grad-13', category: 'background', value: 'linear-gradient(135deg, #fddb92 0%, #d1f2ff 100%)' },
    { id: 'bg-grad-14', category: 'background', value: 'linear-gradient(135deg, #ebbba7 0%, #cfc7f8 100%)' },
    { id: 'bg-grad-15', category: 'background', value: 'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)' },
    { id: 'bg-grad-16', category: 'background', value: 'linear-gradient(135deg, #c31432 0%, #240b36 100%)' },
    { id: 'bg-grad-17', category: 'background', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 10%, #24243e 100%)' },
    { id: 'badge-tralallero', category: 'badge', value: '/chicorun/badges/tralallero.png' },
    { id: 'badge-tungtung', category: 'badge', value: '/chicorun/badges/tungtung.png' },
    { id: 'badge-ballerina', category: 'badge', value: '/chicorun/badges/ballerina.png' },
    { id: 'badge-bombardiro', category: 'badge', value: '/chicorun/badges/bombardiro.png' },
    { id: 'badge-assassino', category: 'badge', value: '/chicorun/badges/assassino.png' },
    { id: 'sticker-star', category: 'sticker', value: '/chicorun/stickers/simple-star.svg' },
    { id: 'sticker-heart', category: 'sticker', value: '/chicorun/stickers/bling-heart.svg' },
    { id: 'sticker-zap', category: 'sticker', value: '/chicorun/stickers/funky-zap.svg' },
    { id: 'sticker-smile', category: 'sticker', value: '/chicorun/stickers/vivid-smile.svg' },
    { id: 'sticker-cloud', category: 'sticker', value: '/chicorun/stickers/pastel-cloud.svg' },
    { id: 'sticker-chico', category: 'sticker', value: '/chicorun/stickers/text-chico.svg' },
    { id: 'sticker-diamond', category: 'sticker', value: '/chicorun/stickers/diamond-bling.svg' },
    { id: 'sticker-paw', category: 'sticker', value: '/chicorun/stickers/cute-paw.svg' },
    { id: 'sticker-music', category: 'sticker', value: '/chicorun/stickers/music-note.svg' },
    { id: 'sticker-wow', category: 'sticker', value: '/chicorun/stickers/wow-bubble.svg' },
    { id: 'border-solid', category: 'border', value: 'solid' },
    { id: 'border-dashed', category: 'border', value: 'dashed' },
];

async function randomize() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        const students = await ChicorunStudentModel.find({
            nickname: { $nin: ['송현', 'sh'] }
        });
        console.log(`Found ${students.length} students to randomize (excluding 송현, sh)`);

        const backgrounds = ALL_CHICORUN_ITEMS.filter(i => i.category === 'background');
        const badges = ALL_CHICORUN_ITEMS.filter(i => i.category === 'badge');
        const stickers = ALL_CHICORUN_ITEMS.filter(i => i.category === 'sticker');
        const borders = ALL_CHICORUN_ITEMS.filter(i => i.category === 'border');

        const nicknameColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff', '#1e293b'];

        for (const student of students) {
            // Apply random background
            const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
            student.cardStyle = randomBg.value;

            // Apply random badge
            const randomBadge = badges[Math.floor(Math.random() * badges.length)];
            student.badge = randomBadge.value;

            // Randomize Nickname Style
            student.nicknameStyle = {
                color: nicknameColors[Math.floor(Math.random() * nicknameColors.length)],
                bold: Math.random() > 0.2,
                italic: Math.random() > 0.8,
                underline: Math.random() > 0.9,
                fontSize: 18 + Math.floor(Math.random() * 8),
                x: 20 + (Math.random() * 120),
                y: 180 + (Math.random() * 60),
                rotate: Math.random() * 20 - 10,
            };

            // Randomize Customize Data
            const numStickers = 1 + Math.floor(Math.random() * 4); // 1 to 4 stickers
            const stickerPlacements = [];
            for (let i = 0; i < numStickers; i++) {
                const s = stickers[Math.floor(Math.random() * stickers.length)];
                stickerPlacements.push({
                    id: Date.now().toString() + i + Math.random(),
                    emoji: s.value,
                    x: Math.random() * 200,
                    y: Math.random() * 280,
                    scale: 0.8 + Math.random() * 1.2,
                    rotate: Math.random() * 360,
                });
            }

            const randomBorder = borders[Math.floor(Math.random() * borders.length)];
            student.customize = {
                stickers: stickerPlacements,
                frameId: 'default',
                badgeId: randomBadge.id,
                borderStyle: {
                    color: nicknameColors[Math.floor(Math.random() * nicknameColors.length)],
                    width: 2 + Math.floor(Math.random() * 4),
                    style: randomBorder.value,
                    radius: 12 + Math.floor(Math.random() * 20),
                },
                pointStyle: {
                    color: nicknameColors[Math.floor(Math.random() * nicknameColors.length)],
                    background: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    borderColor: '#ffffff',
                    fontSize: 14 + Math.floor(Math.random() * 6),
                    x: 20 + (Math.random() * 100),
                    y: 260 + (Math.random() * 40),
                    rotate: Math.random() * 10 - 5,
                },
                rankStyle: {
                    color: nicknameColors[Math.floor(Math.random() * nicknameColors.length)],
                    fontSize: 20 + Math.floor(Math.random() * 12),
                    x: 10 + (Math.random() * 40),
                    y: 10 + (Math.random() * 30),
                    rotate: Math.random() * 30 - 15,
                },
                badgeStyle: {
                    fontSize: 60 + Math.floor(Math.random() * 60),
                    x: 40 + (Math.random() * 120),
                    y: 40 + (Math.random() * 120),
                    rotate: Math.random() * 40 - 20,
                }
            };

            // Also add all items to ownedItems
            student.ownedItems = Array.from(new Set([...student.ownedItems, ...ALL_CHICORUN_ITEMS.map(i => i.id)]));

            await student.save();
        }

        console.log('Successfully randomized all students!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

randomize();
