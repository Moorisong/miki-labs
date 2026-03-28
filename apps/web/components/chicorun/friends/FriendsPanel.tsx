'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './FriendsPanel.module.css';
import { CHICORUN_API } from '@/constants/chicorun';

interface Friend {
    id: string;
    _id?: string;
    nickname: string;
    point: number;
    currentLevel: number;
    updatedAt?: string;
}

interface RequestItem {
    _id: string;
    fromUser?: Friend;
    toUser?: Friend;
    createdAt: string;
}

interface SearchResult extends Friend {
    isFriend: boolean;
    pendingSent: boolean;
    pendingReceived: boolean;
    requestId?: string;
}

interface FriendsPanelProps {
    onClose: () => void;
    onUpdateCount?: (count: number) => void;
}

export default function FriendsPanel({ onClose, onUpdateCount }: FriendsPanelProps) {
    const [activeTab, setActiveTab] = useState<'list' | 'received' | 'sent' | 'search'>('list');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [receivedRequests, setReceivedRequests] = useState<RequestItem[]>([]);
    const [sentRequests, setSentRequests] = useState<RequestItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFriends = useCallback(async () => {
        const token = localStorage.getItem('chicorun_user_token');
        if (!token) return;

        try {
            const res = await fetch(CHICORUN_API.FRIENDS, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setFriends(data.data.friends || []);
                if (onUpdateCount) onUpdateCount(data.data.pendingReceivedCount || 0);
            }
        } catch (err) {
            console.error('Failed to fetch friends', err);
        }
    }, [onUpdateCount]);

    const fetchRequests = useCallback(async () => {
        const token = localStorage.getItem('chicorun_user_token');
        if (!token) return;

        try {
            const res = await fetch(CHICORUN_API.FRIEND_REQUESTS, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setReceivedRequests(data.data.received || []);
                setSentRequests(data.data.sent || []);
            }
        } catch (err) {
            console.error('Failed to fetch requests', err);
        }
    }, []);

    const handleSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const token = localStorage.getItem('chicorun_user_token');
        if (!token) return;

        setIsLoading(true);
        try {
            const res = await fetch(`${CHICORUN_API.FRIEND_SEARCH}?nickname=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.data || []);
            }
        } catch (err) {
            console.error('Search failed', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFriends();
        fetchRequests();
    }, [fetchFriends, fetchRequests]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) handleSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, handleSearch]);

    const respondRequest = async (requestId: string, action: 'accept' | 'reject') => {
        const token = localStorage.getItem('chicorun_user_token');
        if (!token) return;

        try {
            const res = await fetch(CHICORUN_API.FRIEND_RESPOND, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ requestId, action })
            });
            const data = await res.json();
            if (data.success) {
                fetchFriends();
                fetchRequests();
                if (searchQuery) handleSearch(searchQuery);
            } else {
                alert(data.error?.message || '요청 처리에 실패했습니다.');
            }
        } catch (err) {
            alert('서버 오류가 발생했습니다.');
        }
    };

    const sendRequest = async (toNickname: string) => {
        const token = localStorage.getItem('chicorun_user_token');
        if (!token) return;

        try {
            const res = await fetch(CHICORUN_API.FRIEND_REQUEST, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ toNickname })
            });
            const data = await res.json();
            if (data.success) {
                fetchRequests();
                if (searchQuery) handleSearch(searchQuery);
                alert('친구 신청을 보냈습니다.');
            } else {
                alert(data.error?.message || '신청에 실패했습니다.');
            }
        } catch (err) {
            alert('서버 오류가 발생했습니다.');
        }
    };

    const removeFriend = async (friendId: string) => {
        if (!confirm('정말로 친구를 삭제하시겠습니까?')) return;

        const token = localStorage.getItem('chicorun_user_token');
        if (!token) return;

        try {
            const res = await fetch(`${CHICORUN_API.FRIENDS}/${friendId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchFriends();
                if (searchQuery) handleSearch(searchQuery);
            }
        } catch (err) {
            alert('서버 오류가 발생했습니다.');
        }
    };

    const cancelRequest = async (requestId: string) => {
        const token = localStorage.getItem('chicorun_user_token');
        if (!token) return;

        try {
            const res = await fetch(`${CHICORUN_API.FRIEND_REQUEST}/${requestId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchRequests();
                if (searchQuery) handleSearch(searchQuery);
            }
        } catch (err) {
            alert('서버 오류가 발생했습니다.');
        }
    };

    return (
        <div className={styles.panelOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.panel}>
                <div className={styles.header}>
                    <button className={styles.mobileCloseBtn} onClick={onClose}>
                        <span className={styles.backIcon}>←</span>
                        <span className={styles.closeLabel}>닫기</span>
                    </button>
                    <h2>친구 관리</h2>
                    <button className={styles.closeButton} onClick={onClose}>✕</button>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'list' ? styles.active : ''}`}
                        onClick={() => setActiveTab('list')}
                    >
                        목록
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'received' ? styles.active : ''}`}
                        onClick={() => setActiveTab('received')}
                    >
                        받은 요청 {receivedRequests.length > 0 && <span className={styles.badge}>{receivedRequests.length}</span>}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'sent' ? styles.active : ''}`}
                        onClick={() => setActiveTab('sent')}
                    >
                        보낸 요청
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'search' ? styles.active : ''}`}
                        onClick={() => setActiveTab('search')}
                    >
                        검색
                    </button>
                </div>

                <div className={styles.searchContainer}>
                    <div className={styles.searchInputWrapper}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="닉네임으로 친구 찾기..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (activeTab !== 'search') setActiveTab('search');
                            }}
                        />
                    </div>
                </div>

                <div className={styles.resultsList}>
                    {activeTab === 'list' && (
                        friends.length > 0 ? friends.map(friend => (
                            <div key={friend.id || friend._id} className={styles.friendItem}>
                                <div className={styles.avatar}>🏃‍♂️</div>
                                <div className={styles.info}>
                                    <div className={styles.nickname}>{friend.nickname}</div>
                                    <div className={styles.stats}>
                                        <span className={styles.points}>{friend.point.toLocaleString()} P</span>
                                        <span>LV. {friend.currentLevel}</span>
                                        {friend.updatedAt && (
                                            <span style={{ marginLeft: '8px', opacity: 0.6 }}>
                                                · {new Date(friend.updatedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.actions}>
                                    <button className={`${styles.actionBtn} ${styles.removeBtn}`} onClick={() => removeFriend(friend.id || friend._id!)}>삭제</button>
                                </div>
                            </div>
                        )) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>👥</div>
                                <p>아직 친구가 없습니다.</p>
                            </div>
                        )
                    )}

                    {activeTab === 'received' && (
                        receivedRequests.length > 0 ? receivedRequests.map(req => (
                            <div key={req._id} className={styles.friendItem}>
                                <div className={styles.avatar}>📩</div>
                                <div className={styles.info}>
                                    <div className={styles.nickname}>{req.fromUser?.nickname}</div>
                                    <div className={styles.stats}>
                                        <span className={styles.points}>{req.fromUser?.point.toLocaleString()} P</span>
                                        <span>LV. {req.fromUser?.currentLevel}</span>
                                    </div>
                                </div>
                                <div className={styles.actions}>
                                    <button className={`${styles.actionBtn} ${styles.acceptBtn}`} onClick={() => respondRequest(req._id, 'accept')}>수락</button>
                                    <button className={`${styles.actionBtn} ${styles.rejectBtn}`} onClick={() => respondRequest(req._id, 'reject')}>거절</button>
                                </div>
                            </div>
                        )) : (
                            <div className={styles.emptyState}>
                                <p>받은 요청이 없습니다.</p>
                            </div>
                        )
                    )}

                    {activeTab === 'sent' && (
                        sentRequests.length > 0 ? sentRequests.map(req => (
                            <div key={req._id} className={styles.friendItem}>
                                <div className={styles.avatar}>📤</div>
                                <div className={styles.info}>
                                    <div className={styles.nickname}>{req.toUser?.nickname}</div>
                                    <div className={styles.stats}>
                                        <span className={styles.points}>{req.toUser?.point.toLocaleString()} P</span>
                                        <span>LV. {req.toUser?.currentLevel}</span>
                                    </div>
                                </div>
                                <div className={styles.actions}>
                                    <button className={`${styles.actionBtn} ${styles.cancelBtn}`} onClick={() => cancelRequest(req._id)}>취소</button>
                                </div>
                            </div>
                        )) : (
                            <div className={styles.emptyState}>
                                <p>보낸 요청이 없습니다.</p>
                            </div>
                        )
                    )}

                    {activeTab === 'search' && (
                        searchResults.length > 0 ? searchResults.map(res => (
                            <div key={res.id} className={styles.friendItem}>
                                <div className={styles.avatar}>🔍</div>
                                <div className={styles.info}>
                                    <div className={styles.nickname}>
                                        {res.nickname}
                                        {(res as any).isMe && <span className={styles.meBadge}>나</span>}
                                    </div>
                                    <div className={styles.stats}>
                                        <span className={styles.points}>{res.point.toLocaleString()} P</span>
                                        <span>LV. {res.currentLevel}</span>
                                    </div>
                                </div>
                                <div className={styles.actions}>
                                    {(res as any).isMe ? (
                                        <span className={styles.stats}>나</span>
                                    ) : res.isFriend ? (
                                        <span className={styles.stats}>이미 친구입니다</span>
                                    ) : res.pendingSent ? (
                                        <button className={`${styles.actionBtn} ${styles.cancelBtn}`} onClick={() => cancelRequest(res.requestId!)}>요청 보냄</button>
                                    ) : res.pendingReceived ? (
                                        <button className={`${styles.actionBtn} ${styles.acceptBtn}`} onClick={() => respondRequest(res.requestId!, 'accept')}>수락 대기</button>
                                    ) : (
                                        <button className={`${styles.actionBtn} ${styles.requestBtn}`} onClick={() => sendRequest(res.nickname)}>친구 신청</button>
                                    )}
                                </div>
                            </div>
                        )) : searchQuery && !isLoading ? (
                            <div className={styles.emptyState}>
                                <p>검색 결과가 없습니다.</p>
                            </div>
                        ) : null
                    )}
                </div>
                <div className={styles.panelFooter}>
                    <button className={styles.footerCloseBtn} onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
