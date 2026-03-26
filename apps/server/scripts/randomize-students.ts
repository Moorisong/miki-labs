
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
    // MZ Stickers (SVGs)
    { id: 'sticker-heart-mz', category: 'sticker', value: '/chicorun/mz-stickers/heart-pink.svg' },
    { id: 'sticker-star-mz', category: 'sticker', value: '/chicorun/mz-stickers/star-silver.svg' },
    { id: 'sticker-cherry-mz', category: 'sticker', value: '/chicorun/mz-stickers/cherry.svg' },
    { id: 'sticker-smiley-mz', category: 'sticker', value: '/chicorun/mz-stickers/smiley-neon.svg' },
    { id: 'sticker-butterfly-mz', category: 'sticker', value: '/chicorun/mz-stickers/butterfly-blue.svg' },
    { id: 'sticker-diamond-mz', category: 'sticker', value: '/chicorun/mz-stickers/diamond-bling.svg' },
    { id: 'sticker-paw-mz', category: 'sticker', value: '/chicorun/mz-stickers/paw-pink.svg' },
    { id: 'sticker-bubble-mz', category: 'sticker', value: '/chicorun/mz-stickers/bubble-cluster.svg' },
    { id: 'sticker-check-mz', category: 'sticker', value: '/chicorun/mz-stickers/check-mz.svg' },
    { id: 'sticker-eye-mz', category: 'sticker', value: '/chicorun/mz-stickers/eye-mz.svg' },

    // Borders
    { id: 'border-dashed', category: 'border', value: 'dashed' },
];

async function randomize() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        // Exclude specific nicknames
        const students = await ChicorunStudentModel.find({
            nickname: { $nin: ['송현', 'sh'] }
        });
        console.log(`Found ${students.length} students to randomize (excluding 송현, sh)`);

        const backgrounds = ALL_CHICORUN_ITEMS.filter(i => i.category === 'background');
        const badges = ALL_CHICORUN_ITEMS.filter(i => i.category === 'badge');
        const stickers = ALL_CHICORUN_ITEMS.filter(i => i.category === 'sticker');
        const borders = ALL_CHICORUN_ITEMS.filter(i => i.category === 'border');

        const nicknameColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff', '#1e293b'];

        const CARD_WIDTH = 260;
        const CARD_HEIGHT = 340;

        for (const student of students) {
            // 1. Pick a random background
            const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
            student.cardStyle = randomBg.value;

            // 2. Pick a random badge
            const randomBadge = badges[Math.floor(Math.random() * badges.length)];
            student.badge = randomBadge.value;

            // 3. Determine Layout Theme (Human-like alignment)
            const themes = ['classic', 'centered', 'dynamic'];
            const theme = themes[Math.floor(Math.random() * themes.length)];

            let bPos, nPos, pPos, rPos;
            const mainColor = nicknameColors[Math.floor(Math.random() * nicknameColors.length)];

            if (theme === 'centered') {
                // Centered approach
                bPos = { x: 70, y: 70, rotate: 0, fontSize: 120 };
                nPos = { x: 20, y: 210, rotate: 0, fontSize: 24, align: 'center' }; // x=20 with full width is often handled by css but we specify for script
                pPos = { x: 50, y: 275, rotate: 0, fontSize: 18 };
                rPos = { x: 105, y: 15, rotate: 0, fontSize: 20 };
            } else if (theme === 'dynamic') {
                // Slightly tilted and offset
                bPos = { x: 40 + (Math.random() * 40), y: 40 + (Math.random() * 20), rotate: (Math.random() * 20 - 10), fontSize: 110 };
                nPos = { x: 30 + (Math.random() * 20), y: 200 + (Math.random() * 10), rotate: (Math.random() * 10 - 5), fontSize: 22 };
                pPos = { x: 30 + (Math.random() * 40), y: 270 + (Math.random() * 10), rotate: (Math.random() * 6 - 3), fontSize: 17 };
                rPos = { x: 15, y: 15, rotate: -15, fontSize: 26 };
            } else {
                // Classic standard
                bPos = { x: 90, y: 60, rotate: 0, fontSize: 80 };
                nPos = { x: 20, y: 200, rotate: 0, fontSize: 22 };
                pPos = { x: 20, y: 270, rotate: 0, fontSize: 18 };
                rPos = { x: 110, y: 20, rotate: 0, fontSize: 24 };
            }

            // 4. Randomize Nickname Style
            student.nicknameStyle = {
                color: mainColor,
                bold: Math.random() > 0.1,
                italic: Math.random() > 0.8,
                underline: Math.random() > 0.95,
                fontSize: nPos.fontSize,
                x: nPos.x,
                y: nPos.y,
                rotate: nPos.rotate,
            };

            // 5. Human-like Sticker Placement (Clusters or Patterns)
            const numStickers = 2 + Math.floor(Math.random() * 4); // 2-5 stickers
            const stickerPlacements = [];
            const stickerPattern = Math.floor(Math.random() * 3); // 0: Corner, 1: Halo, 2: Scatter

            for (let i = 0; i < numStickers; i++) {
                const s = stickers[Math.floor(Math.random() * stickers.length)];
                let sx, sy, sr, ss;

                if (stickerPattern === 0) { // Corners
                    const cornerPoints = [
                        [20, 20], [210, 20], [20, 290], [210, 290]
                    ];
                    const base = cornerPoints[Math.floor(Math.random() * cornerPoints.length)];
                    sx = base[0] + (Math.random() * 30 - 15);
                    sy = base[1] + (Math.random() * 30 - 15);
                    sr = Math.random() * 360;
                    ss = 0.5 + Math.random() * 0.5;
                } else if (stickerPattern === 1) { // Halo around badge/name
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 60 + Math.random() * 40;
                    const centerX = bPos.x + 50;
                    const centerY = bPos.y + 50;
                    sx = centerX + Math.cos(angle) * radius - 15;
                    sy = centerY + Math.sin(angle) * radius - 15;
                    sr = Math.random() * 40 - 20;
                    ss = 0.6 + Math.random() * 0.4;
                } else { // Neat scatter
                    sx = 20 + Math.random() * 200;
                    sy = 20 + Math.random() * 300;
                    sr = Math.random() * 360;
                    ss = 0.4 + Math.random() * 0.6;
                }

                // Bounds check (Keep inside 260x340)
                stickerPlacements.push({
                    id: `s-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
                    emoji: s.value,
                    x: Math.max(10, Math.min(sx, 230)),
                    y: Math.max(10, Math.min(sy, 310)),
                    scale: ss,
                    rotate: sr,
                });
            }

            // 6. Finalize Customize Data
            const randomBorder = borders[Math.floor(Math.random() * borders.length)];
            student.customize = {
                stickers: stickerPlacements,
                frameId: 'default',
                badgeId: randomBadge.id,
                borderStyle: {
                    color: nicknameColors[Math.floor(Math.random() * nicknameColors.length)],
                    width: 2 + Math.floor(Math.random() * 3),
                    style: randomBorder.value,
                    radius: 12 + Math.floor(Math.random() * 16),
                },
                pointStyle: {
                    color: nicknameColors[Math.floor(Math.random() * nicknameColors.length)],
                    background: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    borderColor: '#ffffff',
                    fontSize: pPos.fontSize,
                    x: pPos.x,
                    y: pPos.y,
                    rotate: pPos.rotate,
                },
                rankStyle: {
                    color: mainColor,
                    fontSize: rPos.fontSize,
                    x: rPos.x,
                    y: rPos.y,
                    rotate: rPos.rotate,
                },
                badgeStyle: {
                    fontSize: bPos.fontSize,
                    x: bPos.x,
                    y: bPos.y,
                    rotate: bPos.rotate,
                }
            };

            // 7. Update Owned Items (Unlock all for randomized users)
            student.ownedItems = Array.from(new Set([...student.ownedItems, ...ALL_CHICORUN_ITEMS.map(i => i.id)]));

            await student.save();
        }

        console.log('Successfully randomized all students with human-like styles!');
        process.exit(0);
    } catch (err) {
        console.error('Error during randomization:', err);
        process.exit(1);
    }
}

randomize();
