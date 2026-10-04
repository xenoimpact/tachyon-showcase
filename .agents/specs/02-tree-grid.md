# 화면 2 스펙: 계층형 트리 그리드 (Tree Grid)

## 1. 개요 및 목적
* **화면 ID**: `tree` / 화면 번호 `02`
* **목적**: 대규모 기업의 조직 체계(본부 > 부서 > 단위 프로젝트) 및 다단계 예산/실적 구조를 시각화하는 계층형 트리 그리드를 시연합니다.
* **제안 슬라이드 매핑**: [슬라이드 3] 계층 구조 표현과 트리 그리드

---

## 2. 데이터 및 인터페이스 매핑
* **참조 패키지**: `@tachyon-showcase/shared`
* **타입 정의**: `TreeNodeItem` ([packages/shared/src/types/tree.ts](file:///Users/tsyeom/projects/tachyon-showcase/packages/shared/src/types/tree.ts))
* **데이터셋**: `mockTreeData` (3단계 계층: 본부 > 부서 > 단위 프로젝트 15개 노드, 집행률 자동 계산)
* **컬럼 정의**: `treeGridColumns` ([packages/shared/src/columns.ts](file:///Users/tsyeom/projects/tachyon-showcase/packages/shared/src/columns.ts))

---

## 3. 필수 UI 구성요소 및 속성

| 영역 | 컬럼/컴포넌트 | 필드명 | 너비 | 정렬 | 주요 속성 및 역할 |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **트리 열 (고정)** | 조직 / 단위 프로젝트명 | `name` | 300 | 좌측 | `TachyonTreeColumn`, 트리 접힘/펼침 토글 아이콘, `frozenLeft="1"` |
| **일반 열** | 코드 | `code` | 110 | 중앙 | 조직/프로젝트 식별 코드 |
| **일반 열** | 구분 | `category` | 120 | 중앙 | `본부`, `부서`, `프로젝트` 계층 레벨 표시 |
| **일반 열** | 담당자/책임자 | `manager` | 130 | 중앙 | 관리자명 |
| **수치 열** | 배정 예산 | `budget` | 140 | 우측 | `TachyonNumberColumn`, `pattern="0,0"`, 단위 원 |
| **수치 열** | 집행 실적 | `spent` | 140 | 우측 | `TachyonNumberColumn`, `pattern="0,0"`, 단위 원 |
| **지표 열** | 집행률(%) | `achievementRate` | 110 | 우측 | `spent / budget * 100` 계산값 포맷팅 (`0.0%`) |
| **상태 열** | 상태 | `status` | 100 | 중앙 | `StatusBadgeRenderer` (`정상`, `주의`, `완료`, `지연`) |

---

## 4. 핵심 시연 포인트 및 인터랙션 시나리오
1. **다단계 계층 펼치기/접기 (Expand / Collapse)**:
   * 부모 노드(본부, 부서)의 화살표 토글 버튼을 클릭하여 하위 프로젝트 노드를 부드럽게 펼치거나 접음.
   * 상단 컨트롤 버튼: **'전체 펼치기(Expand All)'**, **'전체 접기(Collapse All)'** 액션 제공.
2. **트리 내 좌측 열 고정 (Frozen Tree Column)**:
   * 가로로 긴 예산/실적 테이블에서도 조직/프로젝트명이 좌측에 고정되어 계층 맥락을 상시 유지.
3. **트리 데이터 정렬**:
   * 계층 구조를 깨뜨리지 않으면서 동일 레벨 내에서 예산 또는 집행실적 기준 오름차순/내림차순 정렬 지원.
4. **상위 노드 집계 가시화**:
   * 상위 본부/부서 노드에서 하위 프로젝트들의 예산 합산액이 자연스럽게 집계되어 비즈니스 인과관계를 전달.
