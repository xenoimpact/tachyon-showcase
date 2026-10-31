# 기능: 화면 라우팅 (vue-router)

## 작업 체크리스트

- [x] `vue-router` 의존성 추가 (`pnpm add vue-router --filter @tachyon-showcase/vue`)
- [x] `packages/vue/src/router/index.ts` 메뉴 목록 이관 및 라우터 구성
- [x] 주소에서 `#` 제거: HTML5 history 모드(`/메뉴id`) 전환, base 경로(`import.meta.env.BASE_URL`) 적용
- [x] `packages/vue/vite.config.ts` 빌드 시 `index.html` → `404.html` 복사 (GitHub Pages 직접 접속·새로고침 대응)
- [x] `packages/vue/src/main.ts` 라우터 등록
- [x] `packages/vue/src/App.vue` 활성 메뉴를 라우트 이름과 연동, `RouterView`로 화면 렌더링
- [x] 빌드 검증 (`pnpm build`)
- [ ] 브라우저 동작 확인 (메뉴 이동·새로고침·뒤로가기·없는 경로 이동)
