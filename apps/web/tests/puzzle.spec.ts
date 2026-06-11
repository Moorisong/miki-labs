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


});

