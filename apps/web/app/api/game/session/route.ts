import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import crypto from 'crypto';

// 세션 만료 시간 (10분)
const SESSION_EXPIRY_MS = 10 * 60 * 1000;

// 최소 게임 플레이 시간 (3초)
export const MIN_GAME_DURATION_MS = 3000;

// 서버 전용 시크릿 (환경 변수에서 가져옴 - 필수)
const SESSION_SECRET = process.env.GAME_SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error('GAME_SESSION_SECRET 환경변수가 설정되지 않았습니다.');
}

/**
 * 게임 세션 토큰 생성
 * 서버에서만 생성 가능한 암호화된 토큰
 */
function generateSessionToken(kakaoId: string, startTime: number): string {
  const payload = `${kakaoId}:${startTime}:${crypto.randomBytes(16).toString('hex')}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payload);
  const signature = hmac.digest('hex');

  // Base64로 인코딩하여 전송
  const token = Buffer.from(`${payload}:${signature}`).toString('base64');
  return token;
}

/**
 * 게임 세션 토큰 검증 (DB에서 조회)
 */
export async function verifySessionToken(token: string): Promise<{
  valid: boolean;
  kakaoId?: string;
  startTime?: number;
  error?: string;
}> {
  try {
    const db = await getDatabase();
    const sessions = db.collection('game_sessions');

    const session = await sessions.findOne({ token });

    if (!session) {
      return { valid: false, error: '유효하지 않은 게임 세션입니다.' };
    }

    if (session.used) {
      return { valid: false, error: '이미 사용된 게임 세션입니다.' };
    }

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      // 만료된 세션 삭제
      await sessions.deleteOne({ token });
      return { valid: false, error: '만료된 게임 세션입니다.' };
    }

    const gameDuration = Date.now() - new Date(session.startTime).getTime();
    if (gameDuration < MIN_GAME_DURATION_MS) {
      return {
        valid: false,
        error: `게임 시간이 너무 짧습니다. (${Math.floor(gameDuration)}ms < ${MIN_GAME_DURATION_MS}ms)`
      };
    }

    return {
      valid: true,
      kakaoId: session.kakaoId,
      startTime: new Date(session.startTime).getTime()
    };
  } catch (error) {
    console.error('세션 검증 오류:', error);
    return { valid: false, error: '세션 검증 중 오류가 발생했습니다.' };
  }
}

/**
 * 게임 세션 사용 처리 (1회용)
 */
export async function consumeSession(token: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    const sessions = db.collection('game_sessions');

    const result = await sessions.updateOne(
      { token, used: false },
      { $set: { used: true, usedAt: new Date() } }
    );

    return result.modifiedCount === 1;
  } catch (error) {
    console.error('세션 소비 오류:', error);
    return false;
  }
}

/**
 * POST /api/game/session
 * 게임 시작 시 호출하여 세션 토큰을 발급받음
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const kakaoId = session?.user?.kakaoId || 'guest';

    // 로그인 확인 로직 제거 (게스트 플레이 지원)
    // if (!session?.user?.kakaoId) { ... }


    const startTime = new Date();
    const expiresAt = new Date(startTime.getTime() + SESSION_EXPIRY_MS);

    // 세션 토큰 생성
    const sessionToken = generateSessionToken(kakaoId, startTime.getTime());

    const db = await getDatabase();
    const sessions = db.collection('game_sessions');

    // 만료된 세션 정리 (옵션: 주기적으로 실행)
    await sessions.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    // 새 세션 저장
    await sessions.insertOne({
      token: sessionToken,
      kakaoId,
      startTime,
      expiresAt,
      used: false,
      createdAt: new Date()
    });

    // TTL 인덱스 생성 (세션 자동 만료용 - 한 번만 실행됨)
    try {
      await sessions.createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 }
      );
    } catch {
      // 인덱스가 이미 존재하면 무시
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionToken,
        startTime: startTime.getTime(),
        expiresAt: expiresAt.getTime()
      }
    });
  } catch (error) {
    console.error('게임 세션 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
