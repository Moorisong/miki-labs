'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Modal from '@/components/ui/modal';
import styles from './nickname-modal.module.css';

interface NicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (nickname: string) => void;
  mode?: 'create' | 'edit'; // 신규 설정 vs 수정
  currentNickname?: string | null;
  canChangeNickname?: boolean;
  nextChangeDate?: string | null;
}

export default function NicknameModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'create',
  currentNickname = null,
  canChangeNickname = true,
  nextChangeDate = null,
}: NicknameModalProps) {
  const { update } = useSession();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = mode === 'edit';

  // 모달이 열릴 때 현재 닉네임으로 초기화 (수정 모드)
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && currentNickname) {
        setNickname(currentNickname);
      } else {
        setNickname('');
      }
      setError(null);
    }
  }, [isOpen, isEditMode, currentNickname]);

  // 다음 변경 가능일까지 남은 일수 계산
  const getDaysUntilChange = () => {
    if (!nextChangeDate) return 0;
    const nextDate = new Date(nextChangeDate);
    const now = new Date();
    const diffTime = nextDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = nickname.trim();

    if (trimmed.length < 2 || trimmed.length > 10) {
      setError('닉네임은 2~10자여야 합니다.');
      return;
    }

    // 수정 모드에서 같은 닉네임이면 그냥 닫기
    if (isEditMode && trimmed === currentNickname) {
      onClose();
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/user/nickname', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: trimmed }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || '닉네임 설정에 실패했습니다.');
        return;
      }

      // NextAuth 세션 업데이트
      await update();

      onSuccess(trimmed);
      onClose();
    } catch (err) {
      setError('서버 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      // 수정 모드에서는 그냥 모달 닫기
      onClose();
    } else {
      // 신규 설정 모드에서는 로그아웃
      signOut({ callbackUrl: '/' });
    }
  };

  const daysLeft = getDaysUntilChange();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? '닉네임 수정' : '닉네임 설정'}
      size="sm"
      closeOnOverlayClick={isEditMode}
      closeOnEscape={isEditMode}
      showCloseButton={isEditMode}
    >
      <div className={styles.content}>
        {isEditMode && !canChangeNickname ? (
          // 변경 불가능 상태 표시
          <div className={styles.restricted}>
            <p className={styles.restrictedIcon}>🔒</p>
            <p className={styles.restrictedTitle}>닉네임 변경 불가</p>
            <p className={styles.restrictedDesc}>
              닉네임은 한 달에 한 번만 변경할 수 있습니다.
            </p>
            <p className={styles.restrictedDays}>
              <strong>{daysLeft}일</strong> 후 변경 가능
            </p>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
            >
              확인
            </button>
          </div>
        ) : (
          <>
            <p className={styles.description}>
              {isEditMode
                ? '새로운 닉네임을 입력해주세요.'
                : '랭킹에 표시될 닉네임을 설정해주세요.'}
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length > 10) {
                      setNickname(val.slice(0, 10));
                    } else {
                      setNickname(val);
                    }
                  }}
                  placeholder="닉네임 (2~10자)"
                  className={styles.input}
                  maxLength={10}
                  disabled={isSubmitting}
                  autoFocus
                />
                <span className={styles.charCount}>{nickname.length}/10</span>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting || nickname.trim().length < 2}
                >
                  {isSubmitting ? '저장 중...' : isEditMode ? '변경' : '확인'}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  {isEditMode ? '취소' : '로그아웃'}
                </button>
              </div>
            </form>

            <p className={styles.hint}>
              {isEditMode
                ? '닉네임은 한 달에 한 번만 변경할 수 있습니다.'
                : '닉네임을 설정하지 않으면 이용할 수 없습니다.'}
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
