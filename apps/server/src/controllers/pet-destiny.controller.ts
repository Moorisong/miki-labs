import { Request, Response } from 'express';
import { calculatePetDestiny, PetDestinyRequest } from '../services/pet-destiny';

// 요청 검증
function validateRequest(body: unknown): { valid: true; data: PetDestinyRequest } | { valid: false; error: string } {
    if (!body || typeof body !== 'object') {
        return { valid: false, error: '잘못된 요청입니다. 다시 시도해주세요.' };
    }

    const { ownerBirth, petBirth, petType } = body as Record<string, unknown>;

    // ownerBirth 검증
    if (!ownerBirth || typeof ownerBirth !== 'string') {
        return { valid: false, error: '집사의 생년월일을 입력해주세요.' };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ownerBirth)) {
        return { valid: false, error: '집사 생년월일 형식이 올바르지 않습니다. (YYYY-MM-DD)' };
    }
    const ownerDate = new Date(ownerBirth);
    if (isNaN(ownerDate.getTime())) {
        return { valid: false, error: '집사 생년월일에 존재하지 않는 날짜가 있습니다. 다시 확인해주세요.' };
    }
    if (ownerDate.getFullYear() < 1900 || ownerDate > new Date()) {
        return { valid: false, error: '집사 생년월일은 1900년 이후부터 오늘까지만 입력 가능합니다.' };
    }

    // petBirth 검증
    if (!petBirth || typeof petBirth !== 'string') {
        return { valid: false, error: '반려동물의 생년월일을 입력해주세요.' };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(petBirth)) {
        return { valid: false, error: '반려동물 생년월일 형식이 올바르지 않습니다. (YYYY-MM-DD)' };
    }
    const petDate = new Date(petBirth);
    if (isNaN(petDate.getTime())) {
        return { valid: false, error: '반려동물 생년월일에 존재하지 않는 날짜가 있습니다. 다시 확인해주세요.' };
    }
    if (petDate.getFullYear() < 2000 || petDate > new Date()) {
        return { valid: false, error: '반려동물 생년월일은 2000년 이후부터 입력 가능해요.' };
    }

    // petType 검증
    if (!petType || typeof petType !== 'string') {
        return { valid: false, error: '반려동물 종류를 선택해주세요.' };
    }
    if (!['cat', 'dog', 'other'].includes(petType)) {
        return { valid: false, error: '반려동물 종류가 올바르지 않습니다.' };
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
                message: '운명 분석 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
            }
        });
    }
}
