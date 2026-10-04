# 데모 화면 공통 레이아웃 및 스타일링 규약 (Demo Layout Rules)

이 문서는 `tachyon-showcase`의 모든 데모 화면(화면 01~05)이 준수해야 하는 전역 레이아웃 골격과 공통 컴포넌트 스타일링 규칙을 정의합니다.

---

## 1. 모든 데모 화면의 기본 껍질 (DemoContainer)

모든 데모 화면 컴포넌트(`packages/vue/src/views/*.vue`)는 반드시 최상위 루트로 `<DemoContainer>`를 사용해야 하며, 2-Tier 엔터프라이즈 툴바 구조를 엄격히 준수합니다.

```html
<template>
    <DemoContainer :title="title" :description="description">
        <!-- 2-Tier 툴바 좌측: KPI 통계 알약 위젯 슬롯 -->
        <template #stats>
            <div class="stat-pill">
                <span class="stat-label">라벨</span>
                <span class="stat-value">수치</span>
            </div>
        </template>

        <!-- 2-Tier 툴바 우측: 화면별 액션 및 제어 도구 슬롯 -->
        <template #actions>
            <div class="flex items-center gap-2">
                <button class="btn-demo btn-demo-outline" ...>토글/옵션</button>
                <button class="btn-demo bg-emerald-600 hover:bg-emerald-700 text-white border-none ml-1" @click="exportToExcel">
                    Excel 다운로드
                </button>
            </div>
        </template>

        <!-- 본문: 풀블리드 타키온 그리드 (100% 채움) -->
        <TachyonGrid class="w-full h-full" ... />
    </DemoContainer>
</template>
```

### 필수 규격
1. **1-Tier (헤더 타이틀 및 설명)**:
   - `title`: 화면 명칭 (예: `기본 그리드 (상·하·좌·우 4방향 고정)`)
   - `description`: 일반 사용자 및 고객 눈높이에 맞춘 직관적인 한 줄 안내 (과도한 미사여구, 기술 괄호 나열 지양)
2. **2-Tier (통계 & 액션 수평 정렬)**:
   - 좌측 `#stats`: 데이터 건수, 상태별 건수, 금액, 성능 시간 등 실시간 메트릭 3~4종 배치
   - 우측 `#actions`: 프리셋 버튼, 토글 그룹, Excel 내보내기 버튼 단일 수평 정렬
3. **그리드 바디 (Full-bleed 뷰포트)**:
   - 외곽 패딩 없이 `flex-1 min-h-0 w-full`로 뷰포트를 100% 채웁니다.
   - `.tachyon-grid`는 외곽선과 모서리 곡률을 `none / 0`으로 유지하여 컨테이너와 일체화합니다.

---

## 2. Tailwind v4 + CSS 하이브리드 스타일 작성 원칙

공통 컴포넌트 클래스(`themes.css`의 `@layer components`)와 Tailwind 유틸리티를 아래 규칙에 따라 결합합니다.

### 1) 표준 컴포넌트 클래스 매핑

| UI 요소 | 기본 뼈대 클래스 | Tailwind 유틸리티 오버라이드 예시 |
| :--- | :--- | :--- |
| **통계 알약** | `.stat-pill` | - |
| └ 라벨 | `.stat-label` | - |
| └ 수치 | `.stat-value` | `text-emerald-600`, `text-blue-600`, `font-mono` |
| **기본 버튼** | `.btn-demo` | `bg-emerald-600 hover:bg-emerald-700 text-white border-none` |
| **아웃라인 버튼** | `.btn-demo .btn-demo-outline` | `bg-blue-600 text-white border-blue-600` (액티브 시) |
| **토글 그룹** | `.toggle-group` | - |
| └ 토글 아이템 | `.toggle-item` | `bg-sky-500/15 text-sky-600 font-bold` (활성화 시) |

### 2) 작성 가이드
* UI 박스의 패딩, 라운딩, 보더, 테마 변수 매핑은 기본 뼈대 클래스를 사용합니다.
* 특정 지표의 색상 강조나 숫자 전용 폰트(`font-mono`), 간격(`ml-1`, `gap-2`)은 인라인 Tailwind 유틸리티로 즉시 덮어씁니다.

---

## 3. 타키온 캔버스 1px 고정선(Frozen Line) 표준

그리드의 상·하·좌·우 고정(Frozen) 분할선은 전 테마 1px 두께를 유지합니다.
* **Default (Light)**: `width: 1`, `color: '#64748b'`
* **Dark**: `width: 1`, `color: 'rgba(255, 255, 255, 0.2)'`
* **Steel Blue**: `width: 1`, `color: '#38bdf8'`
