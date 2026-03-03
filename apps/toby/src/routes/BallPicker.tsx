import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import MyorokBanner from '../components/MyorokBanner';
import KakaoAdfit, { ADFIT_UNITS, ADFIT_SIZES } from '../components/KakaoAdFit';
import { PhysicsEngine } from '../canvas/PhysicsEngine';
import { Ball } from '../canvas/Ball';
import { APP_TITLES } from '../constants/app';

const BallPicker: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<PhysicsEngine | null>(null);
    const requestRef = useRef<number>(0);

    // Settings
    const [totalBalls, setTotalBalls] = useState<number>(30);
    const [gameMode, setGameMode] = useState<1 | 2>(1);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [winner, setWinner] = useState<number | null>(null);
    const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
    const frameCountRef = useRef<number>(0);
    const simulationSpeedRef = useRef<number>(1);
    const accumulatorRef = useRef<number>(0);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const isPausedRef = useRef<boolean>(false);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    useEffect(() => {
        simulationSpeedRef.current = simulationSpeed;
    }, [simulationSpeed]);

    useEffect(() => {
        if (canvasRef.current && !engineRef.current) {
            engineRef.current = new PhysicsEngine(canvasRef.current.width, canvasRef.current.height, gameMode);
        }
    }, []);

    const handleModeChange = (mode: 1 | 2) => {
        setGameMode(mode);
        if (engineRef.current) {
            engineRef.current.setMode(mode);
        }
    };

    const startSimulation = () => {
        if (!canvasRef.current || !engineRef.current) return;
        if (totalBalls < 1) {
            alert('공의 개수는 1개 이상이어야 합니다.');
            return;
        }

        setIsPlaying(true);
        setIsPaused(false);
        setWinner(null);
        frameCountRef.current = 0;
        accumulatorRef.current = 0;
        cancelAnimationFrame(requestRef.current);

        const engine = engineRef.current;

        if (gameMode === 2) {
            engine.setMode(2);
        }

        engine.clear();

        const colors = ['#4AA8FF', '#FF6B9D', '#FFE66D', '#7CB342', '#FF8A65', '#9575CD', '#FFB74D', '#BA68C8'];

        const ballOrder = Array.from({ length: totalBalls }, (_, i) => i + 1);
        for (let i = ballOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ballOrder[i], ballOrder[j]] = [ballOrder[j], ballOrder[i]];
        }

        ballOrder.forEach((ballNumber, index) => {
            setTimeout(() => {
                if (!engineRef.current) return;

                const xOffset = (Math.random() - 0.5) * (100 + index * 5);
                const yOffset = Math.random() * 80 - 60 - (index * 8);

                const x = (engine.width / 2) + xOffset;
                const y = yOffset;
                const color = colors[ballNumber % colors.length];

                const ball = new Ball(x, y, 15, ballNumber, color);

                const speedMultiplier = 1 + (index * 0.05);
                ball.vx *= speedMultiplier;
                ball.vy *= speedMultiplier;

                engine.addBall(ball);
            }, index * 120);
        });

        animate();
    };

    const animate = () => {
        if (!canvasRef.current || !engineRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const engine = engineRef.current;

        if (!isPausedRef.current) {
            frameCountRef.current++;

            // 1.0 속도를 기존보다 더 느리게(0.6배속) 설정
            const baseSpeedMultiplier = 0.6;
            accumulatorRef.current += simulationSpeedRef.current * baseSpeedMultiplier;

            let updatesThisFrame = 0;
            while (accumulatorRef.current >= 1 && updatesThisFrame < 3) {
                engine.update();
                accumulatorRef.current -= 1;
                updatesThisFrame++;
            }
        }

        engine.draw(ctx);

        if (!isPausedRef.current) {
            const goalBall = engine.getGoalBall();
            if (goalBall) {
                setWinner(goalBall.number);
                setIsPlaying(false);
                setIsPaused(false);
                cancelAnimationFrame(requestRef.current);
                return;
            }
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        return () => {
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #f8faff 0%, #f0f4f8 100%)',
            fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif"
        }}>
            <Header />
            <div className="container" style={{ maxWidth: '900px', padding: '2rem 1.5rem' }}>
                {/* 타이틀 영역 */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0,
                        letterSpacing: '-0.02em'
                    }}>
                        {APP_TITLES.BALL}
                    </h1>
                    <p style={{ color: '#667', marginTop: '0.6rem', fontSize: '1rem', fontWeight: '500' }}>
                        {gameMode === 1 ? '고정된 코스에서 레이싱으로 1등 뽑기' : '매번 새로운 랜덤 코스! 1등은 누구?'}
                    </p>
                </div>

                {/* 컨트롤 패널 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'stretch', // 세로 높이 통일을 위해 stretch
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    padding: '1.2rem',
                    background: '#ffffff',
                    borderRadius: '24px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                    border: '1px solid #e2e2ea',
                    flexWrap: 'wrap'
                }}>
                    {/* 모드 선택 섹션 */}
                    <div style={{
                        display: 'flex',
                        gap: '0.4rem',
                        background: '#f8f9fa',
                        padding: '0.4rem',
                        borderRadius: '16px',
                        border: '1px solid #eee'
                    }}>
                        <button
                            onClick={() => handleModeChange(1)}
                            disabled={isPlaying}
                            style={{
                                background: gameMode === 1 ? '#ffffff' : 'transparent',
                                color: gameMode === 1 ? '#4A90E2' : '#889',
                                padding: '0 1.2rem',
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: gameMode === 1 ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                cursor: isPlaying ? 'not-allowed' : 'pointer',
                                opacity: isPlaying && gameMode !== 1 ? 0.5 : 1,
                                transition: 'all 0.2s ease',
                                minHeight: '44px'
                            }}
                        >
                            고정 맵
                        </button>
                        <button
                            onClick={() => handleModeChange(2)}
                            disabled={isPlaying}
                            style={{
                                background: gameMode === 2 ? '#ffffff' : 'transparent',
                                color: gameMode === 2 ? '#E24A90' : '#889',
                                padding: '0 1.2rem',
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: gameMode === 2 ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                cursor: isPlaying ? 'not-allowed' : 'pointer',
                                opacity: isPlaying && gameMode !== 2 ? 0.5 : 1,
                                transition: 'all 0.2s ease',
                                minHeight: '44px'
                            }}
                        >
                            랜덤 맵
                        </button>
                    </div>

                    {/* 공 개수 설정 */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        padding: '0 1.2rem',
                        borderRadius: '16px',
                        border: '1px solid #e2e2ea',
                        background: '#fcfcfe'
                    }}>
                        <span style={{ color: '#445', fontWeight: '600', fontSize: '0.95rem' }}>공 개수</span>
                        <input
                            type="number"
                            value={totalBalls}
                            onChange={(e) => setTotalBalls(parseInt(e.target.value) || 0)}
                            style={{
                                width: '70px',
                                padding: '0.4rem',
                                fontSize: '1rem',
                                fontWeight: '700',
                                textAlign: 'center',
                                background: 'transparent',
                                border: 'none',
                                color: '#334',
                                outline: 'none'
                            }}
                            min="1"
                            max="50"
                            disabled={isPlaying}
                        />
                        <span style={{ color: '#889', fontWeight: '500', fontSize: '0.95rem' }}>개</span>
                    </div>

                    {/* 속도 조절 */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0 0.5rem',
                        borderRadius: '16px',
                        background: 'transparent',
                    }}>
                        <span style={{ color: '#445', fontWeight: '600', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>⚡ 속도</span>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.25"
                            value={simulationSpeed}
                            onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                            className="speed-range"
                        />
                        <span style={{
                            color: '#4A90E2',
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            minWidth: '45px',
                            textAlign: 'left'
                        }}>
                            {simulationSpeed.toFixed(2)}x
                        </span>
                    </div>

                    {/* 시작 / 일시정지 버튼 */}
                    <button
                        onClick={() => {
                            if (!isPlaying) {
                                startSimulation();
                            } else {
                                setIsPaused(!isPaused);
                            }
                        }}
                        style={{
                            background: !isPlaying
                                ? 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)'
                                : isPaused
                                    ? 'linear-gradient(135deg, #FFB74D 0%, #F57C00 100%)' // 다시 시작 (주황색 계열)
                                    : 'linear-gradient(135deg, #666 0%, #444 100%)',      // 일시정지 (회색/검정 계열)
                            border: 'none',
                            color: '#fff',
                            padding: '0 2.5rem',
                            fontSize: '1.1rem',
                            fontWeight: '800',
                            borderRadius: '16px',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            minHeight: '52px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                        }}
                    >
                        {!isPlaying ? '시작하기' : isPaused ? '다시 시작' : '일시정지'}
                    </button>
                </div>

                {/* 팁 안내 */}
                <div style={{
                    textAlign: 'center',
                    color: '#99a',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    marginBottom: '1.5rem'
                }}>
                    <span style={{ color: gameMode === 1 ? '#4A90E2' : '#E24A90', marginRight: '6px' }}>•</span>
                    {gameMode === 1
                        ? '고정 맵: 항상 같은 장애물 배치로 공정한 레이스'
                        : '랜덤 맵: 매번 공이 어디로 튈지 모르는 짜릿함!'}
                </div>

                {/* 캔버스 영역 */}
                <div style={{
                    position: 'relative',
                    width: 'fit-content',
                    margin: '0 auto',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}>
                    <canvas
                        ref={canvasRef}
                        id="ball-canvas"
                        width="800"
                        height="600"
                        style={{
                            display: 'block',
                            border: '2px solid #ddd',
                            borderRadius: '16px',
                            backgroundColor: '#000'
                        }}
                    />

                    {/* 승자 모달 */}
                    {winner !== null && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0, 0, 0, 0.85)',
                            backdropFilter: 'blur(5px)'
                        }}>
                            <div style={{
                                background: '#1a1a2e',
                                border: '2px solid #444',
                                padding: '2.5rem 4rem',
                                borderRadius: '24px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                textAlign: 'center',
                                animation: 'popIn 0.3s ease'
                            }}>
                                <div style={{
                                    fontSize: '1.2rem',
                                    color: '#FFFF00',
                                    textShadow: '0 0 15px #FFFF00',
                                    marginBottom: '0.5rem',
                                    letterSpacing: '3px'
                                }}>
                                    🏆 WINNER 🏆
                                </div>
                                <div style={{
                                    fontSize: '7rem',
                                    fontWeight: 'bold',
                                    color: '#ffffff',
                                    lineHeight: 1
                                }}>
                                    {winner}
                                </div>
                                <button
                                    onClick={() => setWinner(null)}
                                    style={{
                                        marginTop: '1.5rem',
                                        background: '#444',
                                        border: '2px solid #666',
                                        color: '#fff',
                                        padding: '0.6rem 2rem',
                                        fontSize: '1rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 묘록 광고 배너 및 카카오 애드핏 */}
                <div style={{ marginTop: '2.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '800px', padding: '0 1rem' }}>
                        <KakaoAdfit
                            unit={ADFIT_UNITS.MAIN_BANNER}
                            width="100%"
                            height={ADFIT_SIZES.BANNER_320x100.height}
                        />
                    </div>
                    <MyorokBanner />
                </div>
            </div>

            {/* 하단 푸터 */}
            <div style={{
                marginTop: '1rem',
                paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))',
                color: '#aaa',
                fontSize: '0.85rem',
                textAlign: 'center'
            }}>
                Made with ❤️ for teachers
            </div>

            {/* CSS 애니메이션 */}
            <style>{`
                @keyframes popIn {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }

                .speed-range {
                    -webkit-appearance: none;
                    width: 100px;
                    height: 4px;
                    background: #e2e2ea;
                    border-radius: 2px;
                    outline: none;
                    margin: 0;
                    cursor: pointer;
                }

                .speed-range::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 14px;
                    height: 14px;
                    background: #4A90E2;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    border: none;
                    margin-top: -5px; /* (height-thumb_height)/2 = (4-14)/2 */
                }

                .speed-range::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    background: #4A90E2;
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                }

                /* Active track progress (Chrome only trick) */
                .speed-range::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 4px;
                    cursor: pointer;
                    background: #e2e2ea;
                    border-radius: 2px;
                    border: none;
                }
            `}</style>
        </div>
    );
};

export default BallPicker;
