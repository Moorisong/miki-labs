import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import MyorokBanner from '../components/MyorokBanner';
import KakaoAdfit, { ADFIT_UNITS, ADFIT_SIZES } from '../components/KakaoAdFit';
import { toPng } from 'html-to-image';
import { APP_TITLES } from '../constants/app';

interface SeatData {
    display: string;
}

type SeatMode = 'number' | 'name';

const STORAGE_KEY_PAIRS = 'TRT_SEAT_PAIRS';
const STORAGE_KEY_COLS = 'TRT_SEAT_COLS';
const STORAGE_KEY_MODE = 'TRT_SEAT_MODE';
const STORAGE_KEY_NAMES = 'TRT_SEAT_NAMES';
const STORAGE_KEY_TOTAL = 'TRT_SEAT_TOTAL';
const SESSION_KEY_FIXED = 'TRT_SEAT_FIXED_SESSION';
const SESSION_KEY_EMPTY = 'TRT_SEAT_EMPTY_SESSION';

const SeatRandom: React.FC = () => {
    const [pairRows, setPairRows] = useState<number>(5);
    const [pairRowsInput, setPairRowsInput] = useState<string>('5');
    const [pairsPerRowDirect, setPairsPerRowDirect] = useState<number>(3);
    const [pairsPerRowInput, setPairsPerRowInput] = useState<string>('3');
    const [mode, setMode] = useState<SeatMode>('number');
    const [totalStudents, setTotalStudents] = useState<number>(30);
    const [totalStudentsInput, setTotalStudentsInput] = useState<string>('30');
    const [names, setNames] = useState<string[]>([]);
    const [nameInput, setNameInput] = useState<string>('');
    const [showNameInput, setShowNameInput] = useState<boolean>(false);
    const [seats, setSeats] = useState<(SeatData | null)[][]>([]);
    const [fixedSeats, setFixedSeats] = useState<Map<string, number>>(new Map());
    const [emptySeats, setEmptySeats] = useState<Set<string>>(new Set());
    const [showShuffleHint, setShowShuffleHint] = useState<boolean>(false);
    const gridRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Load settings
    useEffect(() => {
        const savedPairs = localStorage.getItem(STORAGE_KEY_PAIRS);
        const savedCols = localStorage.getItem(STORAGE_KEY_COLS);
        const savedMode = localStorage.getItem(STORAGE_KEY_MODE);
        const savedTotal = localStorage.getItem(STORAGE_KEY_TOTAL);
        const savedNames = localStorage.getItem(STORAGE_KEY_NAMES);
        const savedFixed = sessionStorage.getItem(SESSION_KEY_FIXED);
        const savedEmpty = sessionStorage.getItem(SESSION_KEY_EMPTY);

        if (savedPairs) { const v = parseInt(savedPairs); setPairRows(v); setPairRowsInput(String(v)); }
        if (savedCols) { const v = parseInt(savedCols); setPairsPerRowDirect(v); setPairsPerRowInput(String(v)); }
        if (savedMode) setMode(savedMode as SeatMode);
        if (savedTotal) { const v = parseInt(savedTotal); setTotalStudents(v); setTotalStudentsInput(String(v)); }
        if (savedNames) {
            const parsed = JSON.parse(savedNames);
            setNames(parsed);
            setNameInput(parsed.join('\n'));
        }
        if (savedFixed) {
            const parsed = JSON.parse(savedFixed);
            setFixedSeats(new Map(Object.entries(parsed).map(([k, v]) => [k, v as number])));
        }
        if (savedEmpty) {
            const parsed: string[] = JSON.parse(savedEmpty);
            setEmptySeats(new Set(parsed));
        }
    }, []);

    // 저장 함수
    const saveToStorage = (data: {
        pairRows?: number;
        pairsPerRowDirect?: number;
        totalStudents?: number;
        mode?: SeatMode;
        names?: string[];
    }) => {
        if (data.pairRows !== undefined) localStorage.setItem(STORAGE_KEY_PAIRS, data.pairRows.toString());
        if (data.pairsPerRowDirect !== undefined) localStorage.setItem(STORAGE_KEY_COLS, data.pairsPerRowDirect.toString());
        if (data.totalStudents !== undefined) localStorage.setItem(STORAGE_KEY_TOTAL, data.totalStudents.toString());
        if (data.mode !== undefined) localStorage.setItem(STORAGE_KEY_MODE, data.mode);
        if (data.names !== undefined) localStorage.setItem(STORAGE_KEY_NAMES, JSON.stringify(data.names));
    };

    // 이름 파싱
    const parseNames = (input: string): string[] => {
        return input
            .split(/[\n,，\t\s]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    };

    const handlePairRowsChange = (inputStr: string) => {
        setPairRowsInput(inputStr);
        const parsed = parseInt(inputStr, 10);
        if (!isNaN(parsed)) {
            const newVal = Math.max(1, Math.min(20, parsed));
            setPairRows(newVal);
            saveToStorage({ pairRows: newVal });
        }
    };

    const handlePairRowsBlur = () => {
        const clamped = Math.max(1, Math.min(20, parseInt(pairRowsInput, 10) || 1));
        setPairRows(clamped);
        setPairRowsInput(String(clamped));
        saveToStorage({ pairRows: clamped });
    };

    const handlePairsPerRowChange = (inputStr: string) => {
        setPairsPerRowInput(inputStr);
        const parsed = parseInt(inputStr, 10);
        if (!isNaN(parsed)) {
            const newVal = Math.max(1, Math.min(20, parsed));
            setPairsPerRowDirect(newVal);
            saveToStorage({ pairsPerRowDirect: newVal });
        }
    };

    const handlePairsPerRowBlur = () => {
        const clamped = Math.max(1, Math.min(20, parseInt(pairsPerRowInput, 10) || 1));
        setPairsPerRowDirect(clamped);
        setPairsPerRowInput(String(clamped));
        saveToStorage({ pairsPerRowDirect: clamped });
    };

    const handleTotalStudentsChange = (inputStr: string) => {
        setTotalStudentsInput(inputStr);
        const parsed = parseInt(inputStr, 10);
        if (!isNaN(parsed)) {
            const newVal = Math.max(1, parsed);
            setTotalStudents(newVal);
            saveToStorage({ totalStudents: newVal });
        }
    };

    const handleTotalStudentsBlur = () => {
        const clamped = Math.max(1, parseInt(totalStudentsInput, 10) || 1);
        setTotalStudents(clamped);
        setTotalStudentsInput(String(clamped));
        saveToStorage({ totalStudents: clamped });
    };

    const handleModeChange = (newMode: SeatMode) => {
        setMode(newMode);
        saveToStorage({ mode: newMode });
    };

    const handleNameInputSave = () => {
        const parsed = parseNames(nameInput);

        // 세팅 데이터(고정석 또는 빈 자리)가 있으면 경고
        const hasSettings = fixedSeats.size > 0 || emptySeats.size > 0;
        if (hasSettings) {
            const confirmed = confirm('이름 목록을 변경하면 고정석 등 모든 세팅 값이 초기화됩니다.\n변경하시겠습니까?');
            if (!confirmed) return;

            // 세팅 초기화
            const emptyMap = new Map<string, number>();
            const emptySet = new Set<string>();
            setFixedSeats(emptyMap);
            setEmptySeats(emptySet);
            sessionStorage.removeItem(SESSION_KEY_FIXED);
            sessionStorage.removeItem(SESSION_KEY_EMPTY);
        }

        setNames(parsed);
        setTotalStudents(parsed.length);
        setShowNameInput(false);
        saveToStorage({ names: parsed, totalStudents: parsed.length });
        if (parsed.length > 0) setShowShuffleHint(true);
    };

    const studentCount = mode === 'name' ? names.length : totalStudents;
    const pairsPerRow = pairsPerRowDirect; // 직접 입력한 열 수

    // 학생 표시 텍스트 가져오기
    const getStudentDisplay = useCallback((index: number): string => {
        if (mode === 'name' && names[index]) {
            return names[index];
        }
        return String(index + 1);
    }, [mode, names]);

    // 셔플 함수 (고정석 반영)
    const shuffleSeats = () => {
        const studentList = mode === 'name' ? [...names] : Array.from({ length: totalStudents }, (_, i) => String(i + 1));

        if (studentCount === 0) {
            if (mode === 'name') alert('등록된 학생 이름이 없습니다. 이름을 먼저 입력해주세요!');
            else alert('학생 인원 설정이 잘못되었습니다.');
            return;
        }
        const count = studentCount;

        // 고정석에 배치된 학생 인덱스들 (0-based)
        const fixedStudentIndices = new Set<number>();
        fixedSeats.forEach((studentIdx) => {
            if (studentIdx > 0 && studentIdx <= count) {
                fixedStudentIndices.add(studentIdx - 1);
            }
        });

        // 고정되지 않은 학생들 셔플
        const shuffledStudents: string[] = [];
        for (let i = 0; i < count; i++) {
            if (!fixedStudentIndices.has(i)) {
                shuffledStudents.push(studentList[i]);
            }
        }

        // Fisher-Yates 셔플
        for (let i = shuffledStudents.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledStudents[i], shuffledStudents[j]] = [shuffledStudents[j], shuffledStudents[i]];
        }

        // 좌석 배치 (고정석 위치에는 해당 학생, 나머지는 셔플된 학생)
        const pairs: (SeatData | null)[][] = [];
        let shuffleIndex = 0;

        for (let row = 0; row < pairRows; row++) {
            const rowPairs: (SeatData | null)[] = [];
            for (let p = 0; p < pairsPerRow; p++) {
                for (let seat = 0; seat < 2; seat++) {
                    const posKey = `${row}-${p}-${seat}`;

                    // 빈 자리: 아무도 배정하지 않음
                    if (emptySeats.has(posKey)) {
                        rowPairs.push({ display: '🚫' });
                        continue;
                    }

                    const fixedStudentIdx = fixedSeats.get(posKey);

                    if (fixedStudentIdx && fixedStudentIdx > 0 && fixedStudentIdx <= count) {
                        // 고정석: 해당 학생 배치
                        rowPairs.push({ display: getStudentDisplay(fixedStudentIdx - 1) });
                    } else if (shuffleIndex < shuffledStudents.length) {
                        // 비고정석: 셔플된 학생 배치
                        rowPairs.push({ display: shuffledStudents[shuffleIndex] });
                        shuffleIndex++;
                    } else {
                        rowPairs.push(null);
                    }
                }
            }
            pairs.push(rowPairs);
        }

        setSeats(pairs);
    };

    // 모바일에서 초기 로딩 및 섞기 시 중앙 정렬
    const centerScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollWidth = container.scrollWidth;
            const clientWidth = container.clientWidth;
            if (scrollWidth > clientWidth) {
                container.scrollLeft = (scrollWidth - clientWidth) / 2;
            }
        }
    }, []);

    useEffect(() => {
        if (seats.length > 0) {
            // 여러 단계로 시도 (렌더링 직후, 레이아웃 확정 후)
            centerScroll();
            const timer1 = setTimeout(centerScroll, 100);
            const timer2 = setTimeout(centerScroll, 500);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [seats, centerScroll]);

    useEffect(() => {
        window.addEventListener('resize', centerScroll);
        return () => window.removeEventListener('resize', centerScroll);
    }, [centerScroll]);

    // 줄 수 / 열 수 변경 시 다시 섞기 (seats가 있을 때만)
    useEffect(() => {
        if (seats.length > 0) {
            shuffleSeats();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pairRows, pairsPerRowDirect]);

    // 이미지 저장
    const handleExport = async () => {
        if (!gridRef.current) return;

        try {
            const dataUrl = await toPng(gridRef.current, {
                backgroundColor: '#ffffff',
                pixelRatio: 2
            });

            const link = document.createElement('a');
            link.download = `짝꿍배치_${new Date().toLocaleDateString()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (e) {
            console.error(e);
            alert('이미지 저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#ffffff' }}>
            <Header />
            <div className="container" style={{ maxWidth: '1000px', paddingTop: '1.5rem' }}>
                {/* 타이틀 */}
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
                        {APP_TITLES.SEAT}
                    </h1>
                    <p style={{ color: '#667', marginTop: '0.6rem', fontSize: '1rem', fontWeight: '500' }}>
                        학생들의 자리를 랜덤으로 배치합니다
                    </p>
                </div>

                {/* 광고 배너 */}
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <KakaoAdfit
                        unit={ADFIT_UNITS.MAIN_BANNER}
                        width={ADFIT_SIZES.BANNER_320x100.width}
                        height={ADFIT_SIZES.BANNER_320x100.height}
                    />
                </div>

                {/* 설정 영역 */}
                <div className="seat-config-panel" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'stretch',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    padding: '1.2rem',
                    background: '#ffffff',
                    borderRadius: '24px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                    border: '1px solid #e2e2ea',
                    flexWrap: 'wrap'
                }}>
                    {/* 모드 토글 */}
                    <div className="seat-config-item" style={{
                        display: 'flex',
                        gap: '0.4rem',
                        background: '#f8f9fa',
                        padding: '0.4rem',
                        borderRadius: '16px',
                        border: '1px solid #eee'
                    }}>
                        <button
                            onClick={() => handleModeChange('number')}
                            style={{
                                padding: '0 1.2rem',
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                background: mode === 'number' ? '#ffffff' : 'transparent',
                                color: mode === 'number' ? '#4A90E2' : '#889',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: mode === 'number' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                minHeight: '44px'
                            }}
                        >
                            번호
                        </button>
                        <button
                            onClick={() => handleModeChange('name')}
                            style={{
                                padding: '0 1.2rem',
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                background: mode === 'name' ? '#ffffff' : 'transparent',
                                color: mode === 'name' ? '#E24A90' : '#889',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: mode === 'name' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                minHeight: '44px'
                            }}
                        >
                            이름
                        </button>
                    </div>

                    {/* 배치 (열×줄) */}
                    <div className="seat-config-item" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        padding: '0 1.2rem',
                        borderRadius: '16px',
                        border: '1px solid #e2e2ea',
                        background: '#fcfcfe'
                    }}>
                        <label style={{ color: '#445', fontWeight: '600', fontSize: '0.95rem' }}>배치</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={pairsPerRowInput}
                                onChange={(e) => handlePairsPerRowChange(e.target.value.replace(/[^0-9]/g, ''))}
                                onBlur={handlePairsPerRowBlur}
                                style={{
                                    padding: '0.4rem',
                                    fontSize: '1rem',
                                    width: '40px',
                                    textAlign: 'center',
                                    border: '1px solid #e2e2ea',
                                    borderRadius: '10px',
                                    fontWeight: '700',
                                    color: '#334',
                                    background: '#fff',
                                    outline: 'none'
                                }}
                            />
                            <span style={{ color: '#aaa', fontWeight: '600', fontSize: '1rem' }}>×</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={pairRowsInput}
                                onChange={(e) => handlePairRowsChange(e.target.value.replace(/[^0-9]/g, ''))}
                                onBlur={handlePairRowsBlur}
                                style={{
                                    padding: '0.4rem',
                                    fontSize: '1rem',
                                    width: '40px',
                                    textAlign: 'center',
                                    border: '1px solid #e2e2ea',
                                    borderRadius: '10px',
                                    fontWeight: '700',
                                    color: '#334',
                                    background: '#fff',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <span style={{ color: '#889', fontSize: '0.85rem', fontWeight: '500' }}>(열×줄)</span>
                    </div>

                    {/* 번호 모드: 학생 수 */}
                    {mode === 'number' && (
                        <div className="seat-config-item" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            padding: '0 1.2rem',
                            borderRadius: '16px',
                            border: '1px solid #e2e2ea',
                            background: '#fcfcfe'
                        }}>
                            <label style={{ color: '#445', fontWeight: '600', fontSize: '0.95rem' }}>학생 수</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={totalStudentsInput}
                                onChange={(e) => handleTotalStudentsChange(e.target.value.replace(/[^0-9]/g, ''))}
                                onBlur={handleTotalStudentsBlur}
                                style={{
                                    padding: '0.4rem',
                                    fontSize: '1rem',
                                    width: '55px',
                                    textAlign: 'center',
                                    border: '1px solid #e2e2ea',
                                    borderRadius: '10px',
                                    fontWeight: '700',
                                    color: '#334',
                                    background: '#fff',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    )}

                    {/* 이름 모드: 이름 설정 버튼 */}
                    {mode === 'name' && (
                        <div className="seat-config-item" style={{ display: 'flex' }}>
                            <button
                                onClick={() => setShowNameInput(true)}
                                className={names.length === 0 ? 'btn-name-nudge' : ''}
                                style={{
                                    padding: '0 1.2rem',
                                    fontSize: '0.95rem',
                                    fontWeight: '700',
                                    background: '#ffffff',
                                    color: '#E24A90',
                                    border: '1px solid #E24A90',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    minHeight: '44px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#fff0f6';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#ffffff';
                                }}
                            >
                                📝 이름 ({names.length}명)
                            </button>
                        </div>
                    )}
                </div>

                {/* 이름 입력 모달 */}
                {showNameInput && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: '#fff',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            width: '90%',
                            maxWidth: '400px'
                        }}>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>📝 학생 이름 입력</h3>
                            <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                                줄바꿈, 쉼표, 띄어쓰기로 구분
                            </p>
                            <textarea
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                placeholder="예시:&#10;김철수&#10;이영희&#10;박민수"
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    padding: '0.8rem',
                                    fontSize: '1rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#888', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>인식된 이름: {parseNames(nameInput).length}명</span>
                                <button
                                    onClick={() => {
                                        const testData = "김민준, 이서준, 박지후, 최도윤, 정예준, 강하준, 조준우, 윤시우, 장서연, 임지우, 한수아, 오예린, 신하윤, 서서현, 권지민, 황민서, 안윤서, 송채원, 유소연, 남유진, 백태윤, 노승우, 하준호, 배현우, 문다은, 성은서, 주시현, 류유나, 홍채윤, 전수빈, 고지안, 손연우, 차세아";
                                        navigator.clipboard.writeText(testData);
                                        alert('테스트 이름 33명 복사됨! 붙여넣기 하세요!');
                                    }}
                                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', color: '#666' }}
                                >
                                    📋 테스트 데이터
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button
                                    onClick={() => setShowNameInput(false)}
                                    style={{ padding: '0.5rem 1rem', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleNameInputSave}
                                    style={{ padding: '0.5rem 1.5rem', background: '#4A90E2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    저장
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 버튼 영역 */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => { shuffleSeats(); setShowShuffleHint(false); }}
                        disabled={mode === 'name' && names.length === 0}
                        className={showShuffleHint ? 'btn-pulse-hint' : ''}
                        style={{
                            background: (mode === 'name' && names.length === 0)
                                ? '#e0e0e0'
                                : 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                            border: 'none',
                            color: '#fff',
                            padding: '0 2.5rem',
                            fontSize: '1.1rem',
                            fontWeight: '800',
                            borderRadius: '16px',
                            boxShadow: (mode === 'name' && names.length === 0) ? 'none' : '0 8px 20px rgba(74,144,226,0.3)',
                            cursor: (mode === 'name' && names.length === 0) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            minHeight: '52px'
                        }}
                        onMouseEnter={(e) => {
                            if (!(mode === 'name' && names.length === 0)) {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 12px 25px rgba(74,144,226,0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!(mode === 'name' && names.length === 0)) {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(74,144,226,0.3)';
                            }
                        }}
                    >
                        짝궁 섞기
                    </button>
                    {seats.length > 0 && (
                        <button
                            onClick={handleExport}
                            style={{
                                background: 'linear-gradient(135deg, #50C878 0%, #3DA65E 100%)',
                                border: 'none',
                                color: '#fff',
                                padding: '0 2rem',
                                fontSize: '1rem',
                                fontWeight: '800',
                                borderRadius: '16px',
                                boxShadow: '0 8px 20px rgba(80,200,120,0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                minHeight: '52px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 12px 25px rgba(80,200,120,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(80,200,120,0.2)';
                            }}
                        >
                            이미지로 저장
                        </button>
                    )}
                </div>

                {/* 좌석 그리드 - 짝꿍 레이아웃 */}
                <div
                    className="seat-grid-scroll"
                    ref={scrollContainerRef}
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-start', // 이 너비를 넘을 경우 왼쪽 짤림 방지
                        padding: '0 1rem 1rem 1rem',
                        overflowX: 'auto',
                        width: '100%',
                        boxSizing: 'border-box'
                    }}
                >
                    <div
                        ref={gridRef}
                        style={{
                            display: 'inline-block',
                            margin: '0 auto', // 공간 있을 때 중앙 정렬, 없을 때 왼쪽 고정
                            textAlign: 'left',
                            padding: '2rem 1.5rem',
                            background: '#fafafa',
                            borderRadius: '16px',
                            border: '1px solid #eee',
                            flexShrink: 0
                        }}
                    >
                        {/* 칠판 */}
                        <div style={{
                            background: '#2d5a27',
                            color: '#fff',
                            padding: '0.8rem 3rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            marginBottom: '1.5rem',
                            fontSize: '1.1rem',
                            fontWeight: '500'
                        }}>
                            📖 칠판
                        </div>

                        {/* 짝꿍 좌석 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {seats.length > 0 ? (
                                seats.map((row, rowIdx) => (
                                    <div key={rowIdx} style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                                        {Array.from({ length: Math.ceil(row.length / 2) }).map((_, pairIdx) => {
                                            const left = row[pairIdx * 2];
                                            const right = row[pairIdx * 2 + 1];
                                            return (
                                                <div key={pairIdx} style={{
                                                    display: 'flex',
                                                    gap: '2px',
                                                    background: '#e8e8e8',
                                                    padding: '3px',
                                                    borderRadius: '10px'
                                                }}>
                                                    <div style={{
                                                        minWidth: mode === 'name' ? '65px' : '50px',
                                                        height: '50px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: left?.display === '🚫'
                                                            ? 'repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 5px, #e0e0e0 5px, #e0e0e0 10px)'
                                                            : left ? '#fff' : '#f0f0f0',
                                                        border: left?.display === '🚫' ? '2px solid #aaa' : '1px solid #ddd',
                                                        borderRadius: '8px 2px 2px 8px',
                                                        fontSize: left?.display === '🚫' ? '1.2rem' : mode === 'name' ? '0.85rem' : '1.2rem',
                                                        fontWeight: '600',
                                                        color: left?.display === '🚫' ? '#999' : left ? '#333' : '#ccc',
                                                        padding: '0 0.3rem',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {left?.display || ''}
                                                    </div>
                                                    <div style={{
                                                        minWidth: mode === 'name' ? '65px' : '50px',
                                                        height: '50px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: right?.display === '🚫'
                                                            ? 'repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 5px, #e0e0e0 5px, #e0e0e0 10px)'
                                                            : right ? '#fff' : '#f0f0f0',
                                                        border: right?.display === '🚫' ? '2px solid #aaa' : '1px solid #ddd',
                                                        borderRadius: '2px 8px 8px 2px',
                                                        fontSize: right?.display === '🚫' ? '1.2rem' : mode === 'name' ? '0.85rem' : '1.2rem',
                                                        fontWeight: '600',
                                                        color: right?.display === '🚫' ? '#999' : right ? '#333' : '#ccc',
                                                        padding: '0 0.3rem',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {right?.display || ''}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))
                            ) : (
                                // 빈 그리드 미리보기
                                Array.from({ length: pairRows }).map((_, rowIdx) => (
                                    <div key={rowIdx} style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                                        {Array.from({ length: pairsPerRow || 3 }).map((_, pairIdx) => (
                                            <div key={pairIdx} style={{
                                                display: 'flex',
                                                gap: '2px',
                                                background: '#e8e8e8',
                                                padding: '3px',
                                                borderRadius: '10px'
                                            }}>
                                                <div style={{
                                                    minWidth: '50px',
                                                    height: '50px',
                                                    background: '#f5f5f5',
                                                    borderRadius: '8px 2px 2px 8px',
                                                    border: '1px dashed #ddd'
                                                }} />
                                                <div style={{
                                                    minWidth: '50px',
                                                    height: '50px',
                                                    background: '#f5f5f5',
                                                    borderRadius: '2px 8px 8px 2px',
                                                    border: '1px dashed #ddd'
                                                }} />
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                {/* seat-grid-scroll end */}

                {/* 설정 링크 */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#bbb', fontSize: '0.8rem' }}>
                    <Link to="/seat/settings" style={{ color: '#aaa', textDecoration: 'none' }}>Setting</Link>
                </div>

                <div style={{ marginTop: '3rem', marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                    <MyorokBanner />
                </div>
            </div>
            {/* 모바일 최적화 스타일 */}
            <style>{`
                @media (max-width: 600px) {
                    .seat-config-panel {
                        padding: 1.2rem 1rem !important;
                        gap: 1rem !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        border-radius: 20px !important;
                        margin: 0 auto 1.5rem auto !important;
                        width: calc(100% - 2rem) !important;
                        box-sizing: border-box !important;
                    }
                    .seat-config-item {
                        width: 100% !important;
                        display: flex !important;
                        justify-content: center !important;
                        align-items: center !important;
                        min-height: 48px !important;
                        box-sizing: border-box !important;
                    }
                    /* 개별 설정 항목들이 너비를 너무 차지하지 않으면서 가운데 정렬되도록 */
                    .seat-config-item > button, 
                    .seat-config-item > div {
                        width: 100% !important;
                        max-width: 330px !important; /* 조금 더 넓게 */
                        display: flex !important;
                        justify-content: center !important;
                        align-items: center !important;
                        white-space: nowrap !important; /* 글자 줄바꿈 방지 */
                    }
                    /* 라벨들 줄바꿈 절대 방지 */
                    .seat-config-item label,
                    .seat-config-item span {
                        white-space: nowrap !important;
                        flex-shrink: 0 !important;
                    }
                    /* 배치(열x줄) 영역 내부 텍스트 겹침 방지 */
                    .seat-config-item > div {
                        gap: 0.6rem !important;
                        padding: 0 1rem !important;
                    }
                    /* 이름 버튼 가이드(말풍선) 위치 미세 조정 */
                    .btn-name-nudge::after {
                        width: 90% !important;
                        left: 50% !important;
                        transform: translateX(-50%) !important;
                        white-space: normal !important; /* 말풍선은 줄바꿈 허용 */
                        text-align: center !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default SeatRandom;
