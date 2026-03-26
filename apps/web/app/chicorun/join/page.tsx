'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';
import { CHICORUN_API, CHICORUN_STORAGE_KEY, CHICORUN_ROUTES } from '@/constants/chicorun';

// ─── 아이콘 ──────────────────────────────────────────────────────────────────────
const IconUser = () => (
    <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const IconLock = () => (
    <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const IconLogIn = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
        <polyline points="10 17 15 12 10 7"></polyline>
        <line x1="15" y1="12" x2="3" y2="12"></line>
    </svg>
);

const IconBook = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

function JoinForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlClassCode = searchParams.get('classCode') || '';

    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // 이미 로그인된 경우 학습 페이지로 리다이렉트 (링크의 클래스코드와 일치할 때만)
    useEffect(() => {
        const token = localStorage.getItem(CHICORUN_STORAGE_KEY.TOKEN);
        const studentInfoStr = localStorage.getItem(CHICORUN_STORAGE_KEY.STUDENT_INFO);

        if (token && studentInfoStr) {
            try {
                const info = JSON.parse(studentInfoStr);
                // URL에 특정 클래스 코드가 상주하는데, 현재 토큰의 클래스와 다르다면 리다이렉트 하지 않음 (새 가입 유도)
                if (urlClassCode && info.classCode !== urlClassCode.toUpperCase()) {
                    return;
                }
                router.replace(CHICORUN_ROUTES.LEARN);
            } catch {
                // ignore
            }
        }
    }, [router, urlClassCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nickname || !password) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(CHICORUN_API.STUDENT_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classCode: urlClassCode ? urlClassCode.toUpperCase().trim() : undefined,
                    nickname: nickname.trim(),
                    password,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                const msg = data.error?.message ?? data.error ?? '로그인에 실패했습니다.';
                if (msg.includes('ERROR_CLASS_NOT_FOUND')) {
                    setError('존재하지 않는 클래스 코드입니다. 담당 선생님께 확인하세요.');
                } else if (msg.includes('ERROR_WRONG_PASSWORD')) {
                    setError('비밀번호가 틀렸어요. 다시 시도하거나 선생님께 초기화를 요청하세요.');
                } else if (msg.includes('ERROR_CLASS_CODE_REQUIRED')) {
                    setError('등록되지 않은 닉네임입니다. 오타가 없는지 확인하거나, 처음 방문하셨다면 선생님이 공유해주신 "전체 링크"로 접속해 주세요.');
                } else {
                    setError(msg);
                }
                return;
            }

            // 토큰 및 학생 정보 저장
            const { token, student } = data.data as { token: string; student: any };
            localStorage.setItem(CHICORUN_STORAGE_KEY.TOKEN, token);
            localStorage.setItem(CHICORUN_STORAGE_KEY.STUDENT_INFO, JSON.stringify(student));

            router.push(CHICORUN_ROUTES.LEARN);
        } catch {
            setError('서버 연결에 실패했습니다. 잠시 후 다시 시도하세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {/* 닉네임 */}
            <div className={styles.inputGroup}>
                <label className={styles.label}>닉네임</label>
                <div className={styles.inputWrapper}>
                    <IconUser />
                    <input
                        type="text"
                        value={nickname}
                        onChange={e => setNickname(e.target.value)}
                        placeholder="닉네임"
                        className={styles.input}
                        required
                        maxLength={10}
                        autoComplete="nickname"
                    />
                </div>
            </div>

            {/* 비밀번호 */}
            <div className={styles.inputGroup}>
                <label className={styles.label}>비밀번호</label>
                <div className={styles.inputWrapper}>
                    <IconLock />
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="숫자 4~8자리"
                        className={styles.input}
                        required
                        autoComplete="current-password"
                    />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.5rem 0 0' }}>
                    💡 처음이면 자동 가입, 기존 사용자는 로그인됩니다
                </p>
            </div>

            {/* 에러 메시지 */}
            {error && (
                <div style={{
                    padding: '0.875rem 1rem',
                    background: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '0.75rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* 입장 버튼 */}
            <button
                type="submit"
                className={styles.btnSubmit}
                disabled={isLoading}
            >
                {isLoading ? (
                    <span>로딩 중...</span>
                ) : (
                    <>
                        <IconLogIn />
                        입장하기
                    </>
                )}
            </button>

            {!urlClassCode && (
                <div style={{
                    marginTop: '0.5rem',
                    padding: '0.875rem 1rem',
                    background: '#f8fafc',
                    color: '#64748b',
                    borderRadius: '0.75rem',
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                    border: '1px solid #e2e8f0'
                }}>
                    ℹ️ <b>처음 방문하시나요?</b><br />
                    새로운 클래스에 참여하려면 선생님이 보내주신 <b>전체 링크</b>를 눌러 접속하세요.
                </div>
            )}
        </form>
    );
}

export default function StudentEnterPage() {
    return (
        <div className={styles.container}>

            <main className={styles.main}>
                <div className={styles.card}>
                    <div className={styles.titleArea}>
                        <h2 className={styles.title}>입장하기 ⚡</h2>
                        <p className={styles.subtitle}>정보를 입력하고 바로 시작하세요!</p>
                    </div>

                    <Suspense fallback={<div>로딩 중...</div>}>
                        <JoinForm />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
