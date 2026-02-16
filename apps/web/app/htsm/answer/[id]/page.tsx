import { Metadata, ResolvingMetadata } from 'next';
import FriendAnswerPage from '@/contents/htsm/friend-answer-page';

export async function generateMetadata(
    { params }: PageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const url = `https://box.haroo.site/htsm/answer/${id}`;

    return {
        title: '[자아탐험] 친구를 가장 잘 표현하는 키워드를 선택해주세요',
        description:
            '당신의 선택 하나가 누군가의 ‘숨겨진 자아’를 완성합니다. 친구를 가장 잘 표현하는 3가지 키워드를 익명으로 선택해주세요.',
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: '[자아탐험] 친구를 가장 잘 표현하는 키워드를 선택해주세요',
            description: '당신의 선택 하나가 누군가의 ‘숨겨진 자아’를 완성합니다. 친구를 가장 잘 표현하는 3가지 키워드를 익명으로 선택해주세요.',
            url: url,
            images: [
                {
                    url: 'https://box.haroo.site/htsm-og-base.png?v=2',
                    width: 1200,
                    height: 630,
                    alt: '자아탐험 - 친구 평가하기',
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: '[자아탐험] 친구를 가장 잘 표현하는 키워드를 선택해주세요',
            description: '당신의 선택 하나가 누군가의 ‘숨겨진 자아’를 완성합니다. 친구를 가장 잘 표현하는 3가지 키워드를 익명으로 선택해주세요.',
            images: ['https://box.haroo.site/htsm-og-base.png?v=2'],
        },
    };
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function HtsmAnswerPage({ params }: PageProps) {
    const { id } = await params;
    return <FriendAnswerPage shareId={id} />;
}
