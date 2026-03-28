'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './QuickFriendRequestModal.module.css';
import { CHICORUN_API } from '@/constants/chicorun';

interface Friend {
    id: string;
    nickname: string;
    point: number;
    currentLevel: number;
    isFriend: boolean;
    pendingSent: boolean;
    pendingReceived: boolean;
    requestId?: string;
}

interface Props {
    onClose: () => void;
}

export default function QuickFriendRequestModal({ onClose }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Friend[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = useCallback(async (q: string) => {
        if (!q.trim()) {
            setResults([]);
            return;
        }
        const token = localStorage.getItem('chicorun_user_token');
        if (!token) return;

        setIsLoading(true);
        try {
            const res = await fetch(`${CHICORUN_API.FRIEND_SEARCH}?nickname=${encodeURIComponent(q)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setResults(data.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) handleSearch(query);
        }, 400);
        return () => clearTimeout(timer);
    }, [query, handleSearch]);

    const sendRequest = async (nickname: string) => {
        const token = localStorage.getItem('chicorun_user_token');
        if (!token) return;

        try {
            const res = await fetch(CHICORUN_API.FRIEND_REQUEST, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ toNickname: nickname })
            });
            const data = await res.json();
            if (data.success) {
                handleSearch(query);
                alert('친구 신청을 보냈습니다.');
            } else {
                alert(data.error?.message || '신청에 실패했습니다.');
            }
        } catch (err) {
            alert('서버 오류가 발생했습니다.');
        }
    };

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>친구 신청</h3>
                    <button className={styles.closeButton} onClick={onClose}>✕</button>
                </div>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="친구 닉네임 검색..."
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className={styles.results}>
                    {results.map(res => (
                        <div key={res.id} className={styles.item}>
                            <div className={styles.nickname}>
                                🏃‍♂️ {res.nickname}
                                {(res as any).isMe && <span className={styles.meBadge}>나</span>}
                            </div>
                            <div>
                                {(res as any).isMe ? (
                                    <span className={styles.statusText}>이건 당신이에요!</span>
                                ) : res.isFriend ? (
                                    <span className={styles.statusText}>이미 친구</span>
                                ) : res.pendingSent ? (
                                    <span className={styles.statusText}>요청 보냄</span>
                                ) : res.pendingReceived ? (
                                    <span className={styles.statusText}>수락 대기 중</span>
                                ) : (
                                    <button className={styles.requestBtn} onClick={() => sendRequest(res.nickname)}>신청</button>
                                )}
                            </div>
                        </div>
                    ))}
                    {query.trim() && results.length === 0 && !isLoading && (
                        <p className={styles.statusText} style={{ textAlign: 'center', marginTop: '1rem' }}>
                            "{query}"에 대한 검색 결과가 없습니다.
                        </p>
                    )}
                    {isLoading && (
                        <p className={styles.statusText} style={{ textAlign: 'center', marginTop: '1rem' }}>
                            검색 중...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
