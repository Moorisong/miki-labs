import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 10, 100);

    const db = await getDatabase();
    const scores = db.collection('scores');

    // 점수 높은 순, 같은 점수면 먼저 달성한 순
    const rankings = await scores
      .find({})
      .sort({ score: -1, createdAt: 1 })
      .limit(limit)
      .toArray();

    const formattedRankings = rankings.map((entry, index) => ({
      rank: index + 1,
      oderId: entry.userId?.toString() || entry._id.toString(),
      nickname: entry.nickname || 'Unknown',
      score: entry.score,
      catches: entry.dollsCaught,
      createdAt: entry.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedRankings,
    });
  } catch (error) {
    console.error('랭킹 조회 오류:', error);
    // DB 연결 실패 시 빈 배열 반환
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
}
