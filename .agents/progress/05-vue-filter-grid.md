# 화면 05: 헤더 필터링 (Column Filter)

- **스펙 문서**: [.agents/specs/05-filter-grid.md](../../.agents/specs/05-filter-grid.md)

## 작업 체크리스트

- [x] 기존 화면 번호 재배치 (트리 05→06, 실시간 06→07, 픽셀 07→08)
- [x] `packages/vue/src/config/tachyon/columns/TachyonSetFilterColumn.ts` 값 목록 필터 컬럼
- [x] `packages/vue/src/config/tachyon/columns/TachyonTextFilterColumn.ts` 문자열 조건 필터 컬럼
- [x] `packages/vue/src/assets/styles/filter.css` 테마 연동 필터 헤더·팝업 스타일
- [x] `packages/vue/src/views/FilterGridDemo.vue` 데모 화면 구현
- [x] `packages/vue/src/App.vue` 05번 메뉴 등록
- [x] `packages/vue/src/views/IntroductionView.vue` 05번 데모 카드 추가
- [x] 빌드 검증 (`pnpm build`)
- [ ] 브라우저 동작 확인 (필터 팝업·테마 전환·표시 건수 갱신)
