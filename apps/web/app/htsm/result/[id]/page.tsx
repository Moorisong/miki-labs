import { Metadata, ResolvingMetadata } from 'next';
import ResultPage from '@/contents/htsm/result-page';

export async function generateMetadata(
    { params }: PageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const url = `https://box.haroo.site/htsm/result/${id}`;

    return {
        title: '[자아탐험] 숨겨진 성격 결과가 공개되었습니다',
        description:
            '주변 사람들이 본 나의 모습까지 포함된 결과입니다. 생각보다 정확하고, 조금 놀랄 수도 있습니다.',
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: '[자아탐험] 숨겨진 성격 결과가 공개되었습니다',
            description: '주변 사람들이 본 나의 모습까지 포함된 결과입니다. 생각보다 정확하고, 조금 놀랄 수도 있습니다.',
            url: url,
            images: [
                {
                    url: 'https://box.haroo.site/htsm-og-result.png',
                    width: 1200,
                    height: 630,
                    alt: 'HTSM 결과 - See how they see me',
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: '[자아탐험] 숨겨진 성격 결과가 공개되었습니다',
            description: '주변 사람들이 본 나의 모습까지 포함된 결과입니다. 생각보다 정확하고, 조금 놀랄 수도 있습니다.',
            images: ['https://box.haroo.site/htsm-og-result.png'],
        },
    };
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function HtsmResultPage({ params }: PageProps) {
    const { id } = await params;
    return <ResultPage shareId={id} />;
}
