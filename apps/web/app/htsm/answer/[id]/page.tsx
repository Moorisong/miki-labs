import type { Metadata } from 'next';
import FriendAnswerPage from '@/contents/htsm/friend-answer-page';

export const metadata: Metadata = {
    title: '친구의 키워드를 선택해주세요',
    description:
        '친구를 가장 잘 표현하는 3가지 키워드를 익명으로 선택해주세요. 10초면 충분해요!',
    openGraph: {
        title: '친구의 키워드를 선택해주세요 | HowTheySeeMe',
        description: '친구를 가장 잘 표현하는 3가지 키워드를 익명으로 선택해주세요.',
    },
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function HtsmAnswerPage({ params }: PageProps) {
    const { id } = await params;
    return <FriendAnswerPage shareId={id} />;
}
