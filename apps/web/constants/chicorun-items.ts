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
    {
        id: 'sticker-star',
        name: '골드 스타',
        description: '반짝이는 골드 스타 스티커 (Simple)',
        price: 1,
        category: 'sticker',
        value: '/chicorun/stickers/simple-star.svg'
    },
    {
        id: 'sticker-heart',
        name: '블링 하트',
        description: '사랑스러운 핑크 블링 하트 (Bling-bling)',
        price: 1,
        category: 'sticker',
        value: '/chicorun/stickers/bling-heart.svg'
    },
    {
        id: 'sticker-zap',
        name: '펑키 썬더',
        description: '강렬한 벼락 모양 스티커 (Funky)',
        price: 1,
        category: 'sticker',
        value: '/chicorun/stickers/funky-zap.svg'
    },
    {
        id: 'sticker-smile',
        name: '비비드 스마일',
        description: '밝게 웃고 있는 오렌지 스마일리 (Vivid)',
        price: 1,
        category: 'sticker',
        value: '/chicorun/stickers/vivid-smile.svg'
    },
    {
        id: 'sticker-cloud',
        name: '파스텔 클라우드',
        description: '포근한 파스텔톤 구름 (Pastel)',
        price: 1,
        category: 'sticker',
        value: '/chicorun/stickers/pastel-cloud.svg'
    },
    {
        id: 'sticker-chico',
        name: '치코 레터',
        description: '보라색 버블 텍스트 치코 (Text)',
        price: 2,
        category: 'sticker',
        value: '/chicorun/stickers/text-chico.svg'
    },
    {
        id: 'sticker-diamond',
        name: '다이아 크리스탈',
        description: '투명하고 화려한 다이아몬드 (Bling-bling)',
        price: 2,
        category: 'sticker',
        value: '/chicorun/stickers/diamond-bling.svg'
    },
    {
        id: 'sticker-paw',
        name: '핑크 젤리',
        description: '귀여운 고양이 발바닥 (Cute)',
        price: 1,
        category: 'sticker',
        value: '/chicorun/stickers/cute-paw.svg'
    },
    {
        id: 'sticker-music',
        name: '멜로디 그린',
        description: '즐거운 음악 선율 (Vivid)',
        price: 2,
        category: 'sticker',
        value: '/chicorun/stickers/music-note.svg'
    },
    {
        id: 'sticker-wow',
        name: '와우! 팝아트',
        description: '강렬한 인상의 WOW! 말풍선 (Comic)',
        price: 2,
        category: 'sticker',
        value: '/chicorun/stickers/wow-bubble.svg'
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


