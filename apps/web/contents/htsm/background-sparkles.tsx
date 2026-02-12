'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';

export default function BackgroundSparkles() {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                pointerEvents: 'none',
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 5], fov: 60 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
                dpr={[1, 2]} // 고해상도 지원
            >
                {/* 보라 스파클 - 배경 전체에 넓게 분포 */}
                <Sparkles
                    count={200}
                    scale={[30, 30, 20]} // 스케일을 더 키워서 화면 전체 커버
                    size={6}
                    speed={0.4}
                    opacity={0.8}
                    color="#a855f7" // 더 진한 보라색
                />
                {/* 시안 스파클 */}
                <Sparkles
                    count={150}
                    scale={[30, 30, 20]}
                    size={4}
                    speed={0.5}
                    opacity={0.6}
                    color="#06b6d4" // 더 진한 시안색
                />
            </Canvas>
        </div>
    );
}
