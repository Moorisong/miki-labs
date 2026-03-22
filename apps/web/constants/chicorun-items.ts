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
        price: 0,
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

    // Badges (Italian Brainrot Characters)
    {
        id: 'badge-tralallero',
        name: '트랄랄레로 트랄랄라',
        description: '세 개의 근육질 다리를 가진 귀여운 상어',
        price: 1,
        category: 'badge',
        value: '/chicorun/badges/tralallero.png'
    },
    {
        id: 'badge-tungtung',
        name: '퉁퉁퉁 사후르',
        description: '야구 배트를 든 귀여운 나무 유령',
        price: 1,
        category: 'badge',
        value: '/chicorun/badges/tungtung.png'
    },
    {
        id: 'badge-ballerina',
        name: '발레리나 카푸치나',
        description: '카푸치노 머리를 한 우아한 발레리나',
        price: 1,
        category: 'badge',
        value: '/chicorun/badges/ballerina.png'
    },
    {
        id: 'badge-bombardiro',
        name: '봄바르디로 크로코딜로',
        description: '비행기 몸을 가진 용감한 악어',
        price: 1,
        category: 'badge',
        value: '/chicorun/badges/bombardiro.png'
    },
    {
        id: 'badge-assassino',
        name: '카푸치노 아사시노',
        description: '가면을 쓴 귀여운 커피 암살자',
        price: 1,
        category: 'badge',
        value: '/chicorun/badges/assassino.png'
    },

    // Stickers
    // (Stickers removed as per user request to delete previous emoji data)

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


