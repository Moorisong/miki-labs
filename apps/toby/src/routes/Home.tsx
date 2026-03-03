import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/global.css';
import MyorokBanner from '../components/MyorokBanner';
import KakaoAdfit, { ADFIT_UNITS, ADFIT_SIZES } from '../components/KakaoAdFit';
import { APP_TITLES } from '../constants/app';

const tools = [
    {
        path: '/number',
        title: APP_TITLES.NUMBER,
        description: '학생 번호를 원하는만큼 랜덤으로 뽑기',
        color: '#4A90E2',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
        path: '/ball',
        title: APP_TITLES.BALL,
        description: '귀여운 공들의 레이스로 1등 뽑기',
        color: '#E24A90',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
        path: '/seat',
        title: APP_TITLES.SEAT,
        description: '교실 자리 랜덤으로 배치하기',
        color: '#50C878',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
    }
];

const Home: React.FC = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>

            {/* 로고 & 타이틀 */}
            <div style={{ textAlign: 'center', marginBottom: '3em' }}>
                <div style={{
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }}>
                    <img src="/toby/logo.png" alt="Toby Logo" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                </div>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: 0
                }}>
                    TOBY
                </h1>
                <p style={{
                    color: '#666',
                    fontSize: '1.1rem',
                    marginTop: '0.5rem',
                    fontWeight: '500'
                }}>
                    선생님을 위한 랜덤 도구
                </p>
            </div>

            {/* 도구 카드들 */}
            <div style={{
                display: 'grid',
                marginTop: '4em',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                width: '100%',
                maxWidth: '1000px'
            }}>
                {tools.map((tool) => (
                    <Link
                        key={tool.path}
                        to={tool.path}
                        style={{ textDecoration: 'none' }}
                    >
                        <div style={{
                            background: '#fff',
                            borderRadius: '20px',
                            padding: '2rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            border: '1px solid rgba(0,0,0,0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                            }}
                        >
                            {/* 그라데이션 악센트 */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: tool.gradient
                            }} />

                            {/* 제목 */}
                            <h2 style={{
                                fontSize: '1.4rem',
                                fontWeight: '700',
                                color: '#333',
                                margin: '0 0 0.5rem 0'
                            }}>
                                {tool.title}
                            </h2>

                            {/* 설명 */}
                            <p style={{
                                fontSize: '0.95rem',
                                color: '#888',
                                margin: 0,
                                lineHeight: '1.5'
                            }}>
                                {tool.description}
                            </p>

                            {/* 화살표 */}
                            <div style={{
                                position: 'absolute',
                                bottom: '1.5rem',
                                right: '1.5rem',
                                fontSize: '1.2rem',
                                color: tool.color,
                                opacity: 0.6
                            }}>
                                →
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* 광고 및 묘록 배너 */}
            <div style={{ marginTop: '7rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '800px', padding: '0 1rem' }}>
                    <KakaoAdfit
                        unit={ADFIT_UNITS.MAIN_BANNER}
                        width="100%"
                        height={ADFIT_SIZES.BANNER_320x100.height}
                    />
                </div>
                <MyorokBanner />
            </div>

            {/* 하단 푸터 */}
            <div style={{
                marginTop: '3rem',
                marginBottom: '3rem',
                color: '#aaa',
                fontSize: '0.85rem'
            }}>
                Made with ❤️ for teachers
            </div>
        </div>
    );
};

export default Home;
