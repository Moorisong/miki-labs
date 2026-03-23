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
    {
        id: 'bg-sunset-mirage',
        name: '선셋 미라지',
        description: '황홀한 태양빛을 닮은 보라-핑크 그라데이션 (Vivid)',
        price: 2,
        category: 'background',
        value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        previewStyle: { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
    },
    {
        id: 'bg-emerald-aurora',
        name: '에메랄드 오로라',
        description: '청량한 숲의 기운을 담은 그린-민트 그라데이션 (Pastel)',
        price: 2,
        category: 'background',
        value: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)',
        previewStyle: { background: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)' }
    },
    {
        id: 'bg-midnight-velvet',
        name: '미드나잇 벨벳',
        description: '깊고 중후한 멋의 다크 네이비 그라데이션 (Dark)',
        price: 3,
        category: 'background',
        value: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
        previewStyle: { background: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' }
    },
    {
        id: 'bg-cyber-neon',
        name: '사이버 네온 핑크',
        description: '강렬한 대비를 이루는 네온 시안-핑크 (Neon)',
        price: 3,
        category: 'background',
        value: 'linear-gradient(to right, #00dbde 0%, #fc00ff 100%)',
        previewStyle: { background: 'linear-gradient(to right, #00dbde 0%, #fc00ff 100%)' }
    },
    {
        id: 'bg-lemon-chiffon',
        name: '레몬 쉬폰',
        description: '부드럽고 밝은 느낌의 단색 파스텔 옐로우 (Simple)',
        price: 1,
        category: 'background',
        value: '#fff9c4',
        previewStyle: { background: '#fff9c4' }
    },

    // Badges (Italian Brainrot Style Characters)
    {
        id: 'badge-pasta-rex',
        name: '파스타 렉스',
        description: '스파게티 몸에 미트볼 눈을 가진 개구쟁이 파스타 공룡',
        price: 1,
        category: 'badge',
        value: '/chicorun/badges/pasta-rex.png'
    },
    {
        id: 'badge-pizzadino',
        name: '피자 다이노',
        description: '머리에 맛있는 페퍼로니 피자를 얹은 초식 공룡',
        price: 1,
        category: 'badge',
        value: '/chicorun/badges/pizzadino.png'
    },
    {
        id: 'badge-gelato-bear',
        name: '젤라또 베어',
        description: '입에서 살살 녹는 젤라또 콘을 입은 분홍 곰돌이',
        price: 1,
        category: 'badge',
        value: '/chicorun/badges/gelato-bear.png'
    },
    {
        id: 'badge-vespa-cat',
        name: '베스파 냥이',
        description: '이탈리아 빈티지 스쿠터를 타는 쿨한 검은 고양이',
        price: 1,
        category: 'badge',
        value: '/chicorun/badges/vespa-cat.png'
    },
    {
        id: 'badge-leaning-giraffe',
        name: '피사의 기린',
        description: '피사의 사탑처럼 살짝 기울어진 요리사 모자 기린',
        price: 1,
        category: 'badge',
        value: '/chicorun/badges/leaning-giraffe.png'
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
    {
        id: 'sticker-sun-sparkle',
        name: '눈부신 태양',
        description: '반짝반짝 빛나는 블링블링 태양 (Bling)',
        price: 1,
        category: 'sticker',
        value: '/chicorun/stickers/sun-sparkle.svg'
    },
    {
        id: 'sticker-cool-shades',
        name: '선글라스 표정',
        description: '자신감 넘치는 쿨한 선글라스 페이스 (Emoji)',
        price: 1,
        category: 'sticker',
        value: '/chicorun/stickers/cool-shades.svg'
    },
    {
        id: 'sticker-go-text',
        name: '고! 전진',
        description: '속도감이 느껴지는 펑키한 GO! 텍스트 (Text)',
        price: 2,
        category: 'sticker',
        value: '/chicorun/stickers/go-text.svg'
    },
    {
        id: 'sticker-pastel-moon',
        name: '파스텔 달님',
        description: '포근하고 은은한 느낌의 파스텔 달 (Pastel)',
        price: 1,
        category: 'sticker',
        value: '/chicorun/stickers/pastel-moon.svg'
    },
    {
        id: 'sticker-vivid-fire',
        name: '활활 불꽃',
        description: '열정적인 에너지를 뿜는 비비드 불꽃 (Vivid)',
        price: 2,
        category: 'sticker',
        value: '/chicorun/stickers/vivid-fire.svg'
    },

    // Borders
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


