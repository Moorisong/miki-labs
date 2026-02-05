import { Request, Response } from 'express';
import { calculatePetDestiny, PetDestinyRequest } from '../services/pet-destiny';

// 요청 검증
function validateRequest(body: unknown): { valid: true; data: PetDestinyRequest } | { valid: false; error: string } {
    if (!body || typeof body !== 'object') {
        return { valid: false, error: '요청 본문이 없습니다.' };
    }

    const { ownerBirth, petBirth, petType } = body as Record<string, unknown>;

    // ownerBirth 검증
    if (!ownerBirth || typeof ownerBirth !== 'string') {
        return { valid: false, error: 'ownerBirth가 필요합니다.' };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ownerBirth)) {
        return { valid: false, error: 'ownerBirth 형식이 올바르지 않습니다. (YYYY-MM-DD)' };
    }
    const ownerDate = new Date(ownerBirth);
    if (isNaN(ownerDate.getTime())) {
        return { valid: false, error: 'ownerBirth가 유효한 날짜가 아닙니다.' };
    }
    if (ownerDate.getFullYear() < 1900 || ownerDate > new Date()) {
        return { valid: false, error: 'ownerBirth가 허용 범위를 벗어났습니다. (1900년 이후, 오늘 이전)' };
    }

    // petBirth 검증
    if (!petBirth || typeof petBirth !== 'string') {
        return { valid: false, error: 'petBirth가 필요합니다.' };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(petBirth)) {
        return { valid: false, error: 'petBirth 형식이 올바르지 않습니다. (YYYY-MM-DD)' };
    }
    const petDate = new Date(petBirth);
    if (isNaN(petDate.getTime())) {
        return { valid: false, error: 'petBirth가 유효한 날짜가 아닙니다.' };
    }
    if (petDate.getFullYear() < 2000 || petDate > new Date()) {
        return { valid: false, error: 'petBirth가 허용 범위를 벗어났습니다. (2000년 이후, 오늘 이전)' };
    }

    // petType 검증
    if (!petType || typeof petType !== 'string') {
        return { valid: false, error: 'petType이 필요합니다.' };
    }
    if (!['cat', 'dog', 'other'].includes(petType)) {
        return { valid: false, error: 'petType은 cat, dog, other 중 하나여야 합니다.' };
    }

    return {
        valid: true,
        data: {
            ownerBirth,
            petBirth,
            petType: petType as 'cat' | 'dog' | 'other'
        }
    };
}

/**
 * POST /api/pet-destiny
 * 반려동물 운세 계산 API
 */
export async function calculatePetDestinyHandler(req: Request, res: Response) {
    try {
        // 요청 검증
        const validation = validateRequest(req.body);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: validation.error
                }
            });
        }

        // 운세 계산 (보안: 생년월일 로깅 금지)
        const result = calculatePetDestiny(validation.data);

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Pet destiny calculation error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '운세 계산 중 오류가 발생했습니다.'
            }
        });
    }
}
