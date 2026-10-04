# 화면 1: 기본 그리드 (상·하·좌·우 4방향 고정)

- [x] 2단 다단 계층형 헤더 구성 (프로젝트 정보, 금액 및 수량)
- [x] 실무 4방향 고정(Frozen) 구현
  - [x] 좌측 2열 고정: 주문번호 & 고객사명 (핵심 식별자)
  - [x] 우측 1열 고정: 진행상태 배지 (상시 모니터링)
  - [x] 상단 2행 고정: 긴급 집중 관리 품의 2건 (앰버 틴트 배경색 강조)
  - [x] 하단 1행 고정: 전사 100건 수주 총 결산 집계행 ([합계], 블루 틴트 배경색 강조)
- [x] 1px 고정선 테마 적용 (default: #64748b, dark: rgba(255,255,255,0.2), steel-blue: #38bdf8)
- [x] Tailwind + CSS 하이브리드 아키텍처 적용 (@layer components: stat-pill, btn-demo, toggle-group)
- [x] 4종 요약 통계 KPI 연동 (데이터 건수, 검수완료, 공급가액, 총 합계금액)
- [x] 상태 배지 렌더러 (StatusBadgeRenderer)
- [x] 숫자 콤마 표시 형식 (TachyonNumberColumn pattern="0,0")
- [x] 날짜 포맷팅 표시 형식 (TachyonDateColumn pattern="YYYY-MM-DD")
- [x] Web Worker 엑셀 내보내기 연동 (XlsxWorker)

