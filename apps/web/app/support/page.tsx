'use client';

import { useState } from 'react';
import { useToast } from '@/lib/hooks/use-toast';
import Toast from '@/components/ui/toast';
import styles from './page.module.css';

const ACCOUNT_INFO = {
    bank: '국민은행',
    number: '404601-01-365244',
    holder: '김*현(미키)',
};

export default function SupportPage() {
    const [isExpanded, setIsExpanded] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const handleSupportClick = () => {
        setIsExpanded((prev) => !prev);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(ACCOUNT_INFO.number);
            showToast('계좌번호가 복사되었습니다', 'success', 2500);
        } catch {
            showToast('복사에 실패했습니다', 'error', 2500);
        }
    };

    return (
        <div className={styles.container}>
            {/* 안내 문구 */}
            <section className={styles.messageSection}>
                <p className={styles.messageLine}>
                    이곳은 교사, 아이들을 위해 무료로 운영되고 있습니다.
                </p>

                <p className={styles.messageLine}>
                    혹시 이 서비스가 마음에 들었고
                    <br />
                    응원해 주고 싶은 분이 계시다면
                    <br />
                    아래 후원하기 버튼을 클릭해 주세요.
                </p>
                <p className={`${styles.messageLine} ${styles.messageMuted}`}>
                    물론 후원 없이도 모든 기능은 언제든 자유롭게 사용하실 수 있습니다.
                </p>
            </section>

            {/* 후원 버튼 */}
            <button
                id="support-button"
                className={styles.supportButton}
                onClick={handleSupportClick}
                type="button"
            >
                후원하기 💗
            </button>

            {/* 계좌 정보 expand 영역 */}
            <div className={`${styles.accountWrapper} ${isExpanded ? styles.expanded : ''}`}>
                <div className={styles.accountInner}>
                    <div className={styles.accountCard}>
                        <p className={styles.accountBank}>{ACCOUNT_INFO.bank}</p>
                        <div className={styles.accountNumberRow}>
                            <span className={styles.accountNumber}>{ACCOUNT_INFO.number}</span>
                            <button
                                id="copy-account-button"
                                className={styles.copyButton}
                                onClick={handleCopy}
                                type="button"
                            >
                                복사
                            </button>
                        </div>
                        <p className={styles.accountHolder}>{ACCOUNT_INFO.holder}</p>
                    </div>

                    {/* 하단 안내 */}
                    <div className={styles.footerMessage}>
                        <p>후원은 익명으로도 가능합니다.</p>
                        <p>보내주신 마음은 감사히 받겠습니다 :)</p>
                    </div>
                </div>
            </div>

            <Toast toast={toast} onHide={hideToast} />
        </div>
    );
}
