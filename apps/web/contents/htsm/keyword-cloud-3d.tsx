'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Sparkles, OrbitControls } from '@react-three/drei';
import type { Group } from 'three';

const KEYWORDS = [
    { text: 'Creative', gradient: 'linear-gradient(135deg, #ec4899, #f472b6)', shadow: '#ec489966', position: [-2.5, 2.2, 0] as [number, number, number] },
    { text: 'Funny', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', shadow: '#f59e0b66', position: [2.3, 1.8, 1] as [number, number, number] },
    { text: 'Kind', gradient: 'linear-gradient(135deg, #10b981, #34d399)', shadow: '#10b98166', position: [-3.0, -0.8, 0.8] as [number, number, number] },
    { text: 'Energetic', gradient: 'linear-gradient(135deg, #ef4444, #f87171)', shadow: '#ef444466', position: [2.8, -0.5, -0.8] as [number, number, number] },
    { text: 'Thoughtful', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', shadow: '#8b5cf666', position: [0, 0.3, 1.5] as [number, number, number] },
    { text: 'Organized', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)', shadow: '#3b82f666', position: [-1.8, -2.5, -0.5] as [number, number, number] },
    { text: 'Adventurous', gradient: 'linear-gradient(135deg, #f97316, #fb923c)', shadow: '#f9731666', position: [1.5, 3.0, -0.5] as [number, number, number] },
    { text: 'Loyal', gradient: 'linear-gradient(135deg, #6366f1, #818cf8)', shadow: '#6366f166', position: [2.5, -2.8, 0.3] as [number, number, number] },
];

function FloatingWord({ text, gradient, shadow, position, index }: {
    text: string;
    gradient: string;
    shadow: string;
    position: [number, number, number];
    index: number;
}) {
    const groupRef = useRef<Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            // 각 키워드가 개별적으로 부유하는 효과
            const t = state.clock.elapsedTime;
            const offset = index * 0.8;
            groupRef.current.position.y = position[1] + Math.sin(t * 0.8 + offset) * 0.3;
            groupRef.current.position.x = position[0] + Math.cos(t * 0.5 + offset) * 0.15;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            <Html center distanceFactor={8} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
                <div
                    style={{
                        background: gradient,
                        padding: '8px 20px',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '14px',
                        fontFamily: "'Inter', sans-serif",
                        whiteSpace: 'nowrap',
                        boxShadow: `0 4px 20px ${shadow}, 0 0 40px ${shadow}`,
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(4px)',
                        letterSpacing: '0.5px',
                        userSelect: 'none',
                    }}
                >
                    {text}
                </div>
            </Html>
        </group>
    );
}

function Cloud() {
    const groupRef = useRef<Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.25;
            groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.12) * 0.08;
        }
    });

    return (
        <group ref={groupRef}>
            {KEYWORDS.map((k, i) => (
                <FloatingWord key={k.text} {...k} index={i} />
            ))}
        </group>
    );
}

export default function KeywordCloud3D() {
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '350px' }}>
            <Canvas
                camera={{ position: [0, 0, 8], fov: 50 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={1} />

                {/* 보라 스파클 */}
                <Sparkles
                    count={100}
                    scale={12}
                    size={3}
                    speed={0.3}
                    opacity={0.5}
                    color="#c084fc"
                />
                {/* 시안 스파클 */}
                <Sparkles
                    count={60}
                    scale={10}
                    size={2}
                    speed={0.5}
                    opacity={0.3}
                    color="#67e8f9"
                />

                <Cloud />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.4}
                />
            </Canvas>
        </div>
    );
}
