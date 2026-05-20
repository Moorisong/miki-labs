import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

async function getFont(text: string) {
  try {
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
    const question = searchParams.get('q') || '질문';
    const name = searchParams.get('name') || '친구';

    const bgUrl = new URL('/images/u-know/og-result-bg.png', req.url).toString();

    const textToLoad = `Q.${question}과연의대답은?!😲결과확인하기${name}`;
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
              backgroundColor: '#FFFBEB',
              border: '8px solid #3C1E1E',
              boxShadow: '16px 16px 0 0 #3C1E1E',
              borderRadius: '32px',
              padding: '60px 80px',
              maxWidth: '900px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', fontSize: '32px', color: '#64748B', marginBottom: '16px' }}>
              Q. {question}
            </div>
            <div style={{ display: 'flex', fontSize: '64px', color: '#1E293B', marginBottom: '32px' }}>
              과연 {name}의 대답은?! 😲
            </div>
            <div style={{ display: 'flex', fontSize: '40px', color: '#F59E0B', backgroundColor: '#FEF3C7', padding: '16px 32px', borderRadius: '999px', border: '4px solid #F59E0B' }}>
              결과 확인하기
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
