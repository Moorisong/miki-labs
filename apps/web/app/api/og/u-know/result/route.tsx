import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

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

    // 질문이 너무 길면 잘라서 '...' 처리
    const maxLen = 100;
    const displayQuestion = question.length > maxLen ? question.slice(0, maxLen) + '...' : question;

    // 길이에 따라 폰트 크기 조절
    const qFontSize = displayQuestion.length <= 20 ? 46 : displayQuestion.length <= 40 ? 38 : 32;

    const textToLoad = `너잘알Q.${displayQuestion}의대답보러가자!😲${name}👀`;
    const fontData = await getFont(textToLoad);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            padding: '32px 60px',
            position: 'relative',
          }}
        >
          {/* 너잘알 타이틀 (배경 없이 폰트 강조) */}
          <div
            style={{
              display: 'flex',
              fontSize: '56px',
              color: '#6C5CE7',
              fontWeight: 900,
              letterSpacing: '-1px',
              marginBottom: '16px',
              textShadow: '3px 3px 0px rgba(108, 92, 231, 0.2)',
            }}
          >
            너잘알 👀
          </div>

          {/* 결과 텍스트 박스 - 질문만 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F8F6FF',
              border: '4px solid #6C5CE7',
              borderRadius: '20px',
              padding: '36px 48px',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: `${qFontSize}px`,
                color: '#1E293B',
                fontWeight: 900,
                textAlign: 'center',
                wordBreak: 'keep-all',
                lineHeight: 1.3,
                whiteSpace: 'pre-wrap',
                justifyContent: 'center',
              }}
            >
              {displayQuestion}
            </div>
          </div>

          {/* 이름 텍스트 - 박스 밖 */}
          <div
            style={{
              display: 'flex',
              fontSize: '38px',
              color: '#1E293B',
              fontWeight: 900,
              marginTop: '16px',
              textAlign: 'center',
              wordBreak: 'keep-all',
            }}
          >
            {name}의 대답은 과연?! 😲
          </div>
        </div>
      ),
      {
        width: 800,
        height: 400,
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
