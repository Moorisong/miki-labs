export interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'background' | 'badge' | 'sticker' | 'border' | 'nickname';
    value: string;
    previewStyle?: any;
}

export const ALL_CHICORUN_ITEMS: ShopItem[] = [
    // Backgrounds
    {
        id: 'bg-white',
        name: '기본 화이트',
        description: '깔끔한 화이트 배경',
        price: 1,
        category: 'background',
        value: 'white',
        previewStyle: { background: 'white' }
    },
    {
        id: 'bg-sunset',
        name: '선셋 오렌지',
        description: '따뜻한 노을빛 그라데이션',
        price: 1,
        category: 'background',
        value: 'linear-gradient(135deg, #f97316, #f59e0b)',
        previewStyle: { background: 'linear-gradient(135deg, #f97316, #f59e0b)' }
    },
    {
        id: 'bg-ocean',
        name: '오션 블루',
        description: '시원한 바다색 그라데이션',
        price: 1,
        category: 'background',
        value: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
        previewStyle: { background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' }
    },
    {
        id: 'bg-neon',
        name: '네온 핑크',
        description: '화려한 네온 핑크',
        price: 1,
        category: 'background',
        value: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
        previewStyle: { background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }
    },

    // Badges
    {
        id: 'badge-crown',
        name: '황금 왕관',
        description: '최고의 실력자 배지',
        price: 1,
        category: 'badge',
        value: '👑'
    },
    {
        id: 'badge-fire',
        name: '불타는 열정',
        description: '멈추지 않는 도전 정신',
        price: 1,
        category: 'badge',
        value: '🔥'
    },
    {
        id: 'badge-zap',
        name: '번개 속도',
        description: '누구보다 빠른 문제 해결',
        price: 1,
        category: 'badge',
        value: '⚡'
    },

    // Stickers
    {
        id: 'sticker-star',
        name: '반짝이는 별',
        description: '카드를 빛내줄 별 스티커',
        price: 1,
        category: 'sticker',
        value: '⭐'
    },
    {
        id: 'sticker-rocket',
        name: '우주선 로켓',
        description: '목표를 향해 나아가는 로켓',
        price: 1,
        category: 'sticker',
        value: '🚀'
    },
    {
        id: 'sticker-heart',
        name: '사랑의 하트',
        description: '귀여운 하트 스티커',
        price: 1,
        category: 'sticker',
        value: '💖'
    },

    // Borders
    {
        id: 'border-solid',
        name: '기본 실선',
        description: '깔끔한 실선 테두리',
        price: 1,
        category: 'border',
        value: 'solid',
        previewStyle: { borderStyle: 'solid', borderWidth: '4px', borderColor: '#3b82f6' }
    },
    {
        id: 'border-dashed',
        name: '대시 라인',
        description: '세련된 점선 테두리',
        price: 1,
        category: 'border',
        value: 'dashed',
        previewStyle: { borderStyle: 'dashed', borderWidth: '4px', borderColor: '#3b82f6' }
    }
];

