<template>
    <DemoContainer
        badge="화면 1"
        :tags="['2단 다단 헤더', '좌측 열 고정', '상태 배지', '천단위 콤마']"
        title="기본 그리드 (다단 헤더 & 열 고정)"
        description="복잡한 비즈니스 품의 및 주문 데이터를 직관적으로 구조화한 2단 다단 헤더와 좌측 열 고정(Frozen Columns), 그리고 통화/수량 콤마 포맷터와 상태 배지 렌더러를 시연합니다."
    >
        <!-- 데이터 요약 통계 슬롯 -->
        <template #stats>
            <div
                class="flex flex-col items-end px-3.5 py-1.5 rounded-lg border transition-all duration-200 bg-[var(--stat-bg)] border-[var(--stat-border)] text-[var(--stat-value)]"
            >
                <span class="text-[11px] font-semibold text-[var(--stat-label)]">데이터 건수</span>
                <span class="text-sm font-bold">{{ items.length }}건</span>
            </div>
            <div
                class="flex flex-col items-end px-3.5 py-1.5 rounded-lg border transition-all duration-200 bg-[var(--stat-bg)] border-[var(--stat-border)] text-[var(--stat-value)]"
            >
                <span class="text-[11px] font-semibold text-[var(--stat-label)]">총 합계금액</span>
                <span class="text-sm font-bold font-mono">{{ totalOrderAmountText }}원</span>
            </div>
        </template>

        <!-- 액션 버튼 툴바 슬롯 -->
        <template #actions>
            <div class="flex items-center gap-2">
                <button
                    class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all duration-150 cursor-pointer bg-[var(--btn-outline-bg)] border-[var(--btn-outline-border)] text-[var(--btn-outline-text)] hover:bg-[var(--btn-outline-hover-bg)] hover:border-[var(--btn-outline-hover-border)]"
                    type="button"
                    @click="toggleFrozen"
                >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
                    </svg>
                    열 고정: {{ frozenColumnsCount > 0 ? '2개 열 고정중' : '해제됨' }}
                </button>
                <button
                    class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-150 cursor-pointer border-none shadow-xs"
                    type="button"
                    @click="exportToExcel"
                >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Excel 다운로드
                </button>
            </div>
        </template>

        <!-- 타키온 기본 그리드 영역 -->
        <TachyonGrid
            ref="gridRef"
            :items="items"
            :frozen-left="frozenColumnsCount"
            :theme="themeStore.currentTheme"
            class="w-full h-full"
        >
            <!-- 좌측 열 고정 대상 (주문번호, 고객사명) -->
            <TachyonColumn
                data-field="id"
                header-text="주문번호"
                :width="130"
                :styles="{textAlign: 'center'}"
                sortable
            />
            <TachyonColumn data-field="customer" header-text="고객사명" :width="140" sortable />

            <!-- 2단 다단 헤더: 프로젝트 정보 -->
            <TachyonColumn header-text="프로젝트 정보">
                <TachyonColumn data-field="projectName" header-text="프로젝트/품목명" :width="220" sortable />
                <TachyonColumn
                    data-field="category"
                    header-text="분류"
                    :width="120"
                    :styles="{textAlign: 'center'}"
                    sortable
                />
                <TachyonColumn data-field="department" header-text="담당부서" :width="140" sortable />
            </TachyonColumn>

            <!-- 2단 다단 헤더: 금액 및 수량 (VAT 포함) + 숫자 콤마 표시 -->
            <TachyonColumn header-text="금액 및 수량 (VAT 포함)">
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
                    :width="130"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonNumberColumn
                    data-field="vat"
                    header-text="부가세(10%)"
                    :width="110"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonNumberColumn
                    data-field="totalAmount"
                    header-text="합계금액"
                    :width="140"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
            </TachyonColumn>

            <!-- 상태 배지 커스텀 렌더러 -->
            <TachyonColumn
                data-field="status"
                header-text="진행상태"
                :width="110"
                :item-renderer="StatusBadgeRenderer"
                sortable
            />
            <TachyonColumn
                data-field="priority"
                header-text="우선순위"
                :width="90"
                :styles="{textAlign: 'center'}"
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
            <TachyonDateColumn
                data-field="deliveryDate"
                header-text="납기일자"
                :width="120"
                pattern="YYYY-MM-DD"
                :styles="{textAlign: 'center'}"
                sortable
            />
        </TachyonGrid>
    </DemoContainer>
</template>

<script setup lang="ts">
import {computed, ref, shallowRef, useTemplateRef} from 'vue';
import {TachyonGrid, TachyonColumn} from 'tachyon.vue';
import {mockOrders, numToStr} from '@tachyon-showcase/shared';
import TachyonNumberColumn from '@/config/tachyon/columns/TachyonNumberColumn';
import TachyonDateColumn from '@/config/tachyon/columns/TachyonDateColumn';
import StatusBadgeRenderer from '@/components/renderers/StatusBadgeRenderer.vue';
import ExportXlsx from '@/config/tachyon/addons/xlsx/export';
import DemoContainer from '@/components/common/DemoContainer.vue';
import {useThemeStore} from '@/stores/themeStore';

const themeStore = useThemeStore();

const gridRef = useTemplateRef<any>('gridRef');

const items = shallowRef(mockOrders);

const frozenColumnsCount = ref<number>(2);

const totalOrderAmountText = computed<string>(() => {
    const total = items.value.reduce((acc, cur) => {
        return acc + (cur.totalAmount || 0);
    }, 0);
    return numToStr(total, '0,0');
});

/**
 * 좌측 열 고정 개수를 토글합니다. (2개 열 고정 ↔ 고정 해제)
 */
function toggleFrozen(): void {
    if (frozenColumnsCount.value > 0) {
        frozenColumnsCount.value = 0;
    } else {
        frozenColumnsCount.value = 2;
    }
}

/**
 * 현재 그리드 상태와 데이터를 스프레드시트(xlsx) 파일로 내보냅니다.
 */
async function exportToExcel(): Promise<void> {
    const nativeGrid = gridRef.value?.nativeInstance || gridRef.value?.grid || gridRef.value;
    if (nativeGrid) {
        await ExportXlsx.export.call({grid: nativeGrid}, '기본그리드_주문현황.xlsx');
    } else {
        console.warn('그리드 인스턴스를 찾을 수 없습니다.');
    }
}
</script>
