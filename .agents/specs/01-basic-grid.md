# 화면 1 스펙: 기본 그리드 (Basic Grid)

## 1. 개요 및 목적
* **화면 ID**: `basic` / 화면 번호 `01`
* **목적**: 복잡한 엔터프라이즈 비즈니스 주문 데이터를 직관적으로 구조화한 멀티헤더와 실무 시나리오 기반의 **상·하·좌·우 4방향 고정(Frozen)**, 비즈니스 정합성을 보장하는 통화 콤마 포맷터, 상태 배지 렌더러, 그리고 100% 핏 뷰포트를 시연합니다.
* **제안 슬라이드 매핑**: [슬라이드 1, 2] 엔터프라이즈 데이터 구조화, 멀티헤더와 틀고정

---

## 2. 데이터 및 인터페이스 매핑
* **참조 패키지**: `@tachyon-showcase/shared`
* **타입 정의**: `OrderItem` ([packages/shared/src/types/order.ts](file:///Users/tsyeom/projects/tachyon-showcase/packages/shared/src/types/order.ts))
* **데이터셋 구성 (`createShowcaseOrders()`)**:
  - 기본 100건 비즈니스 정합성 주문 데이터 (`수량 × 단가 = 공급가액`, `부가세 10%`, `합계금액`)
  - **상단 2행 (인덱스 0, 1)**: 당일 최우선 처리 대상 품의 (`[긴급 집중관리] 차세대 반도체 공정 모니터링 시스템`, `[긴급 당일출하] 자율주행 센서 텔레메트리 파이프라인`, `priority: '긴급'`)
  - **하단 1행 (인덱스 100)**: 전사 100건 수주 총 결산 집계행 (`id: '[합계]'`, `customer: '전사 100건 결산'`)
* **지표 분리**: 요약행을 제외한 순수 주문 100건 기준으로 통계 및 지표(`baseOrdersCount`) 산출

---

## 3. 필수 UI 구성요소 및 컬럼 정의

| 영역 | 컬럼/컴포넌트 | 필드명 | 너비 | 정렬 | 주요 속성 및 렌더러 |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **좌측 고정 (2열)** | 주문번호 | `id` | 130 | 중앙 | `sortable: true`, 가로 스크롤 시 주문 식별자 유지 |
| **좌측 고정 (2열)** | 고객사명 | `customer` | 160 | 좌측 | `sortable: true`, 고객사명 상시 노출 |
| **멀티헤더 1** | **[프로젝트 정보]** | `projectInfo` | - | - | 2단 중첩 상위 그룹 헤더 |
| └ 하위 열 | 프로젝트/품목명 | `projectName` | 320 | 좌측 | `sortable: true` |
| └ 하위 열 | 분류 | `category` | 120 | 중앙 | `sortable: true` |
| └ 하위 열 | 담당부서 | `department` | 160 | 좌측 | `sortable: true` |
| **멀티헤더 2** | **[금액 및 수량 (VAT 포함)]** | `amountInfo` | - | - | 2단 중첩 상위 그룹 헤더 |
| └ 하위 열 | 수량 | `quantity` | 90 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| └ 하위 열 | 단가 | `unitPrice` | 130 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| └ 하위 열 | 공급가액 | `supplyAmount` | 140 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| └ 하위 열 | 부가세(10%) | `vat` | 120 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| └ 하위 열 | 합계금액 | `totalAmount` | 160 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| **일반 열** | 우선순위 | `priority` | 90 | 중앙 | `sortable: true` |
| **일반 열** | 주문일자 | `orderDate` | 120 | 중앙 | `TachyonDateColumn`, `pattern="YYYY-MM-DD"` |
| **일반 열** | 납기일자 | `deliveryDate` | 120 | 중앙 | `TachyonDateColumn`, `pattern="YYYY-MM-DD"` |
| **우측 고정 (1열)** | 진행상태 | `status` | 120 | 중앙 | `StatusBadgeRenderer`, 세부 내역 탐색 중에도 최종 상태 상시 주시 |

---

## 4. 실무 4방향 고정(Frozen) 시나리오

1. **좌측 2열 (`frozenLeft: 2`)**: `주문번호`, `고객사명` — 가로 스크롤 시에도 어떤 주문인지 식별 유지.
2. **우측 1열 (`frozenRight: 1`)**: `진행상태` 배지 — 우측 끝에 배치되어 가로 스크롤 위치와 무관하게 결재/출하 상태를 상시 모니터링.
3. **상단 2행 (`frozenTop: 2`)**: 최우선 긴급 주문 2건 — 세로 스크롤 시에도 최상단에 핀 고정되어 즉시 파악 가능.
4. **하단 1행 (`frozenBottom: 1`)**: 전사 총 결산 요약행 — 엑셀의 요약행(Summary Footer)처럼 스크롤 중에도 화면 최하단에 상시 노출.
5. **1px 고정선 테마 동기화**: 모든 테마에서 분할선 두께를 1px로 정밀 렌더링.

---

## 5. 툴바 및 KPI 지표 연동

### 1) 통계 지표 (#stats)
* **데이터 건수**: 순수 주문 100건 (`baseOrdersCount`)
* **검수완료**: 상태가 '검수완료'인 건수 (`text-emerald-600`)
* **공급가액**: 100건 공급가액 합계 (`font-mono`)
* **총 합계금액**: 100건 총 합계금액 (`text-blue-600 font-mono`)

### 2) 액션 컨트롤러 (#actions)
* **4방향 마스터 토글 버튼**: 클릭 시 `4방향 전체 고정` ↔ `좌측 열 고정` ↔ `고정 해제` 상태를 순환 변경.
* **개별 방향 미니 토글 그룹 (`.toggle-group`)**: 좌(2열), 우(1열), 상(2행), 하(1행) 상태를 독립적으로 제어.
* **Excel 내보내기 버튼**: Web Worker 기반 `.xlsx` 파일 즉시 다운로드.

