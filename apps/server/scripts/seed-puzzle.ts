import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/haroo-box';

// Replace database name in URI to connect to puzzle database
function buildPuzzleUri(baseUri: string): string {
  if (process.env.PUZZLE_MONGODB_URI) {
    return process.env.PUZZLE_MONGODB_URI;
  }
  return baseUri.replace(/\/[^/?]+(\?|$)/, '/puzzle$1');
}

const PUZZLE_URI = buildPuzzleUri(MONGODB_URI);

async function main() {
  console.log('Connecting to MongoDB (puzzle) at:', PUZZLE_URI);
  await mongoose.connect(PUZZLE_URI);
  console.log('Connected to MongoDB (puzzle)');

  // Define Schema inline matching apps/server/src/models/puzzle.model.ts
  const puzzleSchema = new mongoose.Schema({
    week: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    participantCount: { type: Number, default: 0 },
    archived: { type: Boolean, default: false, index: true },
  }, { strict: false, timestamps: true });

  const Puzzle = mongoose.models.Puzzle || mongoose.model('Puzzle', puzzleSchema);

  // Clear existing puzzles to start fresh
  await Puzzle.deleteMany({});
  console.log('Cleared existing puzzles.');

  const now = new Date();

  const puzzlesToSeed = [
    {
      week: 0,
      title: "평화로운 숲속 오두막",
      imageUrl: "/images/puzzle/forest_cabin.png",
      startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      endDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),   // 1 week ago
      participantCount: 45,
      archived: true,
    },
    {
      week: 1,
      title: "아름다운 보라색 꽃밭",
      imageUrl: "/images/puzzle/purple_flower_field.png",
      startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),  // 1 week ago
      endDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),   // 3 days ago
      participantCount: 12,
      archived: true,
    },
    {
      week: 2,
      title: "신비로운 네온 홀로그램",
      imageUrl: "/images/puzzle/hologram.png",
      startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),  // 3 days ago
      endDate: new Date(now.getTime() - 1 * 60 * 60 * 1000),         // 1 hour ago (ended)
      participantCount: 0,
      archived: true,
    },
    {
      week: 3,
      title: "푸른 바다와 등대",
      imageUrl: "/images/puzzle/lighthouse.png",
      startDate: new Date(now.getTime() - 1 * 60 * 60 * 1000),       // 1 hour ago (active)
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),    // 7 days from now
      participantCount: 0,
      archived: false,
    }
  ];

  console.log('Seeding sample puzzles...');
  for (const p of puzzlesToSeed) {
    const created = await Puzzle.create(p);
    console.log(`✅ Seeded puzzle [Week ${created.week}]: "${created.title}"`);
  }

  console.log('🎉 Seeding successfully completed!');
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch(err => {
  console.error('Error during seeding:', err);
  mongoose.disconnect();
});
