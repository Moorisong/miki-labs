import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: '개인정보처리방침',
    description: '하루상자 개인정보처리방침입니다. 수집하는 개인정보 항목, 이용 목적, 보유 기간 등을 확인하세요.',
    robots: { index: true, follow: true },
};

export default function PrivacyPage() {
    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <header className={styles.header}>
                    <h1 className={styles.title}>개인정보처리방침</h1>
                    <p className={styles.lastUpdated}>최종 업데이트: 2026년 1월 1일</p>
                </header>

                <section className={styles.notice}>
                    <p>
                        <strong>하루상자</strong>는 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 및 관계 법령을 준수합니다.
                        본 방침은 하루상자가 운영하는 서비스에서 수집하는 개인정보의 항목, 수집 목적, 보유 기간 등을 설명합니다.
                    </p>
                </section>

                <nav className={styles.toc}>
                    <h2 className={styles.tocTitle}>목차</h2>
                    <ol className={styles.tocList}>
                        <li><a href="#section1">제1조 (수집하는 개인정보 항목)</a></li>
                        <li><a href="#section2">제2조 (개인정보 수집 및 이용 목적)</a></li>
                        <li><a href="#section3">제3조 (개인정보 보유 및 이용 기간)</a></li>
                        <li><a href="#section4">제4조 (개인정보의 제3자 제공)</a></li>
                        <li><a href="#section5">제5조 (개인정보 처리 위탁)</a></li>
                        <li><a href="#section6">제6조 (이용자 권리 및 행사 방법)</a></li>
                        <li><a href="#section7">제7조 (개인정보 자동 수집 장치)</a></li>
                        <li><a href="#section8">제8조 (개인정보 보호 조치)</a></li>
                        <li><a href="#section9">제9조 (개인정보보호 책임자)</a></li>
                        <li><a href="#section10">제10조 (방침 변경)</a></li>
                    </ol>
                </nav>

                <div className={styles.content}>

                    <article id="section1" className={styles.article}>
                        <h2 className={styles.articleTitle}>제1조 (수집하는 개인정보 항목)</h2>
                        <p>하루상자는 서비스 이용을 위해 다음과 같은 개인정보를 수집합니다.</p>

                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>구분</th>
                                        <th>수집 항목</th>
                                        <th>수집 방법</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>소셜 로그인 (카카오)</td>
                                        <td>닉네임, 프로필 이미지 (선택), 카카오 고유 식별자</td>
                                        <td>회원가입 시 자동 수집</td>
                                    </tr>
                                    <tr>
                                        <td>서비스 이용 기록</td>
                                        <td>게임 점수, 콘텐츠 이용 기록, 접속 일시</td>
                                        <td>서비스 이용 중 자동 수집</td>
                                    </tr>
                                    <tr>
                                        <td>기기·접속 정보</td>
                                        <td>IP 주소, 브라우저 유형, 운영체제, 쿠키</td>
                                        <td>서비스 접속 시 자동 수집</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.highlight}>
                            <p>
                                💡 비회원의 경우 로그인 없이 서비스를 이용할 수 있으며, 이 경우 소셜 로그인 관련 정보는 수집되지 않습니다.
                                서비스에 새로운 콘텐츠가 추가될 경우, 해당 콘텐츠에서 수집하는 개인정보 항목을 본 방침에 추가하여 안내합니다.
                            </p>
                        </div>
                    </article>

                    <article id="section2" className={styles.article}>
                        <h2 className={styles.articleTitle}>제2조 (개인정보 수집 및 이용 목적)</h2>
                        <p>하루상자는 수집한 개인정보를 다음 목적으로 이용합니다.</p>
                        <ol className={styles.orderedList}>
                            <li>
                                <strong>회원 관리:</strong> 회원 식별, 로그인 인증, 중복 가입 방지, 부정 이용 방지
                            </li>
                            <li>
                                <strong>서비스 제공:</strong> 콘텐츠 이용, 게임 기록 저장, 랭킹 시스템 운영, 개인화된 서비스 제공
                            </li>
                            <li>
                                <strong>서비스 개선:</strong> 이용 통계 분석, 서비스 오류 파악 및 개선, 신규 콘텐츠 개발
                            </li>
                            <li>
                                <strong>법적 의무 이행:</strong> 관계 법령에 따른 기록 보존 및 분쟁 처리
                            </li>
                        </ol>
                    </article>

                    <article id="section3" className={styles.article}>
                        <h2 className={styles.articleTitle}>제3조 (개인정보 보유 및 이용 기간)</h2>
                        <p>
                            하루상자는 개인정보 수집 목적이 달성된 후, 또는 이용자가 서비스 탈퇴를 요청한 경우 지체 없이 개인정보를
                            파기합니다. 단, 관계 법령에 의한 보관 의무가 있는 경우 해당 기간 동안 보관합니다.
                        </p>

                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>보유 항목</th>
                                        <th>보유 기간</th>
                                        <th>근거</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>회원 계정 정보</td>
                                        <td>회원 탈퇴 시까지</td>
                                        <td>서비스 이용 계약</td>
                                    </tr>
                                    <tr>
                                        <td>서비스 이용 기록</td>
                                        <td>서비스 탈퇴 후 즉시 삭제</td>
                                        <td>서비스 이용 계약</td>
                                    </tr>
                                    <tr>
                                        <td>전자상거래 관련 기록</td>
                                        <td>5년</td>
                                        <td>전자상거래법</td>
                                    </tr>
                                    <tr>
                                        <td>소비자 불만·분쟁 기록</td>
                                        <td>3년</td>
                                        <td>전자상거래법</td>
                                    </tr>
                                    <tr>
                                        <td>접속 로그</td>
                                        <td>3개월</td>
                                        <td>통신비밀보호법</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <article id="section4" className={styles.article}>
                        <h2 className={styles.articleTitle}>제4조 (개인정보의 제3자 제공)</h2>
                        <p>
                            하루상자는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 단, 다음의 경우에는 예외로 합니다.
                        </p>
                        <ol className={styles.orderedList}>
                            <li>이용자가 사전에 동의한 경우</li>
                            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                        </ol>
                    </article>

                    <article id="section5" className={styles.article}>
                        <h2 className={styles.articleTitle}>제5조 (개인정보 처리 위탁)</h2>
                        <p>하루상자는 서비스 운영을 위해 다음과 같이 개인정보 처리를 외부 업체에 위탁할 수 있습니다.</p>

                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>수탁 업체</th>
                                        <th>위탁 업무</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>카카오㈜</td>
                                        <td>소셜 로그인(OAuth) 인증 처리</td>
                                    </tr>
                                    <tr>
                                        <td>클라우드 인프라 제공사</td>
                                        <td>서버 운영 및 데이터 저장</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <p className={styles.smallText}>
                            위탁 업무의 내용이나 수탁자가 변경될 경우 본 방침을 통해 공지합니다.
                        </p>
                    </article>

                    <article id="section6" className={styles.article}>
                        <h2 className={styles.articleTitle}>제6조 (이용자 권리 및 행사 방법)</h2>
                        <p>이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다.</p>
                        <ol className={styles.orderedList}>
                            <li>
                                <strong>개인정보 열람 요청:</strong> 수집·이용 중인 개인정보 내용 확인
                            </li>
                            <li>
                                <strong>개인정보 수정·삭제 요청:</strong> 부정확한 정보의 수정 또는 삭제
                            </li>
                            <li>
                                <strong>처리 정지 요청:</strong> 개인정보 처리의 일시적 중단 요청
                            </li>
                            <li>
                                <strong>회원 탈퇴:</strong> 계정 삭제 및 개인정보 파기 요청
                            </li>
                        </ol>
                        <p>
                            위 권리 행사는 서비스 내 계정 설정 또는{' '}
                            <a href="mailto:thiagooo@naver.com" className={styles.emailLink}>thiagooo@naver.com</a>로 이메일 문의를
                            통해 하실 수 있으며, 10일 이내에 처리합니다.
                        </p>
                    </article>

                    <article id="section7" className={styles.article}>
                        <h2 className={styles.articleTitle}>제7조 (개인정보 자동 수집 장치)</h2>
                        <ol className={styles.orderedList}>
                            <li>
                                <strong>쿠키(Cookie):</strong> 하루상자는 이용자 경험 개선을 위해 쿠키를 사용합니다. 쿠키는 세션 유지,
                                로그인 상태 저장 등에 활용됩니다.
                            </li>
                            <li>
                                이용자는 브라우저 설정을 통해 쿠키 수집을 거부할 수 있습니다. 단, 이 경우 서비스 일부 기능 이용이
                                어려울 수 있습니다.
                            </li>
                            <li>
                                <strong>분석 도구:</strong> 서비스 개선을 위해 방문자 분석 도구(예: Google Analytics 등)를 사용할 수
                                있으며, 수집되는 정보는 익명화된 통계 데이터입니다.
                            </li>
                        </ol>
                    </article>

                    <article id="section8" className={styles.article}>
                        <h2 className={styles.articleTitle}>제8조 (개인정보 보호 조치)</h2>
                        <p>하루상자는 개인정보 보호를 위해 다음과 같은 기술적·관리적 조치를 취합니다.</p>
                        <ol className={styles.orderedList}>
                            <li>개인정보 전송 시 HTTPS 암호화 통신 적용</li>
                            <li>비밀번호 등 민감 정보의 안전한 암호화 저장</li>
                            <li>개인정보 접근 권한 최소화 및 접근 기록 관리</li>
                            <li>외부 해킹 및 침해 대비 보안 시스템 운영</li>
                        </ol>
                    </article>

                    <article id="section9" className={styles.article}>
                        <h2 className={styles.articleTitle}>제9조 (개인정보보호 책임자)</h2>
                        <p>개인정보 처리에 관한 업무를 담당하고, 관련 민원 처리를 위해 아래와 같이 개인정보보호 책임자를 지정합니다.</p>
                        <div className={styles.contactBox}>
                            <p><strong>담당부서:</strong> 하루상자 운영팀</p>
                            <p>
                                <strong>문의 이메일:</strong>{' '}
                                <a href="mailto:thiagooo@naver.com" className={styles.emailLink}>thiagooo@naver.com</a>
                            </p>
                        </div>
                        <p>
                            개인정보 침해에 관한 신고·상담은 개인정보보호위원회(www.pipc.go.kr) 또는 개인정보침해신고센터(118)에
                            문의하실 수 있습니다.
                        </p>
                    </article>

                    <article id="section10" className={styles.article}>
                        <h2 className={styles.articleTitle}>제10조 (방침 변경)</h2>
                        <ol className={styles.orderedList}>
                            <li>
                                본 개인정보처리방침은 법령 개정, 서비스 변경, 새로운 콘텐츠 추가 등의 사유로 내용이 변경될 수 있습니다.
                            </li>
                            <li>방침 변경 시 최소 7일 전 서비스 내 공지를 통해 안내합니다.</li>
                            <li>이용자는 변경된 방침에 동의하지 않을 경우 서비스 이용을 중단하거나 탈퇴를 요청할 수 있습니다.</li>
                        </ol>
                    </article>

                </div>

                <footer className={styles.footer}>
                    <p>본 방침은 <strong>2026년 1월 1일</strong>부터 시행됩니다.</p>
                </footer>
            </div>
        </div>
    );
}
