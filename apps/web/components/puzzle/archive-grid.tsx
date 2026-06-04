'use client';

import { Puzzle } from '@/types/puzzle';
import ArchivePuzzleCard from './archive-puzzle-card';

interface ArchiveGridProps {
  puzzles: Puzzle[];
  myHistory: {
    puzzleId: string;
    completionTime: number;
    myRank?: number;
    completed: boolean;
  }[];
  isHistoryLoaded?: boolean;
}

export default function ArchiveGrid({ puzzles, myHistory, isHistoryLoaded }: ArchiveGridProps) {
  // 내 히스토리 맵 구성 (퍼즐 ID별 데이터 맵핑)
  const historyMap = new Map(myHistory.map((h) => [h.puzzleId, h]));

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {puzzles.map((puzzle) => {
        const history = historyMap.get(puzzle._id);
        
        let status: 'current' | 'completed' | 'missed' = 'missed';
        if (history) {
          status = history.completed ? 'completed' : 'current';
        }

        const myTime = history && history.completed ? formatDuration(history.completionTime) : null;
        const myRank = history && history.myRank ? history.myRank : null;

        return (
          <ArchivePuzzleCard
            key={puzzle._id}
            puzzle={puzzle}
            status={status}
            myTime={myTime}
            myRank={myRank}
            isHistoryLoaded={isHistoryLoaded}
          />
        );
      })}
    </div>
  );
}
