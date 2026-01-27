import { NextAuthOptions } from 'next-auth';
import KakaoProvider from 'next-auth/providers/kakao';
import { getDatabase } from './mongodb';

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      kakaoId?: string;
      nickname?: string | null;
      nicknameUpdatedAt?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    kakaoId?: string;
    nickname?: string | null;
    nicknameUpdatedAt?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'kakao') {
        try {
          const db = await getDatabase();
          const users = db.collection('users');

          // 기존 유저 확인 또는 새 유저 생성
          await users.updateOne(
            { kakaoId: account.providerAccountId },
            {
              $set: {
                kakaoId: account.providerAccountId,
                email: user.email,
                name: user.name,
                image: user.image,
                updatedAt: new Date(),
              },
              $setOnInsert: {
                createdAt: new Date(),
                highScore: 0,
                totalGames: 0,
                nickname: null, // 처음 가입 시 닉네임 없음
              },
            },
            { upsert: true }
          );
        } catch (error) {
          console.error('MongoDB 유저 저장 오류:', error);
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (account?.provider === 'kakao') {
        token.kakaoId = account.providerAccountId;

        // 로그인 시 DB에서 닉네임 조회
        try {
          const db = await getDatabase();
          const users = db.collection('users');
          const dbUser = await users.findOne({ kakaoId: account.providerAccountId });
          token.nickname = dbUser?.nickname || null;
          token.nicknameUpdatedAt = dbUser?.nicknameUpdatedAt?.toISOString() || null;
        } catch (error) {
          console.error('닉네임 조회 오류:', error);
          token.nickname = null;
          token.nicknameUpdatedAt = null;
        }
      }

      // 세션 업데이트 트리거 시 DB에서 닉네임 다시 조회
      if (trigger === 'update' && token.kakaoId) {
        try {
          const db = await getDatabase();
          const users = db.collection('users');
          const dbUser = await users.findOne({ kakaoId: token.kakaoId });
          token.nickname = dbUser?.nickname || null;
          token.nicknameUpdatedAt = dbUser?.nicknameUpdatedAt?.toISOString() || null;
        } catch (error) {
          console.error('닉네임 업데이트 조회 오류:', error);
        }
      }

      if (user) {
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.kakaoId = token.kakaoId;
        session.user.nickname = token.nickname;
        session.user.nicknameUpdatedAt = token.nicknameUpdatedAt;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
