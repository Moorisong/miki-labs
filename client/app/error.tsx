'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // 운영 환경이라면 Sentry 등의 도구로 에러를 전송하는 로직을 여기에 추가할 수 있습니다.
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'var(--font-geist-sans), sans-serif'
        }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#38bdf8' }}>
                앗! 잠시 문제가 발생했습니다
            </h1>
            <p style={{ marginBottom: '2rem', color: '#94a3b8', lineHeight: '1.6' }}>
                애플리케이션을 로드하는 중 예상치 못한 오류가 발생했습니다.<br />
                아래 버튼을 눌러 다시 시도하거나 메인 페이지로 돌아가주세요.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    onClick={() => reset()}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#38bdf8',
                        color: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                    }}
                >
                    다시 시도하기
                </button>
                <Link
                    href="/"
                    style={{
                        padding: '12px 24px',
                        backgroundColor: 'transparent',
                        color: '#38bdf8',
                        border: '1px solid #38bdf8',
                        borderRadius: '8px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        transition: 'background-color 0.2s'
                    }}
                >
                    홈으로 가기
                </Link>
            </div>

            {process.env.NODE_ENV === 'development' && (
                <pre style={{
                    marginTop: '2rem',
                    padding: '16px',
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    maxWidth: '100%',
                    overflowX: 'auto',
                    color: '#ef4444'
                }}>
                    {error.message}
                </pre>
            )}
        </div>
    );
}
