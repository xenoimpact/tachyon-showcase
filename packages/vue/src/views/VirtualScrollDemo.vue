<template>
    <DemoContainer
        title="대용량 가상 스크롤 (Virtual Scrolling)"
        description="50만 건 대용량 빅데이터도 지연 없이 60fps로 매끄럽게 처리하는 캔버스 가상 렌더링 엔진"
    >
        <!-- 5대 성능 KPI 슬롯 (Tailwind + CSS 하이브리드) -->
        <template #stats>
            <div class="stat-pill">
                <span class="stat-label">데이터 건수</span>
                <span class="stat-value text-blue-600 dark:text-sky-400 font-mono"
                    >{{ selectedCount.toLocaleString() }}건</span
                >
            </div>
            <div class="stat-pill">
                <span class="stat-label">화면 가상 셀</span>
                <span class="stat-value font-mono">약 {{ visibleCellCount }}개</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">데이터 생성</span>
                <span class="stat-value font-mono">{{ genDuration }}ms</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">첫 렌더링</span>
                <span class="stat-value font-mono text-purple-600 dark:text-purple-400">{{ renderDuration }}ms</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">실시간 FPS</span>
                <span
                    class="stat-value font-mono"
                    :class="fps >= 55 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'"
                >
                    {{ fps }} FPS
                </span>
            </div>
        </template>

        <!-- 우측 액션 도구 슬롯 -->
        <template #actions>
            <div class="flex items-center gap-2">
                <!-- 건수 전환 세그먼트 버튼 -->
                <div class="toggle-group">
                    <button
                        v-for="opt in countOptions"
                        :key="opt.value"
                        class="toggle-item"
                        :class="selectedCount === opt.value ? 'bg-blue-600 text-white font-bold' : ''"
                        :disabled="isLoading"
                        type="button"
                        @click="changeDataset(opt.value)"
                    >
                        {{ opt.label }}
                    </button>
                </div>

                <!-- 빠른 스크롤 점프 액션 버튼 -->
                <button
                    class="btn-demo btn-demo-outline"
                    type="button"
                    title="맨 위로 스크롤 이동"
                    :disabled="isLoading"
                    @click="scrollToTop"
                >
                    <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 15l-6-6-6 6M18 9l-6-6-6 6" />
                    </svg>
                    <span>맨 위로</span>
                </button>
                <button
                    class="btn-demo btn-demo-outline"
                    type="button"
                    title="맨 아래로 스크롤 이동"
                    :disabled="isLoading"
                    @click="scrollToBottom"
                >
                    <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 9l6 6 6-6M6 15l6 6 6-6" />
                    </svg>
                    <span>맨 아래로</span>
                </button>
            </div>
        </template>

        <!-- 메인 그리드 및 로딩 오버레이 영역 -->
        <div class="relative w-full h-full overflow-hidden">
            <TachyonGrid
                ref="gridRef"
                :items="items"
                :frozen-left="1"
                :theme="themeStore.currentTheme"
                class="w-full h-full"
            >
                <!-- 좌측 순번(행 번호) 고정 컬럼 -->
                <TachyonNumberColumn
                    data-field="no"
                    header-text="No."
                    :width="70"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="id"
                    header-text="주문번호"
                    :width="140"
                    :styles="{textAlign: 'center'}"
                    sortable
                />
                <TachyonColumn data-field="customer" header-text="고객사명" :width="160" sortable />
                <TachyonColumn data-field="department" header-text="담당부서" :width="160" sortable />
                <TachyonColumn data-field="projectName" header-text="프로젝트/품목명" :width="280" sortable />
                <TachyonColumn
                    data-field="category"
                    header-text="품목구분"
                    :width="120"
                    :styles="{textAlign: 'center'}"
                    sortable
                />
                <TachyonNumberColumn
                    data-field="quantity"
                    header-text="수량"
                    :width="90"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonNumberColumn
                    data-field="unitPrice"
                    header-text="단가"
                    :width="120"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonNumberColumn
                    data-field="supplyAmount"
                    header-text="공급가액"
                    :width="140"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonNumberColumn
                    data-field="vat"
                    header-text="부가세(10%)"
                    :width="120"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonNumberColumn
                    data-field="totalAmount"
                    header-text="합계금액"
                    :width="150"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonDateColumn
                    data-field="orderDate"
                    header-text="주문일자"
                    :width="110"
                    pattern="YYYY-MM-DD"
                    :styles="{textAlign: 'center'}"
                    sortable
                />
                <TachyonColumn
                    data-field="status"
                    header-text="진행상태"
                    :width="120"
                    :item-renderer="StatusBadgeRenderer"
                    sortable
                />
            </TachyonGrid>

            <!-- 로딩 인디케이터 오버레이 (10,000건 단위 비동기 청크 진행률 게이지) -->
            <div
                v-if="isLoading"
                class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 transition-opacity duration-200"
            >
                <div
                    class="flex flex-col items-center gap-3.5 px-7 py-5 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 min-w-[280px]"
                >
                    <div class="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <div class="flex flex-col items-center gap-2 w-full">
                        <span class="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {{ selectedCount.toLocaleString() }}건 비동기 생성 중 ({{ progressPercent }}%)
                        </span>
                        <!-- 미니 프로그레스 게이지 바 -->
                        <div class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                            <div
                                class="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-400 rounded-full transition-all duration-150 ease-out"
                                :style="{width: `${Math.max(2, progressPercent)}%`}"
                            />
                        </div>
                        <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            10,000건/청크 논블로킹 엔진
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </DemoContainer>
</template>

<script setup lang="ts">
import {nextTick, onMounted, onUnmounted, ref, shallowRef, useTemplateRef} from 'vue';
import {TachyonGrid, TachyonColumn} from 'tachyon.vue';
import {generateLargeDatasetAsync, type OrderItem} from '@tachyon-showcase/shared';
import TachyonNumberColumn from '@/config/tachyon/columns/TachyonNumberColumn';
import TachyonDateColumn from '@/config/tachyon/columns/TachyonDateColumn';
import StatusBadgeRenderer from '@/components/renderers/StatusBadgeRenderer.vue';
import DemoContainer from '@/components/common/DemoContainer.vue';
import {useThemeStore} from '@/stores/themeStore';

const themeStore = useThemeStore();
const gridRef = useTemplateRef<any>('gridRef');

/** 청크 단위 생성 배치 크기 */
const CHUNK_SIZE = 10_000;
/** 초기 권장 벤치마크 데이터 건수 */
const INITIAL_COUNT = 100_000;

interface CountOption {
    label: string;
    value: number;
}

const countOptions: CountOption[] = [
    {label: '1만 건', value: 10_000},
    {label: '10만 건', value: 100_000},
    {label: '50만 건', value: 500_000}
];

const selectedCount = ref<number>(INITIAL_COUNT);
const isLoading = ref<boolean>(false);
const progressPercent = ref<number>(0);
const genDuration = ref<number>(0);
const renderDuration = ref<number>(0);
const visibleCellCount = ref<number>(260); // 13열 x 약 20행
const fps = ref<number>(60);

const items = shallowRef<OrderItem[]>([]);

let animFrameId: number | null = null;
let lastTime = performance.now();
let frameCount = 0;
let isUnmounted = false;

/**
 * 실시간 FPS 측정 루프를 실행합니다.
 */
function measureFps(currentTime: number): void {
    if (isUnmounted) {
        return;
    }
    frameCount++;
    const delta = currentTime - lastTime;
    if (delta >= 500) {
        fps.value = Math.min(60, Math.round((frameCount * 1000) / delta));
        frameCount = 0;
        lastTime = currentTime;
    }
    animFrameId = requestAnimationFrame(measureFps);
}

/**
 * 10,000건 단위 청크 비동기로 대용량 데이터를 생성하고 그리드에 바인딩합니다.
 * @param count 로드할 데이터 레코드 건수
 */
async function loadData(count: number): Promise<void> {
    isLoading.value = true;
    progressPercent.value = 0;
    selectedCount.value = count;

    const genStart = performance.now();
    const newItems = await generateLargeDatasetAsync(count, CHUNK_SIZE, (pct) => {
        if (!isUnmounted) {
            progressPercent.value = pct;
        }
    });

    if (isUnmounted) {
        return;
    }

    const genEnd = performance.now();
    genDuration.value = Math.round(genEnd - genStart);
    progressPercent.value = 100;

    // 100% 완료 상태를 사용자가 시각적으로 인지할 수 있도록 짧게 대기
    await new Promise<void>((resolve) => {
        setTimeout(resolve, 120);
    });

    if (isUnmounted) {
        return;
    }

    const renderStart = performance.now();
    items.value = newItems;

    await nextTick();
    const renderEnd = performance.now();
    renderDuration.value = Math.max(1, Math.round(renderEnd - renderStart));

    isLoading.value = false;
}

/**
 * 데이터 건수를 변경합니다.
 * @param count 변경할 건수
 */
function changeDataset(count: number): void {
    if (selectedCount.value === count && items.value.length > 0) {
        return;
    }
    void loadData(count);
}

/**
 * 그리드 맨 위(첫 번째 행)로 즉시 스크롤합니다.
 */
function scrollToTop(): void {
    const grid = gridRef.value?.nativeInstance || gridRef.value;
    if (grid && typeof grid.scrollToCell === 'function') {
        grid.scrollToCell(0, 0, false);
    }
}

/**
 * 그리드 맨 아래(마지막 행)로 즉시 스크롤합니다.
 */
function scrollToBottom(): void {
    const grid = gridRef.value?.nativeInstance || gridRef.value;
    if (grid && typeof grid.scrollToCell === 'function') {
        const lastRowIndex = Math.max(0, items.value.length - 1);
        grid.scrollToCell(lastRowIndex, 0, false);
    }
}

onMounted(() => {
    animFrameId = requestAnimationFrame(measureFps);
    void loadData(INITIAL_COUNT);
});

onUnmounted(() => {
    isUnmounted = true;
    if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
});
</script>
