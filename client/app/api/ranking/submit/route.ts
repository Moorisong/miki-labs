import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 로그인한 사용자만 점수 제출 가능
    if (!session?.user?.kakaoId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 닉네임이 없으면 제출 불가
    if (!session.user.nickname) {
      return NextResponse.json(
        { success: false, error: '닉네임을 먼저 설정해주세요.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { score, attempts, dollsCaught } = body;

    // 유효성 검사
    if (typeof score !== 'number' || score < 0 || score > 1000000) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 점수입니다.' },
        { status: 400 }
      );
    }

    if (typeof attempts !== 'number' || attempts < 1 || attempts > 1000) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 시도 횟수입니다.' },
        { status: 400 }
      );
    }

    if (typeof dollsCaught !== 'number' || dollsCaught < 0 || dollsCaught > 100) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 성공 횟수입니다.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const scores = db.collection('scores');
    const users = db.collection('users');

    // 사용자 정보 가져오기
    const user = await users.findOne({ kakaoId: session.user.kakaoId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 점수 저장 (nickname을 직접 저장하여 조회 성능 향상)
    const result = await scores.insertOne({
      oderId: user._id,
      kakaoId: session.user.kakaoId,
      nickname: session.user.nickname,
      score,
      attempts,
      dollsCaught,
      createdAt: new Date(),
    });

    // 사용자의 최고 점수 업데이트
    if (user.highScore === undefined || score > user.highScore) {
      await users.updateOne(
        { kakaoId: session.user.kakaoId },
        {
          $set: {
            highScore: score,
            updatedAt: new Date(),
          },
          $inc: { totalGames: 1 },
        }
      );
    } else {
      await users.updateOne(
        { kakaoId: session.user.kakaoId },
        {
          $inc: { totalGames: 1 },
          $set: { updatedAt: new Date() },
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: { scoreId: result.insertedId.toString() },
      message: '점수가 저장되었습니다.',
    });
  } catch (error) {
    console.error('점수 제출 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
