import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { verifySessionToken, consumeSession, MIN_GAME_DURATION_MS } from '@/app/api/game/session/route';

// 중복 제출 방지: 최소 제출 간격 (밀리초)
const MIN_SUBMIT_INTERVAL_MS = 5000; // 5초

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
    const { score, attempts, dollsCaught, gameSessionToken } = body;

    // 게임 세션 토큰 검증 (필수)
    if (!gameSessionToken) {
      return NextResponse.json(
        { success: false, error: '게임 세션 토큰이 필요합니다. 게임을 정상적으로 시작해주세요.' },
        { status: 400 }
      );
    }

    const sessionVerification = await verifySessionToken(gameSessionToken);
    if (!sessionVerification.valid) {
      return NextResponse.json(
        { success: false, error: sessionVerification.error || '유효하지 않은 게임 세션입니다.' },
        { status: 403 }
      );
    }

    // 세션의 kakaoId와 현재 사용자 일치 확인
    // 세션이 guest인 경우, 현재 로그인한 사용자의 제출 허용 (게스트 플레이 후 로그인 시나리오)
    if (sessionVerification.kakaoId !== 'guest' && sessionVerification.kakaoId !== session.user.kakaoId) {
      return NextResponse.json(
        { success: false, error: '게임 세션과 사용자가 일치하지 않습니다.' },
        { status: 403 }
      );
    }

    // 세션 소비 (1회용) - 재사용 방지
    const consumed = await consumeSession(gameSessionToken);
    if (!consumed) {
      return NextResponse.json(
        { success: false, error: '이미 사용된 게임 세션이거나 유효하지 않은 세션입니다.' },
        { status: 403 }
      );
    }

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

    // 중복 제출 방지: 마지막 제출 시간 체크
    const existingScoreForRateLimit = await scores.findOne({
      $or: [
        { kakaoId: session.user.kakaoId },
        { kakaoId: session.user.kakaoId }
      ]
    });

    if (existingScoreForRateLimit?.updatedAt) {
      const lastSubmitTime = new Date(existingScoreForRateLimit.updatedAt).getTime();
      const now = Date.now();
      const timeSinceLastSubmit = now - lastSubmitTime;

      if (timeSinceLastSubmit < MIN_SUBMIT_INTERVAL_MS) {
        const remainingSeconds = Math.ceil((MIN_SUBMIT_INTERVAL_MS - timeSinceLastSubmit) / 1000);
        return NextResponse.json(
          { success: false, error: `너무 빠른 제출입니다. ${remainingSeconds}초 후에 다시 시도해주세요.` },
          { status: 429 }
        );
      }
    }

    // 사용자 정보 가져오기
    const user = await users.findOne({ kakaoId: session.user.kakaoId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 점수 저장 (nickname을 직접 저장하여 조회 성능 향상)
    // 기존 점수가 있으면 누적, 없으면 새로 생성
    // kakaoId 또는 userId로 기존 점수 찾기 (구 데이터 호환성 및 중복 방지)
    const existingScore = await scores.findOne({
      $or: [
        { kakaoId: session.user.kakaoId },
        { userId: user._id }
      ]
    });

    let result;
    let currentTotalScore = score;
    let currentTotalAttempts = attempts;
    let currentTotalDollsCaught = dollsCaught;

    if (existingScore) {
      // 기존 점수 업데이트
      await scores.updateOne(
        { _id: existingScore._id },
        {
          $inc: {
            score: score,
            attempts: attempts,
            dollsCaught: dollsCaught,
          },
          $set: {
            nickname: session.user.nickname, // 닉네임 변경 시 반영
            kakaoId: session.user.kakaoId, // 구 데이터에 kakaoId가 없으면 추가
            updatedAt: new Date(),
          },
        }
      );

      const updatedScore = await scores.findOne({ _id: existingScore._id });
      if (updatedScore) {
        currentTotalScore = updatedScore.score;
        currentTotalAttempts = updatedScore.attempts;
        currentTotalDollsCaught = updatedScore.dollsCaught;
        result = { insertedId: existingScore._id };
      }
    } else {
      result = await scores.insertOne({
        userId: user._id,
        kakaoId: session.user.kakaoId,
        nickname: session.user.nickname,
        score,
        attempts,
        dollsCaught,
        createdAt: new Date(),
      });
      // Initial values are already set above
    }

    // 사용자의 누적 점수 업데이트 (highScore 필드를 누적 점수로 사용)
    await users.updateOne(
      { kakaoId: session.user.kakaoId },
      {
        $inc: {
          highScore: score, // 기존 점수에 이번 게임 점수 누적
          totalGames: 1
        },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        scoreId: result?.insertedId?.toString() || existingScore?._id.toString(),
        totalScore: currentTotalScore,
        totalAttempts: currentTotalAttempts,
        totalDollsCaught: currentTotalDollsCaught
      },
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
