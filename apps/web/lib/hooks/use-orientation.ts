'use client';

import { useState, useEffect } from 'react';

export interface OrientationState {
  isLandscape: boolean;
  isLargeScreen: boolean; // >= 1024px
}

/**
 * 화면 방향(orientation)과 viewport 크기를 감지하는 훅.
 * - isLandscape: landscape 방향 여부
 * - isLargeScreen: viewport width >= 1024px (Large Landscape / Compact Landscape 구분 기준)
 */
export function useOrientation(): OrientationState {
  const [state, setState] = useState<OrientationState>({
    isLandscape: false,
    isLargeScreen: false,
  });

  useEffect(() => {
    const check = () => {
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const isLargeScreen = window.innerWidth >= 1024;
      setState({ isLandscape, isLargeScreen });
    };

    check();

    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);

    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  return state;
}
