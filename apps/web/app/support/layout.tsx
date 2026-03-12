import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '후원하기',
    description: '하루상자는 무료로 운영되고 있습니다. 서비스가 마음에 드셨다면 후원으로 응원해 주세요.',
    robots: {
        index: true,
        follow: true,
    },
};

export default function SupportLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
