import React from 'react';

/**
 * 묘록(Myorok) 교차 홍보 배너 컴포넌트
 * - 하루상자 디자인 가이드에 맞춘 광고 배너
 * - CSS 클래스는 global.css의 .myorok-* 사용
 */
const MyorokBanner: React.FC = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
            <a
                href="https://myorok.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="myorok-banner"
            >
                <div className="myorok-banner-content">
                    {/* 앱 아이콘 */}
                    <div className="myorok-icon-section">
                        <img
                            src="/myorok-icon.png"
                            alt="묘록 앱 아이콘"
                            className="myorok-app-icon"
                        />
                    </div>

                    {/* 텍스트 영역 */}
                    <div className="myorok-text-section">
                        <span className="myorok-label">고양이 집사를 위한 추천 앱</span>
                        <h4 className="myorok-title">
                            <span className="myorok-desktop-only">환묘 및 고양이 건강 기록 앱, 묘록</span>
                            <span className="myorok-mobile-only">고양이 건강 기록 앱, 묘록</span>
                        </h4>
                        <p className="myorok-description">
                            배변 기록 · 투약 현황 · 건강 상태 메모를 한 곳에서 관리하세요
                        </p>
                    </div>

                    {/* CTA 버튼 */}
                    <div className="myorok-cta-section">
                        <span className="myorok-cta-button">앱 보러가기 →</span>
                    </div>
                </div>
            </a>
        </div>
    );
};

export default MyorokBanner;
