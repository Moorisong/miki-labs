'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

import { NAV_LINKS, API, MESSAGES, CONFIG } from '@/constants';
import { CHICORUN_API, CHICORUN_ROUTES } from '@/constants/chicorun';


import styles from './nav-bar.module.css';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [hasChicoToken, setHasChicoToken] = useState(false);
  const [studentNickname, setStudentNickname] = useState<string | null>(null);
  const [studentClassCode, setStudentClassCode] = useState<string | null>(null);
  const [studentPoints, setStudentPoints] = useState<number>(0);
  const [studentBadge, setStudentBadge] = useState<string>('🌱');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

  // 비밀번호 변경용 상태
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchLatestInfo = async () => {
      const studentToken = localStorage.getItem('chicorun_user_token');
      setHasChicoToken(!!studentToken);

      if (studentToken) {
        try {
          const res = await fetch(CHICORUN_API.STUDENT_ME, {
            headers: { Authorization: `Bearer ${studentToken}` }
          });
          const data = await res.json();
          if (data.success && data.data) {
            const info = data.data;
            setStudentNickname(info.nickname || null);
            setStudentPoints(info.point || 0);
          }
        } catch (err) {
          console.error('Failed to fetch latest student info in NavBar', err);
        }
      } else {
        setStudentNickname(null);
      }
    };

    fetchLatestInfo();

    // Listen for custom event to re-fetch on save/purchase
    const handleReFetch = () => fetchLatestInfo();
    window.addEventListener('chicorun_user_update', handleReFetch);
    return () => window.removeEventListener('chicorun_user_update', handleReFetch);
  }, [pathname]);


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isContentsActive = NAV_LINKS.some(link => pathname === link.href);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isChicorun = pathname.startsWith('/chicorun');

  const handleSignOut = () => {
    closeMenu();
    // Chicorun 관련 모든 로컬 스토리지 데이터 삭제
    localStorage.removeItem('chicorun_user_token');
    localStorage.removeItem('chicorun_user_info');

    // 자아탐험 관련 페이지에서 로그아웃 시 자아탐험 랜딩 페이지로 이동
    const redirectUrl = pathname.startsWith('/htsm') ? '/htsm' : isChicorun ? '/chicorun' : pathname;

    if (session) {
      signOut({ callbackUrl: redirectUrl });
    } else {
      // 학생 등 세션이 없는 경우 수동 리다이렉트
      window.location.href = redirectUrl;
    }
  };

  // ─── 선생님 성함 확인 (NextAuth 세션 기반) ───────────────────────────────────
  const teacherName = (session?.user as any)?.nickname || session?.user?.name;
  const isChicorunTeacher = isChicorun && !!teacherName;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) return;

    if (newPassword !== confirmNewPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    const token = localStorage.getItem('chicorun_user_token');
    if (!token) return;

    setIsChangingPassword(true);
    setPasswordError('');

    try {
      const res = await fetch(CHICORUN_API.STUDENT_CHANGE_PASSWORD, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        alert('비밀번호가 성공적으로 변경되었습니다. 다음 로그인 시 새 비밀번호를 사용해주세요.');
        setIsPasswordModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordError(data.error?.message || data.error || '비밀번호 변경에 실패했습니다.');
      }
    } catch (err) {
      setPasswordError('서버 오류가 발생했습니다. 잠시 후 시도해주세요.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Chicorun 바로가기 링크 (로그인 상태에 따라 학생/선생님 버튼 필터링)
  const CHICORUN_LINKS = [
    { href: '/chicorun', label: '학습' },
    // 학생 로그인 시에만 랭킹 버튼 표시
    ...(studentNickname ? [
      { href: '/chicorun/ranking', label: '랭킹' }
    ] : []),
    // 로그인하지 않은 학생의 경우 참여 페이지로 이동
    ...(!teacherName && !studentNickname ? [{
      href: '/chicorun/join',
      label: '시작하기'
    }] : []),
  ];

  // Toby 서비스에서는 헤더를 보이지 않게 처리
  if (pathname.startsWith('/toby')) {
    return null;
  }


  return (
    <>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo} onClick={closeMenu}>
            <img src="/logo.png" alt="Logo" className={styles.logoIcon} />
            <span className={styles.logoText}>하루상자</span>
          </Link>

          <button
            className={styles.hamburger}
            onClick={toggleMenu}
            aria-label="메뉴 열기"
            aria-expanded={isMenuOpen}
          >
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.active : ''}`} />
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.active : ''}`} />
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.active : ''}`} />
          </button>

          <ul className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>
            {/* PC: Dropdown Menu */}
            {!isChicorun && (
              <li
                className={`${styles.dropdownContainer} ${styles.desktopOnly}`}
                onMouseEnter={() => window.innerWidth > 768 && setIsDropdownOpen(true)}
                onMouseLeave={() => window.innerWidth > 768 && setIsDropdownOpen(false)}
              >
                <button
                  className={`${styles.navLink} ${styles.dropdownToggle} ${isContentsActive ? styles.active : ''}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  콘텐츠 <span className={`${styles.arrow} ${isDropdownOpen ? styles.arrowRotate : ''}`}>▾</span>
                </button>
                <ul className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.show : ''}`}>
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`${styles.dropdownItem} ${pathname === link.href ? styles.dropdownItemActive : ''}`}
                        onClick={() => {
                          closeMenu();
                          setIsDropdownOpen(false);
                        }}
                        {...((link as any).newTab || link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}

            {/* Mobile: Linear List */}
            {!isChicorun && NAV_LINKS.map((link) => (
              <li key={link.href} className={styles.mobileOnly}>
                <Link
                  href={link.href}
                  className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
                  onClick={closeMenu}
                  {...((link as any).newTab || link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Chicorun Specific Links (Visible only on /chicorun paths) - Positioned to the right */}
            {isChicorun && (
              <>
                {CHICORUN_LINKS.map((link) => (
                  <li key={link.href} className={styles.chicorunLinkItem}>
                    <Link
                      href={link.href}
                      className={`${styles.navLink} ${styles.chicorunLink} ${pathname === link.href ? styles.active : ''}`}
                      onClick={closeMenu}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}

                {/* 학생 프로필 (PC: 드롭다운) */}
                {studentNickname && !teacherName && (
                  <li
                    className={`${styles.dropdownContainer} ${styles.desktopOnly}`}
                    onMouseEnter={() => window.innerWidth > 768 && setIsStudentDropdownOpen(true)}
                    onMouseLeave={() => window.innerWidth > 768 && setIsStudentDropdownOpen(false)}
                  >
                    <button
                      className={`${styles.navLink} ${styles.chicorunLink} ${styles.studentProfileBtn}`}
                      onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                      aria-haspopup="true"
                      aria-expanded={isStudentDropdownOpen}
                    >
                      학생({studentNickname}) <span className={`${styles.arrow} ${isStudentDropdownOpen ? styles.arrowRotate : ''}`}>▾</span>
                    </button>
                    <ul className={`${styles.dropdownMenu} ${isStudentDropdownOpen ? styles.show : ''}`}>
                      <li className={styles.dropdownProfileRow}>
                        <div className={styles.profileBadgeName}>
                          <span className={styles.profileBadge}>🏃‍♂️</span>
                          <span className={styles.profileName}>{studentNickname}</span>
                        </div>
                        <Link
                          href={CHICORUN_ROUTES.RANKING}
                          className={styles.profilePointsLink}
                          onClick={() => {
                            closeMenu();
                            setIsStudentDropdownOpen(false);
                          }}
                        >
                          {studentPoints} P
                        </Link>
                      </li>
                      <li className={styles.dropdownDivider}></li>
                      <li>
                        <button
                          className={`${styles.dropdownItem} ${styles.dropdownActionBtn}`}
                          onClick={() => {
                            closeMenu();
                            setIsStudentDropdownOpen(false);
                            setIsPasswordModalOpen(true);
                            setPasswordError('');
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmNewPassword('');
                          }}
                        >
                          비밀번호 변경
                        </button>
                      </li>
                    </ul>
                  </li>
                )}

                {/* 학생 프로필 (모바일: 모두 펼침) */}
                {studentNickname && !teacherName && (
                  <>
                    <li className={`${styles.mobileOnly} ${styles.mobileProfileHeader}`}>
                      <div className={styles.profileBadgeName}>
                        <span className={styles.profileBadge}>🏃‍♂️</span>
                        <span className={styles.profileName}>{studentNickname}</span>
                      </div>
                      <div className={styles.mobileProfileInfo}>
                        <span className={styles.mobilePoints}>{studentPoints} P</span>
                      </div>
                    </li>
                    <li className={`${styles.mobileOnly} ${styles.mobileProfileActions}`}>
                      <button
                        className={styles.mobileActionBtn}
                        onClick={() => {
                          closeMenu();
                          setIsPasswordModalOpen(true);
                        }}
                      >
                        비밀번호 변경
                      </button>
                    </li>
                  </>
                )}
              </>
            )}

            <li className={styles.authItem}>
              {status === 'loading' ? (
                <span className={styles.authLoading}>...</span>
              ) : (session || hasChicoToken) ? (
                <div className={styles.userMenu}>
                  <button onClick={handleSignOut} className={styles.logoutButton}>
                    로그아웃
                  </button>
                </div>
              ) : (
                !isChicorun && (
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                    className={styles.loginButton}
                    onClick={closeMenu}
                  >
                    로그인
                  </Link>
                )
              )}
            </li>
          </ul>
        </nav>
      </header>

      {/* 학생 비밀번호 변경 모달 */}
      {isPasswordModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsPasswordModalOpen(false)}>
          <div className={styles.modal}>
            <h3>비밀번호 변경</h3>
            <p>현재 비밀번호와 새로운 비밀번호(4~8자리)를 입력해주세요.</p>
            <form onSubmit={handleChangePassword}>
              <input
                type="password"
                placeholder="현재 비밀번호"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={styles.modalInput}
                required
              />
              <input
                type="password"
                placeholder="새 비밀번호 (4~8자리)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.modalInput}
                required
                minLength={4}
                maxLength={8}
                style={{ marginBottom: '0.5rem' }}
              />
              <input
                type="password"
                placeholder="새 비밀번호 확인"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={styles.modalInput}
                required
                minLength={4}
                maxLength={8}
              />
              {passwordError && <div className={styles.modalError}>{passwordError}</div>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsPasswordModalOpen(false)}>취소</button>
                <button type="submit" className={styles.btnConfirm} disabled={isChangingPassword}>
                  {isChangingPassword ? '변경 중...' : '변경하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * 뱃지 스타일 헬퍼 (배경색 및 테두리 색상)
 */
const getBadgeStyles = (path: string) => {
  if (path.includes('tralallero')) return { bg: '#FFD700', border: '#1D4ED8' }; // Yellow
  if (path.includes('tungtung')) return { bg: '#D1FAE5', border: '#7C2D12' }; // Mint green
  if (path.includes('ballerina')) return { bg: '#DDD6FE', border: '#DB2777' }; // Lavender
  if (path.includes('bombardiro')) return { bg: '#FFEDD5', border: '#374151' }; // Orange
  if (path.includes('assassino')) return { bg: '#E0F2FE', border: '#000000' }; // SkyBlue
  return { bg: '#f1f5f9', border: '#e2e8f0' };
};

