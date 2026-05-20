/**
 * 너잘알 서비스 상수
 */

/** 데이터 만료 기간 (3일) */
export const TTL_DAYS = 3;
export const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

/** 질문 제한 */
export const MAX_QUESTIONS = 10;
export const MIN_QUESTIONS = 1;

/** 입력 길이 제한 */
export const MAX_QUESTION_LENGTH = 200;
export const MAX_ANSWER_LENGTH = 200;
export const MAX_NAME_LENGTH = 10;

/** nanoid 토큰 길이 */
export const TOKEN_LENGTH = 12;

/** 에러 메시지 */
export const ERROR_MESSAGES = {
  TEST_NOT_FOUND: '해당 테스트를 찾을 수 없습니다.',
  INVALID_QUESTIONS: `질문은 ${MIN_QUESTIONS}~${MAX_QUESTIONS}개여야 합니다.`,
  MISSING_FIELDS: '필수 입력값이 누락되었습니다.',
  QUESTION_TOO_LONG: `질문은 ${MAX_QUESTION_LENGTH}자 이내여야 합니다.`,
  ANSWER_TOO_LONG: `답변은 ${MAX_ANSWER_LENGTH}자 이내여야 합니다.`,
  NAME_TOO_LONG: `이름은 ${MAX_NAME_LENGTH}자 이내여야 합니다.`,
  INVALID_ANSWER_INDEX: '유효하지 않은 질문 인덱스입니다.',
  SECURITY_REQUIRED: '보안 정보가 필요합니다.',
} as const;
