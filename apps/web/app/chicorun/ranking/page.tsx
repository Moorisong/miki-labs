'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ranking.module.css';
import { CHICORUN_API, CHICORUN_ROUTES } from '@/constants/chicorun';

interface RankingEntry {
    rank: number;
    id: string;
    nickname: string;
    point: number;
    level: number;
}

function RankingContent() {
    const router = useRouter();
    const [ranking, setRanking] = useState<RankingEntry[]>([]);
    const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchFriendIds = useCallback(async () => {
        const token = localStorage.getItem('chicorun_user_token');
        if (!token) return;

        try {
            const res = await fetch(CHICORUN_API.FRIENDS, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data.friends) {
                const ids = new Set<string>(
                    data.data.friends.map((f: { _id?: string; id?: string }) => f._id || f.id || '')
                );
                setFriendIds(ids);
            }
        } catch {
            // 친구 목록 로드 실패 시 무시 (랭킹 자체는 표시)
        }
    }, []);

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const response = await fetch(CHICORUN_API.RANKING);
                const data = await response.json();

                if (data.success) {
                    setRanking(data.data.ranking);
                } else {
                    setError('랭킹 데이터를 불러올 수 없습니다.');
                }
            } catch {
                setError('서버와 연결할 수 없습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRanking();
        fetchFriendIds();
    }, [fetchFriendIds]);

    if (isLoading) return <div className={styles.loading}>랭킹 불러오는 중... 🏃‍♂️</div>;
    if (error) return <div className={styles.error}>⚠️ {error}</div>;

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <h1 className={styles.title}>포인트 랭킹</h1>
                <p className={styles.subtitle}>현재 최고 랭커는 누구? 🔥</p>
            </header>

            <div className={styles.rankingList}>
                {ranking.map((item) => {
                    const isFriend = friendIds.has(item.id);
                    return (
                        <div
                            key={item.id}
                            className={`${styles.rankingItem} ${item.rank === 1 ? styles.top1 :
                                item.rank === 2 ? styles.top2 :
                                    item.rank === 3 ? styles.top3 : ''
                                } ${isFriend ? styles.friendItem : ''}`}
                        >
                            <span className={styles.rank}>{item.rank}</span>
                            <span className={styles.nickname}>
                                {item.nickname}
                                {isFriend && <span className={styles.friendBadge}>친구</span>}
                            </span>
                            <span className={styles.points}>{item.point.toLocaleString()} P</span>
                            <span className={styles.level}>Lv.{item.level}</span>
                        </div>
                    );
                })}
                {ranking.length === 0 && (
                    <p className={styles.error}>아직 등록된 랭커가 없습니다. 첫 1인이 되어보세요!</p>
                )}
            </div>

            <button
                className={styles.backBtn}
                onClick={() => router.push(CHICORUN_ROUTES.LEARN)}
            >
                학습 페이지로 이동
            </button>
        </main>
    );
}

export default function RankingPage() {
    return (
        <div className={styles.container}>
            <Suspense fallback={<div className={styles.loading}>정보 확인 중...</div>}>
                <RankingContent />
            </Suspense>
        </div>
    );
}
