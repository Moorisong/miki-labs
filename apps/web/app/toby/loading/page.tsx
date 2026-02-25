import type { Metadata } from 'next';
import TobyLoadingPage from '@/contents/toby/loading-page';

export const metadata: Metadata = {
    title: 'TOBY 준비 중',
    description: '광고를 클릭하고 TOBY를 시작하세요.',
};

export default function TobyLoadingRoute() {
    return <TobyLoadingPage />;
}
