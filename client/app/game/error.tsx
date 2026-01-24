'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GameError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Game Page Error:', error);
    }, [error]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            margin: '20px auto',
            maxWidth: '600px',
            borderRadius: '16px',
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            textAlign: 'center',
            color: '#f8fafc'
        }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏗️</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#38bdf8' }}>
                게임 실행 중 오류가 발생했습니다
            </h2>
            <p style={{ marginBottom: '2rem', color: '#94a3b8', lineHeight: '1.6' }}>
                기기의 그래픽 가속(WebGL) 설정이나 일시적인 네트워크 문제일 수 있습니다.<br />
                인형뽑기 기계를 다시 불러오겠습니까?
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    onClick={() => reset()}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#38bdf8',
                        color: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    기계 다시 불러오기
                </button>
                <Link
                    href="/"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: 'transparent',
                        color: '#94a3b8',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        fontWeight: '600',
                        textDecoration: 'none'
                    }}
                >
                    로비로 돌아가기
                </Link>
            </div>
        </div>
    );
}
