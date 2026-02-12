# React 다국어(i18n) 시스템 구현 지시

너는 시니어 프론트엔드 개발자다.
기존 React(CRA) 프로젝트에 **간단하고 유지보수 쉬운 i18n 시스템**을 추가해라.

외부 라이브러리(i18next 등) 사용 금지.
직접 구현하는 경량 i18n 구조를 만들어야 한다.

목표
영어(en) / 한국어(ko) 2개 언어를 지원하는 전역 번역 시스템 구축.

---

# 1. 생성해야 할 파일 구조

```
src/i18n/
  en.js
  ko.js
  i18n.js
```

---

# 2. 번역 데이터 파일 작성

## src/i18n/en.js

영문 번역 객체를 `export default` 로 작성.

구조 예시:
```javascript
export default {
  hero: {
    title: "See how they see you",
    subtitle: "Friends help reveal the real you",
    startButton: "Start My Test"
  }
}
```

중첩 객체 구조 사용.

---

## src/i18n/ko.js

한국어 번역 동일 구조 유지.

```javascript
export default {
  hero: {
    title: "남들이 보는 나를 확인해보세요",
    subtitle: "친구들이 진짜 나를 밝혀줍니다",
    startButton: "테스트 시작하기"
  }
}
```

⚠️ 두 파일의 key 구조는 반드시 동일해야 한다.

---

# 3. i18n 핵심 모듈 구현

파일: `src/i18n/i18n.js`

다음 기능을 반드시 구현:

## 3.1 지원 언어 목록
`const SUPPORTED_LANGUAGES = ["en", "ko"]`

## 3.2 기본 언어
기본 언어 = "en"

## 3.3 현재 언어 저장 방식
`localStorage` 사용
키 이름: "lang"

## 3.4 현재 언어 가져오기 함수
`getCurrentLanguage()`

동작:
1. `localStorage` 값 확인
2. 없으면 기본값 `en` 사용

---

## 3.5 언어 변경 함수
`setLanguage(lang)`

동작:
- `localStorage` 저장
- 페이지 reload 없이 상태 반영 가능하도록 설계

---

## 3.6 번역 함수 `t(key)`

핵심 기능.

사용 방식:
`t("hero.title")`

동작 요구사항:

1. key를 "." 기준으로 split
2. 번역 객체에서 안전하게 탐색
3. 번역 없으면 key 그대로 반환

예:
`t("not.exist")` → "not.exist"

---

# 4. Language Context 생성

파일 생성:
`src/context/LanguageContext.js`

포함 기능:

- 현재 언어 state
- `changeLanguage` 함수
- `t` 함수 제공

Provider 이름:
`LanguageProvider`

Hook 생성:
`useLanguage()`

사용 예:
`const { t, language, changeLanguage } = useLanguage()`

---

# 5. App.js 적용

App 전체를 `LanguageProvider` 로 감싸라.

---

---

# 6. Language Switcher 컴포넌트 생성

파일:
`src/components/LanguageSwitcher.js`

UI 요구사항:
우측 상단 고정 버튼

버튼 2개:
EN / 한국어

클릭 시 `changeLanguage` 호출.

현재 언어 강조 표시.

## 6.1 위치 선정 (UX/UI 중요)

**위치:** 전 페이지 공통 헤더 우측 상단

**이유:**
1. **글로벌 관습:** 대부분의 글로벌 서비스에서 언어 설정은 우측 상단에 위치하여 사용자가 찾기 쉬움.
2. **접근성:** 테스트 흐름 중간(특히 친구 공유 시)에 언어를 변경해야 하는 경우가 많으므로 항상 접근 가능해야 함.

---

# 7. 전역 규칙

⚠️ 매우 중요

모든 UI 텍스트는 하드코딩 금지.
반드시 `t("key")` 사용하도록 구조 작성.

예:
`<h1>{t("hero.title")}</h1>`

---

# 8. 최종 목표

- 외부 라이브러리 없이 동작
- 새 언어 추가 쉬운 구조
- 모든 페이지에서 즉시 사용 가능
- 실제 서비스 수준 품질
