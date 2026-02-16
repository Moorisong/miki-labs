import type { Metadata } from 'next';
import SharePage from '@/contents/htsm/share-page';

export const metadata: Metadata = {
    title: '테스트 공유하기',
    description:
        '친구들에게 테스트를 공유하세요. 3명 이상의 친구가 응답하면 Johari Window 결과가 열립니다.',
    openGraph: {
        title: '테스트 공유하기 | 자아탐험',
        description: '친구들에게 테스트를 공유하세요.',
    },
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function HtsmSharePage({ params }: PageProps) {
    const { id } = await params;
    return <SharePage shareId={id} />;
}
