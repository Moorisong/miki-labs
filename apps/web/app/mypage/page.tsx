import Link from 'next/link';
import { ROUTES } from '@/constants';

export default function MyPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '4rem 2rem',
            background: '#f7fafc',
        }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: '#2d3748',
                    marginBottom: '1rem'
                }}>마이페이지</h1>
            </header>

            <div style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '20px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                textAlign: 'center',
                maxWidth: '500px',
                width: '100%'
            }}>
                <div style={{
                    width: '100px', height: '100px', background: '#edf2f7', borderRadius: '50%', margin: '0 auto 1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem'
                }}>
                    👤
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#2d3748' }}>GUEST</h2>
                <p style={{ color: '#718096', marginBottom: '2rem' }}>로그인 정보가 없습니다.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link
                        href={ROUTES.LOGIN}
                        style={{
                            padding: '12px',
                            background: '#4299e1',
                            color: 'white',
                            fontWeight: 'bold',
                            borderRadius: '10px',
                            textDecoration: 'none'
                        }}
                    >
                        로그인
                    </Link>

                    <Link
                        href={ROUTES.HOME}
                        style={{
                            padding: '12px',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            color: '#4a5568',
                            borderRadius: '10px',
                            textDecoration: 'none'
                        }}
                    >
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
}
