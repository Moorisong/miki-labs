import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: '이용약관',
    description: '하루상자 서비스 이용약관입니다. 서비스 이용 전 반드시 읽어주세요.',
    robots: { index: true, follow: true },
};

export default function TermsPage() {
    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <header className={styles.header}>
                    <h1 className={styles.title}>이용약관</h1>
                    <p className={styles.lastUpdated}>최종 업데이트: 2026년 1월 1일</p>
                </header>

                <section className={styles.notice}>
                    <p>
                        본 약관은 <strong>하루상자</strong>(이하 &quot;서비스&quot;)가 제공하는 웹 서비스 이용에 관한 조건과 절차를
                        규정합니다. 서비스를 이용하거나 회원으로 가입하는 경우 본 약관에 동의한 것으로 간주됩니다.
                    </p>
                </section>

                <nav className={styles.toc}>
                    <h2 className={styles.tocTitle}>목차</h2>
                    <ol className={styles.tocList}>
                        <li><a href="#article1">제1조 (목적)</a></li>
                        <li><a href="#article2">제2조 (정의)</a></li>
                        <li><a href="#article3">제3조 (약관의 효력 및 변경)</a></li>
                        <li><a href="#article4">제4조 (서비스의 구성 및 변경)</a></li>
                        <li><a href="#article5">제5조 (회원가입 및 계정)</a></li>
                        <li><a href="#article6">제6조 (서비스 이용)</a></li>
                        <li><a href="#article7">제7조 (이용자의 의무)</a></li>
                        <li><a href="#article8">제8조 (금지 행위)</a></li>
                        <li><a href="#article9">제9조 (지식재산권)</a></li>
                        <li><a href="#article10">제10조 (서비스 중단 및 변경)</a></li>
                        <li><a href="#article11">제11조 (면책조항)</a></li>
                        <li><a href="#article12">제12조 (분쟁 해결)</a></li>
                    </ol>
                </nav>

                <div className={styles.content}>

                    <article id="article1" className={styles.article}>
                        <h2 className={styles.articleTitle}>제1조 (목적)</h2>
                        <p>
                            본 약관은 하루상자가 운영하는 웹 플랫폼 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 서비스 운영자와
                            이용자 간의 권리, 의무, 책임사항 및 기타 필요한 사항을 규정함을 목적으로 합니다.
                        </p>
                    </article>

                    <article id="article2" className={styles.article}>
                        <h2 className={styles.articleTitle}>제2조 (정의)</h2>
                        <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
                        <ol className={styles.orderedList}>
                            <li>
                                <strong>&quot;서비스&quot;</strong>란 하루상자가 제공하는 웹 기반 미니콘텐츠 플랫폼으로, 현재 제공 중인
                                콘텐츠 및 향후 추가될 모든 콘텐츠를 포함합니다.
                            </li>
                            <li>
                                <strong>&quot;이용자&quot;</strong>란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.
                            </li>
                            <li>
                                <strong>&quot;회원&quot;</strong>이란 소셜 로그인(카카오 등)을 통해 계정을 생성하고, 추가 기능을 이용하는
                                이용자를 말합니다.
                            </li>
                            <li>
                                <strong>&quot;비회원&quot;</strong>이란 로그인 없이 서비스의 일부 기능을 이용하는 자를 말합니다.
                            </li>
                            <li>
                                <strong>&quot;콘텐츠&quot;</strong>란 서비스 내에서 제공되는 미니게임, 심리테스트, 성격검사, 롤링페이퍼,
                                운세 서비스 등 일체의 디지털 콘텐츠를 말합니다.
                            </li>
                        </ol>
                    </article>

                    <article id="article3" className={styles.article}>
                        <h2 className={styles.articleTitle}>제3조 (약관의 효력 및 변경)</h2>
                        <ol className={styles.orderedList}>
                            <li>본 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.</li>
                            <li>서비스는 필요한 경우 언제든지 본 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지를 통해 안내합니다.</li>
                            <li>
                                변경된 약관은 공지 후 7일이 경과한 시점부터 효력이 발생합니다. 단, 이용자에게 불리한 변경의 경우 30일
                                이상의 사전 공지 기간을 둡니다.
                            </li>
                            <li>이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하거나 회원 탈퇴를 요청할 수 있습니다.</li>
                        </ol>
                    </article>

                    <article id="article4" className={styles.article}>
                        <h2 className={styles.articleTitle}>제4조 (서비스의 구성 및 변경)</h2>
                        <ol className={styles.orderedList}>
                            <li>
                                서비스는 다양한 미니콘텐츠로 구성되며, 현재 제공 중인 콘텐츠 외에도 새로운 콘텐츠가 지속적으로 추가될 수
                                있습니다.
                            </li>
                            <li>
                                서비스는 운영상, 기술상의 필요에 의해 사전 통지 없이 콘텐츠를 추가, 변경, 중단할 수 있습니다. 단, 유료
                                서비스의 경우 사전 공지를 통해 안내합니다.
                            </li>
                            <li>
                                현재 하루상자에서 제공하는 주요 서비스는 다음과 같으며, 이에 한정되지 않습니다.
                                <ul className={styles.unorderedList}>
                                    <li>교사 전용 서비스 툴 (TOBY)</li>
                                    <li>성격 및 심리 테스트 (자아탐험 등)</li>
                                    <li>롤링페이퍼 서비스</li>
                                    <li>기타 미니콘텐츠 (추가 예정 포함)</li>
                                </ul>
                            </li>
                        </ol>
                    </article>

                    <article id="article5" className={styles.article}>
                        <h2 className={styles.articleTitle}>제5조 (회원가입 및 계정)</h2>
                        <ol className={styles.orderedList}>
                            <li>
                                서비스는 소셜 로그인(카카오 등) 방식의 회원가입을 제공합니다. 이용자는 소셜 서비스 이용약관에 동의해야
                                합니다.
                            </li>
                            <li>비회원도 일부 콘텐츠를 이용할 수 있으나, 기록 저장·랭킹 등 일부 기능은 회원에게만 제공됩니다.</li>
                            <li>하나의 소셜 계정으로는 하나의 서비스 계정만 생성할 수 있습니다.</li>
                            <li>
                                이용자는 자신의 계정 정보를 타인에게 공유하거나 양도할 수 없으며, 계정 보안에 대한 책임은 이용자 본인에게
                                있습니다.
                            </li>
                            <li>
                                서비스는 다음의 경우 회원 자격을 제한하거나 계정을 삭제할 수 있습니다.
                                <ul className={styles.unorderedList}>
                                    <li>허위 정보를 이용한 가입</li>
                                    <li>타인의 계정을 도용한 경우</li>
                                    <li>서비스 이용 규칙을 위반한 경우</li>
                                    <li>기타 서비스 운영을 방해하는 행위를 한 경우</li>
                                </ul>
                            </li>
                        </ol>
                    </article>

                    <article id="article6" className={styles.article}>
                        <h2 className={styles.articleTitle}>제6조 (서비스 이용)</h2>
                        <ol className={styles.orderedList}>
                            <li>서비스는 연중무휴 24시간 이용 가능함을 원칙으로 합니다.</li>
                            <li>정기점검, 서버 유지보수 등의 이유로 서비스가 일시 중단될 수 있으며, 이 경우 사전에 공지합니다.</li>
                            <li>서비스 이용은 무료를 원칙으로 하되, 특정 콘텐츠는 유료로 제공될 수 있으며 이 경우 별도 안내합니다.</li>
                        </ol>
                    </article>

                    <article id="article7" className={styles.article}>
                        <h2 className={styles.articleTitle}>제7조 (이용자의 의무)</h2>
                        <ol className={styles.orderedList}>
                            <li>이용자는 관계 법령, 본 약관 및 서비스의 이용 안내를 준수해야 합니다.</li>
                            <li>이용자는 서비스 이용 시 타인의 권리를 침해하거나 서비스 운영을 방해해서는 안 됩니다.</li>
                            <li>이용자는 본인의 계정을 안전하게 관리할 책임이 있습니다.</li>
                        </ol>
                    </article>

                    <article id="article8" className={styles.article}>
                        <h2 className={styles.articleTitle}>제8조 (금지 행위)</h2>
                        <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
                        <ol className={styles.orderedList}>
                            <li>서비스 운영을 방해하는 행위 (DDoS, 자동화 도구 남용 등)</li>
                            <li>타인의 계정 또는 개인정보를 무단으로 이용하는 행위</li>
                            <li>서비스 내 랭킹, 점수 등을 비정상적인 방법으로 조작하는 행위</li>
                            <li>서비스의 소스코드, 알고리즘을 무단으로 복제·역설계하는 행위</li>
                            <li>허위 정보를 유포하거나 타인을 기만하는 행위</li>
                            <li>기타 관계 법령에 위반되는 행위</li>
                        </ol>
                    </article>

                    <article id="article9" className={styles.article}>
                        <h2 className={styles.articleTitle}>제9조 (지식재산권)</h2>
                        <ol className={styles.orderedList}>
                            <li>
                                서비스 내 콘텐츠(로고, 디자인, 텍스트, 코드, 이미지 등)의 저작권은 하루상자 또는 정당한 권리자에게
                                귀속됩니다.
                            </li>
                            <li>이용자는 서비스 내 콘텐츠를 사전 동의 없이 복제, 배포, 수정, 상업적으로 이용할 수 없습니다.</li>
                            <li>
                                서비스 이용 중 이용자가 생성한 데이터(게임 결과, 테스트 응답 등)의 저작권은 이용자에게 있으나, 서비스는
                                서비스 개선 및 통계 목적으로 이를 익명화하여 활용할 수 있습니다.
                            </li>
                        </ol>
                    </article>

                    <article id="article10" className={styles.article}>
                        <h2 className={styles.articleTitle}>제10조 (서비스 중단 및 변경)</h2>
                        <ol className={styles.orderedList}>
                            <li>서비스는 사업적 또는 기술적 사정에 의해 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.</li>
                            <li>서비스 중단 시, 이용자에게 사전에 공지합니다. 다만, 불가피한 사유(서버 장애 등)가 있는 경우 사후 공지할 수 있습니다.</li>
                        </ol>
                    </article>

                    <article id="article11" className={styles.article}>
                        <h2 className={styles.articleTitle}>제11조 (면책조항)</h2>
                        <ol className={styles.orderedList}>
                            <li>서비스는 콘텐츠(게임, 테스트, 운세 등)의 결과에 대해 어떠한 보장도 하지 않습니다.</li>
                            <li>
                                서비스 내 심리테스트, 성격검사 등의 결과는 오락 및 참고 목적으로만 제공되며, 전문적인 심리
                                상담, 의학적 조언 또는 법적 판단을 대체하지 않습니다.
                            </li>
                            <li>서비스는 이용자 간의 분쟁에 개입할 의무가 없으며, 이로 인한 손해에 대해 책임을 지지 않습니다.</li>
                            <li>
                                천재지변, 서버 장애, 네트워크 오류 등 불가항력적인 사유로 인한 서비스 중단에 대해 서비스는 책임을 지지
                                않습니다.
                            </li>
                        </ol>
                    </article>

                    <article id="article12" className={styles.article}>
                        <h2 className={styles.articleTitle}>제12조 (분쟁 해결)</h2>
                        <ol className={styles.orderedList}>
                            <li>서비스 이용과 관련하여 분쟁이 발생한 경우, 운영자와 이용자는 상호 협의를 통해 해결을 노력합니다.</li>
                            <li>협의가 이루어지지 않을 경우, 대한민국 법원을 관할 법원으로 합니다.</li>
                            <li>서비스 이용 관련 문의 및 불만 사항은 서비스 내 문의 채널을 통해 접수할 수 있습니다.</li>
                        </ol>
                    </article>

                </div>

                <footer className={styles.footer}>
                    <p>본 약관은 <strong>2026년 1월 1일</strong>부터 시행됩니다.</p>
                </footer>
            </div>
        </div>
    );
}
