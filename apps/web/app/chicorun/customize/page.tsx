'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/use-toast';
import Toast from '@/components/ui/toast';
import styles from './page.module.css';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { CHICORUN_API, CHICORUN_ROUTES, CHICORUN_STORAGE_KEY } from '@/constants/chicorun';

// ─── Constants ─────────────────────────────────────────────────────────────
const AVAILABLE_STICKERS = ['⭐', '🔥', '💎', '🎯', '🚀', '💪', '🎨', '🎵', '🌈', '✨', '🍀', '🍎', '🧩', '🎸', '🕹️', '🏆', '💯', '🍕', '😎', '👻'];
const AVAILABLE_BADGES = ['👑', '🔥', '⚡', '📚', '💪', '⭐', '🎯', '🥊', '🦄', '🎮', '🥇', '🦸', '🚀', '💎', '🌈'];

const AVAILABLE_BACKGROUNDS = [
    { name: '투명 (기본)', value: 'transparent' },
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
    '#ea580c', // Orange
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
    fontSize: number;
    x: number;
    y: number;
    rotate: number;
}
interface BorderStyleType {
    color: string;
    width: number;
    style: string;
    radius: number;
}
interface PointStyleType {
    color: string;
    background: string;
    borderWidth: number;
    borderColor: string;
    fontSize: number;
    x: number;
    y: number;
    rotate: number;
}
interface RankStyleType {
    x: number;
    y: number;
    color: string;
    fontSize: number;
    rotate: number;
}
interface BadgeStyleType {
    x: number;
    y: number;
    fontSize: number;
    rotate: number;
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

const IconClass = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
);

const IconZap = ({ color = '#ea580c' }: { color?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);

// ─── Components ────────────────────────────────────────────────────────────
function DraggableElement({
    type,
    id,
    position,
    children,
    style: extraStyles = {},
    title = "드래그해서 이동",
    rotate = 0,
    scale = 1,
    isSelected = false,
    onSelect,
    onUpdate
}: {
    type: string;
    id?: string;
    position: { x: number; y: number };
    children: React.ReactNode;
    style?: React.CSSProperties;
    title?: string;
    rotate?: number;
    scale?: number;
    isSelected?: boolean;
    onSelect?: () => void;
    onUpdate?: (updates: { scale?: number; rotate?: number; fontSize?: number }) => void;
}) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [initialState, setInitialState] = useState<{ angle: number; distance: number; rotate: number; scale: number; fontSize: number } | null>(null);
    const [{ isDragging, offset }, drag] = useDrag(() => ({
        type,
        item: { id, x: position.x, y: position.y },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
            offset: monitor.getDifferenceFromInitialOffset(),
        }),
        canDrag: !isResizing && !isRotating, // Disable move drag when resizing/rotating
    }), [type, id, position.x, position.y, isResizing, isRotating]);

    const handleHandleMouseDown = (e: React.MouseEvent | React.TouchEvent, action: 'resize' | 'rotate') => {
        e.stopPropagation();
        e.preventDefault();

        const rect = elementRef.current?.getBoundingClientRect();
        if (!rect) return;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
        const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));

        // Get current fontSize if it's a text element
        let currentFontSize = 0;
        if (type !== 'sticker') {
            const childDiv = elementRef.current?.querySelector('div, span') as HTMLElement;
            if (childDiv) currentFontSize = parseInt(window.getComputedStyle(childDiv).fontSize);
        }

        setInitialState({ angle, distance, rotate, scale, fontSize: currentFontSize });
        if (action === 'resize') setIsResizing(true);
        else setIsRotating(true);
    };

    useEffect(() => {
        if (!isResizing && !isRotating) return;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!initialState || !elementRef.current) return;

            const rect = elementRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
            const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

            if (isRotating) {
                const currentAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
                let deltaRotate = currentAngle - initialState.angle;
                onUpdate?.({ rotate: Math.round(initialState.rotate + deltaRotate) });
            } else if (isResizing) {
                const currentDistance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));
                const scaleFactor = currentDistance / initialState.distance;

                if (type === 'sticker') {
                    onUpdate?.({ scale: Number((initialState.scale * scaleFactor).toFixed(2)) });
                } else {
                    const newFontSize = Math.round(initialState.fontSize * scaleFactor);
                    onUpdate?.({ fontSize: Math.max(8, Math.min(200, newFontSize)) });
                }
            }
        };

        const handleUp = () => {
            setIsResizing(false);
            setIsRotating(false);
            setInitialState(null);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('touchend', handleUp);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        };
    }, [isResizing, isRotating, initialState, type, onUpdate]);

    useEffect(() => {
        drag(elementRef);
    }, [drag]);

    return (
        <div
            ref={elementRef}
            title={title}
            onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
            }}
            style={{
                position: 'absolute',
                left: position.x + (isDragging && offset ? offset.x : 0),
                top: position.y + (isDragging && offset ? offset.y : 0),
                cursor: (isResizing || isRotating) ? 'crosshair' : 'move',
                opacity: isDragging ? 0.3 : 1,
                userSelect: 'none',
                zIndex: isSelected ? 100 : (isResizing || isRotating ? 101 : 20),
                touchAction: 'none', // Mobile dragging fix
                transform: `rotate(${rotate}deg) scale(${scale})`,
                outline: isSelected ? '2px solid #3b82f6' : 'none',
                outlineOffset: '2px',
                borderRadius: '4px',
                transition: isDragging || isResizing || isRotating ? 'none' : 'outline 0.2s',
                ...extraStyles,
            }}
        >
            {children}

            {/* Transform Handles */}
            {isSelected && (
                <>
                    {/* Rotation Handle (Top) */}
                    <div
                        onMouseDown={(e) => handleHandleMouseDown(e, 'rotate')}
                        onTouchStart={(e) => handleHandleMouseDown(e, 'rotate')}
                        style={{
                            position: 'absolute',
                            top: '-24px',
                            left: '50%',
                            width: '20px',
                            height: '20px',
                            background: '#3b82f6',
                            border: '2px solid white',
                            borderRadius: '50%',
                            transform: 'translateX(-50%)',
                            cursor: 'alias',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            zIndex: 102
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
                    </div>

                    {/* Resize Handle (Bottom Right) */}
                    <div
                        onMouseDown={(e) => handleHandleMouseDown(e, 'resize')}
                        onTouchStart={(e) => handleHandleMouseDown(e, 'resize')}
                        style={{
                            position: 'absolute',
                            bottom: '-10px',
                            right: '-10px',
                            width: '20px',
                            height: '20px',
                            background: '#3b82f6',
                            border: '2px solid white',
                            borderRadius: '50%',
                            cursor: 'nwse-resize',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            zIndex: 102
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 15 6 6m-6-6v6m0-6h6M9 9 3 3m6 6V3m0 6H3"></path></svg>
                    </div>
                </>
            )}
        </div>
    );
}

function CustomizeContent() {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    const [nickname, setNickname] = useState('치코런');
    const [className, setClassName] = useState<string>('');
    const [selectedBadge, setSelectedBadge] = useState(AVAILABLE_BADGES[0]);
    const [cardStyle, setCardStyle] = useState(AVAILABLE_BACKGROUNDS[1].value);
    const [stickers, setStickers] = useState<StickerItem[]>([]);

    const [nicknameStyle, setNicknameStyle] = useState<NicknameStyleType>({
        color: '#1e293b',
        bold: true,
        italic: false,
        underline: false,
        fontSize: 20,
        x: 120,
        y: 25,
        rotate: 0,
    });

    const [borderStyle, setBorderStyle] = useState<BorderStyleType>({
        color: '#facc15',
        width: 3,
        style: 'solid',
        radius: 24,
    });

    const [pointStyle, setPointStyle] = useState<PointStyleType>({
        color: '#ea580c',
        background: 'linear-gradient(90deg, #ffedd5, #fef3c7)',
        borderWidth: 0,
        borderColor: '#ffffff',
        fontSize: 18,
        x: 580,
        y: 20,
        rotate: 0,
    });

    const [rankStyle, setRankStyle] = useState<RankStyleType>({
        color: '#ca8a04',
        fontSize: 24,
        x: 24,
        y: 20,
        rotate: 0,
    });

    const [badgeStyle, setBadgeStyle] = useState<BadgeStyleType>({
        fontSize: 32,
        x: 80,
        y: 20,
        rotate: 0,
    });

    const [pointInfo, setPointInfo] = useState(0);
    const [myRank, setMyRank] = useState(0);

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedElement, setSelectedElement] = useState<string | null>(null);

    const updateSelectedElement = (updates: { fontSize?: number; scale?: number; rotate?: number }) => {
        if (!selectedElement) return;

        if (selectedElement.startsWith('sticker-')) {
            const id = selectedElement.replace('sticker-', '');
            setStickers(prev => prev.map(s => s.id === id ? { ...s, scale: updates.scale ?? s.scale, rotate: updates.rotate ?? s.rotate } : s));
        } else if (selectedElement === 'nickname') {
            setNicknameStyle(prev => ({ ...prev, fontSize: updates.fontSize ?? prev.fontSize, rotate: updates.rotate ?? prev.rotate }));
        } else if (selectedElement === 'rank') {
            setRankStyle(prev => ({ ...prev, fontSize: updates.fontSize ?? prev.fontSize, rotate: updates.rotate ?? prev.rotate }));
        } else if (selectedElement === 'badge') {
            setBadgeStyle(prev => ({ ...prev, fontSize: updates.fontSize ?? prev.fontSize, rotate: updates.rotate ?? prev.rotate }));
        } else if (selectedElement === 'point') {
            setPointStyle(prev => ({ ...prev, fontSize: updates.fontSize ?? prev.fontSize, rotate: updates.rotate ?? prev.rotate }));
        }
    };

    const getSelectedValue = () => {
        if (!selectedElement) return null;
        if (selectedElement.startsWith('sticker-')) {
            const id = selectedElement.replace('sticker-', '');
            const s = stickers.find(st => st.id === id);
            return { size: s?.scale || 1, rotate: s?.rotate || 0, isSticker: true };
        }
        if (selectedElement === 'nickname') return { size: nicknameStyle.fontSize, rotate: nicknameStyle.rotate, isSticker: false };
        if (selectedElement === 'rank') return { size: rankStyle.fontSize, rotate: rankStyle.rotate, isSticker: false };
        if (selectedElement === 'badge') return { size: badgeStyle.fontSize, rotate: badgeStyle.rotate, isSticker: false };
        if (selectedElement === 'point') return { size: pointStyle.fontSize, rotate: pointStyle.rotate, isSticker: false };
        return null;
    };

    useEffect(() => {
        const studentInfoStr = localStorage.getItem(CHICORUN_STORAGE_KEY.STUDENT_INFO);
        if (studentInfoStr) {
            try {
                const info = JSON.parse(studentInfoStr);
                setClassName(info.className || info.classCode || '');
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

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
                setPointInfo(data.data.point || 0);

                const custom = data.data.customize;
                if (data.data.badge) setSelectedBadge(data.data.badge);
                if (data.data.cardStyle) setCardStyle(data.data.cardStyle);

                if (custom) {
                    if (Array.isArray(custom.stickers)) setStickers(custom.stickers);
                    if (custom.borderStyle) setBorderStyle(prev => ({ ...prev, ...custom.borderStyle }));

                    if (custom.pointStyle) {
                        setPointStyle(prev => ({
                            ...prev,
                            ...custom.pointStyle,
                            x: custom.pointStyle.x || prev.x,
                            y: custom.pointStyle.y || prev.y
                        }));
                    }
                    if (custom.rankStyle) {
                        setRankStyle(prev => ({
                            ...prev,
                            ...custom.rankStyle,
                            x: custom.rankStyle.x || prev.x,
                            y: custom.rankStyle.y || prev.y
                        }));
                    }
                    if (custom.badgeStyle) {
                        setBadgeStyle(prev => ({
                            ...prev,
                            ...custom.badgeStyle,
                            x: custom.badgeStyle.x || prev.x,
                            y: custom.badgeStyle.y || prev.y
                        }));
                    }
                }

                if (data.data.nicknameStyle) {
                    setNicknameStyle(prev => ({
                        ...prev,
                        ...data.data.nicknameStyle,
                        x: data.data.nicknameStyle.x || prev.x,
                        y: data.data.nicknameStyle.y || prev.y
                    }));
                }

                // Fetch real rank
                try {
                    const rankRes = await fetch(CHICORUN_API.CLASS_RANKING(data.data.classCode), { headers: { Authorization: `Bearer ${token}` } });
                    const rankData = await rankRes.json();
                    if (rankData.success && rankData.data) {
                        const rankingArray = Array.isArray(rankData.data) ? rankData.data : rankData.data.ranking;
                        if (Array.isArray(rankingArray)) {
                            const myRankEntry = rankingArray.find((r: any) => r.id === data.data.id || r.nickname === data.data.nickname);
                            if (myRankEntry) {
                                setMyRank(myRankEntry.rank);
                            }
                        }
                    }
                } catch (e) {
                    console.error('Failed to fetch rank for preview', e);
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

    const moveSticker = useCallback((id: string, x: number, y: number) => {
        setStickers(prev => prev.map(s => (s.id === id ? { ...s, x, y } : s)));
    }, []);

    const [, drop] = useDrop(() => ({
        accept: ['sticker', 'rank', 'badge', 'nickname', 'point'],
        drop: (item: any, monitor) => {
            const delta = monitor.getDifferenceFromInitialOffset();
            if (!delta) return;
            const newX = Math.round(item.x + delta.x);
            const newY = Math.round(item.y + delta.y);
            const type = monitor.getItemType();

            if (type === 'sticker') moveSticker(item.id, newX, newY);
            else if (type === 'rank') setRankStyle(p => ({ ...p, x: newX, y: newY }));
            else if (type === 'badge') setBadgeStyle(p => ({ ...p, x: newX, y: newY }));
            else if (type === 'nickname') setNicknameStyle(p => ({ ...p, x: newX, y: newY }));
            else if (type === 'point') setPointStyle(p => ({ ...p, x: newX, y: newY }));
        },
    }), [moveSticker]);

    const addSticker = (emoji: string) => {
        const newSticker: StickerItem = {
            id: Date.now().toString(),
            emoji,
            x: 100 + Math.random() * 200,
            y: 20 + Math.random() * 20,
            scale: 0.8 + Math.random() * 0.7,
            rotate: Math.random() * 60 - 30,
        };
        setStickers(prev => [...prev, newSticker]);
        setSelectedElement(`sticker-${newSticker.id}`);
    };

    const removeSticker = (id: string) => {
        setStickers(prev => prev.filter(s => s.id !== id));
    };

    // Mobile double tap logic helper
    const [lastTap, setLastTap] = useState(0);
    const handleTouchSticker = (id: string) => {
        const now = Date.now();
        if (now - lastTap < 300) {
            removeSticker(id);
        }
        setLastTap(now);
    };

    const handleSave = async () => {
        const token = localStorage.getItem(CHICORUN_STORAGE_KEY.TOKEN);
        if (!token) return;

        setIsSaving(true);
        try {
            const res = await fetch(CHICORUN_API.STUDENT_CUSTOMIZE, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    badge: selectedBadge,
                    cardStyle: cardStyle,
                    nicknameStyle,
                    customize: {
                        stickers,
                        borderStyle,
                        pointStyle,
                        rankStyle,
                        badgeStyle
                    }
                }),
            });

            const data = await res.json();
            if (data.success) {
                showToast('랭킹 꾸미기가 저장되었습니다! 화려해진 랭킹 리스트를 확인해 보세요.', 'success');
            } else {
                showToast('저장 실패', 'error');
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

    const isFirst = myRank === 1;

    const selectedData = getSelectedValue();

    return (
        <div className={styles.container} onClick={() => setSelectedElement(null)}>
            <main className={styles.main}>
                <div className={styles.titleArea}>
                    <h1 className={styles.title}><IconSparkles /> 랭킹 꾸미기</h1>
                    <p className={styles.subtitle}>랭킹 리스트에 나타나는 나의 랭킹 영역을 자유롭게 꾸며보세요!</p>
                </div>

                {className && (
                    <div className={styles.classInfoContainer}>
                        <div className={styles.classInfoBadge}>
                            <IconClass />
                            {className || '내 클래스'}
                        </div>
                    </div>
                )}

                <div className={styles.layoutGrid}>
                    <div className={styles.previewPanel}>
                        <div className={styles.previewHeader}>
                            <h2 className={styles.panelTitle} style={{ marginBottom: '0.5rem' }}>현재 내 랭킹 영역 미리보기</h2>
                            <div className={styles.hintText} style={{ marginTop: 0 }}>
                                💡 <b>직접 드래그</b>하여 위치를 옮겨보세요. 모바일에선 <b>한번 터치해 드래그</b>할 수 있으며, 스티커는 <b>두 번 톡톡 터치</b>하면 삭제됩니다.
                            </div>
                        </div>

                        {/* 미리보기영역 - 픽스 상태일때는 이 부분만 고정됨 */}
                        <div className={styles.stickyPreviewWrapper}>
                            <div className={styles.previewContainer} style={{ paddingBottom: 0 }}>
                                <div
                                    ref={(node) => {
                                        drop(node);
                                        (previewContainerRef as any).current = node;
                                    }}
                                    className={styles.rankingItemPreview}
                                    style={{
                                        background: cardStyle,
                                        border: `${borderStyle.width}px ${borderStyle.style} ${borderStyle.color}`,
                                        borderRadius: `${borderStyle.radius}px`,
                                        overflow: isFirst ? 'visible' : 'hidden',
                                        transform: isFirst ? 'scale(1.05)' : 'translateZ(0)',
                                        zIndex: isFirst ? 10 : 1,
                                        margin: isFirst ? '1rem 0' : '0',
                                        boxShadow: isFirst ? '0 20px 25px -5px rgba(250, 204, 21, 0.4)' : undefined,
                                        height: '80px',
                                        display: 'block',
                                    }}
                                >
                                    {/* 탑강조 뱃지 */}
                                    {isFirst && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-15px',
                                            left: '-15px',
                                            background: 'linear-gradient(135deg, #fef08a, #ca8a04)',
                                            color: '#fff',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            fontWeight: 900,
                                            fontSize: '1rem',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                            transform: 'rotate(-10deg)',
                                            zIndex: 40,
                                            border: '2px solid white',
                                            pointerEvents: 'none',
                                        }}>
                                            👑 TOP 1
                                        </div>
                                    )}

                                    {/* 스티커들 */}
                                    {stickers.map(sticker => (
                                        <DraggableElement
                                            key={sticker.id}
                                            type="sticker"
                                            id={sticker.id}
                                            position={{ x: sticker.x, y: sticker.y }}
                                            rotate={sticker.rotate}
                                            scale={sticker.scale}
                                            isSelected={selectedElement === `sticker-${sticker.id}`}
                                            onSelect={() => setSelectedElement(`sticker-${sticker.id}`)}
                                            onUpdate={updateSelectedElement}
                                            style={{ fontSize: '2rem', zIndex: 10 }}
                                            title="클릭해서 편집 / 더블탭해서 삭제"
                                        >
                                            <div onDoubleClick={() => removeSticker(sticker.id)} onClick={() => handleTouchSticker(sticker.id)}>{sticker.emoji}</div>
                                        </DraggableElement>
                                    ))}

                                    {/* 랭크 번호 */}
                                    <DraggableElement
                                        type="rank"
                                        position={{ x: rankStyle.x, y: rankStyle.y }}
                                        rotate={rankStyle.rotate}
                                        isSelected={selectedElement === 'rank'}
                                        onSelect={() => setSelectedElement('rank')}
                                        onUpdate={updateSelectedElement}
                                    >
                                        <span className={styles.rankNumber} style={{
                                            color: rankStyle.color,
                                            fontSize: `${rankStyle.fontSize}px`,
                                            margin: 0,
                                            lineHeight: 1
                                        }}>
                                            #{myRank > 0 ? myRank : '-'}
                                        </span>
                                    </DraggableElement>

                                    {/* 뱃지 */}
                                    <DraggableElement
                                        type="badge"
                                        position={{ x: badgeStyle.x, y: badgeStyle.y }}
                                        rotate={badgeStyle.rotate}
                                        isSelected={selectedElement === 'badge'}
                                        onSelect={() => setSelectedElement('badge')}
                                        onUpdate={updateSelectedElement}
                                    >
                                        <div style={{ fontSize: `${badgeStyle.fontSize}px`, lineHeight: 1 }}>{selectedBadge}</div>
                                    </DraggableElement>

                                    {/* 닉네임 */}
                                    <DraggableElement
                                        type="nickname"
                                        position={{ x: nicknameStyle.x, y: nicknameStyle.y }}
                                        rotate={nicknameStyle.rotate}
                                        isSelected={selectedElement === 'nickname'}
                                        onSelect={() => setSelectedElement('nickname')}
                                        onUpdate={updateSelectedElement}
                                    >
                                        <div
                                            style={{
                                                color: nicknameStyle.color,
                                                fontWeight: nicknameStyle.bold ? 800 : 500,
                                                fontStyle: nicknameStyle.italic ? 'italic' : 'normal',
                                                textDecoration: nicknameStyle.underline ? 'underline' : 'none',
                                                textShadow: cardStyle !== 'white' && nicknameStyle.color === '#ffffff' ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
                                                fontSize: `${nicknameStyle.fontSize}px`,
                                                whiteSpace: 'nowrap',
                                                lineHeight: 1
                                            }}
                                        >
                                            {nickname}
                                        </div>
                                    </DraggableElement>

                                    {/* 포인트 */}
                                    <DraggableElement
                                        type="point"
                                        position={{ x: pointStyle.x, y: pointStyle.y }}
                                        rotate={pointStyle.rotate}
                                        isSelected={selectedElement === 'point'}
                                        onSelect={() => setSelectedElement('point')}
                                        onUpdate={updateSelectedElement}
                                    >
                                        <div className={styles.pointsBox} style={{
                                            background: pointStyle.background,
                                            color: pointStyle.color,
                                            border: `${pointStyle.borderWidth}px solid ${pointStyle.borderColor}`,
                                            margin: 0,
                                            padding: '0.4rem 0.8rem'
                                        }}>
                                            <IconZap color={pointStyle.color} />
                                            <span className={styles.points} style={{ color: pointStyle.color, fontSize: `${pointStyle.fontSize}px` }}>
                                                {pointInfo.toLocaleString()}P
                                            </span>
                                        </div>
                                    </DraggableElement>
                                </div>
                            </div>
                        </div>

                        {/* 옵션 컨트롤 - 이제 미리보기 패널 안으로 들어와서 카드가 스크롤 끝까지 고정될 수 있게 함 */}
                        <div className={styles.optionsContainer} style={{ marginTop: '2rem' }}>
                            {/* 닉네임 설정 */}
                            <div className={styles.optionSection}>
                                <div className={styles.sectionTitle}>📝 닉네임 스타일</div>
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
                                <div className={styles.textStyleControls}>
                                    <button className={`${styles.btnTextStyle} ${nicknameStyle.bold ? styles.active : ''}`} onClick={() => toggleStyle('bold')}>Bold</button>
                                    <button className={`${styles.btnTextStyle} ${nicknameStyle.italic ? styles.active : ''}`} onClick={() => toggleStyle('italic')}>Italic</button>
                                    <button className={`${styles.btnTextStyle} ${nicknameStyle.underline ? styles.active : ''}`} onClick={() => toggleStyle('underline')}>Underline</button>
                                </div>
                            </div>

                            {/* 등수 및 뱃지 설정 */}
                            <div className={styles.optionSection}>
                                <div className={styles.sectionTitle}>🎖️ 대표 뱃지 설정</div>
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

                            {/* 테두리(배경) 및 테두리 설정 */}
                            <div className={styles.optionSection} style={{ gridColumn: '1 / -1' }}>
                                <div className={styles.sectionTitle}>🎨 랭킹 배경 및 테두리</div>
                                <div className={styles.gridBackgrounds}>
                                    {AVAILABLE_BACKGROUNDS.map(bg => (
                                        <div
                                            key={bg.name}
                                            onClick={() => setCardStyle(bg.value)}
                                            className={`${styles.btnBackground} ${cardStyle === bg.value ? styles.selected : ''}`}
                                            style={{ background: bg.value, border: cardStyle === bg.value ? '4px solid #3b82f6' : '3px solid #e2e8f0', color: bg.value === 'white' || bg.value === 'transparent' ? '#1e293b' : 'white' }}
                                        >
                                            {bg.name}
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.sliderGroup} style={{ marginTop: '1.5rem' }}>
                                    <div className={styles.sliderLabel}><span>테두리 두께</span> <span>{borderStyle.width}px</span></div>
                                    <input type="range" min="0" max="15" value={borderStyle.width} onChange={e => setBorderStyle(p => ({ ...p, width: Number(e.target.value) }))} className={styles.sliderInput} />
                                    <div className={styles.sliderLabel}><span>둥글기</span> <span>{borderStyle.radius}px</span></div>
                                    <input type="range" min="0" max="100" value={borderStyle.radius} onChange={e => setBorderStyle(p => ({ ...p, radius: Number(e.target.value) }))} className={styles.sliderInput} />
                                </div>
                            </div>

                            {/* 포인트 영역 설정 */}
                            <div className={styles.optionSection} style={{ gridColumn: '1 / -1' }}>
                                <div className={styles.sectionTitle}>💎 포인트 영역 색상</div>
                                <div className={styles.gridColor}>
                                    {AVAILABLE_NICKNAME_COLORS.map(color => (
                                        <div
                                            key={color}
                                            className={`${styles.colorCircle} ${pointStyle.color === color ? styles.selected : ''}`}
                                            style={{ background: color, border: pointStyle.color === color ? '3px solid #6366f1' : '3px solid #cbd5e1' }}
                                            onClick={() => setPointStyle(prev => ({ ...prev, color }))}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* 스티커 설정 */}
                            <div className={styles.optionSection} style={{ gridColumn: '1 / -1' }}>
                                <div className={styles.sectionTitle}>✨ 장식 스티커 추가</div>
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
                                    disabled={isSaving}
                                >
                                    {isSaving ? '저장 중...' : <><IconSave /> 변화된 랭킹 영역 저장하기</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Toast toast={toast} onHide={hideToast} />
        </div>
    );
}

export default function CustomizePage() {
    return (
        <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
            <CustomizeContent />
        </DndProvider>
    );
}
