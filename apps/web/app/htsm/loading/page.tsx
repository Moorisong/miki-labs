import type { Metadata } from 'next';
import LoadingPage from '@/contents/htsm/loading-page';

export const metadata: Metadata = {
    title: '테스트 준비 중',
    description: '광고를 시청하고 테스트를 시작하세요.',
};

export default function HtsmLoadingNoIdPage() {
    return <LoadingPage />;
}
