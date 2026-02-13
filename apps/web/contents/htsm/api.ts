/**
 * HTSM API 클라이언트
 * 백엔드 API와의 통신을 담당
 */

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/htsm`;

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

/** Proof Token 발급 */
export async function fetchProofToken(): Promise<string> {
    const res = await fetch(`${API_BASE}/proof-token`);
    const json: ApiResponse<{ proofToken: string }> = await res.json();
    if (!json.success || !json.data) throw new Error(json.error || 'Failed to get proof token');
    return json.data.proofToken;
}

/** 테스트 생성 */
export async function createTest(
    selfKeywords: string[],
    proofToken: string,
    fingerprintHash?: string
): Promise<string> {
    const res = await fetch(`${API_BASE}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selfKeywords, proofToken, fingerprintHash }),
    });
    const json: ApiResponse<{ shareId: string }> = await res.json();
    if (!json.success || !json.data) throw new Error(json.error || 'Failed to create test');
    return json.data.shareId;
}

/** 내 최근 테스트 조회 */
export async function fetchMyTest(fingerprintHash: string): Promise<string | null> {
    const res = await fetch(`${API_BASE}/my-test/${fingerprintHash}`);
    const json: ApiResponse<{ shareId: string | null }> = await res.json();
    if (!json.success || !json.data) throw new Error(json.error || 'Failed to fetch my test');
    return json.data.shareId;
}

/** 친구 응답 제출 */
export async function submitAnswer(
    shareId: string,
    keywords: string[],
    fingerprintHash: string
): Promise<{ isClosed: boolean }> {
    const res = await fetch(`${API_BASE}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId, keywords, fingerprintHash }),
    });
    const json: ApiResponse<{ isClosed: boolean }> = await res.json();
    if (!json.success || !json.data) throw new Error(json.error || 'Failed to submit answer');
    return json.data;
}

/** 결과 조회 */
export interface JohariArea {
    keywords: string[];
}

export interface HtsmResult {
    answerCount: number;
    isClosed: boolean;
    johari: {
        open: JohariArea;
        blind: JohariArea;
        hidden: JohariArea;
        unknown: JohariArea;
    };
}

export async function fetchResult(shareId: string): Promise<HtsmResult> {
    const res = await fetch(`${API_BASE}/result/${shareId}`);
    const json: ApiResponse<HtsmResult> = await res.json();
    if (!json.success || !json.data) throw new Error(json.error || 'Failed to fetch result');
    return json.data;
}

export interface HtsmStats {
    totalCreated: number;
    avgFriends: number;
}

/** 전체 통계 조회 */
export async function fetchStats(): Promise<HtsmStats> {
    const res = await fetch(`${API_BASE}/stats`);
    const json: ApiResponse<HtsmStats> = await res.json();
    if (!json.success || !json.data) throw new Error(json.error || 'Failed to fetch stats');
    return json.data;
}

export interface HtsmTestInfo {
    answerCount: number;
    isClosed: boolean;
    isCreator?: boolean;
}

/** 테스트 정보 조회 */
export async function fetchTestInfo(shareId: string, fingerprintHash?: string): Promise<HtsmTestInfo> {
    const query = fingerprintHash ? `?fp=${fingerprintHash}` : '';
    const res = await fetch(`${API_BASE}/tests/${shareId}${query}`);
    const json: ApiResponse<HtsmTestInfo> = await res.json();
    if (!json.success || !json.data) throw new Error(json.error || 'Failed to fetch test info');
    return json.data;
}

/** 결과 조회 */
