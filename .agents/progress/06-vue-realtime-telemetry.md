# 화면 06: 실시간 데이터 갱신 (초고속 성능 & 텔레메트리 관제)

- **스펙 문서**: [.agents/specs/06-realtime-telemetry.md](../../.agents/specs/06-realtime-telemetry.md)
- **공통 데이터셋**: `packages/shared/src/types/telemetry.ts`, `packages/shared/src/telemetryData.ts`
- **데모 뷰**: `packages/vue/src/views/RealtimeTelemetryDemo.vue`
- **렌더러**: `packages/vue/src/components/renderers/CanvasFlashCellRenderer.ts`, `CanvasStatusBadgeRenderer.ts`

## 작업 체크리스트
- [x] `packages/shared/src/types/telemetry.ts` 50개 컬럼 인터페이스 정의
- [x] `packages/shared/src/telemetryData.ts` 5,000대 설비 대용량 목 데이터 생성기 및 스크롤 뷰포트 추적 틱 변동 엔진 구현
- [x] `packages/vue/src/components/renderers/CanvasFlashCellRenderer.ts` Canvas 2D 기반 상승(▲)/하강(▼) 미니 화살표, 2.5px 네온 액센트 바, 550ms 감쇠 플래시 렌더러 구현
- [x] `packages/vue/src/components/renderers/CanvasStatusBadgeRenderer.ts` 24px 행 높이 맞춤 16px 콤팩트 캡슐 배지 드로잉
- [x] `packages/vue/src/views/RealtimeTelemetryDemo.vue` 메인 뷰 구현 (5,000행 × 49열, 24px 초슬림 행, 좌측 3열 틀고정, 3,000셀/초 부하 대응, 60 FPS 유지)
- [x] `packages/vue/src/App.vue` 06번 메뉴 및 라우팅 등록
- [x] `packages/vue/src/views/IntroductionView.vue` 06번 데모 카드 활성화
- [ ] 전체 빌드(`pnpm build`) 검증
