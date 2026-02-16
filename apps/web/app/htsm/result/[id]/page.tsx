import type { Metadata } from 'next';
import ResultPage from '@/contents/htsm/result-page';

export const metadata: Metadata = {
    title: '[자아탐험] 숨겨진 성격 결과가 공개되었습니다',
    description:
        '주변 사람들이 본 나의 모습까지 포함된 결과입니다. 생각보다 정확하고, 조금 놀랄 수도 있습니다.',
    openGraph: {
        title: '[자아탐험] 숨겨진 성격 결과가 공개되었습니다',
        description: '주변 사람들이 본 나의 모습까지 포함된 결과입니다. 생각보다 정확하고, 조금 놀랄 수도 있습니다.',
        images: [
            {
                url: 'https://box.haroo.site/htsm-og-result.png',
                width: 1200,
                height: 630,
                alt: 'HTSM 결과 - See how they see me',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: '[자아탐험] 숨겨진 성격 결과가 공개되었습니다',
        description: '주변 사람들이 본 나의 모습까지 포함된 결과입니다. 생각보다 정확하고, 조금 놀랄 수도 있습니다.',
        images: ['https://box.haroo.site/htsm-og-result.png'],
    },
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function HtsmResultPage({ params }: PageProps) {
    const { id } = await params;
    return <ResultPage shareId={id} />;
}
