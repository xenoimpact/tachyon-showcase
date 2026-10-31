# 화면 8 스펙: 엑셀 내보내기 & 가져오기 (Excel Export & Import)

## 1. 개요 및 목적
* **화면 ID**: `excel` / 화면 번호 `08`
* **목적**: 대량의 그리드 데이터를 멀티헤더·숫자 서식·틀고정이 유지된 `.xlsx` 파일로 내보내고, 엑셀 파일을 다시 그리드로 가져오는 과정을 시연합니다. 파일 생성은 백그라운드(Web Worker)에서 처리되며, 내보내기 구간별 소요시간을 함께 보여 줍니다.
* **제안 슬라이드 매핑**: 핵심 기능 "서식 유지 엑셀 내보내기 (Spreadsheet Export)"

---

## 2. 데이터 및 인터페이스 매핑
* **참조 패키지**: `@tachyon-showcase/shared`
* **타입 정의**: `OrderItem` ([packages/shared/src/types/order.ts](../../packages/shared/src/types/order.ts))
* **데이터셋 구성 (`generateLargeDataset(count)`)**: 1만 / 5만 / 10만 건 주문 데이터 (항상 같은 결과를 만드는 결정적 생성기)
* **신규 공통 데이터 없음**: 기존 데이터셋을 그대로 사용합니다.

---

## 3. 필수 UI 구성요소 및 컬럼 정의

| 영역 | 멀티헤더 그룹 | 컬럼명 | 필드명 | 너비 | 정렬 | 주요 속성 |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **좌측 고정 (1열)** | - | No. | `no` | 70 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| **일반 열** | 주문 정보 | 주문번호 | `id` | 150 | 중앙 | - |
| **일반 열** | 주문 정보 | 고객사명 | `customer` | 160 | 좌측 | - |
| **일반 열** | 주문 정보 | 담당부서 | `department` | 150 | 좌측 | - |
| **일반 열** | 품목 정보 | 프로젝트/품목명 | `projectName` | 260 | 좌측 | - |
| **일반 열** | 품목 정보 | 분류 | `category` | 120 | 중앙 | - |
| **일반 열** | 금액 정보 | 수량 | `quantity` | 80 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| **일반 열** | 금액 정보 | 단가 | `unitPrice` | 120 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| **일반 열** | 금액 정보 | 공급가액 | `supplyAmount` | 140 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| **일반 열** | 금액 정보 | 부가세 | `vat` | 120 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| **일반 열** | 금액 정보 | 합계금액 | `totalAmount` | 150 | 우측 | `TachyonNumberColumn`, `pattern="0,0"` |
| **일반 열** | 일정 | 주문일자 | `orderDate` | 110 | 중앙 | `TachyonDateColumn`, `pattern="YYYY-MM-DD"` |
| **일반 열** | 일정 | 납기일자 | `deliveryDate` | 110 | 중앙 | `TachyonDateColumn`, `pattern="YYYY-MM-DD"` |
| **우측 고정 (1열)** | - | 진행상태 | `status` | 110 | 중앙 | `StatusBadgeRenderer` |

* 고정: `frozenLeft: 1`, `frozenRight: 1`

---

## 4. 툴바 및 KPI 지표 연동

### 1) 통계 지표 (#stats)
* **데이터 건수**: 현재 그리드에 표시된 행 수 (`text-blue-600`)
* **내보내기**: 마지막 내보내기 전체 소요시간(ms)과 그중 메인 스레드 처리 시간(ms). 마우스를 올리면 구간별 소요시간을 표시합니다.
  - 메인 스레드: 데이터 추출, 전송 전 진단 복제
  - 워커 시작·전송: 전체 왕복 시간에서 워커 내부 처리 시간을 뺀 값
  - 워커 내부: 헤더 작성, 행 추가, 트리 계층, 셀 병합, 테두리·배경, 파일 생성(XML 변환·압축)
* **파일 크기**: 마지막으로 생성한 파일 크기(MB)

※ 모든 수치는 보는 사람의 기기에서 측정한 값이며, 문서·제안 자료에는 고정 수치를 적지 않습니다.

### 2) 액션 컨트롤러 (#actions)
* **건수 전환 토글**: 1만 / 5만 / 10만 건 (작업 중에는 비활성)
* **엑셀 가져오기 버튼**: `.xlsx` 파일을 선택하면 그리드 데이터를 가져온 내용으로 바꿉니다.
* **Excel 다운로드 버튼**: 현재 그리드를 `.xlsx` 파일로 내보냅니다. 작업 중에는 진행 표시로 바뀌며, 그리드 스크롤은 계속 가능합니다.
