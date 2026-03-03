import React, { useState } from 'react';

/**
 * 하루상자 바로가기 버튼 컴포넌트
 * - 하루상자 디자인 토큰 & 스타일 가이드 기반
 * - 호버 시 글로우 + 리프트 애니메이션
 */

const HAROO_TOKENS = {
    primary: '#6C5CE7',
    secondary: '#A29BFE',
    accent: '#FD79A8',
    bg: '#eceef1',
    surface: '#e2e5ea',
    text: '#444',
    textMuted: '#888',
    gradient: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
    shadowGlow: '0 0 16px rgba(108, 92, 231, 0.25)',
};

const HarooButton: React.FC = () => {
    const [hovered, setHovered] = useState(false);

    return (
        <a
            href="https://box.haroo.site"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 32px',
                background: HAROO_TOKENS.bg,
                borderRadius: '16px',
                border: `1px solid ${hovered ? 'rgba(108, 92, 231, 0.4)' : 'rgba(0, 0, 0, 0.06)'}`,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: hovered
                    ? `${HAROO_TOKENS.shadowGlow}, 0 6px 20px rgba(0, 0, 0, 0.1)`
                    : '0 2px 8px rgba(0, 0, 0, 0.06)',
                transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* 호버 오버레이 */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.08) 0%, rgba(162, 155, 254, 0.04) 100%)',
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                }}
            />

            {/* 로고 이미지 */}
            <img
                src="/toby/haroo-logo.png"
                alt="하루상자 로고"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    objectFit: 'contain',
                    flexShrink: 0,
                    transition: 'transform 0.3s ease',
                    transform: hovered ? 'scale(1.08)' : 'scale(1)',
                }}
            />

            {/* 텍스트 영역 */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <span
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: HAROO_TOKENS.text,
                        lineHeight: 1.2,
                        letterSpacing: '-0.02em',
                    }}
                >
                    하루상자
                </span>
                <span
                    style={{
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: HAROO_TOKENS.textMuted,
                        lineHeight: 1.4,
                        marginTop: '2px',
                    }}
                >
                    오늘의 작은 재미를 담다
                </span>
            </div>

            {/* 화살표 아이콘 */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: HAROO_TOKENS.gradient,
                    flexShrink: 0,
                    transition: 'transform 0.3s ease',
                    transform: hovered ? 'translateX(4px)' : 'translateX(0)',
                }}
            >
                <svg
                    viewBox="0 0 24 24"
                    style={{
                        width: '18px',
                        height: '18px',
                        fill: 'none',
                        stroke: '#fff',
                        strokeWidth: 2.5,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                    }}
                >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
            </div>
        </a>
    );
};

export default HarooButton;
