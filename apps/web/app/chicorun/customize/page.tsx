'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CHICORUN_API, CHICORUN_ROUTES, CHICORUN_STORAGE_KEY } from '@/constants/chicorun';

// ─── Constants ─────────────────────────────────────────────────────────────
const AVAILABLE_STICKERS = ['⭐', '🔥', '💎', '🎯', '🚀', '💪', '🎨', '🎵', '🌈', '✨', '🍀', '🍎', '🧩', '🎸', '🕹️', '🏆', '💯', '🍕', '😎', '👻'];
const AVAILABLE_BADGES = ['👑', '🔥', '⚡', '📚', '💪', '⭐', '🎯', '🥊', '🦄', '🎮', '🥇', '🦸', '🚀', '💎', '🌈'];

const AVAILABLE_BACKGROUNDS = [
    { name: '기본 화이트', value: 'white' },
    { name: '다크 나이트', value: 'linear-gradient(135deg, #1e293b, #0f172a)' },
    { name: '선셋 오렌지', value: 'linear-gradient(135deg, #f97316, #f59e0b)' },
    { name: '오션 블루', value: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' },
    { name: '네온 핑크', value: 'linear-gradient(135deg, #ec4899, #8b5cf6)' },
    { name: '갤럭시', value: 'radial-gradient(circle at center, #2e1065, #000000)' },
    { name: '스위트 코랄', value: 'linear-gradient(135deg, #fda4af, #f9a8d4)' },
    { name: '에메랄드 포레스트', value: 'linear-gradient(135deg, #10b981, #059669)' },
    { name: '골든 글로우', value: 'linear-gradient(135deg, #fde047, #eab308)' },
    { name: '레인보우 파티', value: 'linear-gradient(90deg, #f87171, #fbbf24, #34d399, #60a5fa, #a78bfa)' },
    { name: '사이버펑크', value: 'linear-gradient(135deg, #0f172a, #14b8a6, #ec4899)' },
    { name: '매직 페어리', value: 'linear-gradient(135deg, #fce7f3, #e879f9, #c084fc)' },
];

const AVAILABLE_NICKNAME_COLORS = [
    '#1e293b', // Default
    '#ffffff', // White
    '#ef4444', // Red
    '#f59e0b', // Gold
    '#10b981', // Green
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ec4899', // Pink
];

// ─── Types ─────────────────────────────────────────────────────────────────
interface StickerItem {
    id: string;
    emoji: string;
    x: number;
    y: number;
    scale?: number;
    rotate?: number;
}
interface NicknameStyleType {
    color: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
}

// ─── Icons ─────────────────────────────────────────────────────────────────
const IconSparkles = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"></path>
    </svg>
);

const IconSave = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
);

const IconZap = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#f97316" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);

const IconTrophy = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#eab308" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
        <path d="M4 22h16"></path>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
);

// ─── Components ────────────────────────────────────────────────────────────
function DraggableSticker({ sticker, onRemove }: { sticker: StickerItem; onRemove: (id: string) => void }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'sticker',
        item: { id: sticker.id, x: sticker.x, y: sticker.y },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
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
                opacity: isDragging ? 0.3 : 1,
                fontSize: '2rem',
                userSelect: 'none',
                zIndex: 10,
                transform: `scale(${sticker.scale || 1}) rotate(${sticker.rotate || 0}deg)`
            }}
            title="더블클릭해서 삭제"
        >
            {sticker.emoji}
        </div>
    );
}

function CustomizeContent() {
    const router = useRouter();

    const [nickname, setNickname] = useState('치코런');
    const [selectedBadge, setSelectedBadge] = useState(AVAILABLE_BADGES[0]);
    const [cardStyle, setCardStyle] = useState(AVAILABLE_BACKGROUNDS[0].value);
    const [stickers, setStickers] = useState<StickerItem[]>([]);
    const [nicknameStyle, setNicknameStyle] = useState<NicknameStyleType>({
        color: '#1e293b',
        bold: true,
        italic: false,
        underline: false,
    });
    const [pointInfo] = useState(9999);

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMyInfo = useCallback(async () => {
        const token = localStorage.getItem(CHICORUN_STORAGE_KEY.TOKEN);
        if (!token) {
            router.replace(CHICORUN_ROUTES.JOIN);
            return;
        }

        try {
            const res = await fetch(CHICORUN_API.STUDENT_ME, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                setNickname(data.data.nickname);
                const custom = data.data.customization;
                if (custom) {
                    if (custom.badge) setSelectedBadge(custom.badge);
                    if (custom.cardStyle) setCardStyle(custom.cardStyle);
                    if (Array.isArray(custom.stickers)) setStickers(custom.stickers);
                }
                if (data.data.nicknameStyle) {
                    setNicknameStyle({
                        color: data.data.nicknameStyle.color || '#1e293b',
                        bold: data.data.nicknameStyle.bold || false,
                        italic: data.data.nicknameStyle.italic || false,
                        underline: data.data.nicknameStyle.underline || false,
                    });
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

    const previewContainerRef = useRef<HTMLDivElement>(null);

    const [, drop] = useDrop(() => ({
        accept: 'sticker',
        drop: (item: { id: string; x: number; y: number }, monitor) => {
            const delta = monitor.getDifferenceFromInitialOffset();
            if (delta) {
                moveSticker(item.id, Math.round(item.x + delta.x), Math.round(item.y + delta.y));
            }
        },
    }));

    const addSticker = (emoji: string) => {
        const newSticker: StickerItem = {
            id: Date.now().toString(),
            emoji,
            x: 150 + Math.random() * 50,
            y: 20 + Math.random() * 30,
            scale: 1 + Math.random() * 0.5,
            rotate: Math.random() * 60 - 30, // -30 to 30 deg
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
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    nickname: nickname.trim(),
                    badge: selectedBadge,
                    cardStyle: cardStyle,
                    stickers,
                    nicknameStyle,
                }),
            });

            const data = await res.json();
            if (data.success) {
                alert('랭킹 꾸미기가 저장되었습니다! 화려해진 랭킹 리스트를 확인해 보세요.');
                const stored = localStorage.getItem(CHICORUN_STORAGE_KEY.STUDENT_INFO);
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        parsed.nickname = nickname.trim();
                        localStorage.setItem(CHICORUN_STORAGE_KEY.STUDENT_INFO, JSON.stringify(parsed));
                    } catch { }
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

    const toggleStyle = (style: 'bold' | 'italic' | 'underline') => {
        setNicknameStyle(prev => ({ ...prev, [style]: !prev[style] }));
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
            <main className={styles.main}>
                <div className={styles.titleArea}>
                    <h1 className={styles.title}><IconSparkles /> 랭킹 꾸미기</h1>
                    <p className={styles.subtitle}>랭킹 리스트에 나타나는 나의 랭킹 영역을 자유롭게 꾸며보세요!</p>
                </div>

                <div className={styles.layoutGrid}>
                    {/* 미리보기 (랭킹 아이템과 동일한 레이아웃) */}
                    <div className={styles.previewPanel}>
                        <h2 className={styles.panelTitle}>미리보기</h2>
                        <div className={styles.previewContainer}>
                            <div
                                ref={(node) => {
                                    drop(node);
                                    (previewContainerRef as any).current = node;
                                }}
                                className={styles.rankingItemPreview}
                                style={{ background: cardStyle }}
                            >
                                {/* 추가된 스티커들 */}
                                {stickers.map(sticker => (
                                    <DraggableSticker key={sticker.id} sticker={sticker} onRemove={removeSticker} />
                                ))}

                                {/* 가상의 1등 랭크 */}
                                <div className={styles.rankBadgeBox} style={{ position: 'relative', zIndex: 1 }}>
                                    <IconTrophy />
                                </div>

                                {/* 뱃지와 닉네임 */}
                                <div className={styles.rankInfo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
                                    <div className={styles.rankBadgeEmoji}>{selectedBadge}</div>
                                    <div
                                        className={styles.rankNickname}
                                        style={{
                                            color: nicknameStyle.color,
                                            fontWeight: nicknameStyle.bold ? 800 : 500,
                                            fontStyle: nicknameStyle.italic ? 'italic' : 'normal',
                                            textDecoration: nicknameStyle.underline ? 'underline' : 'none',
                                            textShadow: cardStyle !== 'white' && nicknameStyle.color === '#ffffff' ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
                                        }}
                                    >
                                        {nickname}
                                    </div>
                                </div>

                                {/* 가상의 점수 상자 */}
                                <div className={styles.pointsBox} style={{ position: 'relative', zIndex: 1 }}>
                                    <IconZap />
                                    <span className={styles.points}>{pointInfo.toLocaleString()}P</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.hintText}>
                            💡 <b>스티커를 추가</b>하고 자유롭게 패널 안에서 <b>드래그</b>해 나만의 화려한 랭킹 줄을 만들어보세요. 더블클릭하면 스티커가 삭제됩니다.
                        </div>
                    </div>

                    {/* 옵션 컨트롤 */}
                    <div className={styles.optionsContainer}>

                        {/* 닉네임 설정 */}
                        <div className={styles.optionSection}>
                            <div className={styles.sectionTitle}>📝 닉네임 스타일</div>
                            <input
                                type="text"
                                value={nickname}
                                onChange={e => setNickname(e.target.value)}
                                maxLength={10}
                                className={styles.inputNickname}
                                placeholder="새 닉네임 입력 (최대 10자)"
                            />

                            {/* 색상 픽커 */}
                            <div className={styles.gridColor}>
                                {AVAILABLE_NICKNAME_COLORS.map(color => (
                                    <div
                                        key={color}
                                        className={`${styles.colorCircle} ${nicknameStyle.color === color ? styles.selected : ''}`}
                                        style={{ background: color, border: nicknameStyle.color === color ? '3px solid #6366f1' : '3px solid #cbd5e1' }}
                                        onClick={() => setNicknameStyle(prev => ({ ...prev, color }))}
                                    />
                                ))}
                            </div>

                            {/* 효과 픽커 */}
                            <div className={styles.textStyleControls}>
                                <button className={`${styles.btnTextStyle} ${nicknameStyle.bold ? styles.active : ''}`} onClick={() => toggleStyle('bold')}>Bold</button>
                                <button className={`${styles.btnTextStyle} ${nicknameStyle.italic ? styles.active : ''}`} onClick={() => toggleStyle('italic')}>Italic</button>
                                <button className={`${styles.btnTextStyle} ${nicknameStyle.underline ? styles.active : ''}`} onClick={() => toggleStyle('underline')}>Underline</button>
                            </div>
                        </div>

                        {/* 뱃지 설정 */}
                        <div className={styles.optionSection}>
                            <div className={styles.sectionTitle}>🎖️ 대표 뱃지</div>
                            <div className={styles.gridEmojis}>
                                {AVAILABLE_BADGES.map(badge => (
                                    <button
                                        key={badge}
                                        onClick={() => setSelectedBadge(badge)}
                                        className={`${styles.btnEmoji} ${selectedBadge === badge ? styles.selected : ''}`}
                                    >
                                        {badge}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 테두리(배경) 설정 */}
                        <div className={styles.optionSection} style={{ gridColumn: '1 / -1' }}>
                            <div className={styles.sectionTitle}>🎨 랭킹 배경 스타일</div>
                            <div className={styles.gridBackgrounds}>
                                {AVAILABLE_BACKGROUNDS.map(bg => (
                                    <div
                                        key={bg.name}
                                        onClick={() => setCardStyle(bg.value)}
                                        className={`${styles.btnBackground} ${cardStyle === bg.value ? styles.selected : ''}`}
                                        style={{ background: bg.value, border: cardStyle === bg.value ? '3px solid #3b82f6' : '3px solid #e2e8f0' }}
                                    >
                                        {bg.name}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 스티커 설정 */}
                        <div className={styles.optionSection} style={{ gridColumn: '1 / -1' }}>
                            <div className={styles.sectionTitle}>✨ 장식 스티커 추가 (무제한 배치 가능)</div>
                            <div className={styles.gridEmojis}>
                                {AVAILABLE_STICKERS.map(sticker => (
                                    <button
                                        key={sticker}
                                        onClick={() => addSticker(sticker)}
                                        className={styles.btnEmoji}
                                    >
                                        {sticker}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 저장 버튼 */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <button
                                className={styles.btnSave}
                                onClick={handleSave}
                                disabled={isSaving || !nickname.trim()}
                            >
                                {isSaving ? '저장 중...' : <><IconSave /> 화려하게 변신한 랭킹 영역 저장하기</>}
                            </button>
                        </div>
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
