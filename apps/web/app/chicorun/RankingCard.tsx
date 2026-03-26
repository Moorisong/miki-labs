import React from 'react';
import styles from './RankingCard.module.css';

export const CARD_WIDTH = 260;
export const CARD_HEIGHT = 340;

export interface RankingEntry {
    id: string;
    rank: number;
    nickname: string;
    point: number;
    badge?: string;
    cardStyle?: string;
    nicknameStyle?: {
        color: string;
        bold: boolean;
        italic: boolean;
        underline: boolean;
        fontSize?: number;
        x?: number;
        y?: number;
        rotate?: number;
    };
    customize?: {
        stickers?: { id: string; emoji: string; x: number; y: number; scale?: number; rotate?: number }[];
        borderStyle?: {
            color: string;
            width: number;
            style: string;
            radius: number;
        };
        pointStyle?: {
            color: string;
            background: string;
            borderWidth: number;
            borderColor: string;
            fontSize: number;
            x: number;
            y: number;
            rotate?: number;
        };
        rankStyle?: {
            color: string;
            fontSize: number;
            x: number;
            y: number;
            rotate?: number;
        };
        badgeStyle?: {
            fontSize: number;
            x: number;
            y: number;
            rotate?: number;
        };
    };
}

export const CHICORUN_CARD_DEFAULTS = {
    rank: { x: 110, y: 20 },
    badge: { x: 90, y: 60 },
    nickname: { x: 20, y: 200 },
    point: { x: 20, y: 270 }
};

const IconZap = ({ color = '#ea580c' }: { color?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);

export const getBadgeStyles = (path: string) => {
    if (!path) return { bg: '#f1f5f9', border: '#e2e8f0' };
    if (path.includes('pasta-rex')) return { bg: '#FEF3C7', border: '#D97706' }; // Amber
    if (path.includes('pizzadino')) return { bg: '#FEE2E2', border: '#DC2626' }; // Red
    if (path.includes('gelato-bear')) return { bg: '#DBEAFE', border: '#2563EB' }; // Blue
    if (path.includes('vespa-cat')) return { bg: '#D1FAE5', border: '#059669' }; // Green
    if (path.includes('leaning-giraffe')) return { bg: '#FEF9C3', border: '#CA8A04' }; // Yellow
    if (path.includes('badge-starter-star')) return { bg: '#FFFFFF', border: '#60A5FA' }; // Blue
    return { bg: '#f1f5f9', border: '#e2e8f0' };
};

export const getCardBorderStyle = (borderStyle: any) => {
    if (!borderStyle) return {};
    const { color, width, style, radius } = borderStyle;
    const baseStyle: React.CSSProperties = {
        borderRadius: `${radius !== undefined ? radius : 24}px`,
        borderWidth: `${width !== undefined ? width : 3}px`,
        borderColor: color || '#facc15',
        borderStyle: ['solid', 'dashed', 'dotted'].includes(style) ? (style as any) : 'none',
        backgroundClip: 'padding-box',
    };

    return baseStyle;
};

interface RankingCardProps {
    user: RankingEntry;
    isFirst?: boolean;
    scale?: number;
    mode?: 'view' | 'edit';
    // For edit mode
    renderDraggable?: (props: {
        type: string;
        id?: string;
        position: { x: number; y: number };
        rotate?: number;
        scale?: number;
        isSelected?: boolean;
        onSelect?: () => void;
        onUpdate?: (updates: { scale?: number; rotate?: number; fontSize?: number }) => void;
        children: React.ReactNode;
        style?: React.CSSProperties;
    }) => React.ReactNode;
    selectedElement?: string | null;
    onSelectElement?: (id: string | null) => void;
    updateElement?: (updates: { scale?: number; rotate?: number; fontSize?: number }) => void;
    handleTouchSticker?: (id: string) => void;
    removeSticker?: (id: string) => void;
    dropRef?: (node: any) => void;
}

export const RankingCard: React.FC<RankingCardProps> = ({
    user,
    isFirst = false,
    scale = 1,
    mode = 'view',
    renderDraggable,
    selectedElement,
    onSelectElement,
    updateElement,
    handleTouchSticker,
    removeSticker,
    dropRef
}) => {
    const isEdit = mode === 'edit';

    const renderContent = (type: string, id: string | undefined, position: { x: number; y: number }, rotate: number, scaleFactor: number, isSelected: boolean, onSelect: () => void, children: React.ReactNode, extraStyle: React.CSSProperties = {}) => {
        const key = id || type;
        if (isEdit && renderDraggable) {
            return renderDraggable({
                type,
                id,
                position,
                rotate,
                scale: scaleFactor,
                isSelected,
                onSelect,
                onUpdate: updateElement,
                children,
                style: extraStyle
            });
        }

        return (
            <div key={key} style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                transform: `rotate(${rotate}deg) scale(${scaleFactor})`,
                zIndex: 10,
                ...extraStyle
            }}>
                {children}
            </div>
        );
    };

    const bX = user.customize?.badgeStyle?.x ?? CHICORUN_CARD_DEFAULTS.badge.x;
    const bY = user.customize?.badgeStyle?.y ?? CHICORUN_CARD_DEFAULTS.badge.y;
    const nX = user.nicknameStyle?.x ?? CHICORUN_CARD_DEFAULTS.nickname.x;
    const nY = user.nicknameStyle?.y ?? CHICORUN_CARD_DEFAULTS.nickname.y;
    const pX = user.customize?.pointStyle?.x ?? CHICORUN_CARD_DEFAULTS.point.x;
    const pY = user.customize?.pointStyle?.y ?? CHICORUN_CARD_DEFAULTS.point.y;

    const cardStyles: React.CSSProperties = {
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        position: 'absolute',
        left: 0,
        top: 0,
        transformOrigin: 'top left',
        transform: `scale(${scale})`,
        ...((user.cardStyle || 'white').startsWith('linear-gradient')
            ? { backgroundImage: user.cardStyle || 'white' }
            : { backgroundColor: user.cardStyle || 'white' }),
        ...getCardBorderStyle(user.customize?.borderStyle),
        boxShadow: isFirst && user.customize?.borderStyle?.style !== 'neon' ? '0 20px 25px -5px rgba(250, 204, 21, 0.4)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
        overflow: isFirst || user.customize?.borderStyle?.style === 'ribbon' ? 'visible' : 'hidden',
    };

    return (
        <div style={{
            width: `${CARD_WIDTH * scale}px`,
            height: `${CARD_HEIGHT * scale}px`,
            position: 'relative',
            margin: '0 auto',
        }}>
            <div
                ref={dropRef}
                className={styles.rankingCard}
                style={cardStyles}
            >
                {/* Background Click Area for Edit Mode - Moved to negative z-index to stay below content */}
                {isEdit && [
                    <div
                        key="bg-click-inner"
                        onClick={(e) => { e.stopPropagation(); onSelectElement?.('base-card-bg'); }}
                        style={{ position: 'absolute', inset: '20px', borderRadius: `${user.customize?.borderStyle?.radius || 24}px`, zIndex: -1, cursor: 'pointer' }}
                    />,
                    <div
                        key="bg-click-outer"
                        onClick={(e) => { e.stopPropagation(); onSelectElement?.('base-card-border'); }}
                        style={{ position: 'absolute', inset: 0, borderRadius: `${user.customize?.borderStyle?.radius || 24}px`, zIndex: -2, cursor: 'pointer' }}
                    />
                ]}


                {/* Stickers */}
                {user.customize?.stickers?.map((sticker) => (
                    renderContent(
                        'sticker',
                        sticker.id,
                        { x: sticker.x, y: sticker.y },
                        sticker.rotate || 0,
                        sticker.scale || 1,
                        selectedElement === `sticker-${sticker.id}`,
                        () => onSelectElement?.(`sticker-${sticker.id}`),
                        <div
                            onDoubleClick={() => isEdit && removeSticker?.(sticker.id)}
                            onClick={() => isEdit && handleTouchSticker?.(sticker.id)}
                            style={{ width: '1.2em', height: '1.2em', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}
                        >
                            {sticker.emoji.startsWith('/') ? (
                                <img src={sticker.emoji} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="sticker" draggable={false} />
                            ) : sticker.emoji}
                        </div>
                    )
                ))}

                {/* Badge Icon */}
                {renderContent(
                    'badge',
                    undefined,
                    { x: bX, y: bY },
                    user.customize?.badgeStyle?.rotate || 0,
                    1,
                    selectedElement === 'badge',
                    () => onSelectElement?.('badge'),
                    <div style={{
                        fontSize: user.customize?.badgeStyle?.fontSize ? `${user.customize.badgeStyle.fontSize}px` : '100px',
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {user.badge?.startsWith('/') ? (
                            <div style={{
                                background: getBadgeStyles(user.badge).bg,
                                border: user.badge?.includes('badge-starter-star')
                                    ? 'none'
                                    : `calc(${user.customize?.badgeStyle?.fontSize || 100}px * 0.1) solid ${getBadgeStyles(user.badge).border}`,
                                borderRadius: '22%',
                                width: '1em',
                                height: '1em',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={user.badge}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}
                                    alt="badge"
                                    draggable={false}
                                />
                            </div>
                        ) : (user.badge || '')}
                    </div>
                )}

                {/* Nickname */}
                {renderContent(
                    'nickname',
                    undefined,
                    { x: nX, y: nY },
                    user.nicknameStyle?.rotate || 0,
                    1,
                    selectedElement === 'nickname',
                    () => onSelectElement?.('nickname'),
                    <div
                        className={styles.nickname}
                        style={{
                            color: user.nicknameStyle?.color || '#1e293b',
                            fontWeight: user.nicknameStyle?.bold ? 800 : 500,
                            fontStyle: user.nicknameStyle?.italic ? 'italic' : 'normal',
                            textDecoration: user.nicknameStyle?.underline ? 'underline' : 'none',
                            fontSize: user.nicknameStyle?.fontSize ? `${user.nicknameStyle.fontSize}px` : '1.2rem',
                            textShadow: (user.cardStyle !== 'white' && user.cardStyle !== 'transparent' && user.nicknameStyle?.color === '#ffffff') ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
                        }}
                    >
                        {user.nickname}
                    </div>
                )}

                {/* Points */}
                {renderContent(
                    'point',
                    undefined,
                    { x: pX, y: pY },
                    user.customize?.pointStyle?.rotate || 0,
                    1,
                    selectedElement === 'point',
                    () => onSelectElement?.('point'),
                    <div className={styles.pointsBox} style={{
                        background: user.customize?.pointStyle?.background || 'linear-gradient(90deg, #ffedd5, #fef3c7)',
                        color: user.customize?.pointStyle?.color || '#ea580c',
                        border: user.customize?.pointStyle?.borderWidth ? `${user.customize.pointStyle.borderWidth}px solid ${user.customize.pointStyle.borderColor}` : 'none',
                    }}>
                        <IconZap color={user.customize?.pointStyle?.color || '#ea580c'} />
                        <span className={styles.pointsText} style={{
                            color: user.customize?.pointStyle?.color || '#ea580c',
                            fontSize: user.customize?.pointStyle?.fontSize ? `${user.customize.pointStyle.fontSize}px` : '1.1rem'
                        }}>{user.point.toLocaleString()}P</span>
                    </div>
                )}
            </div>
        </div>
    );
};
