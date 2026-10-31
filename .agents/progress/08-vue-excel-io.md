# 화면 08: 엑셀 내보내기 & 가져오기 (Excel Export & Import)

- **스펙 문서**: [.agents/specs/08-excel-io.md](../../.agents/specs/08-excel-io.md)

## 작업 체크리스트

- [x] `.agents/specs/08-excel-io.md` 화면 스펙 작성
- [x] `packages/vue/src/workers/XlsxWorker.ts` 워커 내부 구간별 소요시간 반환
- [x] `packages/vue/src/config/tachyon/addons/xlsx/export.ts` 메인 스레드·전송 구간 측정 및 결과 반환
- [x] `packages/vue/src/views/ExcelIoDemo.vue` 데모 화면 구현
- [x] `packages/vue/src/App.vue` 메뉴 등록
- [x] `packages/vue/src/views/IntroductionView.vue` 데모 카드 추가
- [x] `.agents/proposal.md` 화면 반영, `.agents/specs/03-cell-editor.md` 범위 정리
- [x] 화면 번호 재배치 (엑셀 09→08, 픽셀 08→09)
- [~] 최장 화면 멈춤·가져오기 일치 지표: 외부 공개 화면에 불필요하여 제거
- [x] 빌드 검증 (`pnpm build`)
- [ ] 브라우저 동작 확인 (내보내기 수치·가져오기)
