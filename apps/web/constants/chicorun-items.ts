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
        price: 500,
        category: 'background',
        value: 'linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)',
        previewStyle: { background: 'linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)' }
    },
    {
        id: 'bg-premium-vivid',
        name: '트로피컬 프리즘',
        description: '강렬하고 화려한 비비드 혼합색 그라데이션',
        price: 500,
        category: 'background',
        value: 'linear-gradient(135deg, #FF0844 0%, #FFB199 50%, #FFD700 100%)',
        previewStyle: { background: 'linear-gradient(135deg, #FF0844 0%, #FFB199 50%, #FFD700 100%)' }
    },
    {
        id: 'bg-premium-neon',
        name: '네온 시티나이트',
        description: '진한 바탕에 세련된 네온 블루가 감도는 사이버 무드',
        price: 500,
        category: 'background',
        value: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)',
        previewStyle: { background: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)' }
    },
    {
        id: 'bg-sunset-mirage',
        name: '선셋 미라지',
        description: '황홀한 태양빛을 닮은 보라-핑크 그라데이션 (Vivid)',
        price: 500,
        category: 'background',
        value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        previewStyle: { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
    },
    {
        id: 'bg-emerald-aurora',
        name: '에메랄드 오로라',
        description: '청량한 숲의 기운을 담은 그린-민트 그라데이션 (Pastel)',
        price: 500,
        category: 'background',
        value: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)',
        previewStyle: { background: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)' }
    },
    {
        id: 'bg-midnight-velvet',
        name: '미드나잇 벨벳',
        description: '깊고 중후한 멋의 다크 네이비 그라데이션 (Dark)',
        price: 500,
        category: 'background',
        value: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
        previewStyle: { background: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' }
    },
    {
        id: 'bg-cyber-neon',
        name: '사이버 네온 핑크',
        description: '강렬한 대비를 이루는 네온 시안-핑크 (Neon)',
        price: 500,
        category: 'background',
        value: 'linear-gradient(to right, #00dbde 0%, #fc00ff 100%)',
        previewStyle: { background: 'linear-gradient(to right, #00dbde 0%, #fc00ff 100%)' }
    },
    {
        id: 'bg-lemon-chiffon',
        name: '레몬 쉬폰',
        description: '부드럽고 밝은 느낌의 단색 파스텔 옐로우 (Simple)',
        price: 500,
        category: 'background',
        value: '#fff9c4',
        previewStyle: { background: '#fff9c4' }
    },

    // Badges (Italian Brainrot Style Characters)
    {
        id: 'badge-pasta-rex',
        name: '파스타 렉스',
        description: '스파게티 몸에 미트볼 눈을 가진 개구쟁이 파스타 공룡',
        price: 300,
        category: 'badge',
        value: '/chicorun/badges/pasta-rex.png'
    },
    {
        id: 'badge-pizzadino',
        name: '피자 다이노',
        description: '머리에 맛있는 페퍼로니 피자를 얹은 초식 공룡',
        price: 300,
        category: 'badge',
        value: '/chicorun/badges/pizzadino.png'
    },
    {
        id: 'badge-gelato-bear',
        name: '젤라또 베어',
        description: '입에서 살살 녹는 젤라또 콘을 입은 분홍 곰돌이',
        price: 300,
        category: 'badge',
        value: '/chicorun/badges/gelato-bear.png'
    },
    {
        id: 'badge-vespa-cat',
        name: '베스파 냥이',
        description: '이탈리아 빈티지 스쿠터를 타는 쿨한 검은 고양이',
        price: 300,
        category: 'badge',
        value: '/chicorun/badges/vespa-cat.png'
    },
    {
        id: 'badge-leaning-giraffe',
        name: '피사의 기린',
        description: '피사의 사탑처럼 살짝 기울어진 요리사 모자 기린',
        price: 300,
        category: 'badge',
        value: '/chicorun/badges/leaning-giraffe.png'
    },
    {
        id: 'badge-starter-star',
        name: '스타터 스타',
        description: '처음 시작하는 당신을 위한 반짝이는 별 배지 (기본)',
        price: 0,
        category: 'badge',
        value: '/chicorun/badges/badge-starter-star.png'
    },

    // Stickers
    // MZ Style Stickers (Bling-bling, Compact, Pretty)
    // MZ Style Stickers (Truly Transparent SVGs)
    {
        id: 'sticker-heart-mz',
        name: 'MZ 블러썸 하트 [Animated]',
        description: '두근두근 움직이는 핑크 블링 하트 (Pulsing)',
        price: 400,
        category: 'sticker',
        value: '/chicorun/mz-stickers/heart-pink.svg'
    },
    {
        id: 'sticker-star-mz',
        name: 'Y2K 메탈 스타 [Animated]',
        description: '반짝이며 커졌다 작아지는 실버 스타 (Twinkling)',
        price: 400,
        category: 'sticker',
        value: '/chicorun/mz-stickers/star-silver.svg'
    },
    {
        id: 'sticker-cherry-mz',
        name: '팝 체리',
        description: '광택이 흐르는 레드 더블 체리 (Glossy)',
        price: 300,
        category: 'sticker',
        value: '/chicorun/mz-stickers/cherry.svg'
    },
    {
        id: 'sticker-smiley-mz',
        name: '사이버 스마일 [Animated]',
        description: '눈을 깜빡이며 빛나는 네온 스마일리 (Blinking)',
        price: 400,
        category: 'sticker',
        value: '/chicorun/mz-stickers/smiley-neon.svg'
    },
    {
        id: 'sticker-butterfly-mz',
        name: '시스루 나비 [Animated]',
        description: '훨훨 날아다니는 퍼플 나비 (Aesthetic/Flapping)',
        price: 400,
        category: 'sticker',
        value: '/chicorun/mz-stickers/butterfly-blue.svg'
    },
    {
        id: 'sticker-diamond-mz',
        name: '프리즘 다이아 [Animated]',
        description: '영롱하게 회전하며 빛나는 보석 (Rotating)',
        price: 600,
        category: 'sticker',
        value: '/chicorun/mz-stickers/diamond-bling.svg'
    },
    {
        id: 'sticker-paw-mz',
        name: '젤리 냥발',
        description: '투명하고 말캉한 핑크 발바닥 (Jelly)',
        price: 300,
        category: 'sticker',
        value: '/chicorun/mz-stickers/paw-pink.svg'
    },
    {
        id: 'sticker-bubble-mz',
        name: '버블 클러스터',
        description: '몽글몽글 모여있는 파스텔 버블 (Pastel)',
        price: 300,
        category: 'sticker',
        value: '/chicorun/mz-stickers/bubble-cluster.svg'
    },
    {
        id: 'sticker-check-mz',
        name: 'MZ 체크박스',
        description: '트렌디한 느낌의 체크 마크 (Funky)',
        price: 300,
        category: 'sticker',
        value: '/chicorun/mz-stickers/check-mz.svg'
    },
    {
        id: 'sticker-eye-mz',
        name: '펑키 아이 [Animated]',
        description: '주변을 두리번거리며 깜빡이는 눈 (Unique/Looking)',
        price: 400,
        category: 'sticker',
        value: '/chicorun/mz-stickers/eye-mz.svg'
    },

    // Borders
    {
        id: 'border-solid',
        name: '솔리드 라인',
        description: '깔끔한 직선 테두리 (기본)',
        price: 0,
        category: 'border',
        value: 'solid',
        previewStyle: { borderStyle: 'solid', borderWidth: '4px', borderColor: '#cbd5e1' }
    },
    {
        id: 'border-dashed',
        name: '대시 라인',
        description: '세련된 점선 테두리',
        price: 300,
        category: 'border',
        value: 'dashed',
        previewStyle: { borderStyle: 'dashed', borderWidth: '4px', borderColor: '#3b82f6' }
    }
];



