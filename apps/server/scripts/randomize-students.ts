
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { ChicorunStudentModel } from '../src/models/chicorun-student.model';

dotenv.config({ path: path.join(__dirname, '../.env') });

const ALL_CHICORUN_ITEMS = [
    // Backgrounds
    { id: 'bg-white', category: 'background', value: 'white' },
    { id: 'bg-premium-cloud', category: 'background', value: 'linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)' },
    { id: 'bg-premium-vivid', category: 'background', value: 'linear-gradient(135deg, #FF0844 0%, #FFB199 50%, #FFD700 100%)' },
    { id: 'bg-premium-neon', category: 'background', value: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)' },
    { id: 'bg-sunset-mirage', category: 'background', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'bg-emerald-aurora', category: 'background', value: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)' },
    { id: 'bg-midnight-velvet', category: 'background', value: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
    { id: 'bg-cyber-neon', category: 'background', value: 'linear-gradient(to right, #00dbde 0%, #fc00ff 100%)' },
    { id: 'bg-lemon-chiffon', category: 'background', value: '#fff9c4' },

    // Badges
    { id: 'badge-pasta-rex', category: 'badge', value: '/chicorun/badges/pasta-rex.png' },
    { id: 'badge-pizzadino', category: 'badge', value: '/chicorun/badges/pizzadino.png' },
    { id: 'badge-gelato-bear', category: 'badge', value: '/chicorun/badges/gelato-bear.png' },
    { id: 'badge-vespa-cat', category: 'badge', value: '/chicorun/badges/vespa-cat.png' },
    { id: 'badge-leaning-giraffe', category: 'badge', value: '/chicorun/badges/leaning-giraffe.png' },

    // Stickers
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
    { id: 'sticker-sun-sparkle', category: 'sticker', value: '/chicorun/stickers/sun-sparkle.svg' },
    { id: 'sticker-cool-shades', category: 'sticker', value: '/chicorun/stickers/cool-shades.svg' },
    { id: 'sticker-go-text', category: 'sticker', value: '/chicorun/stickers/go-text.svg' },
    { id: 'sticker-pastel-moon', category: 'sticker', value: '/chicorun/stickers/pastel-moon.svg' },
    { id: 'sticker-vivid-fire', category: 'sticker', value: '/chicorun/stickers/vivid-fire.svg' },

    // Borders
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
