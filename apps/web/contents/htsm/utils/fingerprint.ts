/**
 * 간단한 브라우저 fingerprint 생성 유틸리티
 */
export function generateFingerprint(): string {
    if (typeof window === 'undefined') return '';

    const data = [
        navigator.userAgent,
        navigator.language,
        window.screen.width,
        window.screen.height,
        new Date().getTimezoneOffset(),
    ].join('|');

    // 간단한 해시 로직 (문자열을 숫자로 변환 후 36진수 문자열로 반환)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // 32비트 정수로 변환
    }
    return Math.abs(hash).toString(36);
}
