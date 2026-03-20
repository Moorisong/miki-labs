'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './page.module.css';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CHICORUN_API, CHICORUN_ROUTES, CHICORUN_STORAGE_KEY } from '@/constants/chicorun';

// ─── Constants ─────────────────────────────────────────────────────────────
const AVAILABLE_STICKERS = ['⭐', '🔥', '💎', '🎯', '🚀', '💪', '🎨', '🎵', '🌈', '✨'];
const AVAILABLE_BADGES = ['👑', '🔥', '⚡', '📚', '💪', '⭐', '🎯', '🥊', '🦄', '🎮'];
const AVAILABLE_BORDERS = [
    { name: '기본', bg: 'linear-gradient(135deg, #60a5fa, #06b6d4)' },
    { name: '골드', bg: 'linear-gradient(135deg, #facc15, #f97316)' },
    { name: '실버', bg: 'linear-gradient(135deg, #9ca3af, #6b7280)' },
    { name: '레인보우', bg: 'linear-gradient(135deg, #f472b6, #c084fc, #60a5fa)' },
    { name: '그린', bg: 'linear-gradient(135deg, #4ade80, #14b8a6)' },
    { name: '핑크', bg: 'linear-gradient(135deg, #f472b6, #e11d48)' },
];

// ─── Types ─────────────────────────────────────────────────────────────────
interface StickerItem {
    id: string;
    emoji: string;
    x: number;
    y: number;
}

// ─── Icons ─────────────────────────────────────────────────────────────────
const IconBook = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

const IconSparkles = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"></path>
        <path d="M5 3v4"></path>
        <path d="M19 17v4"></path>
        <path d="M3 5h4"></path>
        <path d="M17 19h4"></path>
    </svg>
);

const IconSave = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
);

// ─── Components ────────────────────────────────────────────────────────────
function DraggableSticker({
    sticker,
    onRemove,
}: {
    sticker: StickerItem;
    onRemove: (id: string) => void;
}) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'sticker',
        item: { id: sticker.id, x: sticker.x, y: sticker.y },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag as any}
            onDoubleClick={() => onRemove(sticker.id)}
            style={{
                position: 'absolute',
                left: sticker.x,
                top: sticker.y,
                cursor: 'move',
                opacity: isDragging ? 0.5 : 1,
                fontSize: '2.5rem',
                userSelect: 'none',
            }}
        >
            {sticker.emoji}
        </div>
    );
}

function CustomizeContent() {
    const pathname = usePathname();
    const router = useRouter();

    const [nickname, setNickname] = useState('치코런');
    const [selectedBadge, setSelectedBadge] = useState(AVAILABLE_BADGES[0]);
    const [selectedBorder, setSelectedBorder] = useState(AVAILABLE_BORDERS[0]);
    const [stickers, setStickers] = useState<StickerItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 내 정보 불러오기
    const fetchMyInfo = useCallback(async () => {
        const token = localStorage.getItem(CHICORUN_STORAGE_KEY.TOKEN);
        if (!token) {
            router.replace(CHICORUN_ROUTES.JOIN);
            return;
        }

        try {
            const res = await fetch(CHICORUN_API.STUDENT_ME, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setNickname(data.data.nickname);
                const custom = data.data.customization;
                if (custom) {
                    if (custom.badge) setSelectedBadge(custom.badge);
                    if (custom.cardStyle) {
                        const match = AVAILABLE_BORDERS.find(b => b.bg === custom.cardStyle);
                        if (match) setSelectedBorder(match);
                    }
                    if (Array.isArray(custom.stickers)) {
                        setStickers(custom.stickers);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to load user info:', err);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchMyInfo();
    }, [fetchMyInfo]);

    const [, drop] = useDrop(() => ({
        accept: 'sticker',
        drop: (item: { id: string; x: number; y: number }, monitor) => {
            const delta = monitor.getDifferenceFromInitialOffset();
            if (delta) {
                const newX = Math.round(item.x + delta.x);
                const newY = Math.round(item.y + delta.y);
                moveSticker(item.id, newX, newY);
            }
        },
    }));

    const addSticker = (emoji: string) => {
        const newSticker: StickerItem = {
            id: Date.now().toString(),
            emoji,
            // 프로필 카드 중앙 부근에 임의 생성
            x: Math.random() * 100 + 100,
            y: Math.random() * 100 + 80,
        };
        setStickers(prev => [...prev, newSticker]);
    };

    const moveSticker = (id: string, x: number, y: number) => {
        setStickers(prev => prev.map(s => (s.id === id ? { ...s, x, y } : s)));
    };

    const removeSticker = (id: string) => {
        setStickers(prev => prev.filter(s => s.id !== id));
    };

    const handleSave = async () => {
        if (!nickname.trim()) return;
        const token = localStorage.getItem(CHICORUN_STORAGE_KEY.TOKEN);
        if (!token) return;

        setIsSaving(true);
        try {
            const res = await fetch(CHICORUN_API.STUDENT_CUSTOMIZE, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nickname: nickname.trim(),
                    badge: selectedBadge,
                    cardStyle: selectedBorder.bg,
                    stickers,
                }),
            });

            const data = await res.json();
            if (data.success) {
                alert('저장되었습니다! 랭킹에서 확인해보세요.');

                // localStorage 내 정보 업데이트
                const stored = localStorage.getItem(CHICORUN_STORAGE_KEY.STUDENT_INFO);
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        parsed.nickname = nickname.trim();
                        localStorage.setItem(CHICORUN_STORAGE_KEY.STUDENT_INFO, JSON.stringify(parsed));
                    } catch {
                        // ignore
                    }
                }
            } else {
                alert(data.error?.includes('DUPLICATE') ? '이미 사용 중인 닉네임입니다.' : '저장 실패');
            }
        } catch (err) {
            console.error('Failed to save customization:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b' }}>
                    <div>⏳</div>
                    <p>내 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href={CHICORUN_ROUTES.LANDING} className={styles.headerLogo}>
                    <div className={styles.iconBox}><IconBook /></div>
                    <span>하루상자</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'normal' }}>Chicorun</span>
                </Link>
                <nav className={styles.navLinks}>
                    <Link href={CHICORUN_ROUTES.LANDING} className={pathname === CHICORUN_ROUTES.LANDING ? styles.activeLink : styles.navLink}>홈</Link>
                    <Link href={CHICORUN_ROUTES.RANKING} className={pathname === CHICORUN_ROUTES.RANKING ? styles.activeLink : styles.navLink}>랭킹</Link>
                    <Link href={CHICORUN_ROUTES.CUSTOMIZE} className={pathname === CHICORUN_ROUTES.CUSTOMIZE ? styles.activeLink : styles.navLink}>꾸미기</Link>
                </nav>
            </header>

            <main className={styles.main}>
                <div className={styles.titleArea}>
                    <h1 className={styles.title}><IconSparkles /> 꾸미기</h1>
                    <p className={styles.subtitle}>나만의 게임 프로필 카드를 꾸며보세요!</p>
                </div>

                <div className={styles.layoutGrid}>
                    {/* 왼쪽: 미리보기 (DnD Area) */}
                    <div className={styles.previewPanel}>
                        <h2 className={styles.panelTitle}>미리보기</h2>
                        <div className={styles.previewContainer}>
                            <div ref={drop as any} className={styles.cardBorder} style={{ background: selectedBorder.bg }}>
                                <div className={styles.cardInner}>
                                    {stickers.map(sticker => (
                                        <DraggableSticker
                                            key={sticker.id}
                                            sticker={sticker}
                                            onRemove={removeSticker}
                                        />
                                    ))}

                                    <div className={styles.cardInnerContent}>
                                        <div className={styles.cardBadge}>{selectedBadge}</div>
                                        <div className={styles.cardNickname}>{nickname}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.hintText}>
                            💡 스티커를 마우스로 드래그해서 옮기거나, 더블클릭해서 삭제하세요
                        </div>
                    </div>

                    {/* 오른쪽: 옵션 컨트롤 */}
                    <div>
                        <div className={styles.optionSection}>
                            <h3 className={styles.sectionTitle}>닉네임</h3>
                            <input
                                type="text"
                                value={nickname}
                                onChange={e => setNickname(e.target.value)}
                                maxLength={10}
                                className={styles.inputNickname}
                                placeholder="새 닉네임 입력 (최대 10자)"
                            />
                        </div>

                        <div className={styles.optionSection}>
                            <h3 className={styles.sectionTitle}>뱃지</h3>
                            <div className={styles.grid5}>
                                {AVAILABLE_BADGES.map(badge => (
                                    <button
                                        key={badge}
                                        onClick={() => setSelectedBadge(badge)}
                                        className={`${styles.btnSelect} ${selectedBadge === badge ? styles.selected : ''}`}
                                    >
                                        {badge}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.optionSection}>
                            <h3 className={styles.sectionTitle}>카드 테두리</h3>
                            <div className={styles.grid2}>
                                {AVAILABLE_BORDERS.map(border => (
                                    <div
                                        key={border.name}
                                        onClick={() => setSelectedBorder(border)}
                                        className={`${styles.btnBorder} ${selectedBorder.name === border.name ? styles.selected : ''}`}
                                    >
                                        <div className={styles.btnBorderInner} style={{ background: border.bg }}>
                                            <span className={styles.btnBorderText}>{border.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.optionSection}>
                            <h3 className={styles.sectionTitle}>스티커 추가</h3>
                            <div className={styles.grid5}>
                                {AVAILABLE_STICKERS.map(sticker => (
                                    <button
                                        key={sticker}
                                        onClick={() => addSticker(sticker)}
                                        className={styles.btnSticker}
                                    >
                                        {sticker}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            className={styles.btnSave}
                            onClick={handleSave}
                            disabled={isSaving || !nickname.trim()}
                        >
                            {isSaving ? '저장 중...' : <><IconSave /> 저장하기</>}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function CustomizePage() {
    return (
        <DndProvider backend={HTML5Backend}>
            <CustomizeContent />
        </DndProvider>
    );
}
