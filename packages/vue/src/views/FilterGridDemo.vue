<template>
    <DemoContainer
        title="헤더 필터링 (값 목록 & 문자열 조건)"
        description="컬럼 헤더의 필터 버튼으로 값을 골라내거나 문자 조건을 입력해 여러 열의 데이터를 함께 걸러냅니다."
    >
        <!-- 데이터 요약 통계 슬롯 -->
        <template #stats>
            <div class="stat-pill">
                <span class="stat-label">전체 건수</span>
                <span class="stat-value">{{ totalCountText }}건</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">표시 건수</span>
                <span class="stat-value text-blue-600 dark:text-sky-400">{{ displayedCountText }}건</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">적용 필터</span>
                <span class="stat-value text-amber-600 dark:text-amber-400">{{ activeFilterCount }}개</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">표시 합계금액</span>
                <span class="stat-value font-mono">{{ displayedAmountText }}원</span>
            </div>
        </template>

        <!-- 액션 버튼 툴바 슬롯 -->
        <template #actions>
            <div class="flex items-center gap-2">
                <button
                    class="btn-demo btn-demo-outline"
                    type="button"
                    :disabled="activeFilterCount === 0"
                    @click="clearAllFilters"
                >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
                    </svg>
                    필터 초기화
                </button>

                <button
                    class="btn-demo bg-emerald-600 hover:bg-emerald-700 text-white border-none ml-1"
                    type="button"
                    @click="exportToExcel"
                >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Excel 다운로드
                </button>
            </div>
        </template>

        <!-- 타키온 그리드 영역 (값 목록 / 문자열 조건 헤더 필터) -->
        <TachyonGrid
            ref="gridRef"
            :items="items"
            :frozen-left="2"
            :frozen-right="1"
            :theme="themeStore.currentTheme"
            class="w-full h-full"
        >
            <TachyonColumn
                data-field="id"
                header-text="주문번호"
                :width="130"
                :styles="{textAlign: 'center'}"
                sortable
            />
            <TachyonTextFilterColumn data-field="customer" header-text="고객사명" :width="170" />
            <TachyonTextFilterColumn data-field="projectName" header-text="프로젝트/품목명" :width="300" />
            <TachyonSetFilterColumn data-field="category" header-text="분류" :width="140" />
            <TachyonSetFilterColumn data-field="department" header-text="담당부서" :width="170" text-align="left" />
            <TachyonSetFilterColumn data-field="priority" header-text="우선순위" :width="110" />
            <TachyonNumberColumn
                data-field="quantity"
                header-text="수량"
                :width="90"
                pattern="0,0"
                :styles="{textAlign: 'right'}"
                sortable
            />
            <TachyonNumberColumn
                data-field="totalAmount"
                header-text="합계금액"
                :width="160"
                pattern="0,0"
                :styles="{textAlign: 'right'}"
                sortable
            />
            <TachyonDateColumn
                data-field="orderDate"
                header-text="주문일자"
                :width="120"
                pattern="YYYY-MM-DD"
                :styles="{textAlign: 'center'}"
                sortable
            />
            <TachyonSetFilterColumn
                data-field="status"
                header-text="진행상태"
                :width="130"
                :item-renderer="StatusBadgeRenderer"
            />
        </TachyonGrid>
    </DemoContainer>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, shallowRef, useTemplateRef} from 'vue';
import {TachyonGrid, TachyonColumn} from 'tachyon.vue';
import {generateLargeDataset, numToStr, type OrderItem} from '@tachyon-showcase/shared';
import TachyonNumberColumn from '@/config/tachyon/columns/TachyonNumberColumn';
import TachyonDateColumn from '@/config/tachyon/columns/TachyonDateColumn';
import TachyonSetFilterColumn from '@/config/tachyon/columns/TachyonSetFilterColumn';
import TachyonTextFilterColumn from '@/config/tachyon/columns/TachyonTextFilterColumn';
import StatusBadgeRenderer from '@/components/renderers/StatusBadgeRenderer.vue';
import DemoContainer from '@/components/common/DemoContainer.vue';
import {useThemeStore} from '@/stores/themeStore';

const TOTAL_ORDER_COUNT = 1_000;

const themeStore = useThemeStore();

const gridRef = useTemplateRef<any>('gridRef');

const items = shallowRef<OrderItem[]>(generateLargeDataset(TOTAL_ORDER_COUNT));

const displayedCount = ref(TOTAL_ORDER_COUNT);
const displayedAmount = ref(0);
const activeFilterCount = ref(0);

/** 전체 건수 텍스트 */
const totalCountText = computed<string>(() => numToStr(items.value.length, '0,0'));

/** 표시 건수 텍스트 */
const displayedCountText = computed<string>(() => numToStr(displayedCount.value, '0,0'));

/** 표시 합계금액 텍스트 */
const displayedAmountText = computed<string>(() => numToStr(displayedAmount.value, '0,0'));

let watchedGrid: any;

/**
 * 타키온 필터 상태를 읽어 표시 건수, 합계금액, 적용 필터 개수를 다시 계산합니다.
 * 컬렉션의 toArray()는 필터가 적용된 결과를 반환합니다.
 */
function syncFilterSummary(): void {
    const grid = gridRef.value?.nativeInstance;
    const rows: OrderItem[] = grid?.collection?.toArray() || [];
    displayedCount.value = rows.length;
    displayedAmount.value = rows.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
    activeFilterCount.value = grid?.filterManager.filters.filter((filter: any) => filter.canCompare).length || 0;
}

/**
 * 모든 열의 필터 조건을 비우고 그리드를 다시 필터링합니다.
 */
function clearAllFilters(): void {
    const filterManager = gridRef.value?.nativeInstance?.filterManager;
    filterManager?.filters.forEach((filter: any) => {
        filter.setConditions(null);
        filter.setValues(null);
    });
    filterManager?.refresh();
}

/**
 * 현재 그리드 상태와 데이터를 스프레드시트(xlsx) 파일로 내보냅니다.
 */
async function exportToExcel(): Promise<void> {
    const exportAddon = gridRef.value?.getAddon('export');
    if (exportAddon) {
        await exportAddon.export('헤더필터링_주문현황.xlsx');
    } else {
        console.warn('export 애드온을 찾을 수 없습니다.');
    }
}

onMounted(async () => {
    await nextTick();
    watchedGrid = gridRef.value?.nativeInstance;
    watchedGrid?.addEventListener('collection-change', syncFilterSummary, false);
    syncFilterSummary();
});

onUnmounted(() => {
    watchedGrid?.removeEventListener('collection-change', syncFilterSummary, false);
});
</script>
