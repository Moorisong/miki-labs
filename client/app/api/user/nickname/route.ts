import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.kakaoId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nickname } = body;

    // 닉네임 유효성 검사
    if (!nickname || typeof nickname !== 'string') {
      return NextResponse.json(
        { success: false, error: '닉네임을 입력해주세요.' },
        { status: 400 }
      );
    }

    const trimmedNickname = nickname.trim();

    if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
      return NextResponse.json(
        { success: false, error: '닉네임은 2~10자여야 합니다.' },
        { status: 400 }
      );
    }

    // 금칙어/특수문자 검사 (간단한 버전)
    const invalidPattern = /[<>{}[\]\\\/'"`;]/;
    if (invalidPattern.test(trimmedNickname)) {
      return NextResponse.json(
        { success: false, error: '사용할 수 없는 문자가 포함되어 있습니다.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const users = db.collection('users');

    // 현재 사용자 정보 조회
    const currentUser = await users.findOne({ kakaoId: session.user.kakaoId });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 한 달 제한 체크 (기존 닉네임이 있는 경우에만)
    if (currentUser.nickname && currentUser.nicknameUpdatedAt) {
      const lastUpdate = new Date(currentUser.nicknameUpdatedAt);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      if (lastUpdate > oneMonthAgo) {
        const nextChangeDate = new Date(lastUpdate);
        nextChangeDate.setMonth(nextChangeDate.getMonth() + 1);
        const daysLeft = Math.ceil((nextChangeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        return NextResponse.json(
          {
            success: false,
            error: `닉네임은 한 달에 한 번만 변경할 수 있습니다. (${daysLeft}일 후 변경 가능)`,
            nextChangeDate: nextChangeDate.toISOString(),
          },
          { status: 429 }
        );
      }
    }

    // 닉네임 중복 검사 (대소문자 구분 없이)
    const existingUser = await users.findOne({
      nickname: { $regex: new RegExp(`^${trimmedNickname}$`, 'i') },
      kakaoId: { $ne: session.user.kakaoId },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '이미 사용 중인 닉네임입니다.' },
        { status: 409 }
      );
    }

    // 닉네임 업데이트 (nicknameUpdatedAt도 함께 저장)
    const result = await users.updateOne(
      { kakaoId: session.user.kakaoId },
      {
        $set: {
          nickname: trimmedNickname,
          nicknameUpdatedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // 랭킹 보드(Scores)의 닉네임도 동기화
    const scores = db.collection('scores');
    await scores.updateMany(
      { kakaoId: session.user.kakaoId },
      { $set: { nickname: trimmedNickname } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { nickname: trimmedNickname },
    });
  } catch (error) {
    console.error('닉네임 설정 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.kakaoId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const users = db.collection('users');
    const user = await users.findOne({ kakaoId: session.user.kakaoId });

    // 다음 변경 가능 날짜 계산
    let canChangeNickname = true;
    let nextChangeDate = null;

    if (user?.nicknameUpdatedAt) {
      const lastUpdate = new Date(user.nicknameUpdatedAt);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      if (lastUpdate > oneMonthAgo) {
        canChangeNickname = false;
        nextChangeDate = new Date(lastUpdate);
        nextChangeDate.setMonth(nextChangeDate.getMonth() + 1);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        nickname: user?.nickname || null,
        nicknameUpdatedAt: user?.nicknameUpdatedAt?.toISOString() || null,
        canChangeNickname,
        nextChangeDate: nextChangeDate?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('닉네임 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
