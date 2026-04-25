import React, { useEffect, useState } from 'react';
import styles from '../page.module.css';

interface CombatSceneProps {
    combo: number;
    triggerAttack: boolean; // true로 바뀌면 공격 이펙트 발동
}

export function CombatScene({ combo, triggerAttack }: CombatSceneProps) {
    const [attacking, setAttacking] = useState(false);

    useEffect(() => {
        if (triggerAttack) {
            setAttacking(true);
            const timer = setTimeout(() => setAttacking(false), 500);
            return () => clearTimeout(timer);
        }
    }, [triggerAttack]);

    return (
        <div className={styles.combatScene}>
            {/* 유저 펫 (좌측) */}
            <div className={`${styles.pet} ${styles.userPet} ${attacking ? styles.attackAnim : ''}`}>
                <img src="/chicorun/user_player.png" alt="user character" className={styles.combatUserImg} />
                {combo > 1 && (
                    <div className={styles.comboBadge}>{combo} 콤보!</div>
                )}
            </div>

            {/* 대결 이펙트 (중앙) */}
            <div className={styles.combatEffectArea}>
                {attacking && <div className={styles.hitEffect}>💥</div>}
            </div>

            {/* 레전드 펫 (우측) */}
            <div className={`${styles.pet} ${styles.legendPet} ${attacking ? styles.hitAnim : ''}`}>
                <img src="/chicorun/legend_boss.png" alt="legend boss" className={styles.combatBossImg} />
            </div>
        </div>
    );
}
