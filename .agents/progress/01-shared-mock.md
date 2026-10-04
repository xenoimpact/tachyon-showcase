# 공통 데이터와 그리드 설정 구축

- [x] `mockData.ts`: 일반 그리드용 업무 데이터 (orderFactory 기반 비즈니스 수식 보장 100건)
- [x] `treeData.ts`: 트리 그리드용 계층 데이터 (본부-부서-프로젝트 3단계)
- [x] `seriesData.ts`: 셀 차트용 월별 12개 값, 목표/실적/위험도 데이터
- [x] `dataGen.ts`: 대용량(1만/10만/100만 건) 초고속 생성 함수
- [x] 화면별 컬럼·옵션 정의를 shared에 두어 프레임워크 간 동일 화면 보장 (`columns.ts`)
- [x] `index.ts` export 정리 및 빌드 확인
