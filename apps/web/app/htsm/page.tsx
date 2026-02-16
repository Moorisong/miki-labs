import type { Metadata } from 'next';
import LandingPage from '@/contents/htsm/landing-page';

export const metadata: Metadata = {
    title: '자아탐험 | 친구들이 보는 나를 발견하세요',
    description:
        '자아탐험은 친구들의 익명 평가를 통해 "내가 보는 나"와 "남이 보는 나"를 비교하는 Johari Window 기반 심리 분석 서비스입니다. 10초만에 테스트를 만들어보세요.',
    keywords: [
        '자아탐험', 'HTSM', 'Johari Window', '조하리 창',
        '성격 분석', '심리 테스트', '친구 평가', '자기 인식',
        '바이럴 테스트', '익명 평가', '성격 키워드',
    ],
    alternates: {
        canonical: 'https://box.haroo.site/htsm',
    },
    openGraph: {
        title: '자아탐험 | 친구들이 보는 나를 발견하세요',
        description: '친구들의 익명 키워드 선택으로 Johari Window 결과를 확인하세요.',
        url: 'https://box.haroo.site/htsm',
        images: [
            {
                url: 'https://box.haroo.site/htsm-og-base.png',
                width: 1200,
                height: 630,
                alt: '자아탐험 - See how they see me',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: '자아탐험 | 친구들이 보는 나를 발견하세요',
        description: '친구들의 익명 키워드 선택으로 Johari Window 결과를 확인하세요.',
        images: ['https://box.haroo.site/htsm-og-base.png'],
    },
};

import { Suspense } from 'react';

export default function HtsmPage() {
    return (
        <Suspense fallback={null}>
            <LandingPage />
        </Suspense>
    );
}
