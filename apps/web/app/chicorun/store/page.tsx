'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/use-toast';
import styles from './page.module.css';
import { CHICORUN_API, CHICORUN_ROUTES, CHICORUN_STORAGE_KEY } from '@/constants/chicorun';

// ─── Data Types ─────────────────────────────────────────────────────────────
import { ALL_CHICORUN_ITEMS, ShopItem } from '@/constants/chicorun-items';

const DEFAULT_OWNED_ITEMS = [
    'bg-white',
    'badge-crown',
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
    const { showToast } = useToast();
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
                    const serverOwned = data.data.ownedItems || DEFAULT_OWNED_ITEMS;
                    setOwnedItems(serverOwned);

                    // Keep localStorage as a secondary cache if needed for other components (optional)
                    localStorage.setItem('chicorun_owned_items', JSON.stringify(serverOwned));


                }
            } catch (err) {
                console.error('Failed to load user data', err);
            } finally {
                setIsLoading(false);
            }
        };

        const handleStorageChange = () => {
            const storedOwned = localStorage.getItem('chicorun_owned_items');
            if (storedOwned) {
                try {
                    const parsed = JSON.parse(storedOwned);
                    const merged = Array.from(new Set([...DEFAULT_OWNED_ITEMS, ...parsed]));
                    setOwnedItems(merged);
                } catch (e) { }
            } else {
                setOwnedItems(DEFAULT_OWNED_ITEMS);
            }
        };
        window.addEventListener('storage', handleStorageChange);

        fetchUserData();
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [router]);



    const handleBuy = async (item: ShopItem) => {
        if (ownedItems.includes(item.id)) return;

        if (points < item.price) {
            showToast('포인트가 부족합니다.', 'error');
            return;
        }

        // Show confirmation dialog
        const isConfirmed = window.confirm(`[${item.name}]을(를) 구매하시겠습니까? 1 CP가 차감됩니다.`);
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

                setPoints(newPointTotal);
                setOwnedItems(newOwned);
                localStorage.setItem('chicorun_owned_items', JSON.stringify(newOwned));

                // Update global info in localStorage so Header can pick it up
                const infoStr = localStorage.getItem('chicorun_student_info');
                if (infoStr) {
                    try {
                        const info = JSON.parse(infoStr);
                        info.point = newPointTotal;
                        localStorage.setItem('chicorun_student_info', JSON.stringify(info));
                        window.dispatchEvent(new Event('storage'));
                    } catch (e) {
                        console.error('Failed to update localStorage student info', e);
                    }
                }

                showToast(`${item.name}을(를) 구매했습니다!`, 'success');
            } else {
                showToast(deductData.error?.message || '구매 실패', 'error');
            }
        } catch (err) {
            console.error('Failed to purchase on server', err);
            showToast('서버 통신 중 오류가 발생했습니다.', 'error');
        }
    };




    const filteredItems = activeTab === 'all'
        ? ALL_CHICORUN_ITEMS
        : ALL_CHICORUN_ITEMS.filter(item => item.category === activeTab);

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
        </div>
    );
}

// ─── Render Helpers ────────────────────────────────────────────────────────
function renderPreview(item: ShopItem) {
    switch (item.category) {
        case 'background':
            return <div className={styles.backgroundPreview} style={item.previewStyle} />;
        case 'badge':
            return <span>{item.value}</span>;
        case 'sticker':
            return <span>{item.value}</span>;
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
