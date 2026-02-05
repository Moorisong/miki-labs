import type { Metadata } from 'next';
import InputPage from '@/contents/pet-destiny/input-page';

export const metadata: Metadata = {
    title: '동물 운명연구소 | 반려동물 운세·성격·궁합 분석',
    description: '동물 운명연구소는 반려동물과 집사의 생년월일을 기반으로 오행 명리학으로 분석하는 재미있는 운세 서비스입니다. 성격 분석, 건강 운, 궁합, 올해 운세까지 확인하세요.',
    keywords: [
        '동물 운명연구소', '반려동물 운세', '집사 궁합', '반려동물 성격 분석',
        '반려동물 건강 운', '마음 경계 지수', '올해 운세', '오행', '명리학',
        '사주', '운세 콘텐츠', '엔터테인먼트 운세', '반려동물 궁합',
        '궁합 점수', '평생 건강 운', '운세 결과'
    ],
    alternates: {
        canonical: 'https://box.haroo.site/pet-destiny',
    },
    openGraph: {
        title: '동물 운명연구소 | 반려동물 운세·성격·궁합 분석',
        description: '반려동물과 집사의 생년월일을 기반으로 오행 명리학으로 분석하는 재미있는 운세 서비스입니다.',
        url: 'https://box.haroo.site/pet-destiny',
        images: [
            {
                url: 'https://box.haroo.site/pet-destiny-og-v2.png',
                width: 1024,
                height: 1024,
                alt: '동물 운명연구소',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: '동물 운명연구소 | 반려동물 운세·성격·궁합 분석',
        description: '반려동물과 집사의 생년월일을 기반으로 오행 명리학으로 분석하는 재미있는 운세 서비스입니다.',
        images: ['https://box.haroo.site/pet-destiny-og-v2.png'],
    },
};

export default function PetDestinyPage() {
    return <InputPage />;
}
