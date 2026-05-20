import ResultContent from '@/contents/u-know/components/result-content';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://haroobox.com';

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const question = (sp.q as string) || '질문';
  const name = (sp.name as string) || '친구';

  const ogImageUrl = `${BASE_URL}/api/og/u-know/result?q=${encodeURIComponent(question)}&name=${encodeURIComponent(name)}`;

  return {
    title: `너잘알 - ${name}의 대답은?!`,
    description: `"${question}" - ${name}의 대답은 과연?! 결과를 확인해보세요!`,
    openGraph: {
      title: `너잘알 - ${name}의 대답은?!`,
      description: `"${question}" - ${name}의 대답은 과연?! 결과를 확인해보세요!`,
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

export default async function UKnowResultPage({ params }: PageProps) {
  const { token } = await params;
  return <ResultContent token={token} />;
}
