# 05-vue-cell-visual — 인셀 시각화 및 모니터링 (화면 04)

* **목표**: 12개월 추세 스파크라인 차트, 목표 달성률 프로그레스 바, 위험 지수 히트맵 등 셀 내부 마이크로 차트와 시각화 렌더러 시연
* **스펙 참조**: `.agents/specs/04-cell-visual.md`
* **데이터셋**: `@tachyon-showcase/shared`의 `mockSeriesData` (`VisualizationItem[]`)

---

## 작업 체크리스트

- [x] **Phase 1: 커스텀 시각화 렌더러 구현**
  - [x] `ProgressBarRenderer.vue`: 목표 달성률 수평 게이지 바 (80% 이상 청색, 100% 초과 녹색, 60% 미만 주황/적색)
  - [x] `SparklineRenderer.vue`: 12개월 매출 추세 미니 라인 차트 (SVG 기반 초경량 곡선, 최고/최저 포인트)
  - [x] `HeatmapCellRenderer.vue`: 위험 지수(0~100) 구간별 동적 틴트 배경색 (초록/노랑/빨강)
  - [x] `StatusBadgeRenderer.vue`: `우수`, `양호`, `경고` 상태 배지 클래스 확장
  - [x] `YoYGrowthRenderer.vue`: 전년비 성장률(YoY) 수치 및 상승(▲)/하강(▼) 인디케이터 배색

- [x] **Phase 2: 메인 데모 화면 구축 (`CellVisualDemo.vue`)**
  - [x] 13개 컬럼 스펙 준수 (좌측 2열 고정, 관할 사업장, 목표/실적, 전년비 YoY, 달성률 바, 12개월 스파크라인, 추세, 평가, 위험지수, 최종 점검일)
  - [x] 500건 대규모 품목 데이터셋 및 16종 베이스/사업장/에디션 조합 다채로운 모델링
  - [x] 상단 4종 KPI 대시보드 (품목수, 총 목표액, 총 실적액, 평균 달성률)
  - [x] 최적 행 높이(`rowHeight: 46`) 적용으로 시각화 요소 가독성 확보
  - [x] 카테고리 필터 토글 및 XLSX 엑셀 내보내기 연동

- [-] **Phase 3: 네비게이션 및 검증**
  - [x] `App.vue` 04번 메뉴에 `CellVisualDemo` 컴포넌트 연결
  - [x] `IntroductionView.vue` 데모 카드 상태 최신화
  - [ ] 전체 빌드(`pnpm build`) 검증 및 무결성 확인

