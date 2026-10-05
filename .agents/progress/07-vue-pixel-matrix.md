# 화면 07: 픽셀 도트 매트릭스 & 전광판 관제

- **스펙 문서**: [.agents/specs/07-pixel-matrix.md](../../.agents/specs/07-pixel-matrix.md)
- **데모 뷰**: `packages/vue/src/views/PixelMatrixDemo.vue`
- **렌더러**: `packages/vue/src/components/renderers/CanvasPixelRenderer.ts`

## 작업 체크리스트
- [x] `packages/vue/src/components/renderers/CanvasPixelRenderer.ts` 초고속 Canvas 2D LED 도트 렌더러 구현 (네온 글로우, 코어 하이라이트, 동적 컬러 맵핑)
- [x] `packages/vue/src/views/PixelMatrixDemo.vue` 64열 × 60행 (3,840개 셀) 그리드 뷰 구현
  - [x] 360° 회전 레이더 스캐너 (중심 32,30, 반경 28, 4중 동심원 링, 8대 타깃 탐지 플래시)
  - [x] 오프스크린 캔버스 기반 임의 텍스트 비트맵 변환 및 무한 수평 스크롤 티커 (34px 대형 폰트)
  - [x] 반도체 웨이퍼 사인 파동(Sine Wave) 애니메이션
  - [x] 콘웨이 생명 게임(Conway's Game of Life) 셀룰러 오토마타 시뮬레이션
  - [x] 7초 주기 무한 자동 순환(Auto-Cycle) 및 실시간 프로그레스 바 연출
  - [x] 60 FPS 및 프레임 소요시간(0.1ms) 실시간 계측 패널
- [x] `packages/vue/src/App.vue` 07번 메뉴 등록 및 라우팅 연결
- [x] `packages/vue/src/views/IntroductionView.vue` 07번 데모 카드 추가
- [ ] 전체 빌드(`pnpm build`) 검증
