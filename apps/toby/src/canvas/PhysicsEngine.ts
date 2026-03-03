import { Ball } from './Ball';

interface ObstacleCircle {
    type: 'circle';
    x: number;
    y: number;
    radius: number;
}

interface ObstacleLine {
    type: 'line';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

interface ObstacleRotator {
    type: 'rotator';
    x: number;
    y: number;
    length: number;
    angle: number;
    speed: number;
}

interface ObstacleLauncher {
    type: 'launcher';
    x: number;
    y: number;
    width: number;
    height: number;
    force: number;
}

interface ObstacleTrap {
    type: 'trap';
    x: number;
    y: number;
    radius: number;
    penaltyY: number;
}

interface ObstacleHole {
    type: 'hole';
    x: number;
    y: number;
    radius: number;
    teleportY: number;
}

interface ObstacleGear {
    type: 'gear';
    x: number;
    y: number;
    radius: number;
    teeth: number;
    angle: number;
    speed: number;
}

interface ObstacleBumper {
    type: 'bumper';
    x: number;
    y: number;
    radius: number;
    force: number;
}

interface ObstacleSpring {
    type: 'spring';
    x: number;
    y: number;
    width: number;
    height: number;
    force: number;
    compressed: number;
}

interface ObstacleVibrator {
    type: 'vibrator';
    x: number;
    y: number;
    width: number;
    height: number;
    amplitude: number;
    phase: number;
}

interface ObstacleWind {
    type: 'wind';
    x: number;
    y: number;
    width: number;
    height: number;
    forceX: number;
    forceY: number;
}

interface ObstacleBoostZone {
    type: 'boostZone';
    x: number;
    y: number;
    width: number;
    height: number;
    boostFactor: number;
}

interface ObstacleSpinZone {
    type: 'spinZone';
    x: number;
    y: number;
    radius: number;
    spinSpeed: number;
    spinDirection: 1 | -1;
}

interface ObstaclePortal {
    type: 'portal';
    id: number;
    x: number;
    y: number;
    radius: number;
    targetId: number;
}

type Obstacle = ObstacleCircle | ObstacleLine | ObstacleRotator | ObstacleLauncher | ObstacleTrap | ObstacleHole | ObstacleGear | ObstacleBumper | ObstacleSpring | ObstacleVibrator | ObstacleWind | ObstacleBoostZone | ObstacleSpinZone | ObstaclePortal;

export type GameMode = 1 | 2; // 1: 고정, 2: 랜덤

export class PhysicsEngine {
    balls: Ball[] = [];
    obstacles: Obstacle[] = [];
    mode: GameMode = 1;

    gravity: number = 0.5;
    friction: number = 0.99;
    restitution: number = 0.55;

    width: number = 800;
    height: number = 600;
    worldHeight: number = 9000;
    cameraY: number = 0;
    frameCount: number = 0;

    constructor(width: number, height: number, mode: GameMode = 1) {
        this.width = width;
        this.height = height;
        this.mode = mode;
        this.initMaze();
    }

    setMode(mode: GameMode) {
        this.mode = mode;
        this.initMaze();
    }

    addBall(ball: Ball) {
        ball.radius = 18;
        this.balls.push(ball);
    }

    clear() {
        this.balls = [];
        this.cameraY = 0;
        this.frameCount = 0;
    }

    // 벽쪽 범퍼 (절반만)
    addWallBumpers(startY: number, endY: number, spacing: number) {
        const W = this.width;
        let count = 0;
        for (let y = startY; y < endY; y += spacing) {
            count++;
            if (count % 2 === 0) continue;
            this.obstacles.push({ type: 'bumper', x: 25, y: y, radius: 15, force: 10 });
            this.obstacles.push({ type: 'bumper', x: W - 25, y: y, radius: 15, force: 10 });
        }
    }

    initMaze() {
        if (this.mode === 1) {
            this.initFixedMaze();
        } else {
            this.initRandomMaze();
        }
    }

    // ========== MODE 1: 고정 맵 ==========
    initFixedMaze() {
        this.obstacles = [];
        const W = this.width;

        // Entry
        this.addStaticLine(0, 0, W * 0.4, 120);
        this.addStaticLine(W, 0, W * 0.6, 120);

        let cy = 170;

        // SECTION 1: 짧은 지그재그
        this.addStaticLine(W * 0.1, cy, W * 0.55, cy + 60);
        cy += 100;
        this.addStaticLine(W * 0.9, cy, W * 0.45, cy + 60);
        this.obstacles.push({ type: 'bumper', x: W * 0.7, y: cy + 30, radius: 18, force: 9 });
        cy += 100;
        this.addStaticLine(W * 0.1, cy, W * 0.7, cy + 80);
        this.obstacles.push({ type: 'hole', x: W * 0.4, y: cy + 40, radius: 20, teleportY: cy + 200 });
        cy += 120;
        this.addStaticLine(W * 0.9, cy, W * 0.3, cy + 80);
        cy += 120;

        this.addWallBumpers(170, cy, 120);

        // 깔때기
        this.addStaticLine(0, cy, W * 0.42, cy + 120);
        this.addStaticLine(W, cy, W * 0.58, cy + 120);
        cy += 170;

        // SECTION 2: 톱니바퀴
        this.obstacles.push({ type: 'gear', x: W * 0.35, y: cy, radius: 38, teeth: 8, angle: 0, speed: 0.035 });
        this.obstacles.push({ type: 'gear', x: W * 0.65, y: cy, radius: 38, teeth: 8, angle: Math.PI / 4, speed: -0.035 });
        cy += 130;

        this.addStaticLine(W * 0.15, cy, W * 0.5, cy + 50);
        this.obstacles.push({ type: 'bumper', x: W * 0.35, y: cy + 25, radius: 16, force: 8 });
        cy += 90;
        this.addStaticLine(W * 0.85, cy, W * 0.5, cy + 50);
        cy += 90;

        this.obstacles.push({ type: 'gear', x: W * 0.5, y: cy, radius: 42, teeth: 10, angle: 0, speed: 0.04 });
        cy += 130;

        // SECTION 3: 범퍼 + 스프링
        this.obstacles.push({ type: 'bumper', x: W * 0.25, y: cy, radius: 20, force: 10 });
        this.obstacles.push({ type: 'bumper', x: W * 0.5, y: cy, radius: 20, force: 10 });
        this.obstacles.push({ type: 'bumper', x: W * 0.75, y: cy, radius: 20, force: 10 });
        cy += 100;

        this.obstacles.push({ type: 'spring', x: W * 0.2, y: cy, width: 70, height: 14, force: 14, compressed: 0 });
        this.obstacles.push({ type: 'spring', x: W * 0.55, y: cy, width: 70, height: 14, force: 14, compressed: 0 });
        cy += 130;

        this.addStaticLine(W * 0.05, cy, W * 0.6, cy + 70);
        cy += 110;
        this.addStaticLine(W * 0.95, cy, W * 0.4, cy + 70);
        cy += 110;

        this.addWallBumpers(cy - 350, cy, 150);

        // SECTION 4: 회전 장애물
        this.obstacles.push({ type: 'rotator', x: W * 0.5, y: cy, length: W * 0.55, angle: 0, speed: 0.04 });
        cy += 130;
        this.obstacles.push({ type: 'rotator', x: W * 0.5, y: cy, length: W * 0.55, angle: Math.PI / 3, speed: -0.04 });
        cy += 130;

        this.addStaticLine(W * 0.1, cy, W * 0.5, cy + 55);
        cy += 90;
        this.addStaticLine(W * 0.9, cy, W * 0.5, cy + 55);
        cy += 100;

        // SECTION 5: 디플렉터 + 범퍼
        for (let c = 0; c < 4; c++) {
            const px = W * 0.2 + c * W * 0.2;
            const size = 14;
            this.addStaticLine(px - size, cy + size, px, cy - size);
            this.addStaticLine(px, cy - size, px + size, cy + size);
        }
        cy += 90;

        this.obstacles.push({ type: 'bumper', x: W * 0.3, y: cy, radius: 18, force: 9 });
        this.obstacles.push({ type: 'bumper', x: W * 0.7, y: cy, radius: 18, force: 9 });
        cy += 100;

        this.addStaticLine(W * 0.08, cy, W * 0.6, cy + 70);
        this.obstacles.push({ type: 'hole', x: W * 0.35, y: cy + 35, radius: 18, teleportY: cy + 180 });
        cy += 110;
        this.addStaticLine(W * 0.92, cy, W * 0.4, cy + 70);
        cy += 120;

        // 깔때기
        this.addStaticLine(0, cy, W * 0.4, cy + 140);
        this.addStaticLine(W, cy, W * 0.6, cy + 140);
        cy += 190;

        // SECTION 6: 진동판 + 톱니
        this.obstacles.push({ type: 'vibrator', x: W * 0.25, y: cy, width: W * 0.5, height: 12, amplitude: 22, phase: 0 });
        cy += 120;

        this.obstacles.push({ type: 'gear', x: W * 0.3, y: cy, radius: 35, teeth: 8, angle: 0, speed: 0.04 });
        this.obstacles.push({ type: 'gear', x: W * 0.7, y: cy, radius: 35, teeth: 8, angle: 0, speed: -0.04 });
        cy += 120;

        this.addStaticLine(W * 0.1, cy, W * 0.55, cy + 55);
        cy += 90;
        this.addStaticLine(W * 0.9, cy, W * 0.45, cy + 55);
        this.obstacles.push({ type: 'bumper', x: W * 0.65, y: cy + 28, radius: 16, force: 8 });
        cy += 100;

        this.addWallBumpers(cy - 400, cy, 140);

        // SECTION 7: 스프링 연속
        this.obstacles.push({ type: 'spring', x: W * 0.15, y: cy, width: 65, height: 12, force: 13, compressed: 0 });
        this.obstacles.push({ type: 'spring', x: W * 0.42, y: cy, width: 65, height: 12, force: 13, compressed: 0 });
        this.obstacles.push({ type: 'spring', x: W * 0.7, y: cy, width: 65, height: 12, force: 13, compressed: 0 });
        cy += 130;

        this.obstacles.push({ type: 'rotator', x: W * 0.5, y: cy, length: W * 0.5, angle: 0, speed: 0.045 });
        cy += 120;

        this.addStaticLine(W * 0.15, cy, W * 0.5, cy + 50);
        cy += 85;
        this.addStaticLine(W * 0.85, cy, W * 0.5, cy + 50);
        cy += 90;

        // SECTION 8: 범퍼 필드
        this.obstacles.push({ type: 'bumper', x: W * 0.2, y: cy, radius: 18, force: 9 });
        this.obstacles.push({ type: 'bumper', x: W * 0.4, y: cy, radius: 18, force: 9 });
        this.obstacles.push({ type: 'bumper', x: W * 0.6, y: cy, radius: 18, force: 9 });
        this.obstacles.push({ type: 'bumper', x: W * 0.8, y: cy, radius: 18, force: 9 });
        cy += 90;

        this.obstacles.push({ type: 'bumper', x: W * 0.3, y: cy, radius: 18, force: 9 });
        this.obstacles.push({ type: 'bumper', x: W * 0.5, y: cy, radius: 18, force: 9 });
        this.obstacles.push({ type: 'bumper', x: W * 0.7, y: cy, radius: 18, force: 9 });
        cy += 100;

        this.addStaticLine(W * 0.1, cy, W * 0.55, cy + 55);
        cy += 90;
        this.addStaticLine(W * 0.9, cy, W * 0.45, cy + 55);
        cy += 100;

        // SECTION 9: 마지막 혼합
        this.obstacles.push({ type: 'gear', x: W * 0.5, y: cy, radius: 40, teeth: 10, angle: 0, speed: 0.045 });
        cy += 120;

        this.obstacles.push({ type: 'rotator', x: W * 0.5, y: cy, length: W * 0.5, angle: Math.PI / 4, speed: -0.05 });
        cy += 110;

        for (let c = 0; c < 5; c++) {
            const px = W * 0.1 + c * W * 0.2;
            const size = 12;
            this.addStaticLine(px - size, cy + size, px, cy - size);
            this.addStaticLine(px, cy - size, px + size, cy + size);
        }
        cy += 80;

        this.obstacles.push({ type: 'bumper', x: W * 0.35, y: cy, radius: 16, force: 8 });
        this.obstacles.push({ type: 'bumper', x: W * 0.65, y: cy, radius: 16, force: 8 });
        cy += 90;

        this.addWallBumpers(cy - 500, cy, 160);

        // SECTION 10: 마지막 슬라이드
        this.addStaticLine(W * 0.1, cy, W * 0.55, cy + 55);
        cy += 90;
        this.addStaticLine(W * 0.9, cy, W * 0.45, cy + 55);
        cy += 90;
        this.addStaticLine(W * 0.1, cy, W * 0.5, cy + 50);
        cy += 85;
        this.addStaticLine(W * 0.9, cy, W * 0.5, cy + 50);
        cy += 100;

        // FINALE: 병목
        this.addStaticLine(0, cy, W / 2 - 45, cy + 300);
        this.addStaticLine(W, cy, W / 2 + 45, cy + 300);

        this.obstacles.push({ type: 'rotator', x: W * 0.5, y: cy + 150, length: W * 0.25, angle: 0, speed: 0.05 });

        // 바람 영역 (깔때기에서 속도 저하)
        this.obstacles.push({ type: 'wind', x: W * 0.2, y: cy, width: W * 0.6, height: 350, forceX: 0, forceY: -0.25 });
        cy += 350;

        // 파이프
        const pipeX = W / 2;
        const pipeLen = 350;
        const gap = 38;
        this.addStaticLine(pipeX - gap, cy, pipeX - gap, cy + pipeLen);
        this.addStaticLine(pipeX + gap, cy, pipeX + gap, cy + pipeLen);

        // 파이프 바람 (약한 저항)
        this.obstacles.push({ type: 'wind', x: pipeX - gap, y: cy, width: gap * 2, height: pipeLen, forceX: 0, forceY: -0.3 });

        // World Walls
        this.addStaticLine(0, 0, 0, this.worldHeight);
        this.addStaticLine(W, 0, W, this.worldHeight);
    }

    // ========== MODE 2: 랜덤 맵 ==========
    initRandomMaze() {
        this.obstacles = [];
        const W = this.width;

        // Entry (항상 고정)
        this.addStaticLine(0, 0, W * 0.4, 120);
        this.addStaticLine(W, 0, W * 0.6, 120);

        let cy = 170;
        const sectionTypes = ['slide', 'gear', 'bumper', 'rotator', 'spring', 'deflector', 'mixed', 'portal', 'boost'];

        // 10개 섹션 랜덤 생성
        for (let section = 0; section < 10; section++) {
            const sectionType = sectionTypes[Math.floor(Math.random() * sectionTypes.length)];

            switch (sectionType) {
                case 'slide':
                    cy = this.generateSlideSection(cy);
                    break;
                case 'gear':
                    cy = this.generateGearSection(cy);
                    break;
                case 'bumper':
                    cy = this.generateBumperSection(cy);
                    break;
                case 'rotator':
                    cy = this.generateRotatorSection(cy);
                    break;
                case 'spring':
                    cy = this.generateSpringSection(cy);
                    break;
                case 'deflector':
                    cy = this.generateDeflectorSection(cy);
                    break;
                case 'mixed':
                    cy = this.generateMixedSection(cy);
                    break;
                case 'portal':
                    cy = this.generatePortalSection(cy);
                    break;
                case 'boost':
                    cy = this.generateBoostSection(cy);
                    break;
            }

            // 벽 범퍼 (확률적)
            if (Math.random() < 0.5) {
                this.addWallBumpers(cy - 200, cy, 150);
            }

            // 섹션 사이 작은 깔때기 (중앙 유도, 짧게)
            if (section < 9 && section % 3 === 2) {
                this.addStaticLine(0, cy, W * 0.42, cy + 80);
                this.addStaticLine(W, cy, W * 0.58, cy + 80);
                cy += 120;
            }
        }

        // FINALE (항상 고정, 안정적)
        this.addStaticLine(0, cy, W / 2 - 45, cy + 250);
        this.addStaticLine(W, cy, W / 2 + 45, cy + 250);
        this.obstacles.push({ type: 'rotator', x: W * 0.5, y: cy + 120, length: W * 0.22, angle: 0, speed: 0.05 });
        cy += 300;

        // 파이프 (짧고 안전하게)
        const pipeX = W / 2;
        const pipeLen = 280;
        const gap = 42; // 넓게
        this.addStaticLine(pipeX - gap, cy, pipeX - gap, cy + pipeLen);
        this.addStaticLine(pipeX + gap, cy, pipeX + gap, cy + pipeLen);

        // 파이프 안 범퍼 없음 (막힘 방지)

        // World Walls
        this.addStaticLine(0, 0, 0, this.worldHeight);
        this.addStaticLine(W, 0, W, this.worldHeight);
    }

    // 슬라이드 섹션
    generateSlideSection(cy: number): number {
        const W = this.width;
        const slideCount = 2 + Math.floor(Math.random() * 2); // 2-3개

        for (let i = 0; i < slideCount; i++) {
            const length = 40 + Math.random() * 30; // 짧게: 40-70px
            if (i % 2 === 0) {
                const startX = W * (0.1 + Math.random() * 0.1);
                const endX = W * (0.45 + Math.random() * 0.15);
                this.addStaticLine(startX, cy, endX, cy + length);
            } else {
                const startX = W * (0.8 + Math.random() * 0.1);
                const endX = W * (0.4 + Math.random() * 0.15);
                this.addStaticLine(startX, cy, endX, cy + length);
            }

            // 가끔 구멍 추가
            if (Math.random() < 0.3) {
                this.obstacles.push({ type: 'hole', x: W * (0.3 + Math.random() * 0.4), y: cy + length / 2, radius: 18, teleportY: cy + 150 });
            }

            cy += length + 40;
        }

        return cy;
    }

    // 톱니바퀴 섹션
    generateGearSection(cy: number): number {
        const W = this.width;
        const gearCount = 1 + Math.floor(Math.random() * 2); // 1-2개

        for (let i = 0; i < gearCount; i++) {
            const positions = [W * 0.3, W * 0.5, W * 0.7];
            const usedPos: number[] = [];

            const numGears = 1 + Math.floor(Math.random() * 2); // 1-2개
            for (let g = 0; g < numGears; g++) {
                const availPos = positions.filter(p => !usedPos.includes(p));
                if (availPos.length > 0) {
                    const pos = availPos[Math.floor(Math.random() * availPos.length)];
                    usedPos.push(pos);
                    const dir = Math.random() > 0.5 ? 1 : -1;
                    this.obstacles.push({ type: 'gear', x: pos, y: cy, radius: 35 + Math.random() * 10, teeth: 8, angle: Math.random() * Math.PI, speed: 0.03 * dir + Math.random() * 0.02 });
                }
            }
            cy += 120;
        }

        // 슬라이드 추가
        this.addStaticLine(W * 0.1, cy, W * 0.5, cy + 50);
        cy += 90;

        return cy;
    }

    // 범퍼 섹션
    generateBumperSection(cy: number): number {
        const W = this.width;
        const rows = 1 + Math.floor(Math.random() * 2); // 1-2줄

        for (let r = 0; r < rows; r++) {
            const bumperCount = 2 + Math.floor(Math.random() * 3); // 2-4개
            for (let b = 0; b < bumperCount; b++) {
                const x = W * (0.15 + b * (0.7 / bumperCount) + Math.random() * 0.1);
                this.obstacles.push({ type: 'bumper', x, y: cy, radius: 16 + Math.random() * 6, force: 8 + Math.random() * 4 });
            }
            cy += 80;
        }

        // 슬라이드
        this.addStaticLine(W * 0.15, cy, W * 0.55, cy + 50);
        cy += 90;

        return cy;
    }

    // 회전 장애물 섹션
    generateRotatorSection(cy: number): number {
        const W = this.width;
        const rotCount = 1 + Math.floor(Math.random() * 2); // 1-2개

        for (let i = 0; i < rotCount; i++) {
            const dir = i % 2 === 0 ? 1 : -1;
            const length = W * (0.4 + Math.random() * 0.2); // 적당한 길이
            this.obstacles.push({ type: 'rotator', x: W * 0.5, y: cy, length, angle: Math.random() * Math.PI, speed: 0.04 * dir + Math.random() * 0.02 });
            cy += 110;
        }

        // 슬라이드
        this.addStaticLine(W * 0.1, cy, W * 0.5, cy + 50);
        cy += 90;

        return cy;
    }

    // 스프링 섹션
    generateSpringSection(cy: number): number {
        const W = this.width;
        const springCount = 2 + Math.floor(Math.random() * 2); // 2-3개

        for (let s = 0; s < springCount; s++) {
            const x = W * (0.15 + s * (0.6 / springCount));
            this.obstacles.push({ type: 'spring', x, y: cy, width: 60 + Math.random() * 20, height: 12, force: 12 + Math.random() * 4, compressed: 0 });
        }
        cy += 120;

        // 슬라이드
        this.addStaticLine(W * 0.85, cy, W * 0.5, cy + 50);
        cy += 90;

        return cy;
    }

    // 디플렉터 섹션
    generateDeflectorSection(cy: number): number {
        const W = this.width;
        const cols = 3 + Math.floor(Math.random() * 2); // 3-4개

        for (let c = 0; c < cols; c++) {
            const px = W * (0.15 + c * (0.7 / cols));
            const size = 12 + Math.random() * 4;
            this.addStaticLine(px - size, cy + size, px, cy - size);
            this.addStaticLine(px, cy - size, px + size, cy + size);
        }
        cy += 80;

        // 슬라이드
        this.addStaticLine(W * 0.1, cy, W * 0.55, cy + 50);
        cy += 90;

        return cy;
    }

    // 혼합 섹션
    generateMixedSection(cy: number): number {
        const W = this.width;

        if (Math.random() > 0.5) {
            this.obstacles.push({ type: 'gear', x: W * 0.35, y: cy, radius: 35, teeth: 8, angle: 0, speed: 0.035 });
            this.obstacles.push({ type: 'bumper', x: W * 0.65, y: cy, radius: 18, force: 9 });
        } else {
            this.obstacles.push({ type: 'bumper', x: W * 0.35, y: cy, radius: 18, force: 9 });
            this.obstacles.push({ type: 'gear', x: W * 0.65, y: cy, radius: 35, teeth: 8, angle: 0, speed: -0.035 });
        }
        cy += 110;

        if (Math.random() > 0.5) {
            this.obstacles.push({ type: 'rotator', x: W * 0.5, y: cy, length: W * 0.45, angle: 0, speed: 0.04 });
            cy += 100;
        } else {
            this.obstacles.push({ type: 'spring', x: W * 0.3, y: cy, width: 70, height: 12, force: 13, compressed: 0 });
            this.obstacles.push({ type: 'spring', x: W * 0.55, y: cy, width: 70, height: 12, force: 13, compressed: 0 });
            cy += 110;
        }

        this.addStaticLine(W * 0.15, cy, W * 0.5, cy + 50);
        cy += 90;

        return cy;
    }

    generatePortalSection(cy: number): number {
        const W = this.width;
        const portalId = Math.floor(Math.random() * 1000);
        
        const portal1X = W * (0.2 + Math.random() * 0.2);
        const portal2X = W * (0.6 + Math.random() * 0.2);
        
        this.obstacles.push({ type: 'portal', id: portalId, x: portal1X, y: cy, radius: 25, targetId: portalId + 1 });
        cy += 150;
        this.obstacles.push({ type: 'portal', id: portalId + 1, x: portal2X, y: cy, radius: 25, targetId: portalId });
        
        cy += 100;

        this.addStaticLine(W * 0.15, cy, W * 0.5, cy + 50);
        cy += 90;

        return cy;
    }

    generateBoostSection(cy: number): number {
        const W = this.width;
        
        this.obstacles.push({ type: 'boostZone', x: W * 0.1, y: cy, width: W * 0.8, height: 60, boostFactor: 1.4 });
        cy += 100;

        this.obstacles.push({ type: 'spinZone', x: W * 0.35, y: cy, radius: 40, spinSpeed: 0.08, spinDirection: 1 });
        this.obstacles.push({ type: 'spinZone', x: W * 0.65, y: cy, radius: 40, spinSpeed: 0.08, spinDirection: -1 });
        cy += 100;

        this.addStaticLine(W * 0.15, cy, W * 0.5, cy + 50);
        cy += 90;

        return cy;
    }

    addStaticLine(x1: number, y1: number, x2: number, y2: number) {
        this.obstacles.push({ type: 'line', x1, y1, x2, y2 });
    }

    addStaticCircle(x: number, y: number, radius: number) {
        this.obstacles.push({ type: 'circle', x, y, radius });
    }

    update() {
        this.frameCount++;
        let maxY = 0;

        for (const obs of this.obstacles) {
            if (obs.type === 'rotator') obs.angle += obs.speed;
            if (obs.type === 'gear') obs.angle += obs.speed;
            if (obs.type === 'spring' && obs.compressed > 0) obs.compressed -= 0.1;
        }

        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];

            ball.vy += this.gravity;
            ball.vx *= this.friction;
            ball.vy *= this.friction;
            ball.update();

            for (const obs of this.obstacles) {
                if (obs.type === 'circle') this.resolveCircleCollision(ball, obs);
                if (obs.type === 'line') this.resolveLineCollision(ball, obs);
                if (obs.type === 'rotator') this.resolveRotatorCollision(ball, obs);
                if (obs.type === 'launcher') this.resolveLauncherCollision(ball, obs);
                if (obs.type === 'trap') this.resolveTrapCollision(ball, obs);
                if (obs.type === 'hole') this.resolveHoleCollision(ball, obs);
                if (obs.type === 'gear') this.resolveGearCollision(ball, obs);
                if (obs.type === 'bumper') this.resolveBumperCollision(ball, obs);
                if (obs.type === 'spring') this.resolveSpringCollision(ball, obs);
                if (obs.type === 'vibrator') this.resolveVibratorCollision(ball, obs);
                if (obs.type === 'wind') this.resolveWindCollision(ball, obs);
                if (obs.type === 'boostZone') this.resolveBoostZoneCollision(ball, obs);
                if (obs.type === 'spinZone') this.resolveSpinZoneCollision(ball, obs);
                if (obs.type === 'portal') this.resolvePortalCollision(ball, obs);
            }

            if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx *= -this.restitution; }
            if (ball.x + ball.radius > this.width) { ball.x = this.width - ball.radius; ball.vx *= -this.restitution; }

            for (let j = i + 1; j < this.balls.length; j++) {
                this.resolveBallCollision(ball, this.balls[j]);
            }

            if (ball.y > maxY) maxY = ball.y;
            if (ball.y > this.worldHeight) ball.isGoals = true;
        }

        let targetCamY = maxY - this.height * 0.6;
        targetCamY = Math.max(0, Math.min(targetCamY, this.worldHeight - this.height));
        this.cameraY += (targetCamY - this.cameraY) * 0.1;
    }

    resolveHoleCollision(ball: Ball, hole: ObstacleHole) {
        const dx = ball.x - hole.x;
        const dy = ball.y - hole.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < hole.radius - 5) {
            ball.y = hole.teleportY;
            ball.x = hole.x + (Math.random() - 0.5) * 50;
            ball.vy = Math.abs(ball.vy) * 0.5 + 3;
            ball.vx = (Math.random() - 0.5) * 5;
        }
    }

    resolveGearCollision(ball: Ball, gear: ObstacleGear) {
        const dx = ball.x - gear.x;
        const dy = ball.y - gear.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const effectiveRadius = gear.radius + 10;

        if (dist < effectiveRadius + ball.radius) {
            const ballAngle = Math.atan2(dy, dx);
            const toothAngle = (gear.teeth * (ballAngle - gear.angle)) % (Math.PI * 2);
            const toothEffect = Math.sin(toothAngle) * 0.5 + 0.5;

            const overlap = effectiveRadius + ball.radius - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            ball.x += nx * overlap;
            ball.y += ny * overlap;

            const tangentX = -ny * gear.speed * 50 * toothEffect;
            const tangentY = nx * gear.speed * 50 * toothEffect;
            ball.vx += tangentX;
            ball.vy += tangentY;

            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx -= 2 * dot * nx * this.restitution;
            ball.vy -= 2 * dot * ny * this.restitution;
        }
    }

    resolveBumperCollision(ball: Ball, bumper: ObstacleBumper) {
        const dx = ball.x - bumper.x;
        const dy = ball.y - bumper.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = ball.radius + bumper.radius;

        if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            ball.x = bumper.x + Math.cos(angle) * minDist;
            ball.y = bumper.y + Math.sin(angle) * minDist;
            ball.vx = Math.cos(angle) * bumper.force;
            ball.vy = Math.sin(angle) * bumper.force;
        }
    }

    resolveSpringCollision(ball: Ball, spring: ObstacleSpring) {
        if (ball.x > spring.x && ball.x < spring.x + spring.width &&
            ball.y + ball.radius > spring.y && ball.y - ball.radius < spring.y + spring.height) {
            if (ball.vy > 0) {
                ball.vy = -spring.force;
                ball.y = spring.y - ball.radius - 2;
                spring.compressed = 1;
            }
        }
    }

    resolveVibratorCollision(ball: Ball, vib: ObstacleVibrator) {
        const offsetX = Math.sin(this.frameCount * 0.1 + vib.phase) * vib.amplitude;
        const actualX = vib.x + offsetX;

        if (ball.x > actualX && ball.x < actualX + vib.width &&
            ball.y + ball.radius > vib.y && ball.y - ball.radius < vib.y + vib.height) {
            ball.y = vib.y - ball.radius - 1;
            ball.vy *= -0.5;
            ball.vx += Math.cos(this.frameCount * 0.1 + vib.phase) * 2;
        }
    }

    resolveTrapCollision(ball: Ball, trap: ObstacleTrap) {
        const dx = ball.x - trap.x;
        const dy = ball.y - trap.y;
        if (Math.sqrt(dx * dx + dy * dy) < trap.radius) {
            ball.y = trap.penaltyY;
            ball.x = this.width / 2 + (Math.random() - 0.5) * 100;
            ball.vy = 0; ball.vx = (Math.random() - 0.5) * 3;
        }
    }

    resolveWindCollision(ball: Ball, wind: ObstacleWind) {
        if (ball.x > wind.x && ball.x < wind.x + wind.width &&
            ball.y > wind.y && ball.y < wind.y + wind.height) {
            ball.vx += wind.forceX;
            ball.vy += wind.forceY;
            if (ball.vy < 0.5) ball.vy = 0.5;
        }
    }

    resolveBoostZoneCollision(ball: Ball, boost: ObstacleBoostZone) {
        if (ball.x > boost.x && ball.x < boost.x + boost.width &&
            ball.y > boost.y && ball.y < boost.y + boost.height) {
            ball.vy *= boost.boostFactor;
            ball.vx *= boost.boostFactor;
        }
    }

    resolveSpinZoneCollision(ball: Ball, spin: ObstacleSpinZone) {
        const dx = ball.x - spin.x;
        const dy = ball.y - spin.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < spin.radius) {
            const spinForce = spin.spinSpeed * spin.spinDirection;
            const tangentX = -dy / dist * spinForce;
            const tangentY = dx / dist * spinForce;
            
            ball.vx += tangentX;
            ball.vy += tangentY;
        }
    }

    resolvePortalCollision(ball: Ball, portal: ObstaclePortal) {
        const dx = ball.x - portal.x;
        const dy = ball.y - portal.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < portal.radius && ball.vy > 0) {
            const targetPortal = this.obstacles.find(o => o.type === 'portal' && o.id === portal.targetId);
            if (targetPortal && targetPortal.type === 'portal') {
                ball.x = targetPortal.x;
                ball.y = targetPortal.y + 30;
                ball.vy = Math.max(ball.vy, 3);
                ball.vx = (Math.random() - 0.5) * 4;
            }
        }
    }

    resolveLauncherCollision(ball: Ball, l: ObstacleLauncher) {
        if (ball.x > l.x && ball.x < l.x + l.width &&
            ball.y + ball.radius > l.y && ball.y - ball.radius < l.y + l.height) {
            ball.vy = -l.force;
            ball.y = l.y - ball.radius - 2;
        }
    }

    resolveRotatorCollision(ball: Ball, rot: ObstacleRotator) {
        const dx1 = Math.cos(rot.angle) * rot.length / 2;
        const dy1 = Math.sin(rot.angle) * rot.length / 2;
        const line: ObstacleLine = { type: 'line', x1: rot.x - dx1, y1: rot.y - dy1, x2: rot.x + dx1, y2: rot.y + dy1 };
        this.resolveLineCollision(ball, line);
        const dist = Math.sqrt((ball.x - rot.x) ** 2 + (ball.y - rot.y) ** 2);
        if (dist < rot.length / 2 + ball.radius + 10) {
            ball.vx += -Math.sin(rot.angle) * rot.speed * 25;
            ball.vy += Math.cos(rot.angle) * rot.speed * 25;
        }
    }

    resolveCircleCollision(ball: Ball, c: ObstacleCircle) {
        const dx = ball.x - c.x, dy = ball.y - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = ball.radius + c.radius;
        if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            ball.x += Math.cos(angle) * (minDist - dist);
            ball.y += Math.sin(angle) * (minDist - dist);
            const nx = dx / dist, ny = dy / dist;
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx -= 2 * dot * nx * this.restitution;
            ball.vy -= 2 * dot * ny * this.restitution;
        }
    }

    resolveLineCollision(ball: Ball, line: ObstacleLine) {
        const dx = ball.x - line.x1, dy = ball.y - line.y1;
        const lx = line.x2 - line.x1, ly = line.y2 - line.y1;
        const lenSq = lx * lx + ly * ly;
        let t = Math.max(0, Math.min(1, (dx * lx + dy * ly) / lenSq));
        const cx = line.x1 + t * lx, cy = line.y1 + t * ly;
        const distX = ball.x - cx, distY = ball.y - cy;
        const dist = Math.sqrt(distX * distX + distY * distY);
        if (dist < ball.radius) {
            const overlap = ball.radius - dist;
            const nx = distX / dist, ny = distY / dist;
            ball.x += nx * overlap; ball.y += ny * overlap;
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx -= 2 * dot * nx * this.restitution;
            ball.vy -= 2 * dot * ny * this.restitution;
        }
    }

    resolveBallCollision(b1: Ball, b2: Ball) {
        const dx = b2.x - b1.x, dy = b2.y - b1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < b1.radius + b2.radius) {
            const overlap = (b1.radius + b2.radius - dist) / 2;
            const ox = (dx / dist) * overlap, oy = (dy / dist) * overlap;
            b1.x -= ox; b1.y -= oy; b2.x += ox; b2.y += oy;
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle), cos = Math.cos(angle);
            const vx1 = b1.vx * cos + b1.vy * sin, vy1 = b1.vy * cos - b1.vx * sin;
            const vx2 = b2.vx * cos + b2.vy * sin, vy2 = b2.vy * cos - b2.vx * sin;
            b1.vx = vx2 * cos - vy1 * sin; b1.vy = vy1 * cos + vx2 * sin;
            b2.vx = vx1 * cos - vy2 * sin; b2.vy = vy2 * cos + vx1 * sin;
            
            const randomness = 0.8 + Math.random() * 0.2;
            b1.vx *= randomness; b1.vy *= randomness; b2.vx *= randomness; b2.vy *= randomness;
            
            b1.vx += (Math.random() - 0.5) * 2;
            b1.vy += (Math.random() - 0.5) * 1;
            b2.vx += (Math.random() - 0.5) * 2;
            b2.vy += (Math.random() - 0.5) * 1;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const time = this.frameCount * 0.03;

        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, `hsl(${(time * 10) % 360}, 50%, 15%)`);
        gradient.addColorStop(1, `hsl(${(time * 10 + 60) % 360}, 40%, 8%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
        for (let i = 0; i < this.width; i += 80) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, this.height); ctx.stroke(); }
        const go = (this.frameCount * 1.5) % 80;
        for (let i = 0; i < this.height; i += 80) { ctx.beginPath(); ctx.moveTo(0, (i + go) % this.height); ctx.lineTo(this.width, (i + go) % this.height); ctx.stroke(); }

        ctx.translate(0, -this.cameraY);

        const progress = this.cameraY / (this.worldHeight - this.height);
        ctx.fillStyle = 'rgba(0,255,255,0.3)';
        ctx.fillRect(5, this.cameraY + 50, 8, (this.height - 100) * progress);
        ctx.strokeStyle = '#0ff';
        ctx.strokeRect(5, this.cameraY + 50, 8, this.height - 100);

        // 모드 표시
        ctx.fillStyle = this.mode === 1 ? '#0ff' : '#f0f';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`MODE ${this.mode}`, 20, this.cameraY + 30);

        for (const obs of this.obstacles) {
            const checkY = obs.type === 'line' ? Math.min(obs.y1, obs.y2) : obs.y;
            if (checkY > this.cameraY + this.height + 300 || checkY < this.cameraY - 300) continue;

            ctx.shadowBlur = 8;

            if (obs.type === 'line') {
                ctx.shadowColor = '#0ff'; ctx.strokeStyle = '#0ff'; ctx.lineWidth = 4;
                ctx.beginPath(); ctx.moveTo(obs.x1, obs.y1); ctx.lineTo(obs.x2, obs.y2); ctx.stroke();
            }
            else if (obs.type === 'circle') {
                ctx.shadowColor = '#0ff'; ctx.fillStyle = '#000'; ctx.strokeStyle = '#0ff'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            }
            else if (obs.type === 'rotator') {
                ctx.save(); ctx.translate(obs.x, obs.y); ctx.rotate(obs.angle);
                ctx.shadowColor = '#f0f'; ctx.strokeStyle = '#f0f'; ctx.lineWidth = 5;
                ctx.beginPath(); ctx.moveTo(-obs.length / 2, 0); ctx.lineTo(obs.length / 2, 0); ctx.stroke();
                ctx.restore();
                ctx.beginPath(); ctx.arc(obs.x, obs.y, 10, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
            }
            else if (obs.type === 'launcher') {
                const flash = (Math.floor(this.frameCount / 5) % 2 === 0);
                ctx.shadowColor = flash ? '#ff0' : '#fa0'; ctx.strokeStyle = flash ? '#ff0' : '#fa0'; ctx.fillStyle = '#220'; ctx.lineWidth = 3;
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height); ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
                ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('JUMP!', obs.x + obs.width / 2, obs.y + 17);
            }
            else if (obs.type === 'trap') {
                ctx.shadowColor = '#f00'; ctx.fillStyle = '#200'; ctx.strokeStyle = '#f00'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(obs.x - 8, obs.y - 8); ctx.lineTo(obs.x + 8, obs.y + 8); ctx.moveTo(obs.x + 8, obs.y - 8); ctx.lineTo(obs.x - 8, obs.y + 8); ctx.stroke();
            }
            else if (obs.type === 'hole') {
                const pulse = Math.sin(this.frameCount * 0.1) * 3;
                ctx.shadowColor = '#a0f'; ctx.fillStyle = '#101'; ctx.strokeStyle = '#a0f'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(obs.x, obs.y, obs.radius + pulse, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.save(); ctx.translate(obs.x, obs.y); ctx.rotate(this.frameCount * 0.05);
                ctx.strokeStyle = 'rgba(160, 0, 255, 0.5)'; ctx.lineWidth = 2;
                ctx.beginPath();
                for (let a = 0; a < Math.PI * 4; a += 0.2) {
                    const r = a * 2;
                    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                }
                ctx.stroke();
                ctx.restore();
            }
            else if (obs.type === 'gear') {
                ctx.save(); ctx.translate(obs.x, obs.y); ctx.rotate(obs.angle);
                ctx.shadowColor = '#fa0'; ctx.strokeStyle = '#fa0'; ctx.fillStyle = '#320'; ctx.lineWidth = 3;
                ctx.beginPath();
                for (let i = 0; i < obs.teeth; i++) {
                    const a1 = (i / obs.teeth) * Math.PI * 2;
                    const a2 = ((i + 0.3) / obs.teeth) * Math.PI * 2;
                    const a3 = ((i + 0.5) / obs.teeth) * Math.PI * 2;
                    const a4 = ((i + 0.8) / obs.teeth) * Math.PI * 2;
                    ctx.lineTo(Math.cos(a1) * obs.radius, Math.sin(a1) * obs.radius);
                    ctx.lineTo(Math.cos(a2) * (obs.radius + 15), Math.sin(a2) * (obs.radius + 15));
                    ctx.lineTo(Math.cos(a3) * (obs.radius + 15), Math.sin(a3) * (obs.radius + 15));
                    ctx.lineTo(Math.cos(a4) * obs.radius, Math.sin(a4) * obs.radius);
                }
                ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fillStyle = '#654'; ctx.fill(); ctx.stroke();
                ctx.restore();
            }
            else if (obs.type === 'bumper') {
                const pulse = Math.sin(this.frameCount * 0.15 + obs.x) * 2;
                ctx.shadowColor = '#0f0'; ctx.strokeStyle = '#0f0'; ctx.lineWidth = 3;
                const grad = ctx.createRadialGradient(obs.x, obs.y, 0, obs.x, obs.y, obs.radius + pulse);
                grad.addColorStop(0, '#0a0');
                grad.addColorStop(1, '#040');
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(obs.x, obs.y, obs.radius + pulse, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            }
            else if (obs.type === 'spring') {
                const compression = obs.compressed * 5;
                ctx.shadowColor = '#ff0'; ctx.strokeStyle = '#ff0'; ctx.lineWidth = 3;
                ctx.fillStyle = '#440';
                ctx.fillRect(obs.x, obs.y + compression, obs.width, obs.height - compression);
                ctx.strokeRect(obs.x, obs.y + compression, obs.width, obs.height - compression);
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const sx = obs.x + 10 + i * (obs.width - 20) / 4;
                    ctx.moveTo(sx, obs.y + compression);
                    ctx.lineTo(sx, obs.y - 8 + compression);
                }
                ctx.stroke();
            }
            else if (obs.type === 'vibrator') {
                const offsetX = Math.sin(this.frameCount * 0.1 + obs.phase) * obs.amplitude;
                ctx.shadowColor = '#f0a'; ctx.strokeStyle = '#f0a'; ctx.lineWidth = 3;
                ctx.fillStyle = '#301';
                ctx.fillRect(obs.x + offsetX, obs.y, obs.width, obs.height);
                ctx.strokeRect(obs.x + offsetX, obs.y, obs.width, obs.height);
                ctx.beginPath();
                ctx.moveTo(obs.x + offsetX - 15, obs.y + obs.height / 2);
                ctx.lineTo(obs.x + offsetX - 5, obs.y);
                ctx.lineTo(obs.x + offsetX - 5, obs.y + obs.height);
                ctx.lineTo(obs.x + offsetX - 15, obs.y + obs.height / 2);
                ctx.moveTo(obs.x + offsetX + obs.width + 15, obs.y + obs.height / 2);
                ctx.lineTo(obs.x + offsetX + obs.width + 5, obs.y);
                ctx.lineTo(obs.x + offsetX + obs.width + 5, obs.y + obs.height);
                ctx.stroke();
            }
            else if (obs.type === 'wind') {
                ctx.save();
                ctx.globalAlpha = 0.15;
                ctx.fillStyle = '#6cf';
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                ctx.globalAlpha = 0.6;
                ctx.strokeStyle = '#6cf';
                ctx.lineWidth = 1;
                for (let i = 0; i < 8; i++) {
                    const px = obs.x + (i % 4 + 0.5) * (obs.width / 4);
                    const baseY = obs.y + obs.height - (this.frameCount * 3 + i * 50) % obs.height;
                    ctx.beginPath();
                    ctx.moveTo(px - 5, baseY + 15);
                    ctx.lineTo(px, baseY);
                    ctx.lineTo(px + 5, baseY + 15);
                    ctx.stroke();
                }
                ctx.restore();
            }
            else if (obs.type === 'boostZone') {
                ctx.save();
                ctx.globalAlpha = 0.2;
                const pulse = Math.sin(this.frameCount * 0.08) * 0.1 + 0.3;
                ctx.fillStyle = `rgba(255, 100, 0, ${pulse})`;
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                ctx.globalAlpha = 0.8;
                ctx.strokeStyle = '#f60';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
                ctx.setLineDash([]);
                ctx.fillStyle = '#ff0';
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('⚡ BOOST', obs.x + obs.width / 2, obs.y + obs.height / 2 + 5);
                ctx.restore();
            }
            else if (obs.type === 'spinZone') {
                ctx.save();
                ctx.globalAlpha = 0.15;
                ctx.fillStyle = '#a0f';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 0.6;
                ctx.strokeStyle = '#a0f';
                ctx.lineWidth = 2;
                ctx.setLineDash([8, 4]);
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
                
                ctx.save();
                ctx.translate(obs.x, obs.y);
                ctx.rotate(this.frameCount * obs.spinSpeed * obs.spinDirection);
                ctx.strokeStyle = '#f0f';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    ctx.moveTo(Math.cos(angle) * obs.radius * 0.7, Math.sin(angle) * obs.radius * 0.7);
                    ctx.lineTo(Math.cos(angle) * obs.radius * 0.9, Math.sin(angle) * obs.radius * 0.9);
                }
                ctx.stroke();
                ctx.restore();
                ctx.restore();
            }
            else if (obs.type === 'portal') {
                const pulse = Math.sin(this.frameCount * 0.1) * 3;
                ctx.shadowColor = '#0ff';
                ctx.fillStyle = `rgba(0, 200, 255, ${0.2 + pulse * 0.05})`;
                ctx.strokeStyle = '#0ff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.radius + pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                
                ctx.save();
                ctx.translate(obs.x, obs.y);
                ctx.rotate(-this.frameCount * 0.05);
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let a = 0; a < Math.PI * 3; a += 0.15) {
                    const r = obs.radius * 0.3 + Math.sin(a * 3) * 10;
                    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                }
                ctx.stroke();
                ctx.restore();
                
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(obs.id.toString(), obs.x, obs.y + 5);
            }
        }

        ctx.shadowBlur = 0;

        ctx.fillStyle = '#0f0'; ctx.fillRect(0, this.worldHeight - 25, this.width, 25);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        for (let i = 0; i < this.width; i += 30) {
            ctx.fillStyle = (Math.floor(i / 30) % 2 === 0) ? '#000' : '#fff';
            ctx.fillRect(i, this.worldHeight - 25, 30, 25);
        }
        ctx.fillStyle = '#0f0'; ctx.font = 'bold 36px sans-serif'; ctx.textAlign = 'center';
        ctx.shadowColor = '#0f0'; ctx.shadowBlur = 15;
        ctx.fillText('🏁 FINISH 🏁', this.width / 2, this.worldHeight - 45);
        ctx.shadowBlur = 0;

        this.balls.forEach(b => b.draw(ctx));
        ctx.restore();
    }

    getGoalBall(): Ball | null { return this.balls.find(b => b.isGoals) || null; }
}
