'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Move, Play, ZoomIn, ZoomOut, Shuffle, Save, Check } from 'lucide-react';

export type InteractionMode = 'play' | 'move';

interface LandscapeToolbarProps {
  interactionMode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onShuffle: () => void;
  onSave: () => void;
  saveStatus?: 'idle' | 'saving' | 'saved';
  timerFormatted: string;
  progressPercent: number;
  puzzleTitle: string;
  difficulty: string;
}

export default function LandscapeToolbar({
  interactionMode,
  onModeChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onShuffle,
  onSave,
  saveStatus = 'idle',
  timerFormatted,
  progressPercent,
  puzzleTitle,
  difficulty,
}: LandscapeToolbarProps) {
  const roundedZoom = Math.round(zoom * 10) / 10;

  const isPlayMode = interactionMode === 'play';
  const isMoveMode = interactionMode === 'move';

  return (
    <div
      className="flex items-center justify-between px-6 py-2.5 border-b select-none"
      style={{
        backgroundColor: '#ffffff',
        borderColor: 'rgba(0, 0, 0, 0.08)',
        minHeight: '56px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 왼쪽: 제목 + 난이도 */}
      <div className="flex flex-col min-w-0">
        <span
          className="text-sm font-bold tracking-tight text-gray-800 truncate max-w-[240px]"
        >
          {puzzleTitle}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5 text-xs font-medium text-gray-500">
          <span>{difficulty}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="text-blue-600 font-semibold">{progressPercent}% 완료</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="font-mono text-gray-600">⏱ {timerFormatted}</span>
        </div>
      </div>

      {/* 가운데: 인터랙션 모드 토글 (트렌디한 캡슐 디자인) */}
      <div
        className="flex items-center gap-1 p-1 rounded-full border"
        style={{ borderColor: 'rgba(0, 0, 0, 0.06)', backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
      >
        {/* 플레이 모드 */}
        <button
          id="landscape-mode-play"
          onClick={() => onModeChange('play')}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
          style={{
            backgroundColor: isPlayMode ? '#ffffff' : 'transparent',
            color: isPlayMode ? '#1f2937' : 'rgba(0, 0, 0, 0.4)',
            boxShadow: isPlayMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
          title="조각 배치 모드"
        >
          <Play size={11} strokeWidth={2.5} className={isPlayMode ? 'text-blue-500' : ''} />
          <span>플레이</span>
        </button>

        {/* 이동 모드 */}
        <button
          id="landscape-mode-move"
          onClick={() => onModeChange('move')}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
          style={{
            backgroundColor: isMoveMode ? '#ffffff' : 'transparent',
            color: isMoveMode ? '#1f2937' : 'rgba(0, 0, 0, 0.4)',
            boxShadow: isMoveMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
          title="패널 이동 모드"
        >
          <Move size={11} strokeWidth={2.5} className={isMoveMode ? 'text-blue-500' : ''} />
          <span>이동</span>
        </button>
      </div>

      {/* 오른쪽: 확대/축소 + 판 엎기 + 저장 */}
      <div className="flex items-center gap-3">
        {/* 확대/축소 (극도로 절제된 디자인) */}
        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            disabled={zoom <= 0.6}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-all disabled:opacity-20 disabled:pointer-events-none"
            title="축소"
          >
            <ZoomOut size={13} />
          </button>

          <span
            className="text-[10px] font-mono font-medium min-w-[28px] text-center text-gray-600"
          >
            {roundedZoom}x
          </span>

          <button
            onClick={onZoomIn}
            disabled={zoom >= 2.2}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-all disabled:opacity-20 disabled:pointer-events-none"
            title="확대"
          >
            <ZoomIn size={13} />
          </button>
        </div>

        <div className="w-px h-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.08)' }} />

        {/* 판 엎기 */}
        <button
          onClick={onShuffle}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
          title="판 엎기"
        >
          <Shuffle size={12} />
          <span className="hidden lg:inline text-[11px]">셔플</span>
        </button>

        <div className="w-px h-3 mx-0.5" style={{ backgroundColor: 'rgba(0, 0, 0, 0.08)' }} />

        {/* 저장/제출 */}
        <button
          onClick={onSave}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-150 disabled:opacity-70"
          style={{
            backgroundColor:
              saveStatus === 'saved'
                ? 'rgba(16, 185, 129, 0.1)'
                : saveStatus === 'saving'
                ? 'rgba(79, 142, 247, 0.1)'
                : '#4f8ef7',
            color: saveStatus === 'saved' ? '#10b981' : saveStatus === 'saving' ? '#4f8ef7' : '#fff',
            border: saveStatus === 'saved' ? '1px solid rgba(16, 185, 129, 0.2)' : saveStatus === 'saving' ? '1px solid rgba(79, 142, 247, 0.2)' : '1px solid transparent',
          }}
          title="저장/제출"
        >
          {saveStatus === 'saving' ? (
            <div className="w-3 h-3 border border-t-transparent border-current rounded-full animate-spin" />
          ) : saveStatus === 'saved' ? (
            <Check size={12} />
          ) : (
            <Save size={12} />
          )}
          <span className="hidden lg:inline text-[11px]">
            {saveStatus === 'saving' ? '저장 중' : saveStatus === 'saved' ? '완료' : '저장'}
          </span>
        </button>
      </div>
    </div>
  );
}
