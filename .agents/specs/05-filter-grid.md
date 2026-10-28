# 화면 5 스펙: 헤더 필터링 (Column Filter)

## 1. 개요 및 목적
* **화면 ID**: `filter` / 화면 번호 `05`
* **목적**: 컬럼 헤더의 필터 버튼으로 엑셀처럼 **값 목록(체크박스) 필터**와 **문자열 조건 필터**를 적용하고, 여러 열의 조건을 함께 걸어 원하는 데이터만 빠르게 추려내는 과정을 시연합니다.
* **제안 슬라이드 매핑**: 핵심 기능 "통합 데이터 필터 및 다중 열 정렬"

---

## 2. 데이터 및 인터페이스 매핑
* **참조 패키지**: `@tachyon-showcase/shared`
* **타입 정의**: `OrderItem` ([packages/shared/src/types/order.ts](../../packages/shared/src/types/order.ts))
* **데이터셋 구성 (`generateLargeDataset(1000)`)**:
  - 1,000건 주문 데이터 (항상 같은 결과를 만드는 결정적 생성기)
  - 고객사 10종, 담당부서 8종, 분류 5종, 진행상태 5종, 우선순위 4종이 고르게 분포하여 값 목록 필터 시연에 적합
* **신규 공통 데이터 없음**: 기존 데이터셋을 그대로 사용합니다.

---

## 3. 필터 컴포넌트

| 구분 | 컬럼 컴포넌트 | 헤더 렌더러 / 팝업 | 동작 |
| :--- | :--- | :--- | :--- |
| **값 목록 필터** | `TachyonSetFilterColumn` | `FilterSetHeaderRenderer` / `FilterSetPopup` | 체크박스로 표시할 값 선택, 검색, 모두 선택, 값별 건수 표시, 검색 결과를 현재 선택에 추가 |
| **문자열 조건 필터** | `TachyonTextFilterColumn` | `FilterTextHeaderRenderer` / `FilterTextPopup` | 포함 / 포함하지 않음 / 시작 문자 / 끝 문자 / 전체 일치 중 하나를 골라 검색어로 필터 |

* 필터 상태는 타키온 필터 인스턴스(`column.filterInstance`) 한 곳에만 둡니다. 헤더와 화면은 그리드의 `collection-change` 이벤트를 받아 이 상태를 읽기만 합니다.
* 값 목록 팝업은 **다른 열 필터를 통과한 행**만으로 목록과 건수를 만듭니다.
* 필터가 걸린 열은 헤더 필터 버튼이 강조 표시됩니다.
* 팝업은 바깥 영역을 누르면 변경 없이 닫힙니다.

---

## 4. 필수 UI 구성요소 및 컬럼 정의

| 영역 | 컬럼/컴포넌트 | 필드명 | 너비 | 정렬 | 주요 속성 및 렌더러 |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **좌측 고정 (2열)** | 주문번호 | `id` | 130 | 중앙 | `sortable: true` |
| **좌측 고정 (2열)** | 고객사명 | `customer` | 170 | 좌측 | `TachyonTextFilterColumn` |
| **일반 열** | 프로젝트/품목명 | `projectName` | 300 | 좌측 | `TachyonTextFilterColumn` |
| **일반 열** | 분류 | `category` | 140 | 중앙 | `TachyonSetFilterColumn` |
| **일반 열** | 담당부서 | `department` | 170 | 좌측 | `TachyonSetFilterColumn` |
| **일반 열** | 우선순위 | `priority` | 110 | 중앙 | `TachyonSetFilterColumn` |
| **일반 열** | 수량 | `quantity` | 90 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| **일반 열** | 합계금액 | `totalAmount` | 160 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| **일반 열** | 주문일자 | `orderDate` | 120 | 중앙 | `TachyonDateColumn`, `pattern="YYYY-MM-DD"` |
| **우측 고정 (1열)** | 진행상태 | `status` | 130 | 중앙 | `TachyonSetFilterColumn`, `StatusBadgeRenderer` |

* 고정: `frozenLeft: 2`, `frozenRight: 1`

---

## 5. 툴바 및 KPI 지표 연동

### 1) 통계 지표 (#stats)
* **전체 건수**: 원본 1,000건
* **표시 건수**: 필터를 통과한 행 수 (`text-blue-600`)
* **적용 필터**: 조건이 걸린 열 개수 (`text-amber-600`)
* **표시 합계금액**: 필터를 통과한 행의 합계금액 (`font-mono`)

※ 표시 건수·합계금액·적용 필터 개수는 그리드의 `collection-change` 이벤트를 받아 필터 결과(`collection.toArray()`)와 `filterManager.filters`의 `canCompare`로 계산합니다.

### 2) 액션 컨트롤러 (#actions)
* **필터 초기화**: `filterManager`의 모든 필터 조건을 비우고 한 번에 다시 필터링 (적용 필터가 없으면 비활성)
* **Excel 내보내기 버튼**: 현재 그리드 상태를 `.xlsx` 파일로 다운로드
