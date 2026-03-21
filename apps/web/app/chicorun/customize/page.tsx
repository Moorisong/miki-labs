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

const AVAILABLE_BORDER_TYPES = [
    { name: '실선', value: 'solid', icon: '➖' },
    { name: '대시', value: 'dashed', icon: '---' },
    { name: '리본', value: 'ribbon', icon: '🎀' },
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

const getCardBorderStyle = (borderStyle: BorderStyleType) => {
    const { color, width, style, radius } = borderStyle;
    const baseStyle: React.CSSProperties = {
        borderRadius: `${radius}px`,
        borderWidth: `${width}px`,
        borderColor: color,
        borderStyle: ['solid', 'dashed', 'dotted'].includes(style) ? (style as any) : 'none',
        backgroundClip: 'padding-box',
    };

    return baseStyle;
};

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

// Reusable Color Picker Component (Hue Slider + Saturation/Lightness 2D Area)
const ColorPicker = ({ value, onChange }: { value: string; onChange: (color: string) => void }) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);

    // Parse current color to HSL
    const parseHSL = (val: string) => {
        if (!val) return { h: 0, s: 75, l: 50 };
        const hslMatch = val.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (hslMatch) return { h: parseInt(hslMatch[1]), s: parseInt(hslMatch[2]), l: parseInt(hslMatch[3]) };

        // Fallback for hex values (could implement a better parser if needed)
        if (val === '#000000') return { h: 0, s: 0, l: 0 };
        if (val === '#ffffff') return { h: 0, s: 0, l: 100 };
        return { h: 0, s: 75, l: 50 };
    };

    const { h, s, l } = parseHSL(value);

    const updateSL = (clientX: number, clientY: number) => {
        if (!boxRef.current) return;
        const rect = boxRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
        const newS = Math.floor((x / rect.width) * 100);
        const newL = Math.floor(100 - (y / rect.height) * 100);
        onChange(`hsl(${h}, ${newS}%, ${newL}%)`);
    };

    const updateHue = (clientX: number) => {
        if (!hueRef.current) return;
        const rect = hueRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const newH = Math.floor((x / rect.width) * 360);
        onChange(`hsl(${newH}, ${s}%, ${l}%)`);
    };

    const handleSLPointer = (e: React.PointerEvent) => {
        e.stopPropagation();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        updateSL(e.clientX, e.clientY);
    };

    const handleHuePointer = (e: React.PointerEvent) => {
        e.stopPropagation();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        updateHue(e.clientX);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {/* 2D SL Area */}
            <div
                ref={boxRef}
                onPointerDown={handleSLPointer}
                onPointerMove={(e) => e.buttons > 0 && updateSL(e.clientX, e.clientY)}
                style={{
                    width: '100%',
                    height: '160px',
                    borderRadius: '1rem',
                    position: 'relative',
                    background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h}, 100%, 50%))`,
                    cursor: 'crosshair',
                    touchAction: 'none',
                    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}
            >
                {/* Pointer */}
                <div style={{
                    position: 'absolute',
                    left: `${s}%`,
                    top: `${100 - l}%`,
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    border: '2.5px solid white',
                    boxShadow: '0 0 5px rgba(0,0,0,0.4)',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 2
                }} />
            </div>

            {/* Hue Bar */}
            <div
                ref={hueRef}
                onPointerDown={handleHuePointer}
                onPointerMove={(e) => e.buttons > 0 && updateHue(e.clientX)}
                style={{
                    height: '24px',
                    width: '100%',
                    borderRadius: '0.6rem',
                    position: 'relative',
                    background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                    cursor: 'crosshair',
                    touchAction: 'none'
                }}
            >
                {/* Hue Pointer */}
                <div style={{
                    position: 'absolute',
                    left: `${(h / 360) * 100}%`,
                    top: '-2px',
                    bottom: '-2px',
                    width: '6px',
                    background: 'white',
                    boxShadow: '0 0 3px rgba(0,0,0,0.5)',
                    borderRadius: '3px',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none'
                }} />
            </div>
        </div>
    );
};

const ColorControl = ({ id, value, onChange, activePickerId, setActivePickerId, showGradientOption = false }: any) => {
    const isOpen = activePickerId === id;

    return (
        <div className={styles.colorPickerSection}>
            <div
                className={styles.colorSwatchWrapper}
                onClick={(e) => { e.stopPropagation(); setActivePickerId(isOpen ? null : id); }}
            >
                <div className={styles.colorSwatch} style={{ background: value }} />
                <span className={styles.colorHexCode}>{value.includes('gradient') ? 'Gradient' : value}</span>
            </div>
            {isOpen && (
                <div
                    className={styles.customPickerPopover}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#64748b', marginBottom: '0.6rem' }}>색상 선택</div>
                    <ColorPicker
                        value={value}
                        onChange={onChange}
                    />

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <input
                            type="text"
                            className={styles.pickerHexInputNative}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="#HEX or hsl"
                        />
                    </div>

                    {showGradientOption && (
                        <button className={styles.btnResetGradient} style={{ width: '100%', marginTop: '1rem' }} onClick={() => { onChange('linear-gradient(90deg, #ffedd5, #fef3c7)'); setActivePickerId(null); }}>기본 그라데이션 복구</button>
                    )}
                    <button className={styles.btnPickerDone} style={{ marginTop: '0.75rem', background: '#f8fafc', color: '#94a3b8', border: '1px solid #f1f5f9' }} onClick={() => setActivePickerId(null)}>닫기</button>
                </div>
            )}
        </div>
    );
};

function CustomizeContent() {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    const [nickname, setNickname] = useState('치코런');
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
    const [activePickerId, setActivePickerId] = useState<string | null>(null);


    // Reset picker when element changes
    useEffect(() => {
        setActivePickerId(null);
    }, [selectedElement]);


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
        <div className={styles.container} onClick={() => { setSelectedElement(null); setActivePickerId(null); }}>
            <main className={styles.main} onClick={(e) => e.stopPropagation()}>
                <div className={styles.titleArea}>
                    <h1 className={styles.title}><IconSparkles /> 랭킹 꾸미기</h1>
                    <p className={styles.subtitle}>랭킹 리스트에 나타나는 나의 랭킹 영역을 자유롭게 꾸며보세요!</p>
                </div>

                <div className={styles.layoutGrid}>
                    <div className={styles.previewPanel}>
                        <div className={styles.previewHeader}>
                            <h2 className={styles.panelTitle} style={{ marginBottom: '0.5rem' }}>현재 내 랭킹 영역 미리보기</h2>
                        </div>

                        {/* 미리보기영역 - 픽스 상태일때는 이 부분만 고정됨 */}
                        <div className={styles.stickyPreviewWrapper}>
                            <div className={styles.previewContainer} style={{ paddingBottom: 0 }}>
                                <button
                                    className={styles.btnStickerFAB}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedElement('sticker-picker');
                                    }}
                                    title="스티커 추가하기"
                                >
                                    ✨
                                </button>

                                <div
                                    ref={(node) => {
                                        drop(node);
                                        (previewContainerRef as any).current = node;
                                    }}
                                    className={styles.rankingItemPreview}
                                    style={{
                                        background: cardStyle,
                                        ...getCardBorderStyle(borderStyle),
                                        overflow: isFirst || borderStyle.style === 'ribbon' ? 'visible' : 'hidden',
                                        transform: isFirst ? 'scale(1.05)' : 'translateZ(0)',
                                        zIndex: isFirst ? 10 : 1,
                                        margin: isFirst ? '1rem 0' : '0',
                                        boxShadow: isFirst && borderStyle.style !== 'neon' ? '0 20px 25px -5px rgba(0, 204, 21, 0.4)' : undefined,
                                        height: '80px',
                                        display: 'block',
                                        position: 'relative'
                                    }}
                                >
                                    {/* 배경 클릭 영역 (안쪽 영역 - 사용자가 더 잘 누를 수 있도록 더 높은 우선순위) */}
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedElement('base-card-bg');
                                        }}
                                        style={{
                                            position: 'absolute',
                                            inset: '10px',
                                            borderRadius: `${borderStyle.radius}px`,
                                            zIndex: 2,
                                            cursor: 'pointer'
                                        }}
                                        title="배경 바꾸기"
                                    />
                                    {/* 테두리 클릭 영역 (외곽 테두리 영역) */}
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedElement('base-card-border');
                                        }}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            borderRadius: `${borderStyle.radius}px`,
                                            zIndex: 1,
                                            cursor: 'pointer'
                                        }}
                                        title="테두리 꾸미기"
                                    />
                                    {/* 리본 스타일 장식 */}
                                    {borderStyle.style === 'ribbon' && (
                                        <>
                                            <div style={{ position: 'absolute', top: -10, left: -10, fontSize: '1.5rem', transform: 'rotate(-45deg)', zIndex: 100 }}>🎀</div>
                                            <div style={{ position: 'absolute', top: -10, right: -10, fontSize: '1.5rem', transform: 'rotate(45deg)', zIndex: 100 }}>🎀</div>
                                        </>
                                    )}
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

                        {/* 옵션 컨트롤 - 이제 선택된 요소에 따라 다르게 보임 */}
                        <div className={styles.optionsContainer} style={{ marginTop: '2rem' }} onClick={(e) => e.stopPropagation()}>
                            {/* 아무것도 선택되지 않았을 때 */}
                            {(!selectedElement) && (
                                <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#f8fafc', borderRadius: '1.5rem', border: '2px dashed #cbd5e1' }}>
                                    <h3 style={{ color: '#1e293b', fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>🎨 꾸미기 가이드</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>카드 중앙/가장자리를 클릭해 <b>배경과 테두리</b>를 꾸며보세요!</p>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>모든 요소는 개별적으로 <b>스타일 수정 및 드래그</b>를 할 수 있습니다.</p>
                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, margin: '0' }}>스티커는 톡톡 두 번 눌러서 삭제할 수 있어요.</p>
                                </div>
                            )}

                            {/* 배경 수정 메뉴 */}
                            {selectedElement === 'base-card-bg' && (
                                <div className={styles.optionSection}>
                                    <div className={styles.sectionTitleWithBack}>
                                        <button onClick={() => setSelectedElement(null)} className={styles.btnBack}>←</button>
                                        🎨 랭킹 배경
                                    </div>
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
                                </div>
                            )}

                            {/* 테두리 수정 메뉴 */}
                            {selectedElement === 'base-card-border' && (
                                <div className={styles.optionSection} style={{ gridColumn: '1 / -1' }}>
                                    <div className={styles.sectionTitleWithBack}>
                                        <button onClick={() => setSelectedElement(null)} className={styles.btnBack}>←</button>
                                        🖼️ 테두리 스타일
                                    </div>
                                    <div className={styles.gridBorderTypes}>
                                        {AVAILABLE_BORDER_TYPES.map(type => (
                                            <button
                                                key={type.value}
                                                onClick={() => setBorderStyle(p => ({ ...p, style: type.value }))}
                                                className={`${styles.btnBorderType} ${borderStyle.style === type.value ? styles.selected : ''}`}
                                            >
                                                <span style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{type.icon}</span>
                                                <span style={{ fontSize: '0.8rem' }}>{type.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <ColorControl id="border-color" value={borderStyle.color} onChange={(val: string) => setBorderStyle(p => ({ ...p, color: val }))} activePickerId={activePickerId} setActivePickerId={setActivePickerId} />

                                    <div className={styles.sliderGroup} style={{ marginTop: '1.5rem' }}>
                                        <div className={styles.sliderLabel}><span>테두리 두께</span> <span>{borderStyle.width}px</span></div>
                                        <input type="range" min="0" max="15" value={borderStyle.width} onChange={e => setBorderStyle(p => ({ ...p, width: Number(e.target.value) }))} className={styles.sliderInput} />
                                        <div className={styles.sliderLabel}><span>둥글기</span> <span>{borderStyle.radius}px</span></div>
                                        <input type="range" min="0" max="100" value={borderStyle.radius} onChange={e => setBorderStyle(p => ({ ...p, radius: Number(e.target.value) }))} className={styles.sliderInput} />
                                    </div>
                                </div>
                            )}

                            {/* 스티커 추가 메뉴 */}
                            {selectedElement === 'sticker-picker' && (
                                <div className={styles.optionSection} style={{ gridColumn: '1 / -1' }}>
                                    <div className={styles.sectionTitleWithBack}>
                                        <button onClick={() => setSelectedElement(null)} className={styles.btnBack}>←</button>
                                        ✨ 장식 스티커 추가
                                    </div>
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
                            )}

                            {/* 닉네임 선택 시 */}
                            {selectedElement === 'nickname' && (
                                <div className={styles.optionSection} style={{ gridColumn: '1 / -1' }}>
                                    <div className={styles.sectionTitle}>📝 닉네임 스타일</div>
                                    <ColorControl id="nick-color" value={nicknameStyle.color} onChange={(val: string) => setNicknameStyle(p => ({ ...p, color: val }))} activePickerId={activePickerId} setActivePickerId={setActivePickerId} />

                                    <div className={styles.textStyleControls}>
                                        <button className={`${styles.btnTextStyle} ${nicknameStyle.bold ? styles.active : ''}`} onClick={() => toggleStyle('bold')}>Bold</button>
                                        <button className={`${styles.btnTextStyle} ${nicknameStyle.italic ? styles.active : ''}`} onClick={() => toggleStyle('italic')}>Italic</button>
                                        <button className={`${styles.btnTextStyle} ${nicknameStyle.underline ? styles.active : ''}`} onClick={() => toggleStyle('underline')}>Underline</button>
                                    </div>
                                </div>
                            )}

                            {/* 뱃지 선택 시 */}
                            {selectedElement === 'badge' && (
                                <div className={styles.optionSection} style={{ gridColumn: '1 / -1' }}>
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
                            )}

                            {/* 포인트 선택 시 */}
                            {selectedElement === 'point' && (
                                <div className={styles.optionSection} style={{ gridColumn: '1 / -1' }}>
                                    <div className={styles.sectionTitle}>💎 포인트 스타일 편집</div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>글자 색상</div>
                                        <ColorControl id="p-text-color" value={pointStyle.color} onChange={(val: string) => setPointStyle(p => ({ ...p, color: val }))} activePickerId={activePickerId} setActivePickerId={setActivePickerId} />

                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>배경 색상</div>
                                        <ColorControl id="p-bg-color" value={pointStyle.background} onChange={(val: string) => setPointStyle(p => ({ ...p, background: val }))} showGradientOption activePickerId={activePickerId} setActivePickerId={setActivePickerId} />

                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>테두리 색상</div>
                                        <ColorControl id="p-border-color" value={pointStyle.borderColor} onChange={(val: string) => setPointStyle(p => ({ ...p, borderColor: val }))} activePickerId={activePickerId} setActivePickerId={setActivePickerId} />

                                    </div>

                                    <div className={styles.sliderGroup}>
                                        <div className={styles.sliderLabel}><span>테두리 두께</span> <span>{pointStyle.borderWidth}px</span></div>
                                        <input
                                            type="range"
                                            min="0" max="8"
                                            value={pointStyle.borderWidth}
                                            onChange={e => setPointStyle(p => ({ ...p, borderWidth: Number(e.target.value) }))}
                                            className={styles.sliderInput}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* 등수 선택 시 */}
                            {selectedElement === 'rank' && (
                                <div className={styles.optionSection} style={{ gridColumn: '1 / -1' }}>
                                    <div className={styles.sectionTitle}>#{myRank} 등수 표시 스타일</div>
                                    <ColorControl id="rank-color" value={rankStyle.color} onChange={(val: string) => setRankStyle(p => ({ ...p, color: val }))} activePickerId={activePickerId} setActivePickerId={setActivePickerId} />

                                </div>
                            )}

                            {/* 스티커 선택 시 - 삭제 팁 정도만 */}
                            {selectedElement?.toString().startsWith('sticker-') && (
                                <div className={styles.optionSection} style={{ gridColumn: '1 / -1' }}>
                                    <div className={styles.sectionTitle}>✨ 선택된 스티커</div>
                                    <p style={{ color: '#64748b' }}>스티커를 두 번 빠르게 터치/클릭하면 삭제할 수 있습니다.</p>
                                </div>
                            )}

                            {/* 저장 버튼은 항상 하단에 */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <button
                                    className={styles.btnSave}
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? '저장 중...' : <><IconSave /> 저장하기</>}
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
