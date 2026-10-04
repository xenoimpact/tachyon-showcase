<template>
    <div class="h-full overflow-y-auto px-8 py-8 transition-colors duration-200">
        <div class="max-w-6xl mx-auto flex flex-col gap-10">
            <!-- 1. Hero 배너 섹션 (담백하고 정갈한 제품 개요형) -->
            <section
                class="relative overflow-hidden rounded-2xl p-7 border transition-all duration-300 shadow-sm"
                style="
                    background: linear-gradient(
                        135deg,
                        rgba(37, 99, 235, 0.08) 0%,
                        rgba(56, 189, 248, 0.05) 50%,
                        rgba(241, 245, 249, 0.03) 100%
                    );
                    border-color: var(--card-border);
                "
            >
                <div class="relative z-10 flex flex-col gap-3.5">
                    <div class="flex items-center gap-2">
                        <span
                            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-blue-600/10 text-blue-600 dark:text-sky-400 border border-blue-500/20"
                        >
                            📖 제품 안내 및 기능 가이드
                        </span>
                        <span class="text-xs text-slate-500 dark:text-slate-400"> Tachyon DataGrid & TreeGrid </span>
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight m-0 text-[var(--text-title)]">
                            타키온(Tachyon) 그리드 컴포넌트 안내
                        </h2>
                        <h3 class="text-sm md:text-base font-semibold text-blue-600 dark:text-sky-400 m-0">
                            엔터프라이즈 데이터그리드(DataGrid)와 계층형 트리그리드(TreeGrid)
                        </h3>
                        <p class="text-xs md:text-sm leading-relaxed text-[var(--text-desc)] max-w-3xl m-0 pt-0.5">
                            표 형태의 대규모 데이터를 신속하게 가공·조회하는 기본 그리드와 조직도·BOM 등을 구조화하는
                            계층형 트리의 주요 기능 및 실무 적용 사례를 소개합니다.
                        </p>
                    </div>
                </div>
            </section>

            <!-- 2. 9대 핵심 특징 카드 섹션 (3x3 그리드) -->
            <section class="flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <h3 class="text-xl font-bold tracking-tight text-[var(--text-title)] m-0">
                        그리드 핵심 특징 (Core Features)
                    </h3>
                    <p class="text-xs text-[var(--text-desc)] m-0">
                        엔터프라이즈 업무 시스템에 최적화된 9가지 핵심 역량을 제공합니다.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- 1. 대용량 가상 스크롤 -->
                    <div
                        class="flex flex-col gap-2.5 p-5 rounded-xl border bg-[var(--card-bg)] border-[var(--card-border)] shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-sky-400 flex items-center justify-center text-lg font-bold shrink-0"
                            >
                                🚀
                            </div>
                            <div class="flex flex-col">
                                <h4 class="text-sm font-bold text-[var(--text-title)] m-0">대용량 가상 스크롤</h4>
                                <span class="text-[10px] text-slate-400 font-mono">Virtual Scrolling</span>
                            </div>
                        </div>
                        <p class="text-xs leading-relaxed text-[var(--text-desc)] m-0">
                            화면에 보이는 뷰포트(Viewport) 영역만 즉각 계산하여 렌더링합니다. 데이터 건수가 대규모로
                            늘어나도 메모리 부하 없이 지연 없는 부드러운 스크롤을 제공합니다.
                        </p>
                    </div>

                    <!-- 2. 셀 내 데이터 시각화 -->
                    <div
                        class="flex flex-col gap-2.5 p-5 rounded-xl border bg-[var(--card-bg)] border-[var(--card-border)] shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg font-bold shrink-0"
                            >
                                📊
                            </div>
                            <div class="flex flex-col">
                                <h4 class="text-sm font-bold text-[var(--text-title)] m-0">셀 내 데이터 시각화</h4>
                                <span class="text-[10px] text-slate-400 font-mono">In-Cell Visualization</span>
                            </div>
                        </div>
                        <p class="text-xs leading-relaxed text-[var(--text-desc)] m-0">
                            HTML5 Canvas 2D 기반 커스텀 렌더러를 활용하여 12개월 추세선(스파크라인), 달성률 진행 바,
                            히트맵, 상태 배지를 셀 내부에 가볍고 빠르게 직접 렌더링합니다.
                        </p>
                    </div>

                    <!-- 3. 스프레드시트형 키보드 및 다중 조작 -->
                    <div
                        class="flex flex-col gap-2.5 p-5 rounded-xl border bg-[var(--card-bg)] border-[var(--card-border)] shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-bold shrink-0"
                            >
                                ⌨️
                            </div>
                            <div class="flex flex-col">
                                <h4 class="text-sm font-bold text-[var(--text-title)] m-0">키보드 및 다중 조작</h4>
                                <span class="text-[10px] text-slate-400 font-mono">Keyboard & Range Interaction</span>
                            </div>
                        </div>
                        <p class="text-xs leading-relaxed text-[var(--text-desc)] m-0">
                            방향키와 Tab/Enter 키를 통한 빠른 셀 이동, 마우스 드래그 다중 영역 선택, 클립보드
                            복사·붙여넣기(Ctrl+C/V), 더블클릭 인라인 셀 수정을 완벽하게 지원합니다.
                        </p>
                    </div>

                    <!-- 4. 다단 헤더 및 4방향 틀고정 -->
                    <div
                        class="flex flex-col gap-2.5 p-5 rounded-xl border bg-[var(--card-bg)] border-[var(--card-border)] shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold shrink-0"
                            >
                                📐
                            </div>
                            <div class="flex flex-col">
                                <h4 class="text-sm font-bold text-[var(--text-title)] m-0">다단 헤더 및 틀고정</h4>
                                <span class="text-[10px] text-slate-400 font-mono">Multi-Level Headers & Pinning</span>
                            </div>
                        </div>
                        <p class="text-xs leading-relaxed text-[var(--text-desc)] m-0">
                            2단 이상의 복합 계층 헤더로 업무 항목을 체계화하며, 상·하단 요약행과 좌·우 기준 식별/상태
                            열을 동시에 고정하여 스크롤 중에도 데이터 기준을 잃지 않습니다.
                        </p>
                    </div>

                    <!-- 5. 계층형 트리 그리드 -->
                    <div
                        class="flex flex-col gap-2.5 p-5 rounded-xl border bg-[var(--card-bg)] border-[var(--card-border)] shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-lg font-bold shrink-0"
                            >
                                🌳
                            </div>
                            <div class="flex flex-col">
                                <h4 class="text-sm font-bold text-[var(--text-title)] m-0">계층형 트리 그리드</h4>
                                <span class="text-[10px] text-slate-400 font-mono">Hierarchical Structure</span>
                            </div>
                        </div>
                        <p class="text-xs leading-relaxed text-[var(--text-desc)] m-0">
                            부모-자식 노드로 구성된 계층 데이터를 시각화하며, 단계별 노드 펼치기/접기(Expand/Collapse)와
                            자동 들여쓰기로 부품표(BOM), 조직도 등을 직관적으로 관리합니다.
                        </p>
                    </div>

                    <!-- 6. 사용자 맞춤형 렌더링 -->
                    <div
                        class="flex flex-col gap-2.5 p-5 rounded-xl border bg-[var(--card-bg)] border-[var(--card-border)] shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-9 h-9 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center text-lg font-bold shrink-0"
                            >
                                🎨
                            </div>
                            <div class="flex flex-col">
                                <h4 class="text-sm font-bold text-[var(--text-title)] m-0">사용자 맞춤형 렌더링</h4>
                                <span class="text-[10px] text-slate-400 font-mono">Custom Rendering</span>
                            </div>
                        </div>
                        <p class="text-xs leading-relaxed text-[var(--text-desc)] m-0">
                            진행상태 배지, 액션 버튼, 통화 및 날짜 서식 포맷터 등 업무 화면 목적에 맞춘 다양한 UI 요소를
                            자유롭게 확장하여 맞춤형 화면을 구성할 수 있습니다.
                        </p>
                    </div>

                    <!-- 7. 통합 필터 및 다중 정렬 -->
                    <div
                        class="flex flex-col gap-2.5 p-5 rounded-xl border bg-[var(--card-bg)] border-[var(--card-border)] shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-bold shrink-0"
                            >
                                🔍
                            </div>
                            <div class="flex flex-col">
                                <h4 class="text-sm font-bold text-[var(--text-title)] m-0">통합 필터 및 다중 정렬</h4>
                                <span class="text-[10px] text-slate-400 font-mono">Filtering & Multi-Sort</span>
                            </div>
                        </div>
                        <p class="text-xs leading-relaxed text-[var(--text-desc)] m-0">
                            텍스트 검색, 숫자 범위, 날짜, 체크박스 필터와 Shift 클릭 기반의 다중 열 순차 정렬을 지원하여
                            대량 데이터 속에서 필요한 항목을 신속하게 탐색합니다.
                        </p>
                    </div>

                    <!-- 8. 고해상도 정밀 디스플레이 -->
                    <div
                        class="flex flex-col gap-2.5 p-5 rounded-xl border bg-[var(--card-bg)] border-[var(--card-border)] shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center text-lg font-bold shrink-0"
                            >
                                🖥️
                            </div>
                            <div class="flex flex-col">
                                <h4 class="text-sm font-bold text-[var(--text-title)] m-0">고해상도 정밀 디스플레이</h4>
                                <span class="text-[10px] text-slate-400 font-mono">HiDPI Sharp Display</span>
                            </div>
                        </div>
                        <p class="text-xs leading-relaxed text-[var(--text-desc)] m-0">
                            디스플레이 화면 배율을 감지하여 캔버스 스케일을 보정합니다. Retina 및 고해상도 모니터에서도
                            텍스트 번짐 없이 1px 그리드 구분선이 선명하게 표시됩니다.
                        </p>
                    </div>

                    <!-- 9. 서식 유지 엑셀 내보내기 -->
                    <div
                        class="flex flex-col gap-2.5 p-5 rounded-xl border bg-[var(--card-bg)] border-[var(--card-border)] shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-9 h-9 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-bold shrink-0"
                            >
                                📁
                            </div>
                            <div class="flex flex-col">
                                <h4 class="text-sm font-bold text-[var(--text-title)] m-0">서식 유지 엑셀 내보내기</h4>
                                <span class="text-[10px] text-slate-400 font-mono">Spreadsheet Export</span>
                            </div>
                        </div>
                        <p class="text-xs leading-relaxed text-[var(--text-desc)] m-0">
                            다단 그룹 헤더 구조와 데이터 서식을 그대로 유지한 채 백그라운드 웹 워커 방식으로 대용량
                            데이터를 스프레드시트(XLSX) 파일로 다운로드합니다.
                        </p>
                    </div>
                </div>
            </section>

            <!-- 3. 5대 인터랙티브 데모 쇼케이스 네비게이션 카드 -->
            <section class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                    <div class="flex flex-col gap-1">
                        <h3 class="text-xl font-bold tracking-tight text-[var(--text-title)] m-0">
                            실무 쇼케이스 데모 (Live Demos)
                        </h3>
                        <p class="text-xs text-[var(--text-desc)] m-0">
                            카드를 클릭하면 실제 구동 중인 해당 데모 화면으로 즉시 전환됩니다.
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div
                        v-for="card in demoCards"
                        :key="card.id"
                        class="flex flex-col justify-between p-5 rounded-xl border bg-[var(--card-bg)] border-[var(--card-border)] transition-all duration-200 cursor-pointer group hover:border-blue-500 hover:shadow-lg"
                        @click="navigateTo(card.id)"
                    >
                        <div class="flex flex-col gap-3">
                            <div class="flex items-center justify-between">
                                <span
                                    class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-sky-400 border border-blue-500/20"
                                >
                                    {{ card.badge }}
                                </span>
                                <span
                                    v-if="card.ready"
                                    class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
                                >
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 체험 가능
                                </span>
                                <span
                                    v-else
                                    class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400"
                                >
                                    준비중
                                </span>
                            </div>

                            <div class="flex flex-col gap-1.5">
                                <h4
                                    class="text-base font-bold text-[var(--text-title)] group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors m-0"
                                >
                                    {{ card.title }}
                                </h4>
                                <p class="text-xs leading-relaxed text-[var(--text-desc)] m-0">
                                    {{ card.description }}
                                </p>
                            </div>

                            <!-- 주요 특징 태그 -->
                            <div class="flex flex-wrap gap-1.5 pt-1">
                                <span
                                    v-for="tag in card.tags"
                                    :key="tag"
                                    class="text-[10px] px-2 py-0.5 rounded bg-[var(--nav-index-bg)] text-[var(--text-desc)] border border-[var(--card-border)]"
                                >
                                    {{ tag }}
                                </span>
                            </div>
                        </div>

                        <div
                            class="flex items-center justify-end gap-1 pt-4 text-xs font-bold text-blue-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform"
                        >
                            <span>데모 바로보기</span>
                            <span>→</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 4. 상세 기능 매트릭스 테이블 -->
            <section class="flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <h3 class="text-xl font-bold tracking-tight text-[var(--text-title)] m-0">
                        그리드 상세 기능 명세 (Feature Matrix)
                    </h3>
                    <p class="text-xs text-[var(--text-desc)] m-0">
                        타키온 그리드가 기본 제공하는 영역별 핵심 기능 스펙입니다.
                    </p>
                </div>

                <div class="rounded-xl border overflow-hidden bg-[var(--card-bg)] border-[var(--card-border)]">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr class="bg-[var(--nav-bg)] border-b border-[var(--card-border)]">
                                <th class="p-3.5 font-bold text-[var(--text-title)] w-36">영역 구분</th>
                                <th class="p-3.5 font-bold text-[var(--text-title)] w-60">핵심 기능</th>
                                <th class="p-3.5 font-bold text-[var(--text-title)]">기능 설명 및 실무 활용</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-[var(--card-border)] text-[var(--app-text)]">
                            <tr>
                                <td class="p-3.5 font-bold text-blue-600 dark:text-sky-400">컬럼(열) 제어</td>
                                <td class="p-3.5 font-semibold">다단 헤더 & 좌우 틀고정</td>
                                <td class="p-3.5 text-[var(--text-desc)] leading-relaxed">
                                    2단 이상의 계층 헤더 그룹화, 좌측 주요 식별자 열 및 우측 상태 관리 열 동시 고정,
                                    콘텐츠 자동 너비(Auto-fit) 및 열 순서 변경
                                </td>
                            </tr>
                            <tr>
                                <td class="p-3.5 font-bold text-blue-600 dark:text-sky-400">행 & 가상화</td>
                                <td class="p-3.5 font-semibold">50만 건 가상 렌더링 & 상하 고정</td>
                                <td class="p-3.5 text-[var(--text-desc)] leading-relaxed">
                                    브라우저 뷰포트 기반 60fps 무지연 스크롤, 상단 긴급 관리 품의 고정, 하단 전사 총
                                    결산 합계 요약행 고정
                                </td>
                            </tr>
                            <tr>
                                <td class="p-3.5 font-bold text-blue-600 dark:text-sky-400">셀 편집 & 조작</td>
                                <td class="p-3.5 font-semibold">인라인 에디터 & 엑셀 연동</td>
                                <td class="p-3.5 text-[var(--text-desc)] leading-relaxed">
                                    더블클릭/F2 인라인 수정, 드롭다운 자동 오픈, 콤마 안전 파싱, 연관 수식 실시간 계산,
                                    클립보드(Ctrl+C/V) 및 XLSX 다운로드
                                </td>
                            </tr>
                            <tr>
                                <td class="p-3.5 font-bold text-blue-600 dark:text-sky-400">시각화 렌더러</td>
                                <td class="p-3.5 font-semibold">스파크라인 차트 & 히트맵</td>
                                <td class="p-3.5 text-[var(--text-desc)] leading-relaxed">
                                    셀 내부 캔버스 12개월 추세선, 목표 달성률 진행 바, 위험도 단계별 히트맵 틴트, 업무
                                    상태 배지 렌더러
                                </td>
                            </tr>
                            <tr>
                                <td class="p-3.5 font-bold text-blue-600 dark:text-sky-400">정렬 & 계층 트리</td>
                                <td class="p-3.5 font-semibold">다중 정렬 & BOM 계층 구조</td>
                                <td class="p-3.5 text-[var(--text-desc)] leading-relaxed">
                                    다중 열 순차 정렬, 부모-자식 노드 간 접기/펼치기(Expand/Collapse), 계층별 자동
                                    인덴트 및 요약 집계
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
interface DemoCard {
    id: string;
    badge: string;
    title: string;
    description: string;
    tags: string[];
    ready: boolean;
}

const emit = defineEmits<{
    (e: 'select-menu', menuId: string): void;
}>();

const demoCards: DemoCard[] = [
    {
        id: 'basic',
        badge: '데모 01',
        title: '기본 그리드 (4방향 틀고정)',
        description:
            '2단 다단 헤더와 상단 긴급행(2행), 하단 합계행(1행), 좌측 2열, 우측 1열의 4방향 동시 틀고정 및 3종 테마 전환을 시연합니다.',
        tags: ['다단 헤더', '4방향 틀고정', '제브라 스트라이프', '엑셀 내보내기'],
        ready: true
    },
    {
        id: 'virtual',
        badge: '데모 02',
        title: '대용량 가상 스크롤 (50만 건)',
        description:
            '500,000건 빅데이터를 60fps로 매끄럽게 처리하는 캔버스 가상 렌더링 엔진과 실시간 FPS/렌더링 시간 측정 패널을 제공합니다.',
        tags: ['50만 건', '60fps', '논블로킹 비동기 청크', '빠른 점프'],
        ready: true
    },
    {
        id: 'editor',
        badge: '데모 03',
        title: '엑셀형 셀 에디터 & 수식 연동',
        description:
            '더블클릭 즉시 수정, 원클릭 드롭다운 자동 오픈, 콤마 안전 파싱, 단가 변경 시 공급가액/부가세/합계 자동 수식 계산을 시연합니다.',
        tags: ['인라인 편집', '자동 수식 계산', '클립보드 연동', '수정 데이터 추적'],
        ready: true
    },
    {
        id: 'visual',
        badge: '데모 04',
        title: '셀 시각화 (스파크라인 & 히트맵)',
        description:
            '셀 내부 12개월 추세선 스파크라인 차트, 목표 달성률 게이지 바, 성과 위험도 단계별 히트맵 틴트 렌더러를 제공합니다.',
        tags: ['스파크라인 차트', '프로그레스 바', '히트맵 렌더러', '대시보드'],
        ready: true
    },
    {
        id: 'tree',
        badge: '데모 05',
        title: '계층형 트리 그리드 (BOM / 조직도)',
        description:
            '부모-자식 다단계 계층 트리 구조, 노드 단계별 접기/펼치기 및 계층 데이터 내에서도 동일한 틀고정과 정렬 기능을 제공합니다.',
        tags: ['계층형 트리', 'BOM / 조직도', '노드 접기/펼치기', '자동 인덴트'],
        ready: false
    }
];

function navigateTo(menuId: string): void {
    emit('select-menu', menuId);
}
</script>
