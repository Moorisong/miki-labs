import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '동물 운명연구소',
    description: '반려동물과 집사의 관계·성향·운세를 오행 기반으로 분석해드립니다.',
    openGraph: {
        title: '동물 운명연구소 | 반려동물 오행 궁합 분석',
        description: '반려동물과 집사의 특별한 인연을 동양 명리학 오행 이론으로 분석해드립니다.',
        images: ['/og-image.png'],
    },
};

export default function PetDestinyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
