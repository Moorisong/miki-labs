'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/use-toast';
import Toast from '@/components/ui/toast';
import styles from './page.module.css';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { CHICORUN_API, CHICORUN_ROUTES, CHICORUN_STORAGE_KEY } from '@/constants/chicorun';
import { ALL_CHICORUN_ITEMS } from '@/constants/chicorun-items';
import { RankingCard, CARD_WIDTH, CARD_HEIGHT, CHICORUN_CARD_DEFAULTS, RankingEntry, getBadgeStyles, getCardBorderStyle } from '../RankingCard';



// ─── Constants (Defaults - will be filtered by ownedItems) ─────────────────
const DEFAULT_OWNED_ITEMS = [
    'bg-white',
    'badge-starter-star',
    'border-solid',
    'border-dashed'
];

// These will be derived from ALL_CHICORUN_ITEMS and ownedItems in the component

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

// Helper removed as it's now in RankingCard.tsx

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

const IconTrash = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18"></path>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
    </svg>
);

const IconTrashSmall = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18"></path>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
    </svg>
);

const IconStore = () => (

    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
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
    parentScale = 1,
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
    parentScale?: number;
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
                left: position.x + (isDragging && offset ? offset.x / parentScale : 0),
                top: position.y + (isDragging && offset ? offset.y / parentScale : 0),
                cursor: (isResizing || isRotating) ? 'crosshair' : 'pointer',
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
            <div className={styles.hoverContent}>
                {children}
            </div>

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
                </div>
            )}
        </div>
    );
};

function CustomizeContent() {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const [ownedItems, setOwnedItems] = useState<string[]>(DEFAULT_OWNED_ITEMS);
    const [nickname, setNickname] = useState('치코런');
    const [selectedBadge, setSelectedBadge] = useState('');
    const [cardStyle, setCardStyle] = useState('white');
    const [stickers, setStickers] = useState<StickerItem[]>([]);

    // Filtered lists based on ownedItems
    const AVAILABLE_BACKGROUNDS = ALL_CHICORUN_ITEMS
        .filter(i => i.category === 'background' && ownedItems.includes(i.id))
        .map(i => ({ id: i.id, name: i.name, value: i.value }));

    const AVAILABLE_BADGES = ALL_CHICORUN_ITEMS
        .filter(i => i.category === 'badge' && ownedItems.includes(i.id))
        .map(i => ({ id: i.id, value: i.value }));

    const AVAILABLE_STICKERS = ALL_CHICORUN_ITEMS
        .filter(i => i.category === 'sticker' && ownedItems.includes(i.id))
        .map(i => ({ id: i.id, value: i.value }));

    const AVAILABLE_BORDER_TYPES = ALL_CHICORUN_ITEMS
        .filter(i => i.category === 'border' && ownedItems.includes(i.id))
        .map(i => ({ id: i.id, name: i.name, value: i.value, icon: i.value === 'solid' ? '➖' : '---' }));

    const AVAILABLE_NICKNAME_COLORS = [
        '#1e293b', '#ffffff', '#ef4444', '#ea580c', '#f59e0b',
        '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#fce7f3'
    ];


    const [nicknameStyle, setNicknameStyle] = useState<NicknameStyleType>({
        color: '#1e293b',
        bold: true,
        italic: false,
        underline: false,
        fontSize: 20,
        x: CHICORUN_CARD_DEFAULTS.nickname.x,
        y: CHICORUN_CARD_DEFAULTS.nickname.y,
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
        x: CHICORUN_CARD_DEFAULTS.point.x,
        y: CHICORUN_CARD_DEFAULTS.point.y,
        rotate: 0,
    });

    const [badgeStyle, setBadgeStyle] = useState<BadgeStyleType>({
        fontSize: 100,
        x: CHICORUN_CARD_DEFAULTS.badge.x,
        y: CHICORUN_CARD_DEFAULTS.badge.y,
        rotate: 0,
    });

    const [pointInfo, setPointInfo] = useState(0);
    const [myRank, setMyRank] = useState(0);

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [activePickerId, setActivePickerId] = useState<string | null>(null);

    const [isSticky, setIsSticky] = useState(false);
    const [scale, setScale] = useState(1);
    const [isMounted, setIsMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const stickySentinelRef = useRef<HTMLDivElement>(null);

    const updateScale = useCallback(() => {
        if (!containerRef.current) return;
        const rectWidth = containerRef.current.clientWidth;
        const winWidth = window.innerWidth;
        const docWidth = document.documentElement.clientWidth;

        const availableWidth = Math.min(rectWidth > 0 ? rectWidth : winWidth, winWidth, docWidth);
        const padding = availableWidth < 500 ? 32 : 100; // Smaller padding on mobile
        const targetWidth = availableWidth - padding;

        const newScale = targetWidth / CARD_WIDTH;
        const stickyFactor = isSticky ? 0.8 : 1;

        // On mobile/tablet, we want the card to be compact.
        if (availableWidth < 600) {
            setScale(Math.min(0.95, Math.max(0.6, newScale)) * stickyFactor);
        } else if (availableWidth < 1024) {
            setScale(Math.min(1, newScale) * stickyFactor);
        } else {
            // On desktop sidebar layout
            const sidebarTargetWidth = 320 - 40; // 320 grid col - padding
            const sidebarScale = sidebarTargetWidth / CARD_WIDTH;
            setScale(Math.min(1, sidebarScale) * (isSticky ? 0.92 : 1));
        }
    }, [containerRef, isSticky]);

    useEffect(() => {
        setIsMounted(true);
        updateScale();

        window.addEventListener('resize', updateScale);
        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) observer.observe(containerRef.current);

        // Sticky Sentinel for compact sticky effect
        const sentinelObserver = new IntersectionObserver(
            ([entry]) => {
                setIsSticky(!entry.isIntersecting);
            },
            {
                rootMargin: '-65px 0px 0px 0px', // Header height is 64px
                threshold: [0]
            }
        );

        if (stickySentinelRef.current) sentinelObserver.observe(stickySentinelRef.current);

        return () => {
            window.removeEventListener('resize', updateScale);
            observer.disconnect();
            sentinelObserver.disconnect();
        };
    }, [updateScale, isLoading]);

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

                // Sync owned items with DB data
                const serverOwned = data.data.ownedItems || [];
                const merged = Array.from(new Set([...DEFAULT_OWNED_ITEMS, ...serverOwned]));
                setOwnedItems(merged);


                if (custom) {
                    const clampX = (x: number) => Math.max(0, Math.min(x, 230));
                    const clampY = (y: number) => Math.max(0, Math.min(y, 310));

                    if (Array.isArray(custom.stickers)) {
                        setStickers(custom.stickers.map((s: any) => ({
                            ...s,
                            x: clampX(s.x),
                            y: clampY(s.y)
                        })));
                    }
                    if (custom.borderStyle) setBorderStyle(prev => ({ ...prev, ...custom.borderStyle }));

                    if (custom.pointStyle) {
                        setPointStyle(prev => ({
                            ...prev,
                            ...custom.pointStyle,
                            x: clampX(custom.pointStyle.x || prev.x),
                            y: clampY(custom.pointStyle.y || prev.y)
                        }));
                    }
                    if (custom.badgeStyle) {
                        setBadgeStyle(prev => ({
                            ...prev,
                            ...custom.badgeStyle,
                            x: clampX(custom.badgeStyle.x || prev.x),
                            y: clampY(custom.badgeStyle.y || prev.y)
                        }));
                    }
                }

                if (data.data.nicknameStyle) {
                    const clampX = (x: number) => Math.max(0, Math.min(x, 230));
                    const clampY = (y: number) => Math.max(0, Math.min(y, 310));
                    setNicknameStyle(prev => ({
                        ...prev,
                        ...data.data.nicknameStyle,
                        x: clampX(data.data.nicknameStyle.x || prev.x),
                        y: clampY(data.data.nicknameStyle.y || prev.y)
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

        const handleReFetch = () => fetchMyInfo();
        window.addEventListener('chicorun_user_update', handleReFetch);
        return () => window.removeEventListener('chicorun_user_update', handleReFetch);
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
            const newX = Math.round(item.x + delta.x / scale);
            const newY = Math.round(item.y + delta.y / scale);
            const type = monitor.getItemType();

            if (type === 'sticker') moveSticker(item.id, newX, newY);
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
                        badgeStyle
                    }
                }),
            });

            const data = await res.json();
            if (data.success) {
                // Notify other components (like NavBar) to re-fetch latest data from DB
                window.dispatchEvent(new Event('chicorun_user_update'));

                showToast('랭킹 꾸미기가 저장되었습니다! 화려해진 랭킹 리스트를 확인해 보세요.', 'success');
                // Reset interactions
                setSelectedElement(null);
                setActivePickerId(null);
            } else {
                showToast('저장 실패', 'error');
            }
        } catch (err) {
            console.error('Failed to save customization:', err);
        } finally {
            setIsSaving(false);
        }
    };


    const discardItem = (itemId: string) => {
        if (DEFAULT_OWNED_ITEMS.includes(itemId)) {
            showToast('기본 아이템은 삭제할 수 없습니다.', 'error');
            return;
        }
        if (window.confirm('이 아이템을 소지품에서 영구적으로 삭제하시겠습니까?\n다시 사용하려면 상점에서 구매해야 합니다.')) {
            // Update DB
            const token = localStorage.getItem(CHICORUN_STORAGE_KEY.TOKEN);
            fetch(CHICORUN_API.STUDENT_REMOVE_ITEM(itemId), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        const newOwned = data.data.ownedItems || [];
                        setOwnedItems(newOwned);
                        localStorage.setItem('chicorun_owned_items', JSON.stringify(newOwned));
                        window.dispatchEvent(new Event('storage'));
                        showToast('아이템이 삭제되었습니다.', 'success');
                    } else {
                        showToast('삭제 실패', 'error');
                    }
                })
                .catch(err => {
                    console.error('Failed to delete item from DB', err);
                    showToast('서버 오류로 삭제하지 못했습니다.', 'error');
                });
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
            <main className={styles.main} onClick={(e) => { e.stopPropagation(); setActivePickerId(null); }}>
                <div className={styles.headerRow}>
                    <div className={styles.titleArea}>
                        <h1 className={styles.title}><IconSparkles /> 랭킹 꾸미기</h1>
                        <p className={styles.subtitle}>랭킹 리스트에 나타나는 나의 랭킹 영역을 자유롭게 꾸며보세요!</p>
                    </div>
                </div>


                <div className={styles.layoutGrid}>
                    <div className={styles.previewPanel}>
                        <div className={styles.previewHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ textAlign: 'left' }}>
                                <h2 className={styles.panelTitle} style={{ margin: 0 }}>현재 내 랭킹 영역 미리보기</h2>
                                <p className={styles.previewHeaderDescription} style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>드래그하거나 스티커를 추가해 보세요!</p>
                            </div>
                        </div>

                        <div ref={stickySentinelRef} style={{ height: '1px', width: '100%' }} />

                        {/* 미리보기영역 - 픽스 상태일때는 이 부분만 고정됨 */}
                        <div className={styles.stickyPreviewWrapper} ref={containerRef}>
                            <div className={styles.previewContainer} style={{ paddingBottom: 0 }}>

                                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                    <RankingCard
                                        mode="edit"
                                        dropRef={drop}
                                        user={{
                                            id: 'preview',
                                            rank: myRank > 0 ? myRank : 1,
                                            nickname: nickname,
                                            point: pointInfo,
                                            badge: selectedBadge,
                                            cardStyle: cardStyle,
                                            nicknameStyle,
                                            customize: {
                                                stickers,
                                                borderStyle,
                                                pointStyle,

                                                badgeStyle
                                            }
                                        }}
                                        isFirst={isFirst}
                                        scale={scale}
                                        selectedElement={selectedElement}
                                        onSelectElement={setSelectedElement}
                                        updateElement={updateSelectedElement}
                                        handleTouchSticker={handleTouchSticker}
                                        removeSticker={removeSticker}
                                        renderDraggable={(props) => (
                                            <DraggableElement
                                                key={props.id || props.type}
                                                {...props}
                                                parentScale={scale}
                                                onUpdate={(updates) => {
                                                    if (updates.fontSize) updateSelectedElement({ fontSize: updates.fontSize });
                                                    if (updates.scale) updateSelectedElement({ scale: updates.scale });
                                                    if (updates.rotate !== undefined) updateSelectedElement({ rotate: updates.rotate });
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.optionsContainer} onClick={(e) => { e.stopPropagation(); setActivePickerId(null); }}>
                        {/* 상시 보이는 스티커 추가 버튼 */}
                        <div className={styles.alwaysVisibleActions}>
                            <button
                                className={styles.btnStickerActionCompact}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedElement('sticker-picker');
                                }}
                            >
                                <span className={styles.btnIconSmall}>✨</span>
                                <span className={styles.btnLabelMainSmall}>장식 스티커 추가하기</span>
                            </button>
                        </div>

                        {/* 아무것도 선택되지 않았을 때의 안내 */}
                        {(!selectedElement) && (
                            <div className={styles.emptyStateContainerSmall}>
                                <div className={styles.emptyStateIconSmall}>🎨</div>
                                <div style={{ textAlign: 'left' }}>
                                    <h3 className={styles.emptyStateTitleSmall}>편집을 시작해보세요!</h3>
                                    <p className={styles.emptyStateDescriptionSmall}>카드에서 수정하고 싶은 부분을 클릭하여 자유롭게 꾸며보세요.</p>
                                </div>
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
                                            key={bg.id}
                                            className={`${styles.btnBackground} ${cardStyle === bg.value ? styles.selected : ''}`}
                                            style={{ background: bg.value, border: cardStyle === bg.value ? '4px solid #3b82f6' : '3px solid #e2e8f0', color: bg.value === 'white' || bg.value === 'transparent' ? '#1e293b' : 'white', position: 'relative' }}
                                            onClick={() => setCardStyle(bg.value)}
                                        >
                                            {bg.name}
                                            {!DEFAULT_OWNED_ITEMS.includes(bg.id) && (
                                                <button
                                                    className={styles.btnDiscardSmall}
                                                    onClick={(e) => { e.stopPropagation(); discardItem(bg.id); }}
                                                    title="보유 목록에서 삭제"
                                                >
                                                    <IconTrashSmall />
                                                </button>
                                            )}
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
                                        <div
                                            key={type.id}
                                            onClick={() => setBorderStyle(p => ({ ...p, style: type.value }))}
                                            className={`${styles.btnBorderType} ${borderStyle.style === type.value ? styles.selected : ''}`}
                                            style={{ position: 'relative', cursor: 'pointer' }}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    setBorderStyle(p => ({ ...p, style: type.value }));
                                                }
                                            }}
                                        >
                                            <span style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{type.icon}</span>
                                            <span style={{ fontSize: '0.8rem' }}>{type.name}</span>
                                            {!DEFAULT_OWNED_ITEMS.includes(type.id) && (
                                                <button
                                                    className={styles.btnDiscardSmall}
                                                    onClick={(e) => { e.stopPropagation(); discardItem(type.id); }}
                                                    title="보유 목록에서 삭제"
                                                >
                                                    <IconTrashSmall />
                                                </button>
                                            )}
                                        </div>

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
                                        <div
                                            key={sticker.id}
                                            className={styles.btnEmojiWrapper}
                                            style={{ position: 'relative' }}
                                        >
                                            <button
                                                onClick={() => addSticker(sticker.value)}
                                                className={styles.btnEmoji}
                                                style={{ padding: sticker.value.startsWith('/') ? '8px' : '0.5rem' }}
                                            >
                                                {sticker.value.startsWith('/') ? (
                                                    <img
                                                        src={sticker.value}
                                                        alt={sticker.id}
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    />
                                                ) : (
                                                    sticker.value
                                                )}
                                            </button>
                                            {!DEFAULT_OWNED_ITEMS.includes(sticker.id) && (
                                                <button
                                                    className={styles.btnDiscardSmall}
                                                    onClick={(e) => { e.stopPropagation(); discardItem(sticker.id); }}
                                                    title="보유 목록에서 삭제"
                                                >
                                                    <IconTrashSmall />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 닉네임 선택 시 */}
                        {selectedElement === 'nickname' && (
                            <div className={styles.optionSection} style={{ gridColumn: '1 / -1' }}>
                                <div className={styles.sectionTitle}>📝 닉네임 스타일</div>
                                <div className={styles.gridColor} style={{ marginBottom: '1rem' }}>
                                    {AVAILABLE_NICKNAME_COLORS.map(color => (
                                        <div
                                            key={color}
                                            onClick={() => setNicknameStyle(p => ({ ...p, color }))}
                                            className={`${styles.colorCircle} ${nicknameStyle.color === color ? styles.selected : ''}`}
                                            style={{ background: color }}
                                        />
                                    ))}
                                </div>
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
                                        <div
                                            key={badge.id}
                                            className={styles.btnEmojiWrapper}
                                            style={{ position: 'relative' }}
                                        >
                                            <button
                                                onClick={() => setSelectedBadge(badge.value)}
                                                className={`${styles.btnEmoji} ${selectedBadge === badge.value ? styles.selected : ''}`}
                                                style={{ padding: badge.value.startsWith('/') ? '4px' : '0.5rem' }}
                                            >
                                                {badge.value.startsWith('/') ? (
                                                    <div style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        background: getBadgeStyles(badge.value).bg,
                                                        border: `3px solid ${getBadgeStyles(badge.value).border}`,
                                                        borderRadius: '20%',
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <img
                                                            src={badge.value}
                                                            style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}
                                                            alt="badge"
                                                        />
                                                    </div>
                                                ) : badge.value}
                                            </button>
                                            {!DEFAULT_OWNED_ITEMS.includes(badge.id) && (
                                                <button
                                                    className={styles.btnDiscardSmall}
                                                    onClick={(e) => { e.stopPropagation(); discardItem(badge.id); }}
                                                    title="보유 목록에서 삭제"
                                                >
                                                    <IconTrashSmall />
                                                </button>
                                            )}
                                        </div>
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


                        {/* 스티커 선택 시 - 삭제 팁 및 전체 제거 */}
                        {selectedElement?.toString().startsWith('sticker-') && (
                            <div className={styles.optionSection} style={{ gridColumn: '1 / -1' }}>
                                <div className={styles.sectionTitle}>✨ 선택된 스티커</div>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>스티커를 두 번 빠르게 터치/클릭하면 삭제할 수 있습니다.</p>
                                <button
                                    className={styles.btnRemoveAllStickers}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('모든 스티커를 제거하시겠습니까?')) {
                                            setStickers([]);
                                            setSelectedElement(null);
                                        }
                                    }}
                                >
                                    <IconTrash /> 모든 스티커 제거하기
                                </button>
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
            </main >
            <Toast toast={toast} onHide={hideToast} />
        </div >
    );
}

export default function CustomizePage() {
    return (
        <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
            <CustomizeContent />
        </DndProvider>
    );
}

// Helper removed
