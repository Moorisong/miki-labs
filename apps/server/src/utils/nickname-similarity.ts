/**
 * 닉네임 유사도 검사 유틸리티
 * 동일인의 유사 닉네임 사용을 방지합니다.
 */

// Levenshtein 거리 계산 (편집 거리)
export function levenshteinDistance(s1: string, s2: string): number {
    const m = s1.length;
    const n = s2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }

    return dp[m][n];
}

// 닉네임 정규화 (숫자를 문자로, 공백 제거 등)
export function normalizeNickname(nickname: string): string {
    return nickname
        .toLowerCase()
        .replace(/\s+/g, '')          // 공백 제거
        .replace(/0/g, 'o')           // 0 → o
        .replace(/1/g, 'l')           // 1 → l
        .replace(/3/g, 'e')           // 3 → e
        .replace(/4/g, 'a')           // 4 → a
        .replace(/5/g, 's')           // 5 → s
        .replace(/7/g, 't')           // 7 → t
        .replace(/8/g, 'b')           // 8 → b
        .replace(/9/g, 'g')           // 9 → g
        .replace(/@/g, 'a')           // @ → a
        .replace(/\$/g, 's')          // $ → s
        .replace(/!/g, 'i')           // ! → i
        .replace(/[_\-\.]/g, '');     // 특수문자 제거
}

// 자음만 추출 (한글용)
export function extractKoreanConsonants(text: string): string {
    const consonants = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    let result = '';

    for (const char of text) {
        const code = char.charCodeAt(0);
        // 한글 음절 범위: 0xAC00 ~ 0xD7A3
        if (code >= 0xAC00 && code <= 0xD7A3) {
            const consonantIndex = Math.floor((code - 0xAC00) / 588);
            result += consonants[consonantIndex];
        } else {
            result += char;
        }
    }

    return result;
}

// 닉네임 유사도 계산 (0~1, 1이 완전 동일)
export function calculateSimilarity(nick1: string, nick2: string): number {
    const normalized1 = normalizeNickname(nick1);
    const normalized2 = normalizeNickname(nick2);

    // 완전 동일
    if (normalized1 === normalized2) return 1;

    // 한글 자음 비교
    const consonants1 = extractKoreanConsonants(normalized1);
    const consonants2 = extractKoreanConsonants(normalized2);
    if (consonants1 === consonants2 && consonants1.length >= 2) return 0.95;

    // Levenshtein 거리 기반 유사도
    const maxLen = Math.max(normalized1.length, normalized2.length);
    if (maxLen === 0) return 1;

    const distance = levenshteinDistance(normalized1, normalized2);
    const similarity = 1 - distance / maxLen;

    return similarity;
}

// 유사한 닉네임인지 확인 (임계값: 0.7 이상이면 유사)
export function isSimilarNickname(nick1: string, nick2: string, threshold: number = 0.7): boolean {
    // 정확히 같은 닉네임은 제외 (본인)
    if (nick1 === nick2) return false;

    return calculateSimilarity(nick1, nick2) >= threshold;
}

// 금지어 패턴 체크
const BANNED_PATTERNS = [
    /admin/i,
    /관리자/,
    /운영자/,
    /gm/i,
    /moderator/i,
];

export function containsBannedPattern(nickname: string): boolean {
    return BANNED_PATTERNS.some(pattern => pattern.test(nickname));
}
