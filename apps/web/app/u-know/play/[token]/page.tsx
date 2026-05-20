import PlayContent from '@/contents/u-know/components/play-content';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://box.haroo.site';

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const question = (sp.q as string) || '내가 뭐라고 답할까?';

  const ogImageUrl = `${BASE_URL}/api/og/u-know/play?q=${encodeURIComponent(question)}`;

  return {
    title: '질문지가 도착했어요!',
    description: `"${question}"\n내가 뭐라고 답할지 맞춰봐! 😆`,
    openGraph: {
      title: '질문지가 도착했어요!',
      description: `"${question}"\n내가 뭐라고 답할지 맞춰봐! 😆`,
      images: [
        {
          url: ogImageUrl,
          width: 800,
          height: 400,
        },
      ],
    },
  };
}

export default async function UKnowPlayPage({ params }: PageProps) {
  const { token } = await params;
  return <PlayContent token={token} />;
}
