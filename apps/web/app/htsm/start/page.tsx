import type { Metadata } from 'next';
import SelfSelectionPage from '@/contents/htsm/self-selection-page';

export const metadata: Metadata = {
    title: '남들이 보는 나와 내가 보는 나',
    description:
        '나를 가장 잘 표현하는 3가지 키워드를 선택하세요. 친구들의 선택과 비교하여 Johari Window 결과를 확인할 수 있습니다.',
    alternates: {
        canonical: 'https://box.haroo.site/htsm/start',
    },
    openGraph: {
        title: '남들이 보는 나와 내가 보는 나 | 자아탐험',
        description: '나를 가장 잘 표현하는 3가지 키워드를 선택하세요.',
        url: 'https://box.haroo.site/htsm/start',
    },
};

export default function HtsmStartPage() {
    return <SelfSelectionPage />;
}
