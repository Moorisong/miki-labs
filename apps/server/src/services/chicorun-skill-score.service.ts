export class ChicorunSkillScoreService {
    static readonly GAME_MODIFIER = {
        WORD_RAIN: 0,
        SPELLING: -50,
        LISTENING: -100
    };

    /**
     * 최초 유저 접근 시 학습 도달 레벨 기반으로 초기 점수 지정
     */
    static initializeSkillScore(achievedMaxLevel: number): number {
        let score = achievedMaxLevel * 10;
        return this.clampSkillScore(score);
    }

    /**
     * 게임 결과 기반 증감치 계산
     */
    static calculateDelta(accuracy: number, maxCombo: number, avgResponseTime: number, isSuccess: boolean): number {
        const failPenalty = isSuccess ? 0 : 30;
        let delta = (accuracy * 50) + (maxCombo * 5) - (avgResponseTime * 10) - failPenalty;
        delta = Math.round(delta);
        return Math.max(-50, Math.min(50, delta));
    }

    /**
     * 현재 스킬 스코어에 증감치 적용 및 제한 (Clamp)
     */
    static applyDelta(currentScore: number, delta: number): number {
        return this.clampSkillScore(currentScore + delta);
    }

    static clampSkillScore(score: number): number {
        return Math.max(50, Math.min(1000, score));
    }

    /**
     * SkillScore를 목표 문제 난이도(단어 레벨)로 변환
     */
    static getTargetDifficulty(skillScore: number, modifier: number = 0): number {
        const effective = this.clampSkillScore(skillScore + modifier);
        if (effective < 200) return 2;  // 1~3 레벨 커버
        if (effective < 400) return 3;  // 2~5 레벨 커버
        if (effective < 600) return 5;  // 4~7 레벨 커버
        if (effective < 800) return 7;  // 6~9 레벨 커버
        return 9;                       // 7~10 레벨 커버
    }
}
