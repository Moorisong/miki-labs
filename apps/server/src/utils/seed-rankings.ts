import 'dotenv/config';
import { connectDatabase, getPuzzleConnection } from '../config/database';
import { getPuzzleModel } from '../models/puzzle.model';
import { getPuzzleResultModel } from '../models/puzzle-result.model';
import { getUserModel } from '../models/user.model';
import crypto from 'crypto';

const ADJECTIVES = [
  '맑은', '푸른', '신난', '고요한', '행복한', '귀여운', '멋진', '똑똑한', '용감한', '피곤한',
  '배고픈', '즐거운', '따뜻한', '새벽의', '밤하늘의', '노란', '초록빛', '바람부는', '달콤한', '짜릿한',
  '느긋한', '부지런한', '잠꾸러기', '수줍은', '상냥한', '호기심많은', '덤덤한', '유쾌한', '차분한', '신비로운'
];

const NOUNS = [
  '사자', '호랑이', '토끼', '여우', '곰', '다람쥐', '펭귄', '고양이', '강아지', '독수리',
  '돌고래', '사슴', '코알라', '올빼미', '너구리', '판다', '햄스터', '쿼카', '거북이', '기린',
  '람쥐', '냥이', '댕댕이', '고슴도치', '수달', '나무늘보', '알파카', '물개', '해마', '펭이'
];

function generateNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}${noun}${num}`;
}

async function seed() {
  try {
    console.log('Connecting to database...');
    await connectDatabase();

    const Puzzle = getPuzzleModel();
    const User = getUserModel();
    const PuzzleResult = getPuzzleResultModel();

    // 1. 활성화된 퍼즐 찾기 (archived: false)
    const activePuzzles = await Puzzle.find({ archived: false });
    if (activePuzzles.length === 0) {
      console.error('No active (unarchived) puzzles found in the database.');
      process.exit(1);
    }

    console.log(`Found ${activePuzzles.length} active puzzle(s). Seeding for each...`);

    for (const puzzle of activePuzzles) {
      console.log(`Seeding for puzzle: "${puzzle.title}" (ID: ${puzzle._id})`);

      // 300명의 모크 유저 생성
      console.log('Generating 300 mock users...');
      const usersData = Array.from({ length: 300 }, () => {
        const nickname = generateNickname();
        return {
          providerId: `mock_user_${crypto.randomUUID()}`,
          provider: 'guest' as const,
          name: nickname,
          nickname: nickname,
          profileImage: '',
        };
      });

      const createdUsers = await User.insertMany(usersData);
      console.log(`Successfully created ${createdUsers.length} users.`);

      // 300명 중 200명은 완주(completed: true), 100명은 미완주(completed: false)
      // 완주자 중 100명은 beginner, 100명은 expert 난이도로 분배
      const resultsData: any[] = [];

      for (let i = 0; i < createdUsers.length; i++) {
        const user = createdUsers[i];
        const isCompleted = i < 200; // 200명 완주

        if (isCompleted) {
          const difficulty = i % 2 === 0 ? 'beginner' : 'expert';
          // 완료 시간 랜덤 (초 단위)
          // 초급: 50초 ~ 400초, 고급: 180초 ~ 1500초
          const completionTime = difficulty === 'beginner'
            ? Math.floor(Math.random() * 350) + 50
            : Math.floor(Math.random() * 1320) + 180;

          const startedAt = new Date(Date.now() - (completionTime + Math.floor(Math.random() * 60)) * 1000);
          const completedAt = new Date(startedAt.getTime() + completionTime * 1000);

          resultsData.push({
            userId: user._id,
            puzzleId: puzzle._id,
            mode: 'ranked',
            difficulty,
            completionTime,
            challengeToken: `mock_token_${crypto.randomUUID()}`,
            startedAt,
            completedAt,
            savedAt: completedAt,
            completed: true
          });
        } else {
          // 미완주자 (completed: false)
          const difficulty = i % 2 === 0 ? 'beginner' : 'expert';
          const startedAt = new Date(Date.now() - Math.floor(Math.random() * 3600) * 1000);

          resultsData.push({
            userId: user._id,
            puzzleId: puzzle._id,
            mode: 'ranked',
            difficulty,
            completionTime: 0,
            challengeToken: `mock_token_${crypto.randomUUID()}`,
            startedAt,
            completedAt: startedAt, // 임시
            savedAt: startedAt,
            completed: false
          });
        }
      }

      console.log('Inserting puzzle results...');
      await PuzzleResult.insertMany(resultsData);
      console.log(`Inserted ${resultsData.length} puzzle results (200 completed, 100 in progress).`);

      // 퍼즐 참여자 수 업데이트
      const completedCount = 200;
      await Puzzle.findByIdAndUpdate(puzzle._id, {
        $inc: { participantCount: completedCount, playCount: 300 }
      });
      console.log(`Updated participantCount (+${completedCount}) and playCount (+300) for puzzle "${puzzle.title}".`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
