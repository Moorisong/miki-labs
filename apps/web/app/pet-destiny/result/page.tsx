import { Suspense } from 'react';
import ResultPage from '@/contents/pet-destiny/result-page';

function LoadingFallback() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a1a2e'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', animation: 'spin 1s linear infinite' }}>✨</div>
                <p style={{ color: '#9ca3af', marginTop: '1rem' }}>결과를 불러오는 중...</p>
            </div>
        </div>
    );
}

export default function PetDestinyResultPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ResultPage />
        </Suspense>
    );
}
