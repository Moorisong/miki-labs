import { Metadata } from 'next';
import { fetchCurrentPuzzle } from '@/lib/puzzle-api';
import PuzzlePageClient from './page.client';

export async function generateMetadata(): Promise<Metadata> {
  const res = await fetchCurrentPuzzle();
  if (res.success && res.data) {
    const puzzle = res.data;
    const imageUrl = puzzle.imageUrl.startsWith('http') 
      ? puzzle.imageUrl 
      : `https://box.haroo.site${puzzle.imageUrl}`;
    
    return {
      title: {
        absolute: '하루퍼즐 | 주간 랭킹 직소퍼즐'
      },
      description: `바쁜 일상 속 소소한 퍼즐 한 조각 어떠세요? ☕`,
      openGraph: {
        title: `[하루퍼즐] 이번 주 퍼즐 도착!`,
        description: `바쁜 일상 속 소소한 퍼즐 한 조각 어떠세요? ☕`,
        url: 'https://box.haroo.site/puzzle',
        type: 'website',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: puzzle.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `[하루퍼즐] 이번 주 퍼즐 도착!`,
        description: `바쁜 일상 속 소소한 퍼즐 한 조각 어떠세요? ☕`,
        images: [imageUrl],
      },
    };
  }

  return {
    title: {
      absolute: '하루퍼즐 | 주간 랭킹 직소퍼즐'
    },
    description: '바쁜 일상 속 소소한 퍼즐 한 조각 어떠세요? ☕',
  };
}

export default function PuzzlePage() {
  return <PuzzlePageClient />;
}
