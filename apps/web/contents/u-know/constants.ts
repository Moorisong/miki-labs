/**
 * 너잘알(u-know) 프론트엔드 상수
 */

/** 라우트 경로 */
export const UKNOW_ROUTES = {
  HOME: '/u-know',
  CREATE: '/u-know/create',
  SHARE: (id: string) => `/u-know/share/${id}`,
  PLAY: (token: string) => `/u-know/play/${token}`,
  RESULT: (token: string) => `/u-know/result/${token}`,
} as const;

/** API 경로 */
export const UKNOW_API = {
  CREATE: '/api/u-know/create',
  SUBMIT: '/api/u-know/submit',
  RESULT: (token: string) => `/api/u-know/result/${token}`,
} as const;

/** 입력 제한 */
export const UKNOW_LIMITS = {
  MAX_QUESTIONS: 10,
  MAX_QUESTION_LENGTH: 200,
  MAX_ANSWER_LENGTH: 200,
  MAX_NAME_LENGTH: 10,
} as const;


/** 결과 리액션 텍스트 */
export const RESULT_REACTIONS = [
  'ㅋㅋㅎㅎㅋㅋㅎㅋ',
  '아 진짜 웃기다 ㅋㅋ',
  '헐 대박 ㅋㅋㅋㅋ',
  '이거 캡쳐해야 함ㅋㅋ',
  'ㄹㅈㄷ 아니냐 ㅋㅋㅋ',
  '레전드다 진짜',
] as const;

/** 예시 질문 셀렉트 목록 */
export const EXAMPLE_QUESTIONS = [
  '새벽 2시에 전화해서 내가 치킨 시켜달라고 하면?',
  '길 가다가 내가 갑자기 엎어지면?',
  '내가 카톡 프사를 니 사진으로 바꾸면?',
  '시험 전날 밤에 내가 "나 하나도 안 했어" 라고 하면?',
  '내가 갑자기 "우리 커플링 사자" 라고 하면?',
  '내가 니 뒤에서 몰래 귀에 대고 "야" 하면?',
  '내가 생일에 편의점 삼각김밥 선물하면?',
  '비 오는 날 우산 하나로 같이 쓰자고 하면?',
  '내가 갑자기 "나 사실 너 싫었어" 라고 하면?',
  '주말에 불러내서 내가 울면서 편지 읽어주면?',
] as const;

/** TTL 안내 문구 */
export const TTL_NOTICE = '서버비 아까우니까 결과는 3일 뒤 삭제됨 😇';
