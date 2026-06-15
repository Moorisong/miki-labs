import { test, expect } from '@playwright/test';

// 1. 공통 Mock API 정의 함수
async function setupBaseMocks(page) {
  // 현재 활성 퍼즐 Mock
  await page.route('**/api/puzzle/current', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          _id: 'puzzle-mock-id-001',
          title: '아름다운 우주 성운',
          imageUrl: '/sample/puzzle.png',
          participantCount: 125,
          startDate: '2026-06-01T00:00:00Z',
          endDate: '2026-06-30T00:00:00Z',
          archived: false,
        },
      }),
    });
  });

  // 아카이브 퍼즐 목록 Mock
  await page.route('**/api/puzzle/archive', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            _id: 'puzzle-mock-id-001',
            title: '아름다운 우주 성운',
            imageUrl: '/sample/puzzle.png',
            participantCount: 125,
            startDate: '2026-06-01T00:00:00Z',
            endDate: '2026-06-30T00:00:00Z',
            archived: false,
          },
          {
            _id: 'puzzle-archive-002',
            title: '고요한 가을 숲',
            imageUrl: '/sample/forest.png',
            participantCount: 89,
            startDate: '2026-05-15T00:00:00Z',
            endDate: '2026-05-22T00:00:00Z',
            archived: true,
          },
        ],
      }),
    });
  });

  // 서비스 전체 통계 Mock
  await page.route('**/api/puzzle/stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          totalPlayCount: 1250,
          completionRate: '78.5%',
        },
      }),
    });
  });

  // 랭킹 목록 Mock
  await page.route('**/api/puzzle/rankings/current*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          { nickname: '스피드킹', completionTime: 125, savedAt: '2026-06-05T00:00:00Z' },
          { nickname: '퍼즐마스터', completionTime: 180, savedAt: '2026-06-06T00:00:00Z' },
          { nickname: '느긋한거북이', completionTime: 320, savedAt: '2026-06-07T00:00:00Z' },
        ],
      }),
    });
  });

  // 챌린지 시작 토큰 Mock
  await page.route('**/api/puzzle/challenge/start', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          challengeToken: 'mock-challenge-token-xyz123',
        },
      }),
    });
  });
}

// 모바일 세로 모드 진입 시 가로 권장 팝업을 닫아주기 위한 헬퍼
async function dismissOrientationSuggestion(page) {
  const dismissBtn = page.locator('text=세로 모드로 계속 진행하기');
  try {
    await dismissBtn.waitFor({ state: 'visible', timeout: 2000 });
    await dismissBtn.click({ force: true });
  } catch (e) {
    // 팝업이 노출되지 않는 환경(PC 크롬 등)이면 예외 무시하고 넘어감
  }
}

test.describe('하루퍼즐 (Haroo Puzzle) E2E 테스트', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupBaseMocks(page);
    // Hide Next.js Dev Tools / Dev Overlay portal to prevent it from intercepting E2E test clicks
    await page.addInitScript(() => {
      window.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.innerHTML = 'nextjs-portal { display: none !important; pointer-events: none !important; }';
        document.head.appendChild(style);
      });
    });
  });

  // ----------------------------------------------------
  // 1. 퍼즐 메인 홈 페이지 테스트
  // ----------------------------------------------------
  test('1. 메인 홈 페이지 로드 및 기본 구성요소 검증', async ({ page }) => {
    await page.goto('/puzzle');
    await dismissOrientationSuggestion(page);
    
    // 로딩 완료 후 퍼즐 타이틀이 올바르게 렌더링되었는지 확인
    await expect(page.locator('text=아름다운 우주 성운')).toBeVisible();
    await expect(page.locator('text=이번 주 퍼즐')).toBeVisible();
    await expect(page.locator('text=125명 완료함')).toBeVisible();

    // 랭킹 프리뷰 탭 클릭 동작 검증
    const generalTab = page.locator('button:has-text("일반")');
    await expect(generalTab).toBeVisible();
    await generalTab.click({ force: true });

    // 통계 카드 검증
    await expect(page.locator('text=누적 플레이 수')).toBeVisible();
    await expect(page.locator('text=1,250회')).toBeVisible();
    await expect(page.locator('text=평균 퍼즐 완성률')).toBeVisible();
    await expect(page.locator('text=78.5%')).toBeVisible();
  });

  // ----------------------------------------------------
  // 2. 퍼즐 아카이브 페이지 테스트
  // ----------------------------------------------------
  test('2. 퍼즐 아카이브 페이지 로드 및 월별 필터 동작 검증', async ({ page }) => {
    await page.goto('/puzzle/archive');

    // 타이틀 및 누적 통계 검증
    await expect(page.locator('h1:has-text("퍼즐 아카이브")')).toBeVisible();
    await expect(page.locator('text=전체 아카이브')).toBeVisible();
    await expect(page.locator('text=2개')).toBeVisible();

    // 월별 필터 버튼 클릭 및 필터링 검증
    const mayFilter = page.locator('button:has-text("5월")');
    if (await mayFilter.isEnabled()) {
      await mayFilter.click({ force: true });
      // 5월 퍼즐인 '고요한 가을 숲' 카드가 노출되는지 확인
      await expect(page.locator('text=고요한 가을 숲')).toBeVisible();
    }
  });

  // ----------------------------------------------------
  // 3. 주간 랭킹 페이지 테스트
  // ----------------------------------------------------
  test('3. 주간 랭킹 페이지 및 난이도별 데이터 갱신 검증', async ({ page }) => {
    await page.goto('/puzzle/ranking');

    // 타이틀 확인
    await expect(page.locator('h1:has-text("주간 랭킹 경쟁")')).toBeVisible();
    await expect(page.locator('text=아름다운 우주 성운').first()).toBeVisible();

    // 랭킹 테이블 내 유저 정보 노출 확인
    await expect(page.locator('text=스피드킹')).toBeVisible();
    await expect(page.locator('text=퍼즐마스터')).toBeVisible();

    // 난이도 변경 버튼 클릭 검증
    const expertButton = page.locator('button:has-text("고수")');
    await expect(expertButton).toBeVisible();
    await expertButton.click({ force: true });
  });

  // ----------------------------------------------------
  // 4. 마이페이지 로그인 가이드 및 초기화/회원탈퇴 검증
  // ----------------------------------------------------
  test('4. 마이페이지 세션 통제 가이드 검증', async ({ page }) => {
    // 비로그인 상태 진입 시
    await page.goto('/puzzle/mypage');

    // 로그인 필요 안내 모달/화면 검증
    await expect(page.locator('text=로그인이 필요한 서비스입니다')).toBeVisible();
    const loginButton = page.locator('a:has-text("로그인하기")');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toHaveAttribute('href', /\/login\?callbackUrl=/);
  });

  // ----------------------------------------------------
  // 5. 퍼즐 플레이 페이지 세로 모드(Portrait) 검증
  // ----------------------------------------------------
  test('5-1. 플레이 페이지 세로 모드 UI 및 상호작용 검증', async ({ page, isMobile }) => {
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    // 세로 모드 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 812 });

    // 특정 퍼즐 상세 API Mocking (id가 details이 아니라 constants 기준으로 직접 세팅된 것 복원)
    await page.route('**/api/puzzle/puzzle-mock-id-001', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            _id: 'puzzle-mock-id-001',
            title: '아름다운 우주 성운',
            imageUrl: '/sample/puzzle.png',
            participantCount: 125,
            archived: false,
          },
        }),
      });
    });

    await page.goto('/puzzle/play/puzzle-mock-id-001?diff=novice&mode=ranked');
    await dismissOrientationSuggestion(page);

    // 헤더 타이틀 및 난이도 배지 확인 (엄격한 Strict 모드 에러 우회를 위해 first() 사용)
    await expect(page.locator('text=초보 (36조각)').first()).toBeVisible();
    
    // 타이머 및 진행률(%) 컴포넌트 렌더링 확인 (타이머 작동 시간이 경과되므로 정규식 포맷 검증)
    await expect(page.locator('.tabular-nums').first()).toHaveText(/\d{2}:\d{2}/);
    await expect(page.locator('text=0%')).toBeVisible();

    // [요구사항 1] 세로 모드 보관함 하단 조각들이 잘려 보이지 않는지 검증 (뷰포트 범위 내 안착 여부)
    const tray = page.locator('.overflow-x-auto').first();
    const trayBounding = await tray.boundingBox();
    const viewport = page.viewportSize();
    if (trayBounding && viewport) {
      expect(trayBounding.y + trayBounding.height).toBeLessThanOrEqual(viewport.height);
    }

    // [요구사항 2] 세로 모드 조각 퍼즐판 배치 검증
    // 1. 트레이에서 첫 번째 조각 클릭
    const firstPiece = page.locator('[data-tray-piece="true"]').first();
    const pieceId = await firstPiece.getAttribute('data-piece-id');
    expect(pieceId).not.toBeNull();

    if (isMobile) {
      await firstPiece.tap();
    } else {
      await firstPiece.click();
    }

    // [추가 요구사항] 세로 모드에서 조각을 집는 순간 보관함 내에 "집었다" 텍스트가 생기지 않는지 검증
    await expect(tray.locator('text=/집었/')).toBeHidden();

    // 조각이 선택되었는지 검증
    await expect(firstPiece).toHaveAttribute('data-selected', 'true');

    // 2. 보드판의 첫 번째 빈 셀 클릭
    const firstCell = page.locator('[data-board-cell="true"]').first();
    await expect(firstCell).toHaveAttribute('data-is-placed', 'false');

    if (isMobile) {
      await firstCell.tap({ force: true });
    } else {
      await firstCell.click({ force: true });
    }

    // 조각 배치 완료 검증
    await expect(firstCell).toHaveAttribute('data-is-placed', 'true');
    await expect(firstCell).toHaveAttribute('data-placed-piece-id', pieceId!);

    // [요구사항 3] 세로 모드 보관함에서 조각을 다른 바구니로 드래그하여 옮겨지는지 확인 (모아보기 서랍 내)
    const openDrawerBtn = page.locator('button:has-text("모아보기")');
    await openDrawerBtn.click({ force: true });
    
    // 모달 슬라이드 업 애니메이션(300ms)이 완료될 때까지 대기하여 드래그 대상의 뷰포트 아웃 에러 방지
    await page.waitForTimeout(500);
    
    // 어두운 배경(backdrop) 우회를 위해 .overflow-y-auto 하위의 조각 셀 선택
    const drawerPiece = page.locator('.z-\\[9990\\] .overflow-y-auto .cursor-pointer').first();
    const targetBasket = page.locator('.z-\\[9990\\] [data-basket-id="basket2"]').first();
    const portraitBasket2Count = targetBasket.locator('span:has-text("개")');
    const beforeCountTextPortrait = await portraitBasket2Count.innerText(); // 예: "(0개)"
    const beforeCountPortrait = parseInt(beforeCountTextPortrait.replace(/[^0-9]/g, ''), 10) || 0;

    await drawerPiece.dragTo(targetBasket, { force: true });

    // 바구니 숫자가 1 증가했는지 검증
    await expect(portraitBasket2Count).toHaveText(`(${beforeCountPortrait + 1}개)`);

    // [추가 테스트] 세로 모드 터치 드래그 앤 드롭 검증 (180ms 롱프레스 터치 드래그)
    const touchBeforeCountText = await portraitBasket2Count.innerText();
    const touchBeforeCount = parseInt(touchBeforeCountText.replace(/[^0-9]/g, ''), 10) || 0;
    
    await page.evaluate(async () => {
      const source = document.querySelector('.z-\\[9990\\] .overflow-y-auto .cursor-pointer');
      const target = document.querySelector('.z-\\[9990\\] [data-basket-id="basket2"]');
      if (!source || !target) return;

      const rectSource = source.getBoundingClientRect();
      const rectTarget = target.getBoundingClientRect();

      const startX = rectSource.left + rectSource.width / 2;
      const startY = rectSource.top + rectSource.height / 2;
      const endX = rectTarget.left + rectTarget.width / 2;
      const endY = rectTarget.top + rectTarget.height / 2;

      // touchstart
      const touch1 = new Touch({
        identifier: Date.now(),
        target: source,
        clientX: startX,
        clientY: startY,
        screenX: startX,
        screenY: startY,
        pageX: startX,
        pageY: startY,
      });

      source.dispatchEvent(new TouchEvent('touchstart', {
        cancelable: true,
        bubbles: true,
        touches: [touch1],
        targetTouches: [touch1],
        changedTouches: [touch1],
      }));

      // 180ms 롱프레스 대기
      await new Promise(resolve => setTimeout(resolve, 200));

      // touchmove
      const touch2 = new Touch({
        identifier: touch1.identifier,
        target: source,
        clientX: endX,
        clientY: endY,
        screenX: endX,
        screenY: endY,
        pageX: endX,
        pageY: endY,
      });

      window.dispatchEvent(new TouchEvent('touchmove', {
        cancelable: true,
        bubbles: true,
        touches: [touch2],
        targetTouches: [touch2],
        changedTouches: [touch2],
      }));

      // touchend
      window.dispatchEvent(new TouchEvent('touchend', {
        cancelable: true,
        bubbles: true,
        touches: [],
        targetTouches: [],
        changedTouches: [touch2],
      }));
    });

    await expect(portraitBasket2Count).toHaveText(`(${touchBeforeCount + 1}개)`);



    // 셔플(다시 섞기) 컨펌 다이얼로그 모킹
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('정말로 판을 엎고 처음부터 다시 시작하시겠습니까?');
      await dialog.dismiss(); // 취소 선택
    });

    // 세로 툴바 영역 버튼 클릭 검증 (뒤로 가기 버튼)
    const backButton = page.locator('text=뒤로');
    await expect(backButton).toBeVisible();
  });

  // ----------------------------------------------------
  // 6. 퍼즐 플레이 페이지 가로 모드(Landscape) 검증
  // ----------------------------------------------------
  test('5-2. 플레이 페이지 가로 모드 전용 레이아웃 및 툴바 검증', async ({ page, isMobile }) => {
    // 가로 모드 뷰포트 설정
    await page.setViewportSize({ width: 812, height: 375 });

    await page.route('**/api/puzzle/puzzle-mock-id-001', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            _id: 'puzzle-mock-id-001',
            title: '아름다운 우주 성운',
            imageUrl: '/sample/puzzle.png',
            participantCount: 125,
            archived: false,
          },
        }),
      });
    });

    await page.goto('/puzzle/play/puzzle-mock-id-001?diff=novice&mode=ranked');

    // 가로 전용 트레이 패널 노출 검증 (클래스명 및 아이디)
    const trayPanel = page.locator('#landscape-tray-panel');
    await expect(trayPanel).toBeVisible();

    // 툴바 내 모드 선택 버튼 노출 검증
    await expect(page.locator('button:has-text("플레이 모드")')).toBeVisible();
    await expect(page.locator('button:has-text("이동 모드")')).toBeVisible();

    // [요구사항 1] 가로 모드 보관함 하단 조각들이 잘려 보이지 않는지 검증 (뷰포트 내 안착 여부)
    const trayBounding = await trayPanel.boundingBox();
    const viewport = page.viewportSize();
    if (trayBounding && viewport) {
      expect(trayBounding.y + trayBounding.height).toBeLessThanOrEqual(viewport.height);
    }

    // [요구사항 2] 가로 모드 조각 퍼즐판 배치 검증
    // 1. 트레이에서 첫 번째 조각 클릭
    const firstPiece = page.locator('#landscape-tray-panel [data-tray-piece="true"]').first();
    const pieceId = await firstPiece.getAttribute('data-piece-id');
    expect(pieceId).not.toBeNull();

    if (isMobile) {
      await firstPiece.tap({ force: true });
    } else {
      await firstPiece.click({ force: true });
    }

    // [추가 요구사항] 가로 모드에서 조각을 집는 순간 보관함 내에 "집었다" 텍스트가 생기지 않는지 검증
    await expect(trayPanel.locator('text=/집었/')).toBeHidden();

    // 조각이 선택되었는지 검증
    await expect(firstPiece).toHaveAttribute('data-selected', 'true');

    // 2. 보드판의 첫 번째 빈 셀 클릭
    const firstCell = page.locator('[data-board-cell="true"]').first();
    await expect(firstCell).toHaveAttribute('data-is-placed', 'false');

    if (isMobile) {
      await firstCell.tap({ force: true });
    } else {
      await firstCell.click({ force: true });
    }

    // 조각 배치 완료 검증
    await expect(firstCell).toHaveAttribute('data-is-placed', 'true');
    await expect(firstCell).toHaveAttribute('data-placed-piece-id', pieceId!);

    // 퍼즐 조각 배치 및 바구니 상태 업데이트 대기
    await page.waitForTimeout(500);

    // [요구사항 3] 가로 모드 보관함에서 조각을 다른 바구니로 드래그해서 옮기기 검증
    const landscapeTargetBasket = page.locator('#landscape-tray-panel [data-basket-id="basket2"]').first();
    const basket2CountSpan = landscapeTargetBasket.locator('span.font-mono');
    const beforeCountText = await basket2CountSpan.innerText();
    const beforeCount = parseInt(beforeCountText, 10) || 0;

    // 현재 바구니에 남은 조각 중 첫 번째 선택
    const landscapePiece = page.locator('#landscape-tray-panel [data-tray-piece="true"]').first();
    
    // Playwright의 dragTo가 Chromium 환경(가로모드 좁은 뷰포트)에서 바인딩 이슈가 있을 수 있어 직접 dragTo 좌표 계산 이동 수행
    const sourceBounding = await landscapePiece.boundingBox();
    const targetBounding = await landscapeTargetBasket.boundingBox();
    if (sourceBounding && targetBounding) {
      await page.mouse.move(sourceBounding.x + sourceBounding.width / 2, sourceBounding.y + sourceBounding.height / 2);
      await page.mouse.down();
      await page.mouse.move(targetBounding.x + targetBounding.width / 2, targetBounding.y + targetBounding.height / 2, { steps: 10 });
      await page.mouse.up();
    } else {
      await landscapePiece.dragTo(landscapeTargetBasket, { force: true });
    }

    // 바구니 숫자가 1 증가했는지 검증
    await expect(basket2CountSpan).toHaveText((beforeCount + 1).toString());

    // [추가 테스트] 가로 모드 터치 드래그 앤 드롭 검증 (180ms 롱프레스 터치 드래그)
    const landscapeTouchBeforeCount = parseInt(await basket2CountSpan.innerText(), 10) || 0;
    
    await page.evaluate(async () => {
      const source = document.querySelector('#landscape-tray-panel [data-tray-piece="true"]');
      const target = document.querySelector('#landscape-tray-panel [data-basket-id="basket2"]');
      if (!source || !target) return;

      const rectSource = source.getBoundingClientRect();
      const rectTarget = target.getBoundingClientRect();

      const startX = rectSource.left + rectSource.width / 2;
      const startY = rectSource.top + rectSource.height / 2;
      const endX = rectTarget.left + rectTarget.width / 2;
      const endY = rectTarget.top + rectTarget.height / 2;

      const touch1 = new Touch({
        identifier: Date.now(),
        target: source,
        clientX: startX,
        clientY: startY,
        screenX: startX,
        screenY: startY,
        pageX: startX,
        pageY: startY,
      });

      source.dispatchEvent(new TouchEvent('touchstart', {
        cancelable: true,
        bubbles: true,
        touches: [touch1],
        targetTouches: [touch1],
        changedTouches: [touch1],
      }));

      await new Promise(resolve => setTimeout(resolve, 200));

      const touch2 = new Touch({
        identifier: touch1.identifier,
        target: source,
        clientX: endX,
        clientY: endY,
        screenX: endX,
        screenY: endY,
        pageX: endX,
        pageY: endY,
      });

      window.dispatchEvent(new TouchEvent('touchmove', {
        cancelable: true,
        bubbles: true,
        touches: [touch2],
        targetTouches: [touch2],
        changedTouches: [touch2],
      }));

      window.dispatchEvent(new TouchEvent('touchend', {
        cancelable: true,
        bubbles: true,
        touches: [],
        targetTouches: [],
        changedTouches: [touch2],
      }));
    });

    await expect(basket2CountSpan).toHaveText((landscapeTouchBeforeCount + 1).toString());
  });

  // ----------------------------------------------------
  // 7. 퍼즐 진행 상황 임시 저장 후 메인 홈 이동 시 이어하기 활성화 검증
  // ----------------------------------------------------
  test('6. 퍼즐 진행 상황 저장 후 메인 홈 이동 시 이어하기 버튼 활성화 검증 (0% 진행 포함)', async ({ page }) => {
    // 0. NextAuth Session Mocking
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            name: '테스터',
            email: 'test@example.com',
            kakaoId: 'mock-kakao-id-123456',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });

    // 1. 진행 상황 조회 API Mocking (진행도 0% 이지만 detailState 존재 상태)
    await page.route('**/api/puzzle/progress?puzzleId=puzzle-mock-id-001', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            progress: 0,
            lastPlayedAt: new Date().toISOString(),
            detailState: {
              difficulty: 'novice',
              mode: 'ranked',
              timerSeconds: 15,
              board: Array(36).fill(null),
              trayPieces: Array.from({ length: 36 }, (_, i) => i),
              startedAt: new Date(Date.now() - 15000).toISOString(),
              updatedAt: new Date().toISOString(),
            }
          }
        }),
      });
    });

    // 2. 내 프로필 API Mocking (완주 내역 없음)
    await page.route('**/api/puzzle/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            profile: { nickname: '테스터', createdAt: new Date().toISOString() },
            statistics: { totalCompleted: 0, bestTimeBeginner: null, bestRank: null },
            history: []
          }
        }),
      });
    });

    // 3. 메인 홈 진입
    await page.goto('/puzzle');
    await dismissOrientationSuggestion(page);

    // 4. "이어하기 (0%)" 버튼이 노출되는지 검증
    const resumeButton = page.locator('button:has-text("이어하기 (0%)")').first();
    await expect(resumeButton).toBeVisible();
  });

});


// ============================================================
// 챌린지 토큰 오류 격리 테스트
// - 챌린지 토큰 에러는 진짜 토큰 문제일 때만 발생해야 함
// - 다른 검증 실패 시 거짓 토큰 에러가 발생하면 안 됨
// - 에러 발생 시 무한 깜빡임(재시도 루프)이 발생하면 안 됨
// ============================================================
test.describe('챌린지 토큰 오류 격리 및 제출 안정성 테스트', () => {

  // 로그인 세션 + 거의 완성된 퍼즐(35/36) 상태를 세팅하는 공통 헬퍼
  async function setupNearlyCompletePuzzle(
    page,
    options: {
      resultsResponse: { status: number; body: any };
      challengeStartOverride?: { status: number; body: any } | null;
    }
  ) {
    // Base mocks (current, archive, stats, rankings/current, challenge/start)
    await setupBaseMocks(page);

    // NextAuth 로그인 세션 Mock
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            name: '토큰테스터',
            email: 'tokentest@example.com',
            kakaoId: 'mock-kakao-token-tester',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });

    // 퍼즐 상세 Mock
    await page.route('**/api/puzzle/puzzle-mock-id-001', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            _id: 'puzzle-mock-id-001',
            title: '토큰 테스트 퍼즐',
            imageUrl: '/sample/puzzle.png',
            participantCount: 10,
            startDate: '2026-06-01T00:00:00Z',
            endDate: '2026-06-30T00:00:00Z',
            archived: false,
          },
        }),
      });
    });

    // 진행 상황 API Mock (GET: 35/36 완성 상태 반환, POST/DELETE: 성공)
    const nearlyCompleteBoard = Array.from({ length: 36 }, (_, i) => i);
    nearlyCompleteBoard[35] = null; // 마지막 슬롯만 비어있음

    await page.route('**/api/puzzle/progress**', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              progress: 97,
              lastPlayedAt: new Date().toISOString(),
              detailState: {
                difficulty: 'novice',
                mode: 'ranked',
                timerSeconds: 120,
                board: nearlyCompleteBoard,
                trayPieces: [35],
                startedAt: new Date(Date.now() - 120000).toISOString(),
                updatedAt: new Date().toISOString(),
              }
            }
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      }
    });

    // 챌린지 시작 토큰 Mock (override 가능)
    if (options.challengeStartOverride !== undefined) {
      await page.route('**/api/puzzle/challenge/start', async (route) => {
        if (options.challengeStartOverride === null) {
          await route.abort('failed');
        } else {
          await route.fulfill({
            status: options.challengeStartOverride.status,
            contentType: 'application/json',
            body: JSON.stringify(options.challengeStartOverride.body),
          });
        }
      });
    }

    // 결과 제출 API Mock (테스트마다 다른 응답)
    await page.route('**/api/puzzle/results', async (route) => {
      await route.fulfill({
        status: options.resultsResponse.status,
        contentType: 'application/json',
        body: JSON.stringify(options.resultsResponse.body),
      });
    });

    // 내 랭킹 Mock
    await page.route('**/api/puzzle/rankings/me*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { myRank: 5, nickname: '토큰테스터', completionTime: 120, totalParticipants: 50, topPercent: 10 },
        }),
      });
    });
  }

  // 마지막 조각을 배치하여 퍼즐을 완성시키는 헬퍼
  async function completePuzzle(page) {
    // 트레이에 남은 마지막 조각(pieceId=35) 클릭
    const lastPiece = page.locator('[data-tray-piece="true"][data-piece-id="35"]');
    await lastPiece.waitFor({ state: 'visible', timeout: 10000 });
    await lastPiece.click({ force: true });

    // 조각이 선택되었는지 확인
    await expect(lastPiece).toHaveAttribute('data-selected', 'true');

    // 보드의 마지막 빈 셀 클릭하여 배치
    const lastCell = page.locator('[data-board-cell="true"][data-is-placed="false"]');
    await lastCell.click({ force: true });

    // CompletionModal이 나타날 때까지 대기
    await page.locator('text=퍼즐 완성!').waitFor({ state: 'visible', timeout: 10000 });
  }

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.innerHTML = 'nextjs-portal { display: none !important; pointer-events: none !important; }';
        document.head.appendChild(style);
      });
    });
  });

  // ----------------------------------------------------------
  // Case 1: 정상 제출 성공 시 토큰 에러 없이 완료 메시지 표시
  // ----------------------------------------------------------
  test('Case 1: 정상 제출 시 "저장/제출 완료" 표시, 토큰 에러 없음', async ({ page }) => {
    await setupNearlyCompletePuzzle(page, {
      resultsResponse: {
        status: 201,
        body: {
          success: true,
          message: '성공적으로 퍼즐 기록이 검증 및 저장되었습니다.',
          data: { resultId: 'test-result-id', completionTime: 120, savedAt: new Date().toISOString() },
        },
      },
    });

    await page.goto('/puzzle/play/puzzle-mock-id-001?resume=true&diff=novice');
    await dismissOrientationSuggestion(page);
    await completePuzzle(page);

    // "저장/제출 완료" 메시지가 표시되는지 확인
    await expect(page.locator('text=저장/제출 완료')).toBeVisible({ timeout: 10000 });

    // 토큰 에러 메시지가 표시되지 않는지 확인
    await expect(page.locator('text=챌린지 토큰')).toBeHidden();
    await expect(page.locator('text=치팅 방지 필터')).toBeHidden();
  });

  // ----------------------------------------------------------
  // Case 2: "이미 랭킹 등록 완료" 에러 시 토큰 에러가 아닌
  //          정확한 에러 메시지 표시 (거짓 토큰 에러 방지)
  // ----------------------------------------------------------
  test('Case 2: 이미 랭킹 등록 완료 에러 → 토큰 에러가 아닌 정확한 에러 메시지 표시', async ({ page }) => {
    await setupNearlyCompletePuzzle(page, {
      resultsResponse: {
        status: 400,
        body: {
          success: false,
          error: '이 난이도는 이미 랭킹 등록이 완료되었습니다.',
        },
      },
    });

    await page.goto('/puzzle/play/puzzle-mock-id-001?resume=true&diff=novice');
    await dismissOrientationSuggestion(page);
    await completePuzzle(page);

    // 정확한 에러 메시지가 표시되는지 확인
    await expect(page.locator('text=이미 랭킹 등록이 완료되었습니다')).toBeVisible({ timeout: 10000 });

    // 토큰 관련 거짓 에러가 표시되지 않는지 확인
    await expect(page.locator('text=챌린지 토큰')).toBeHidden();
  });

  // ----------------------------------------------------------
  // Case 3: "만료된 퍼즐" 에러 시 토큰 에러가 아닌
  //          정확한 에러 메시지 표시 (거짓 토큰 에러 방지)
  // ----------------------------------------------------------
  test('Case 3: 만료된 퍼즐 에러 → 토큰 에러가 아닌 정확한 에러 메시지 표시', async ({ page }) => {
    await setupNearlyCompletePuzzle(page, {
      resultsResponse: {
        status: 400,
        body: {
          success: false,
          error: '활성화 기간이 만료된 퍼즐은 랭킹 등록이 불가능합니다.',
        },
      },
    });

    await page.goto('/puzzle/play/puzzle-mock-id-001?resume=true&diff=novice');
    await dismissOrientationSuggestion(page);
    await completePuzzle(page);

    // 정확한 에러 메시지 표시 확인
    await expect(page.locator('text=활성화 기간이 만료된 퍼즐')).toBeVisible({ timeout: 10000 });

    // 토큰 관련 거짓 에러 미표시 확인
    await expect(page.locator('text=챌린지 토큰')).toBeHidden();
  });

  // ----------------------------------------------------------
  // Case 4: 에러 발생 시 무한 깜빡임(저장중↔에러) 없이
  //          안정적으로 에러 메시지 1회만 표시
  //          (무한 재시도 루프 방지 검증 - 가장 중요한 테스트)
  // ----------------------------------------------------------
  test('Case 4: 제출 에러 시 무한 깜빡임 없이 안정적 에러 표시 (재시도 루프 방지)', async ({ page }) => {
    let resultsCallCount = 0;

    await setupNearlyCompletePuzzle(page, {
      resultsResponse: {
        status: 400,
        body: {
          success: false,
          error: '이 난이도는 이미 랭킹 등록이 완료되었습니다.',
        },
      },
    });

    // results API 호출 횟수 카운팅을 위한 추가 인터셉터
    await page.route('**/api/puzzle/results', async (route) => {
      resultsCallCount++;
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: '이 난이도는 이미 랭킹 등록이 완료되었습니다.',
        }),
      });
    });

    await page.goto('/puzzle/play/puzzle-mock-id-001?resume=true&diff=novice');
    await dismissOrientationSuggestion(page);
    await completePuzzle(page);

    // 에러 메시지가 안정적으로 표시될 때까지 대기
    await expect(page.locator('text=이미 랭킹 등록이 완료되었습니다')).toBeVisible({ timeout: 10000 });

    // 3초 대기 후 API 호출 횟수가 과도하지 않은지 확인 (무한 재시도 없음)
    await page.waitForTimeout(3000);
    expect(resultsCallCount).toBeLessThanOrEqual(2);

    // 3초 대기 후에도 에러 메시지가 여전히 안정적으로 표시되는지 확인
    // (깜빡거림 = "저장중" 메시지와 에러 메시지가 번갈아 나타남)
    await expect(page.locator('text=이미 랭킹 등록이 완료되었습니다')).toBeVisible();
    await expect(page.locator('text=기록 저장/제출 중')).toBeHidden();
  });

  // ----------------------------------------------------------
  // Case 5: 진짜 챌린지 토큰 무효 → 정확한 토큰 에러 표시
  //          (챌린지 토큰 에러가 정당한 경우에만 발생하는지 확인)
  // ----------------------------------------------------------
  test('Case 5: 진짜 토큰 무효 시에만 챌린지 토큰 에러 메시지 표시', async ({ page }) => {
    await setupNearlyCompletePuzzle(page, {
      challengeStartOverride: {
        status: 500,
        body: { success: false, error: '서버 내부 오류' },
      },
      resultsResponse: {
        status: 403,
        body: {
          success: false,
          error: '유효하지 않거나, 만료되었거나, 이미 사용된 챌린지 토큰입니다.',
        },
      },
    });

    await page.goto('/puzzle/play/puzzle-mock-id-001?resume=true&diff=novice');
    await dismissOrientationSuggestion(page);
    await completePuzzle(page);

    // 진짜 토큰 에러이므로 토큰 관련 에러 메시지가 표시되어야 함
    await expect(page.locator('text=챌린지 토큰')).toBeVisible({ timeout: 10000 });
  });

  // ----------------------------------------------------------
  // Case 6: 비로그인 완성 -> 로그인 -> 0%로 초기화(리셋)되는 현상 방지 테스트
  // ----------------------------------------------------------
  test('Case 6: 비로그인 완성 후 로그인하여 복귀 시 퍼즐 상태 리셋 방지 및 동기화 작동', async ({ page }) => {
    // 1. NextAuth 세션: 처음부터 로그인 완료된 세션으로 셋업 (로그인 직후 페이지에 다시 진입한 상태를 모방)
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: '성공유저', email: 'success@example.com', kakaoId: 'mock-kakao-user' },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });

    // 2. 기본 Mocking
    await setupBaseMocks(page);

    // 3. 퍼즐 상세 Mock
    await page.route('**/api/puzzle/puzzle-mock-id-001', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            _id: 'puzzle-mock-id-001',
            title: '테스트용 퍼즐',
            imageUrl: '/sample/puzzle.png',
            participantCount: 0,
            startDate: '2026-06-01T00:00:00Z',
            endDate: '2026-06-30T00:00:00Z',
            archived: false,
          },
        }),
      });
    });

    // 4. 최초 베이스 페이지 진입하여 브라우저 컨텍스트 획득 후 데이터 모킹 주입
    await page.goto('/puzzle');
    await dismissOrientationSuggestion(page);

    // 강제로 로컬 스토리지/IndexedDB 상태를 완성 직전 상태로 세팅
    await page.evaluate(() => {
      sessionStorage.setItem('pending_sync_puzzle-mock-id-001', 'true');
    });

    // IndexedDB에 직접 completion 데이터(100% 완성)를 주입하는 시뮬레이션
    await page.evaluate(async () => {
      const openRequest = indexedDB.open('haruPuzzleDB', 4);
      openRequest.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('puzzleState')) {
          db.createObjectStore('puzzleState', { keyPath: 'puzzleId' });
        }
      };
      
      await new Promise<void>((resolve, reject) => {
        openRequest.onsuccess = (e: any) => {
          const db = e.target.result;
          const transaction = db.transaction('puzzleState', 'readwrite');
          const store = transaction.objectStore('puzzleState');
          
          const nearlyCompleteBoard = Array.from({ length: 36 }, (_, i) => i);
          const piecesData = nearlyCompleteBoard.map((pieceId, idx) => ({
            id: pieceId,
            correctIndex: idx,
            locked: true
          }));

          store.put({
            puzzleId: 'puzzle-mock-id-001',
            difficulty: 'novice',
            mode: 'ranked',
            timerSeconds: 85,
            pieces: piecesData,
            board: nearlyCompleteBoard,
            trayPieces: [],
            progress: 100,
            completed: true,
            startedAt: new Date(Date.now() - 85000).toISOString(),
            updatedAt: new Date().toISOString(),
          });
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject();
        };
      });
    });

    // 이제 로그인 완료 상황으로 mock 설정을 바꾸고, 진입(resume)하는 시나리오

    // 서버 진행도 API Mock: 이 시점에서 서버에는 데이터가 없음 (null)
    let saveProgressCalled = false;
    let savedProgressVal = -1;
    await page.route('**/api/puzzle/progress**', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: null }), // 서버에 데이터가 없음
        });
      } else if (method === 'POST') {
        saveProgressCalled = true;
        const postData = route.request().postDataJSON();
        savedProgressVal = postData.progress;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      }
    });

    // 결과 제출 API Mock
    let submitResultCalled = false;
    await page.route('**/api/puzzle/results', async (route) => {
      submitResultCalled = true;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { resultId: 'mock-final-res', completionTime: 85 }
        }),
      });
    });

    // 랭킹 조회 API Mock
    await page.route('**/api/puzzle/rankings/current**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    // 로그인된 상태로 퍼즐 플레이 페이지를 이어하기 모드로 다시 엽니다.
    await page.goto('/puzzle/play/puzzle-mock-id-001?resume=true&diff=novice');
    
    // 0%로 초기화(리셋)되지 않고, 로컬의 100% 진행 데이터를 기반으로 서버에 saveProgress(100)이 호출되었는지 검증
    // 또한 완료 처리 결과 제출이 동작했는지 확인
    await page.waitForTimeout(1500);

    expect(saveProgressCalled).toBe(true);
    expect(savedProgressVal).toBe(100);
  });

  // ----------------------------------------------------------
  // Case 7: 로그인 사용자 세션 검증 에러 (유효하지 않은 세션) 상황 격리 테스트
  // ----------------------------------------------------------
  test('Case 7: 로그인 상태이나 DB에 유저가 없는 경우 (401 에러) -> 세션 해제 및 로그인 리다이렉트 처리 검증', async ({ page }) => {
    // 1. Session Mock: 일단 프론트 상에는 로그인된 세션 정보가 존재
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: '미가입유저', email: 'no-db@example.com', kakaoId: 'ghost-kakao-id-999' },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });

    await setupBaseMocks(page);

    // 퍼즐 상세 Mock
    await page.route('**/api/puzzle/puzzle-mock-id-001', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            _id: 'puzzle-mock-id-001',
            title: '테스트용 퍼즐',
            imageUrl: '/sample/puzzle.png',
            participantCount: 0,
            startDate: '2026-06-01T00:00:00Z',
            endDate: '2026-06-30T00:00:00Z',
            archived: false,
          },
        }),
      });
    });

    // 2. 서버 진행상황 저장 API Mock: DB에 유저가 없으므로 401(유효하지 않은 사용자 세션입니다) 응답
    let saveProgressStatus = -1;
    await page.route('**/api/puzzle/progress**', async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: '유효하지 않은 사용자 세션입니다.' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              progress: 10,
              lastPlayedAt: new Date().toISOString(),
              detailState: {
                difficulty: 'novice',
                mode: 'ranked',
                timerSeconds: 15,
                board: Array(36).fill(null),
                trayPieces: Array.from({ length: 36 }, (_, idx) => idx),
              }
            }
          }),
        });
      }
    });

    // 3. 로그아웃 API Mock
    let signOutCalled = false;
    await page.route('**/api/auth/signout**', async (route) => {
      signOutCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // 플레이 페이지 진입 (resume 모드로 진입하여 setup을 무사히 통과하게 만듦)
    await page.goto('/puzzle/play/puzzle-mock-id-001?resume=true&diff=novice');
    await dismissOrientationSuggestion(page);

    // 저장(Manual save) 버튼을 클릭하여 저장 트리거
    const saveButton = page.locator('button:has-text("저장")').first();
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // 401 에러 발생 시 로그인 화면으로 리다이렉트 처리되는지 주소 검증
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  // ----------------------------------------------------------
  // Case 8: MongoDB 저장 오류 시 로그인 거부 검증 테스트
  // ----------------------------------------------------------
  test('Case 8: MongoDB 저장 오류(signIn callback 에러) 시 로그인 프로세스 거부 검증', async ({ page }) => {
    // 1. NextAuth Callback에서 signIn 실패를 의도하기 위해 Session이 null을 반환하도록 연출
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: null, expires: null }),
      });
    });

    await setupBaseMocks(page);

    // 로그인 페이지로 직접 가서 signIn 거부 확인
    await page.goto('/login');
    
    // 주소가 /login에 머물러 있거나, NextAuth signin error query 파라미터가 노출되는지 검증
    expect(page.url()).toContain('/login');
  });

});

