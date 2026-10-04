# 화면 1 스펙: 기본 그리드 (Basic Grid)

## 1. 개요 및 목적
* **화면 ID**: `basic` / 화면 번호 `01`
* **목적**: 복잡한 엔터프라이즈 비즈니스 품의 및 주문 데이터를 직관적으로 구조화한 2단 다단 헤더와 좌측 열 고정(Frozen Columns), 그리고 비즈니스 정합성을 보장하는 통화 콤마 포맷터와 상태 배지 렌더러를 시연합니다.
* **제안 슬라이드 매핑**: [슬라이드 1, 2] 엔터프라이즈 데이터 구조화 및 고속 렌더링 기본기

---

## 2. 데이터 및 인터페이스 매핑
* **참조 패키지**: `@tachyon-showcase/shared`
* **타입 정의**: `OrderItem` ([packages/shared/src/types/order.ts](file:///Users/tsyeom/projects/tachyon-showcase/packages/shared/src/types/order.ts))
* **데이터셋**: `mockOrders` (100건 비즈니스 정합성 데이터: `수량 × 단가 = 공급가액`, `부가세 10%`, `합계금액`)
* **컬럼 정의**: `basicGridColumns` ([packages/shared/src/columns.ts](file:///Users/tsyeom/projects/tachyon-showcase/packages/shared/src/columns.ts))

---

## 3. 필수 UI 구성요소 및 속성

| 영역 | 컬럼/컴포넌트 | 필드명 | 너비 | 정렬 | 주요 속성 및 렌더러 |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **좌측 고정** | 주문번호 | `id` | 130 | 중앙 | `sortable: true`, 열 고정 대상 1 |
| **좌측 고정** | 고객사명 | `customer` | 140 | 좌측 | `sortable: true`, 열 고정 대상 2 |
| **다단 헤더 1** | **[프로젝트 정보]** | `projectInfo` | - | - | 2단 중첩 상위 그룹 헤더 |
| └ 하위 열 | 프로젝트/품목명 | `projectName` | 220 | 좌측 | `sortable: true` |
| └ 하위 열 | 분류 | `category` | 120 | 중앙 | `sortable: true` |
| └ 하위 열 | 담당부서 | `department` | 140 | 좌측 | `sortable: true` |
| **다단 헤더 2** | **[금액 및 수량 (VAT 포함)]** | `amountInfo` | - | - | 2단 중첩 상위 그룹 헤더 |
| └ 하위 열 | 수량 | `quantity` | 90 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| └ 하위 열 | 단가 | `unitPrice` | 120 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| └ 하위 열 | 공급가액 | `supplyAmount` | 130 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| └ 하위 열 | 부가세(10%) | `vat` | 110 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| └ 하위 열 | 합계금액 | `totalAmount` | 140 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| **일반 열** | 진행상태 | `status` | 110 | 중앙 | `StatusBadgeRenderer` (`완료`, `진행중`, `검수중`, `대기`, `취소`) |
| **일반 열** | 우선순위 | `priority` | 90 | 중앙 | `sortable: true` |
| **일반 열** | 주문일자 | `orderDate` | 120 | 중앙 | `TachyonDateColumn`, `pattern="YYYY-MM-DD"` |
| **일반 열** | 납기일자 | `deliveryDate` | 120 | 중앙 | `TachyonDateColumn`, `pattern="YYYY-MM-DD"` |

---

## 4. 핵심 시연 포인트 및 인터랙션 시나리오
1. **열 고정 토글**:
   * 그리드 속성 `:frozenLeft="2"`를 기본 적용하여 좌측 2개 열(주문번호, 고객사명)을 고정.
   * 상단 버튼을 통해 2개 고정 ↔ 고정 해제를 실시간 전환 가능.
2. **2단 다단 헤더**:
   * 복합 업무 정보를 논리적으로 묶어주는 상위 그룹 헤더 2개(프로젝트 정보, 금액 및 수량)를 시각적으로 명확히 표시.
3. **천단위 콤마 자동 서식**:
   * 통화 및 수량 데이터에 `0,0` 서식을 적용하여 가독성 확보.
4. **상태 배지 가상화 렌더링**:
   * 타키온 객체 풀링(`prepare`)을 준수하여 스크롤 시 깜빡임 없는 컬러 배지 렌더링.
5. **백그라운드 엑셀 내보내기**:
   * Web Worker(`?worker`)를 기반으로 메인 스레드 멈춤 없이 100건 데이터 및 서식을 `.xlsx`로 즉시 다운로드.
