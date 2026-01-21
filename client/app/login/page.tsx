'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import styles from './page.module.css';

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleKakaoLogin = () => {
    signIn('kakao', { callbackUrl });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.subtitle}>뽑기중독에 오신 것을 환영합니다</p>
        </div>

        <div className={styles.buttons}>
          <button onClick={handleKakaoLogin} className={styles.kakaoButton}>
            <svg
              className={styles.kakaoIcon}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3C6.48 3 2 6.58 2 11c0 2.85 1.89 5.35 4.72 6.77-.15.53-.96 3.39-1 3.56 0 .05-.01.1-.01.15 0 .16.08.3.22.37.08.04.16.05.24.05.13 0 .26-.05.37-.13.52-.37 4.03-2.73 4.67-3.16.59.08 1.19.12 1.79.12 5.52 0 10-3.58 10-8s-4.48-8-10-8" />
            </svg>
            카카오 로그인
          </button>
        </div>

        <p className={styles.notice}>
          로그인 시 서비스 이용약관에 동의하게 됩니다
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.container}><div className={styles.card}>로딩 중...</div></div>}>
      <LoginContent />
    </Suspense>
  );
}
