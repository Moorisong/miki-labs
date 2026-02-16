import type { Metadata } from 'next';
import ResultPage from '@/contents/htsm/result-page';

export const metadata: Metadata = {
    title: 'Johari Window 결과',
    description:
        '나와 친구들의 키워드를 비교한 Johari Window 결과를 확인하세요. Open, Blind, Hidden, Unknown 4가지 영역으로 분석됩니다.',
    openGraph: {
        title: 'Johari Window 결과 | 자아탐험',
        description: '나와 친구들의 키워드를 비교한 Johari Window 결과를 확인하세요.',
        images: [
            {
                url: 'https://box.haroo.site/htsm-og-result.png',
                width: 1200,
                height: 630,
                alt: 'HTSM Result',
            },
        ],
    },
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function HtsmResultPage({ params }: PageProps) {
    const { id } = await params;
    return <ResultPage shareId={id} />;
}
