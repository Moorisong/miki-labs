'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/use-toast';
import Toast from '@/components/ui/toast';
import styles from './page.module.css';
import { CHICORUN_API, CHICORUN_ROUTES, CHICORUN_STORAGE_KEY } from '@/constants/chicorun';

// ─── Data Types ─────────────────────────────────────────────────────────────
import { ALL_CHICORUN_ITEMS, ShopItem } from '@/constants/chicorun-items';

const DEFAULT_OWNED_ITEMS = [
    'bg-white',
    'badge-starter-star',
    'border-solid'
];


const CATEGORIES = [
    { id: 'all', label: '전체' },
    { id: 'background', label: '배경' },
    { id: 'badge', label: '배지' },
    { id: 'sticker', label: '스티커' },
    { id: 'border', label: '테두리' },
];


export default function StorePage() {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const [activeTab, setActiveTab] = useState('all');
    const [points, setPoints] = useState(0);
    const [ownedItems, setOwnedItems] = useState<string[]>(DEFAULT_OWNED_ITEMS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem(CHICORUN_STORAGE_KEY.TOKEN);
        if (!token) {
            router.replace(CHICORUN_ROUTES.JOIN);
            return;
        }

        // Load points and owned items
        const fetchUserData = async () => {
            try {
                const res = await fetch(CHICORUN_API.STUDENT_ME, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    const serverPoints = data.data.point || 0;
                    setPoints(serverPoints);

                    // Sync localStorage with latest server data
                    const infoStr = localStorage.getItem(CHICORUN_STORAGE_KEY.STUDENT_INFO);
                    if (infoStr) {
                        try {
                            const info = JSON.parse(infoStr);
                            info.point = serverPoints;
                            localStorage.setItem(CHICORUN_STORAGE_KEY.STUDENT_INFO, JSON.stringify(info));
                            window.dispatchEvent(new Event('storage'));
                        } catch (e) {
                            console.error('Failed to sync localStorage on load', e);
                        }
                    }

                    // Sync owned items with DB data
                    const serverOwned = data.data.ownedItems || [];
                    const merged = Array.from(new Set([...DEFAULT_OWNED_ITEMS, ...serverOwned]));
                    setOwnedItems(merged);
                }
            } catch (err) {
                console.error('Failed to load user data', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [router]);



    const handleBuy = async (item: ShopItem) => {
        if (ownedItems.includes(item.id)) return;

        if (points < item.price) {
            showToast(`포인트가 부족합니다. (${item.price} CP 필요)`, 'error');
            return;
        }

        // Show confirmation dialog
        const isConfirmed = window.confirm(`[${item.name}]을(를) 구매하시겠습니까? ${item.price} CP가 차감됩니다.`);
        if (!isConfirmed) return;

        // Update DB (Point deduction & Item purchase)

        try {
            const token = localStorage.getItem(CHICORUN_STORAGE_KEY.TOKEN);
            const deductRes = await fetch(CHICORUN_API.STUDENT_DEDUCT_POINT, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: item.price,
                    itemId: item.id
                })
            });
            const deductData = await deductRes.json();

            if (deductData.success) {
                const newPointTotal = deductData.data.point;
                const newOwned = deductData.data.ownedItems || [];
                const merged = Array.from(new Set([...DEFAULT_OWNED_ITEMS, ...newOwned]));

                setPoints(newPointTotal);
                setOwnedItems(merged);

                // Notify Header to re-fetch latest data from DB
                window.dispatchEvent(new Event('chicorun_user_update'));

                showToast(`${item.name}을(를) 구매했습니다!`, 'success');
            } else {
                showToast(deductData.error?.message || '구매 실패', 'error');
            }
        } catch (err) {
            console.error('Failed to purchase on server', err);
            showToast('서버 통신 중 오류가 발생했습니다.', 'error');
        }
    };




    const filteredItems = (activeTab === 'all'
        ? ALL_CHICORUN_ITEMS
        : ALL_CHICORUN_ITEMS.filter(item => item.category === activeTab)
    ).filter(item => !DEFAULT_OWNED_ITEMS.includes(item.id));

    if (isLoading) {
        return <div className={styles.container}>로딩 중...</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>
                        <IconStore /> 치코런 상점
                    </h1>
                    <p>나만의 특별한 카드를 꾸밀 아이템을 구매해보세요!</p>
                </div>

                <div className={styles.pointBadge}>
                    <div className={styles.pointIcon}>C</div>
                    <span className={styles.pointValue}>{points.toLocaleString()} CP</span>
                </div>
            </header>

            <nav className={styles.tabs}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        className={`${styles.tab} ${activeTab === cat.id ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(cat.id)}
                    >
                        {cat.label}
                    </button>
                ))}
            </nav>

            <main className={styles.grid}>
                {filteredItems.map(item => {
                    const isOwned = ownedItems.includes(item.id);
                    return (
                        <div key={item.id} className={styles.itemCard}>
                            <div className={styles.previewBox}>
                                {renderPreview(item)}
                            </div>
                            <div className={styles.itemInfo}>
                                <h3 className={styles.itemName}>{item.name}</h3>
                                <p className={styles.itemDesc}>{item.description}</p>
                            </div>
                            <button
                                className={`${styles.buyButton} ${isOwned ? styles.owned : ''}`}
                                onClick={() => handleBuy(item)}
                                disabled={isOwned}
                            >
                                {isOwned ? (
                                    <>보유 중</>
                                ) : (
                                    <>
                                        <span className={styles.price}>{item.price === 0 ? 'FREE' : `${item.price} CP`}</span>
                                        구매하기
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </main>
            <Toast toast={toast} onHide={hideToast} />
        </div>
    );
}

// ─── Render Helpers ────────────────────────────────────────────────────────
const getBadgeStyles = (path: string) => {
    if (path.includes('pasta-rex')) return { bg: '#FEF3C7', border: '#D97706' }; // Amber
    if (path.includes('pizzadino')) return { bg: '#FEE2E2', border: '#DC2626' }; // Red
    if (path.includes('gelato-bear')) return { bg: '#DBEAFE', border: '#2563EB' }; // Blue
    if (path.includes('vespa-cat')) return { bg: '#D1FAE5', border: '#059669' }; // Green
    if (path.includes('leaning-giraffe')) return { bg: '#FEF9C3', border: '#CA8A04' }; // Yellow
    if (path.includes('badge-starter-star')) return { bg: '#FFFFFF', border: '#60A5FA' }; // Blue
    return { bg: '#f1f5f9', border: '#e2e8f0' };
};

function renderPreview(item: ShopItem) {
    switch (item.category) {
        case 'background':
            return <div className={styles.backgroundPreview} style={item.previewStyle} />;
        case 'badge':
            if (item.value.startsWith('/')) {
                const badgeStyle = getBadgeStyles(item.value);
                return (
                    <div style={{
                        background: badgeStyle.bg,
                        border: item.value.includes('badge-starter-star') ? 'none' : `4px solid ${badgeStyle.border}`,
                        borderRadius: '22%',
                        overflow: 'hidden',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img
                            src={item.value}
                            alt={item.name}
                            className={styles.badgeImage}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                mixBlendMode: 'multiply' // Makes white background of PNG transparent
                            }}
                        />
                    </div>
                );
            }
            return <span>{item.value}</span>;
        case 'sticker':
            return item.value.startsWith('/')
                ? <img src={item.value} alt={item.name} className={styles.stickerImage} />
                : <span>{item.value}</span>;
        case 'border':
            return <div className={styles.borderPreview} style={item.previewStyle} />;
        case 'nickname':
            return <span className={styles.nicknamePreview} style={{ color: item.value }}>Nickname</span>;
        default:
            return <span>{item.value}</span>;
    }
}

// ─── Icons ─────────────────────────────────────────────────────────────────
const IconStore = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);
