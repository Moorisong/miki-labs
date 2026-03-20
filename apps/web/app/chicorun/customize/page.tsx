"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./page.module.css";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// 사용 가능한 스티커
const availableStickers = ["⭐", "🔥", "💎", "🎯", "🚀", "💪", "🎨", "🎵", "🌈", "✨"];

// 사용 가능한 뱃지
const availableBadges = ["👑", "🔥", "⚡", "📚", "💪", "⭐", "🎯", "🥊", "🦄", "🎮"];

// 사용 가능한 테두리
const availableBorders = [
    { name: "기본", bg: "linear-gradient(135deg, #60a5fa, #06b6d4)" },
    { name: "골드", bg: "linear-gradient(135deg, #facc15, #f97316)" },
    { name: "실버", bg: "linear-gradient(135deg, #9ca3af, #6b7280)" },
    { name: "레인보우", bg: "linear-gradient(135deg, #f472b6, #c084fc, #60a5fa)" },
    { name: "그린", bg: "linear-gradient(135deg, #4ade80, #14b8a6)" },
    { name: "핑크", bg: "linear-gradient(135deg, #f472b6, #e11d48)" },
];

interface StickerItem {
    id: string;
    emoji: string;
    x: number;
    y: number;
}

const IconBook = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

const IconSparkles = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"></path>
        <path d="M5 3v4"></path>
        <path d="M19 17v4"></path>
        <path d="M3 5h4"></path>
        <path d="M17 19h4"></path>
    </svg>
);

const IconSave = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
);

interface DraggableStickerProps {
    sticker: StickerItem;
    onMove: (id: string, x: number, y: number) => void;
    onRemove: (id: string) => void;
}

function DraggableSticker({ sticker, onMove, onRemove }: DraggableStickerProps) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "sticker",
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
                position: "absolute",
                left: sticker.x,
                top: sticker.y,
                cursor: "move",
                opacity: isDragging ? 0.5 : 1,
                fontSize: "2.5rem",
                userSelect: "none"
            }}
        >
            {sticker.emoji}
        </div>
    );
}

function CustomizeContent() {
    const pathname = usePathname();
    const [nickname, setNickname] = useState("치코런");
    const [selectedBadge, setSelectedBadge] = useState("🎯");
    const [selectedBorder, setSelectedBorder] = useState(availableBorders[0]);
    const [stickers, setStickers] = useState<StickerItem[]>([]);

    const [, drop] = useDrop(() => ({
        accept: "sticker",
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
            x: Math.random() * 150 + 20,
            y: Math.random() * 150 + 20,
        };
        setStickers([...stickers, newSticker]);
    };

    const moveSticker = (id: string, x: number, y: number) => {
        setStickers(stickers.map(s => s.id === id ? { ...s, x, y } : s));
    };

    const removeSticker = (id: string) => {
        setStickers(stickers.filter(s => s.id !== id));
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/chicorun" className={styles.headerLogo}>
                    <div className={styles.iconBox}>
                        <IconBook />
                    </div>
                    <span>하루상자</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'normal' }}>Haroo Box</span>
                </Link>
                <nav className={styles.navLinks}>
                    <Link href="/chicorun" className={pathname === "/chicorun" ? styles.activeLink : styles.navLink}>홈</Link>
                    <Link href="/chicorun/ranking" className={pathname === "/chicorun/ranking" ? styles.activeLink : styles.navLink}>랭킹</Link>
                    <Link href="/chicorun/customize" className={pathname === "/chicorun/customize" ? styles.activeLink : styles.navLink}>꾸미기</Link>
                </nav>
            </header>

            <main className={styles.main}>
                {/* 타이틀 */}
                <div className={styles.titleArea}>
                    <h1 className={styles.title}>
                        <IconSparkles />
                        꾸미기
                    </h1>
                    <p className={styles.subtitle}>나만의 프로필 카드를 꾸며보세요!</p>
                </div>

                <div className={styles.layoutGrid}>
                    {/* 왼쪽: 프리뷰 */}
                    <div className={styles.previewPanel}>
                        <h2 className={styles.panelTitle}>미리보기</h2>
                        <div className={styles.previewContainer}>
                            <div
                                ref={drop as any}
                                className={styles.cardBorder}
                                style={{ background: selectedBorder.bg }}
                            >
                                <div className={styles.cardInner}>
                                    {/* 배치된 스티커들 */}
                                    {stickers.map(sticker => (
                                        <DraggableSticker
                                            key={sticker.id}
                                            sticker={sticker}
                                            onMove={moveSticker}
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
                            💡 스티커를 더블클릭하면 삭제됩니다
                        </div>
                    </div>

                    {/* 오른쪽: 커스터마이징 옵션 */}
                    <div>
                        {/* 닉네임 변경 */}
                        <div className={styles.optionSection}>
                            <h3 className={styles.sectionTitle}>닉네임</h3>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                maxLength={10}
                                className={styles.inputNickname}
                            />
                        </div>

                        {/* 뱃지 선택 */}
                        <div className={styles.optionSection}>
                            <h3 className={styles.sectionTitle}>뱃지</h3>
                            <div className={styles.grid5}>
                                {availableBadges.map((badge) => (
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

                        {/* 테두리 선택 */}
                        <div className={styles.optionSection}>
                            <h3 className={styles.sectionTitle}>카드 테두리</h3>
                            <div className={styles.grid2}>
                                {availableBorders.map((border) => (
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

                        {/* 스티커 추가 */}
                        <div className={styles.optionSection}>
                            <h3 className={styles.sectionTitle}>스티커 추가</h3>
                            <div className={styles.grid5}>
                                {availableStickers.map((sticker) => (
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

                        <button className={styles.btnSave}>
                            <IconSave />
                            저장하기
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
