'use client';

import { useState } from 'react';
import { rankingApi } from '../api/ranking';
import { SubmitScoreRequest } from '../api/types';

function generateTempId(): string {
  return 'temp_' + Math.random().toString(36).substring(2, 15);
}

export const useScoreSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitScore = async (data: Omit<SubmitScoreRequest, 'tempUserId'>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // MVP: 임시 userId 생성 (로그인 전)
      let tempUserId = localStorage.getItem('tempUserId');
      if (!tempUserId) {
        tempUserId = generateTempId();
        localStorage.setItem('tempUserId', tempUserId);
      }

      const success = await rankingApi.submitScore({
        ...data,
        tempUserId,
      });

      return success;
    } catch (err) {
      console.error('Score submit error:', err);
      setError('점수 제출에 실패했습니다.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return { submitScore, isSubmitting, error, clearError };
};
