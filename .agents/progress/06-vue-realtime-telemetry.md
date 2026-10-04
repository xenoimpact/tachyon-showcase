# 화면 06: 실시간 데이터 갱신 (초고속 성능)

- **스펙 문서**: [.agents/specs/06-realtime-telemetry.md](../../.agents/specs/06-realtime-telemetry.md)
- **공통 데이터셋**: `packages/shared/src/types/telemetry.ts`, `packages/shared/src/telemetryData.ts`
- **데모 뷰**: `packages/vue/src/views/RealtimeTelemetryDemo.vue`
- **렌더러**: `packages/vue/src/components/renderers/FlashCellRenderer.vue` (실시간 틱 플래시)

## 작업 체크리스트
- [ ] `packages/shared/src/types/telemetry.ts` 50개 컬럼 인터페이스 정의
- [ ] `packages/shared/src/telemetryData.ts` 2,000대 설비 대용량 목 데이터 생성기 구현
- [ ] `packages/vue/src/views/RealtimeTelemetryDemo.vue` 메인 뷰 구현 (50열 다단 헤더, 좌측 4열 고정, 실시간 틱 엔진, FPS 카운터)
- [ ] `packages/vue/src/App.vue` 06번 메뉴 및 라우팅 등록
- [ ] `pnpm build` 타입 및 빌드 검증
