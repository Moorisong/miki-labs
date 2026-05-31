'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { fetchMyProfile, deleteMyAccount } from '@/lib/puzzle-api';
import { clearAllPuzzleState } from '@/lib/puzzle-db';
import ProfileCard from '@/components/puzzle/profile-card';
import HistoryList from '@/components/puzzle/history-list';
import RecordChart from '@/components/puzzle/record-chart';
import SettingsPanel from '@/components/puzzle/settings-panel';
import Link from 'next/link';
import { TrendingUp, Award, ArrowLeft } from 'lucide-react';
import styles from '../puzzle-layout.module.css';

export default function MyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.kakaoId;

  const [profile, setProfile] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsLoading(false);
      return;
    }

    async function loadProfile() {
      if (!token) return;
      try {
        const res = await fetchMyProfile(token);
        if (res.success && res.data) {
          setProfile(res.data.profile);
          setStatistics(res.data.statistics);
          setHistory(res.data.history || []);
        }
      } catch (e) {
        console.error('Failed to fetch myprofile:', e);
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      loadProfile();
    }
  }, [token, status]);

  const handleClearData = async () => {
    if (window.confirm('로컬 IndexedDB에 저장된 모든 진행 상태 및 이어하기 데이터를 완전히 초기화하시겠습니까? (이 작업은 되돌릴 수 없습니다)')) {
      await clearAllPuzzleState();
      alert('로컬에 저장된 모든 퍼즐 플레이 조각 상태가 성공적으로 초기화되었습니다! 🧼');
      router.refresh();
    }
  };

  const handleDeleteAccount = async () => {
    if (!token) return;
    if (window.confirm('🚨 정말로 회원 탈퇴를 진행하시겠습니까?\n\n이 작업 진행 시 사용자의 카카오 로그인 프로필 연동이 끊어지며, 저장된 모든 완료 랭킹 기록, 실시간 퍼즐 진행 상황 및 토큰 로그가 데이터베이스에서 CASCADE 영구 일괄 삭제됩니다. 이 작업은 절대 복구할 수 없습니다.')) {
      try {
        const res = await deleteMyAccount(token);
        if (res.success) {
          alert('회원 탈퇴 및 모든 정보 삭제가 성공적으로 완료되었습니다. 그동안 하루퍼즐을 이용해 주셔서 진심으로 감사드립니다.');
          signOut({ callbackUrl: '/puzzle' });
        } else {
          alert(res.error || '회원 탈퇴 처리 중 문제가 발생했습니다.');
        }
      } catch (e) {
        console.error(e);
        alert('회원 탈퇴 중 알 수 없는 에러가 발생했습니다.');
      }
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] flex-col gap-3 font-semibold select-none">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--puzzle-primary) var(--puzzle-primary) var(--puzzle-primary) transparent' }} />
        <span style={{ color: 'var(--puzzle-muted-foreground)' }}>내 프로필 카드를 정리하는 중...</span>
      </div>
    );
  }

  if (status === 'unauthenticated' || !token) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] flex-col gap-3 select-none">
        <span className="text-4xl">🔒</span>
        <p className="text-sm font-bold" style={{ color: 'var(--puzzle-card-foreground)' }}>로그인이 필요한 페이지입니다.</p>
        <p className="text-xs" style={{ color: 'var(--puzzle-muted-foreground)' }}>마이페이지에서 나만의 통계와 기록 히스토리를 확인하고 관리해 보세요.</p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent('/puzzle/mypage')}`}
          className="mt-4 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:scale-[1.02] transition-all"
        >
          로그인하러 가기 🚀
        </Link>
      </div>
    );
  }

  return (
    <div className={`${styles.container} puzzle-animate-fade-in-up`}>
      {/* Page Header Title */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1.5" style={{ color: 'var(--puzzle-card-foreground)' }}>
            마이페이지
          </h1>
          <p className="text-sm font-semibold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
            내 개인 통계 정보와 아카이브 완주 기록을 한눈에 관리해 보세요.
          </p>
        </div>

        <Link
          href="/puzzle"
          className="flex items-center gap-1 text-xs font-bold transition-colors"
          style={{ color: 'var(--puzzle-muted-foreground)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--puzzle-foreground)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--puzzle-muted-foreground)'; }}
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          <span>메인으로</span>
        </Link>
      </div>

      {/* Main Spacing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: User Profile & setting dials */}
        <div className="flex flex-col gap-4">
          {profile && statistics && (
            <ProfileCard
              profile={profile}
              statistics={statistics}
            />
          )}

          {/* Achievement teaser badges */}
          <div
            className="rounded-2xl border p-5"
            style={{
              backgroundColor: 'var(--puzzle-glass-bg)',
              backdropFilter: 'var(--puzzle-glass-blur)',
              borderColor: 'var(--puzzle-border)',
              boxShadow: 'var(--puzzle-shadow-sm)',
            }}
          >
            <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: 'var(--puzzle-card-foreground)' }}>
              <Award size={15} style={{ color: 'var(--puzzle-primary)' }} />
              달성 업적 배지
            </p>
            <div className="flex flex-wrap gap-2">
              {statistics?.totalCompleted >= 1 && (
                <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold" style={{ backgroundColor: 'var(--puzzle-secondary)', color: 'var(--puzzle-primary)' }}>
                  🏆 첫 완주 달성
                </span>
              )}
              {statistics?.bestTimeBeginner && statistics.bestTimeBeginner < 600 && (
                <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold" style={{ backgroundColor: 'var(--puzzle-secondary)', color: 'var(--puzzle-primary)' }}>
                  ⚡ 스피드 챌린저
                </span>
              )}
              {statistics?.totalCompleted >= 5 && (
                <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold" style={{ backgroundColor: 'var(--puzzle-secondary)', color: 'var(--puzzle-primary)' }}>
                  🌟 연속 퍼즐러
                </span>
              )}
              {statistics?.bestRank && statistics.bestRank <= 10 && (
                <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold" style={{ backgroundColor: 'var(--puzzle-secondary)', color: 'var(--puzzle-primary)' }}>
                  🎯 TOP 10 랭커
                </span>
              )}
              {history.length === 0 && (
                <span className="text-xs font-semibold" style={{ color: 'var(--puzzle-muted-foreground)' }}>
                  아직 획득한 훈장이 없습니다. 퍼즐을 풀고 첫 훈장을 획득하세요! 🏅
                </span>
              )}
            </div>
          </div>

          <SettingsPanel
            onClearData={handleClearData}
            onDeleteAccount={handleDeleteAccount}
          />
        </div>

        {/* Right side: completed history details & chart analytics */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-extrabold flex items-center gap-2" style={{ color: 'var(--puzzle-card-foreground)' }}>
              완주 기록 히스토리
            </h2>
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: 'var(--puzzle-muted)', color: 'var(--puzzle-muted-foreground)' }}
            >
              <TrendingUp size={12} />
              <span>{history.length}개 완주</span>
            </div>
          </div>

          {/* History List */}
          <HistoryList history={history} />

          {/* Record trend chart */}
          {history.length > 1 && (
            <RecordChart history={history} />
          )}
        </div>
      </div>
    </div>
  );
}
