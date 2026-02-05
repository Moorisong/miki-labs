'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { calculateAge, encodeResultData } from '@/lib/pet-destiny/fortune';
import { PetDestinyRequest, PetDestinyResponse } from '@/lib/pet-destiny/types';
import styles from './styles.module.css';

const LOADING_MESSAGES = [
    '궁합 계산 중...',
    '오행 분석 중...',
    '운명의 실타래를 풀고 있어요...',
    '별자리를 읽고 있어요...',
];

export default function InputPage() {
    const router = useRouter();
    const [petType, setPetType] = useState<string>('');
    const [otherPetType, setOtherPetType] = useState<string>('');
    const [petBirthDate, setPetBirthDate] = useState<string>('');
    const [ownerBirthDate, setOwnerBirthDate] = useState<string>('');
    const [petName, setPetName] = useState<string>('');
    const [ownerName, setOwnerName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

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

                router.push(`/pet-destiny/result?seed=${encodeURIComponent(seed)}`);
            } else {
                alert(data.error?.message || '오류가 발생했습니다.');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('API 호출 오류:', error);
            alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
            setIsLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

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
                        <h1 className={styles.title}>운명연구소</h1>
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
                            반려동물 생년월일 {petBirthDate && calculateAge(petBirthDate)}
                        </label>
                        <input
                            id="petBirthDate"
                            type="date"
                            value={petBirthDate}
                            onChange={(e) => setPetBirthDate(e.target.value)}
                            max={today}
                            className={styles.input}
                        />
                    </div>

                    {/* 집사 생년월일 */}
                    <div className={styles.formSection}>
                        <label className={styles.label} htmlFor="ownerBirthDate">
                            집사 생년월일
                        </label>
                        <input
                            id="ownerBirthDate"
                            type="date"
                            value={ownerBirthDate}
                            onChange={(e) => setOwnerBirthDate(e.target.value)}
                            max={today}
                            className={styles.input}
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
        </div>
    );
}
