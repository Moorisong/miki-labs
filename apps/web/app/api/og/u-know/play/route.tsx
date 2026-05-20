import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

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

// 질문 길이에 따라 동적으로 폰트 크기 결정
function getQuestionFontSize(text: string): number {
  const len = text.length;
  if (len <= 15) return 56;
  if (len <= 25) return 46;
  if (len <= 40) return 38;
  if (len <= 55) return 32;
  return 28;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const question = searchParams.get('q') || '친구가 보낸 질문이 있어!';

    // 질문이 너무 길면 잘라서 '...' 처리
    const maxLen = 100;
    // OG 이미지에서는 줄바꿈을 공백으로 치환하여 한 줄로 표시
    const sanitizedQuestion = question.replace(/\n/g, ' ');
    const displayQuestion = sanitizedQuestion.length > maxLen ? sanitizedQuestion.slice(0, maxLen) + '...' : sanitizedQuestion;

    const bgPath = path.join(process.cwd(), 'public', 'images', 'u-know', 'og-play-bg.png');
    const bgData = fs.readFileSync(bgPath).toString('base64');
    const bgSrc = `data:image/png;base64,${bgData}`;

    const questionFontSize = getQuestionFontSize(displayQuestion);
    const textToLoad = `너잘알${displayQuestion}친구가너한테질문을던졌어나도답변하러가기`;
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
            padding: '40px 60px',
            position: 'relative',
          }}
        >
          {/* 너잘알 타이틀 (배경 없이 폰트 강조) */}
          <div
            style={{
              display: 'flex',
              fontSize: '48px',
              color: '#6C5CE7',
              fontWeight: 900,
              letterSpacing: '-1px',
              marginBottom: '20px',
              textShadow: '3px 3px 0px rgba(108, 92, 231, 0.2)', // 폰트 효과
            }}
          >
            너잘알 👀
          </div>


          {/* 질문 텍스트 박스 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F8F6FF',
              border: '4px solid #6C5CE7',
              borderRadius: '20px',
              padding: '36px 48px',
              fontSize: `${questionFontSize}px`,
              color: '#1E293B',
              fontWeight: 900,
              lineHeight: 1.4,
              textAlign: 'center',
              width: '100%',
              whiteSpace: 'normal',
              wordBreak: 'keep-all',
            }}
          >
            {displayQuestion}
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
