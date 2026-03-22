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
        description: '깔끔한 화이트 배경 (기본)',
        price: 0,
        category: 'background',
        value: 'white',
        previewStyle: { background: 'white' }
    },
    {
        id: 'bg-premium-cloud',
        name: '실키 클라우드',
        description: '연하고 부드러운 화이트-블루 파스텔 그라데이션',
        price: 1,
        category: 'background',
        value: 'linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)',
        previewStyle: { background: 'linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)' }
    },
    {
        id: 'bg-premium-vivid',
        name: '트로피컬 프리즘',
        description: '강렬하고 화려한 비비드 혼합색 그라데이션',
        price: 2,
        category: 'background',
        value: 'linear-gradient(135deg, #FF0844 0%, #FFB199 50%, #FFD700 100%)',
        previewStyle: { background: 'linear-gradient(135deg, #FF0844 0%, #FFB199 50%, #FFD700 100%)' }
    },
    {
        id: 'bg-premium-neon',
        name: '네온 시티나이트',
        description: '진한 바탕에 세련된 네온 블루가 감도는 사이버 무드',
        price: 3,
        category: 'background',
        value: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)',
        previewStyle: { background: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)' }
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


