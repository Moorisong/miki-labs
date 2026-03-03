import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import NumberSlot from '../components/NumberSlot';
import MyorokBanner from '../components/MyorokBanner';
import KakaoAdfit, { ADFIT_UNITS, ADFIT_SIZES } from '../components/KakaoAdFit';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { pickRandomNumbers } from '../utils/random';
import { APP_TITLES } from '../constants/app';

const NumberPicker: React.FC = () => {
    // State for settings
    const [totalStudents, setTotalStudents] = useState<number>(30);
    const [pickCount, setPickCount] = useState<number>(1);
    const [excludeInput, setExcludeInput] = useState<string>('');

    // State for execution
    const [results, setResults] = useState<number[]>([]);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [animationDoneCount, setAnimationDoneCount] = useState<number>(0);

    // Load settings on mount
    useEffect(() => {
        const savedTotal = loadFromStorage(STORAGE_KEYS.TOTAL_STUDENTS, 30);
        const savedCount = loadFromStorage(STORAGE_KEYS.PICK_COUNT, 1);
        const savedExclude = loadFromStorage(STORAGE_KEYS.EXCLUDE_LIST, []);

        setTotalStudents(savedTotal);
        setPickCount(savedCount);
        setExcludeInput(savedExclude.join(', '));
    }, []);

    // Save settings when changed
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.TOTAL_STUDENTS, totalStudents);
        saveToStorage(STORAGE_KEYS.PICK_COUNT, pickCount);
        const excludeList = parseExcludeInput(excludeInput);
        saveToStorage(STORAGE_KEYS.EXCLUDE_LIST, excludeList);
    }, [totalStudents, pickCount, excludeInput]);

    const parseExcludeInput = (input: string): number[] => {
        return input
            .split(',')
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n));
    };

    const handleStart = () => {
        if (isAnimating) return;

        const excludeList = parseExcludeInput(excludeInput);

        if (totalStudents < 1) {
            alert('전체 인원은 1명 이상이어야 합니다.');
            return;
        }
        if (pickCount < 1) {
            alert('뽑을 인원은 1명 이상이어야 합니다.');
            return;
        }
        const possibleCount = totalStudents - excludeList.filter(n => n <= totalStudents).length;
        if (pickCount > possibleCount) {
            alert(`뽑을 수 있는 인원이 부족합니다. (가능: ${possibleCount}명)`);
            return;
        }

        try {
            const newResults = pickRandomNumbers(totalStudents, pickCount, excludeList);
            setResults(newResults);
            setIsAnimating(true);
            setAnimationDoneCount(0);
        } catch (e) {
            alert('번호 추첨 중 오류가 발생했습니다.');
            console.error(e);
        }
    };

    const handleAnimationComplete = () => {
        setAnimationDoneCount(prev => prev + 1);
    };

    useEffect(() => {
        if (isAnimating && animationDoneCount >= pickCount) {
            setIsAnimating(false);
        }
    }, [animationDoneCount, pickCount, isAnimating]);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #f8faff 0%, #f0f4f8 100%)',
            fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif"
        }}>
            <Header />
            <div className="container" style={{ maxWidth: '640px', padding: '2.5rem 1.5rem' }}>
                {/* 타이틀 */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{
                        fontSize: '2.2rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0,
                        letterSpacing: '-0.02em'
                    }}>
                        {APP_TITLES.NUMBER}
                    </h1>
                    <p style={{ color: '#667', marginTop: '0.6rem', fontSize: '1rem', fontWeight: '500' }}>
                        정정당당! 랜덤으로 번호를 추첨합니다
                    </p>
                </div>

                {/* 설정 필드 카드 */}
                <div style={{
                    background: '#ffffff',
                    padding: '1.2rem 1.5rem',
                    borderRadius: '24px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                    border: '1px solid #e2e2ea',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {[
                            { label: '전체 인원', unit: '명', value: totalStudents, type: 'number', onChange: (v: any) => setTotalStudents(parseInt(v) || 0), min: 1 },
                            { label: '뽑을 인원', unit: '명', value: pickCount, type: 'number', onChange: (v: any) => setPickCount(parseInt(v) || 0), min: 1 },
                            { label: '제외 번호', unit: '', value: excludeInput, type: 'text', onChange: (v: any) => setExcludeInput(v), placeholder: '예: 5, 12' }
                        ].map((field, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.2rem 0'
                            }}>
                                <label style={{
                                    color: '#445',
                                    fontWeight: '600',
                                    fontSize: '1rem',
                                    flex: '1'
                                }}>
                                    {field.label}
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: '1.5', justifyContent: 'flex-end' }}>
                                    <input
                                        type={field.type}
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        placeholder={field.placeholder}
                                        min={field.min}
                                        disabled={isAnimating}
                                        style={{
                                            padding: '0.5rem 0.8rem',
                                            fontSize: '1rem',
                                            width: field.type === 'number' ? '80px' : '100%',
                                            textAlign: field.type === 'number' ? 'center' : 'left',
                                            border: '1px solid #e2e2ea',
                                            borderRadius: '12px',
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                            background: '#fcfcfe',
                                            fontWeight: '600',
                                            color: '#334'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#4A90E2';
                                            e.target.style.background = '#fff';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#f0f0f5';
                                            e.target.style.background = '#fcfcfe';
                                        }}
                                    />
                                    {field.unit && <span style={{ color: '#889', fontWeight: '500', width: '20px' }}>{field.unit}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 결과 영역 */}
                <div style={{
                    minHeight: '220px',
                    marginBottom: '2.5rem',
                    padding: '2.5rem',
                    background: '#ffffff',
                    borderRadius: '24px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                    border: '1px solid #e2e2ea',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* 장식용 배경 로고 */}
                    <div style={{
                        position: 'absolute',
                        opacity: 0.03,
                        fontSize: '10rem',
                        fontWeight: '900',
                        color: '#4A90E2',
                        pointerEvents: 'none',
                        zIndex: 0
                    }}>
                        ?
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        width: '100%',
                        zIndex: 1
                    }}>
                        {results.length > 0 ? (
                            results.map((num, idx) => (
                                <NumberSlot
                                    key={`${isAnimating ? 'anim' : 'static'}-${idx}`}
                                    targetNumber={num}
                                    isAnimating={isAnimating}
                                    index={idx}
                                    onAnimationComplete={handleAnimationComplete}
                                />
                            ))
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                color: '#bbc',
                                fontWeight: '500'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎯</div>
                                <div style={{ fontSize: '1.1rem' }}>아래 버튼을 눌러 추첨을 시작하세요</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 제어 버튼 */}
                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={handleStart}
                        disabled={isAnimating}
                        style={{
                            fontSize: '1.15rem',
                            padding: '1rem 4rem',
                            background: isAnimating
                                ? '#e0e0e0'
                                : 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '16px',
                            cursor: isAnimating ? 'not-allowed' : 'pointer',
                            fontWeight: '700',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            boxShadow: isAnimating ? 'none' : '0 8px 25px rgba(74,144,226,0.25)',
                            transform: isAnimating ? 'scale(0.98)' : 'scale(1)'
                        }}
                        onMouseEnter={(e) => {
                            if (!isAnimating) {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(74,144,226,0.35)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isAnimating) {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(74,144,226,0.25)';
                            }
                        }}
                    >
                        {isAnimating ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="spinner">⏳</span> 추첨 중...
                            </div>
                        ) : '추첨 시작하기'}
                    </button>
                </div>

                {/* 팁 안내 */}
                <div style={{
                    marginTop: '2.5rem',
                    textAlign: 'center',
                    color: '#99a',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                }}>
                    <span style={{ color: '#4A90E2', marginRight: '4px' }}>•</span>
                    설정값은 브라우저에 자동으로 안전하게 보관됩니다
                </div>

                {/* 하단 배너 및 광고 */}
                <div style={{ marginTop: '3.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0 1rem' }}>
                        <KakaoAdfit
                            unit={ADFIT_UNITS.MAIN_BANNER}
                            width="100%"
                            height={ADFIT_SIZES.BANNER_320x100.height}
                        />
                        <div style={{ width: '100%', margin: '0' }}>
                            <MyorokBanner />
                        </div>
                    </div>
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
        </div>
    );
};

export default NumberPicker;
