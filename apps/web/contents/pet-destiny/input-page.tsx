'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { calculateAge, encodeResultData } from '@/lib/pet-destiny/fortune';
import { PetDestinyRequest, PetDestinyResponse } from '@/lib/pet-destiny/types';
import styles from './styles.module.css';
import { useToast } from '@/lib/hooks/use-toast';
import Toast from '@/components/ui/toast';

const LOADING_MESSAGES = [
    '궁합 계산 중...',
    '오행 분석 중...',
    '운명의 실타래를 풀고 있어요...',
    '별자리를 읽고 있어요...',
];

interface DateInputGroupProps {
    onChange: (date: string) => void;
    maxDate?: string;
    onError?: (message: string) => void;
    disabled?: boolean;
    value?: string;
}

function DateInputGroup({ onChange, maxDate, onError, disabled, value }: DateInputGroupProps) {
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const dateInputRef = useRef<HTMLInputElement>(null);
    const dateGroupRef = useRef<HTMLDivElement>(null);

    // Sync from props (value) to internal state
    useEffect(() => {
        // 포커스가 내부에 있다면, 외부 변경(특히 초기화)을 무시하여 입력 중 리셋 방지
        if (dateGroupRef.current?.contains(document.activeElement)) {
            return;
        }

        if (value) {
            const [y, m, d] = value.split('-');
            setYear((prev) => (prev !== y ? y : prev));
            setMonth((prev) => (prev !== m ? m : prev));
            setDay((prev) => (prev !== d ? d : prev));
        } else if (value === '') {
            setYear('');
            setMonth('');
            setDay('');
        }
    }, [value]);

    // Sync from internal state to parent
    useEffect(() => {
        if (!year || !month || !day) {
            onChange('');
            return;
        }

        const y = parseInt(year);
        const m = parseInt(month);
        const d = parseInt(day);

        if (isNaN(y) || isNaN(m) || isNaN(d)) return;

        // Basic range checks
        if (m < 1 || m > 12) return;
        if (d < 1 || d > 31) return;

        const formattedDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        // Validate date existence
        const dateObj = new Date(formattedDate);
        if (isNaN(dateObj.getTime())) return;
        if (dateObj.toISOString().split('T')[0] !== formattedDate) return;
        if (maxDate && formattedDate > maxDate) return;

        onChange(formattedDate);
    }, [year, month, day, onChange, maxDate]);

    // Handle calendar picker selection
    const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const val = e.target.value;
        if (val) {
            const [y, m, d] = val.split('-');
            setYear(y);
            setMonth(m);
            setDay(d);
        }
    };

    const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void, maxLen: number) => {
        if (disabled) return;
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= maxLen) {
            setter(value);
        }
    };

    const openCalendar = () => {
        if (!dateInputRef.current) return;

        if ('showPicker' in dateInputRef.current && typeof dateInputRef.current.showPicker === 'function') {
            try {
                dateInputRef.current.showPicker();
            } catch (err) {
                dateInputRef.current.click();
            }
        } else {
            dateInputRef.current.click();
        }
    };

    const handleBlur = (e: React.FocusEvent) => {
        if (disabled) return;
        // 내부에서 포커스 이동하는 경우는 무시
        if (e.currentTarget.contains(e.relatedTarget)) return;

        // 하나라도 입력되어 있다면 검증 시도
        if (year || month || day) {
            if (!year || year.length < 4) return; // 연도는 아직 입력중일 수 있음
            if (!month) return;
            if (!day) return;

            const y = parseInt(year);
            const m = parseInt(month);
            const d = parseInt(day);

            if (m < 1 || m > 12) {
                onError?.('올바른 월(1-12)을 입력해주세요.');
                return;
            }
            if (d < 1 || d > 31) {
                onError?.('올바른 일(1-31)을 입력해주세요.');
                return;
            }

            const formattedDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dateObj = new Date(formattedDate);

            // 유효하지 않은 날짜 (예: 2월 30일)
            if (dateObj.toISOString().split('T')[0] !== formattedDate) {
                onError?.('존재하지 않는 날짜입니다. 다시 확인해주세요.');
                return;
            }

            // 미래 날짜 확인
            if (maxDate && formattedDate > maxDate) {
                onError?.('미래의 날짜는 입력할 수 없습니다.');
                return;
            }
        }
    };

    return (
        <div
            ref={dateGroupRef}
            className={`${styles.dateInputGroup} ${disabled ? styles.disabled : ''}`}
            onBlur={handleBlur}
        >
            <div className={styles.dateInputWrapper}>
                <input
                    className={styles.dateInput}
                    placeholder="YYYY"
                    value={year}
                    onChange={(e) => handleNumberInput(e, setYear, 4)}
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    disabled={disabled}
                />
                <span className={styles.dateSuffix}>년</span>
            </div>
            <div className={styles.dateInputWrapper}>
                <input
                    className={styles.dateInput}
                    placeholder="MM"
                    value={month}
                    onChange={(e) => handleNumberInput(e, setMonth, 2)}
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    disabled={disabled}
                />
                <span className={styles.dateSuffix}>월</span>
            </div>
            <div className={styles.dateInputWrapper}>
                <input
                    className={styles.dateInput}
                    placeholder="DD"
                    value={day}
                    onChange={(e) => handleNumberInput(e, setDay, 2)}
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    disabled={disabled}
                />
                <span className={styles.dateSuffix}>일</span>
            </div>

            <button type="button" className={styles.calendarButton} onClick={openCalendar} title="날짜 선택" disabled={disabled}>
                📅
            </button>

            <input
                type="date"
                ref={dateInputRef}
                onChange={handleDateSelect}
                max={maxDate}
                className={styles.hiddenDateInput}
                tabIndex={-1}
                disabled={disabled}
            />
        </div >
    );
}

export default function InputPage() {
    const router = useRouter();
    const [petType, setPetType] = useState<string>('');
    const [otherPetType, setOtherPetType] = useState<string>('');
    const [petBirthDate, setPetBirthDate] = useState<string>('');
    const [isUnknownPetBirthday, setIsUnknownPetBirthday] = useState(false);
    const [ownerBirthDate, setOwnerBirthDate] = useState<string>('');
    const [petName, setPetName] = useState<string>('');
    const [ownerName, setOwnerName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { toast, showToast, hideToast } = useToast();

    const isFormValid = () => {
        const hasPetType = petType !== '';
        const hasOtherPetType = petType !== '기타' || otherPetType.trim() !== '';
        const hasPetBirthDate = petBirthDate !== '';
        const hasOwnerBirthDate = ownerBirthDate !== '';

        return hasPetType && hasOtherPetType && hasPetBirthDate && hasOwnerBirthDate;
    };

    const handleSubmit = async () => {
        if (!isFormValid()) return;

        setIsLoading(true);
        setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);

        try {
            // API 호출
            const apiPetType = petType === '고양이' ? 'cat' : petType === '강아지' ? 'dog' : 'other';
            const request: PetDestinyRequest = {
                ownerBirth: ownerBirthDate,
                petBirth: petBirthDate,
                petType: apiPetType,
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pet-destiny`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });

            const data: PetDestinyResponse = await response.json();

            if (data.success && data.data) {
                // 결과 데이터를 localStorage에 저장
                const resultData = {
                    ...data.data,
                    petType: petType === '기타' ? otherPetType : petType,
                    petName,
                    ownerName,
                };
                localStorage.setItem('petDestinyResult', JSON.stringify(resultData));

                // 인코딩된 seed 생성
                const seed = encodeResultData({
                    petType: petType === '기타' ? otherPetType : petType,
                    petBirthDate,
                    ownerBirthDate,
                    petName,
                    ownerName,
                });


                router.push(`/pet-destiny/result?seed=${encodeURIComponent(seed)}&unknown=${isUnknownPetBirthday}`);
            } else {
                showToast(data.error?.message || '오류가 발생했습니다.');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('API 호출 오류:', error);
            showToast('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
            setIsLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    const handleUnknownPetBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setIsUnknownPetBirthday(isChecked);

        if (isChecked) {
            // 내부 로직용 평균값 계산 (화면에는 표시하지 않음)
            const currentYear = new Date().getFullYear();
            const calculatedYear = currentYear - 3;
            setPetBirthDate(`${calculatedYear}-06-01`);
        } else {
            setPetBirthDate('');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                {/* 헤더 */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <Image
                            src="/pet-destiny-logo-transparent-v2.png"
                            alt="운명연구소 로고"
                            width={80}
                            height={80}

                        />
                    </div>
                    <p className={styles.subtitle}>반려동물과 집사의 특별한 인연을 분석해드려요</p>
                </div>

                {/* 입력 폼 */}
                <div className={styles.formCard}>
                    {/* 동물 종류 선택 */}
                    <div className={styles.formSection}>
                        <label className={styles.label}>반려동물 종류</label>
                        <div className={styles.animalGrid}>
                            {[
                                { value: '고양이', emoji: '🐱' },
                                { value: '강아지', emoji: '🐶' },
                                { value: '기타', emoji: '🐾' },
                            ].map((animal) => (
                                <label
                                    key={animal.value}
                                    className={`${styles.animalOption} ${petType === animal.value ? styles.animalOptionSelected : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="petType"
                                        value={animal.value}
                                        checked={petType === animal.value}
                                        onChange={(e) => setPetType(e.target.value)}
                                        className={styles.hiddenRadio}
                                    />
                                    <span className={styles.animalIcon}>{animal.emoji}</span>
                                    <span className={styles.animalLabel}>{animal.value}</span>
                                </label>
                            ))}
                        </div>

                        {petType === '기타' && (
                            <input
                                type="text"
                                placeholder="어떤 동물인가요? (최대 10자)"
                                value={otherPetType}
                                onChange={(e) => setOtherPetType(e.target.value.slice(0, 10))}
                                className={styles.input}
                                style={{ marginTop: '0.75rem' }}
                            />
                        )}
                    </div>

                    {/* 반려동물 생년월일 */}
                    <div className={styles.formSection}>
                        <label className={styles.label} htmlFor="petBirthDate">
                            반려동물 생년월일 {!isUnknownPetBirthday && petBirthDate && calculateAge(petBirthDate)}
                        </label>
                        <DateInputGroup
                            onChange={setPetBirthDate}
                            maxDate={today}
                            onError={(msg) => showToast(msg)}
                            disabled={isUnknownPetBirthday}
                            value={isUnknownPetBirthday ? '' : petBirthDate}
                        />
                        <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center' }}>
                            <div className={styles.checkboxWrapper} style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    id="unknown-birthday-checkbox"
                                    checked={isUnknownPetBirthday}
                                    onChange={handleUnknownPetBirthdayChange}
                                    style={{ width: '1.1rem', height: '1.1rem', marginRight: '0.5rem', accentColor: '#a78bfa', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.95rem', color: '#4b5563' }}>
                                    모름
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 집사 생년월일 */}
                    <div className={styles.formSection}>
                        <label className={styles.label} htmlFor="ownerBirthDate">
                            집사 생년월일
                        </label>
                        <DateInputGroup
                            onChange={setOwnerBirthDate}
                            maxDate={today}
                            onError={(msg) => showToast(msg)}
                        />
                    </div>

                    {/* 선택 입력 */}
                    <div className={styles.optionalSection}>
                        <p className={styles.optionalTitle}>선택 입력 (더 정확한 분석을 위해)</p>
                        <div className={styles.optionalFields}>
                            <div>
                                <label className={styles.label} htmlFor="petName">반려동물 이름</label>
                                <input
                                    id="petName"
                                    type="text"
                                    placeholder="예: 초코"
                                    value={petName}
                                    onChange={(e) => setPetName(e.target.value.slice(0, 10))}
                                    className={styles.input}
                                />
                            </div>
                            <div>
                                <label className={styles.label} htmlFor="ownerName">집사 이름</label>
                                <input
                                    id="ownerName"
                                    type="text"
                                    placeholder="예: 김집사"
                                    value={ownerName}
                                    onChange={(e) => setOwnerName(e.target.value.slice(0, 10))}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                    </div>

                    {/* CTA 버튼 */}
                    <button
                        onClick={handleSubmit}
                        disabled={!isFormValid() || isLoading}
                        className={styles.ctaButton}
                        style={{ marginTop: '1.5rem' }}
                    >
                        {isLoading ? loadingMessage : isFormValid() ? '궁합 결과 보기' : '정보를 입력해주세요'}
                    </button>
                </div>

                {/* 안내 문구 */}
                <div className={styles.footer}>
                    <p className={styles.privacyNote}>
                        입력하신 생년월일 정보는 결과 계산에만 사용되며 어떠한 개인정보도 저장되지 않습니다.
                        로그인 없이 이용 가능합니다.
                    </p>
                    <p className={styles.disclaimer}>
                        ✨ 본 콘텐츠는 엔터테인먼트 목적의 운세 서비스입니다.
                    </p>
                </div>
            </div>
            <Toast toast={toast} onHide={hideToast} />
        </div>
    );
}
