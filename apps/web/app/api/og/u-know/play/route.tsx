import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// TTF 폰트 파일 로드 (Edge 환경을 고려해 전체 폰트 대신 필요한 글자만 서브셋으로 로드)
async function getFont(text: string) {
  try {
    // User-Agent를 조작하여 WOFF2 대신 TTF를 반환받도록 유도
    const css = await fetch(`https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@900&text=${encodeURIComponent(text)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1' }
    }).then(res => res.text());
    
    const resource = css.match(/src: url\((.+)\) format\('(truetype|opentype)'\)/);
    if (resource) {
      return await fetch(resource[1]).then(res => res.arrayBuffer());
    }
  } catch (e) {
    console.error('Failed to load font:', e);
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const question = searchParams.get('q') || '내가 뭐라고 답할까?';

    const bgUrl = new URL('/images/u-know/og-play-bg.png', req.url).toString();

    // 폰트 로드할 텍스트 추출
    const textToLoad = `Q.${question}내대답을맞춰봐!🎯`;
    const fontData = await getFont(textToLoad);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <img
            src={bgUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1200px',
              height: '630px',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              border: '8px solid #1E293B',
              boxShadow: '16px 16px 0 0 rgba(30, 41, 59, 1)',
              borderRadius: '32px',
              padding: '60px 80px',
              maxWidth: '900px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', fontSize: '64px', color: '#1E293B', marginBottom: '24px', textAlign: 'center', whiteSpace: 'pre-wrap' }}>
              Q. {question}
            </div>
            <div style={{ display: 'flex', fontSize: '40px', color: '#FD79A8' }}>
              내 대답을 맞춰봐! 🎯
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fontData
          ? [
              {
                name: 'Noto Sans KR',
                data: fontData,
                style: 'normal',
                weight: 900,
              },
            ]
          : undefined,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate the image`, { status: 500 });
  }
}
