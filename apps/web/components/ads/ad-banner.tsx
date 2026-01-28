'use client';

import { usePathname } from 'next/navigation';
import KakaoAdfit, { ADFIT_SIZES, ADFIT_UNITS } from './kakao-adfit';
import styles from './ad-banner.module.css';

interface AdBannerProps {
    className?: string;
}

export default function AdBanner({ className }: AdBannerProps) {
    const pathname = usePathname();

    return (
        <div className={`${styles.adContainer} ${className || ''}`}>
            <KakaoAdfit
                key={pathname}
                unit={ADFIT_UNITS.MAIN_BANNER}
                width={ADFIT_SIZES.BANNER_320x100.width}
                height={ADFIT_SIZES.BANNER_320x100.height}
            />
        </div>
    );
}

