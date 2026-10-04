<template>
    <DemoContainer
        title="인셀 시각화 및 모니터링 (In-Cell Visualization)"
        description="정형 수치 나열을 넘어 셀 내부에서 12개월 추세 스파크라인, 목표 달성률 게이지 바, 위험도 히트맵을 직접 렌더링하는 대시보드형 그리드"
    >
        <!-- 상단 4종 KPI 대시보드 슬롯 -->
        <template #stats>
            <div class="stat-pill">
                <span class="stat-label">모니터링 품목</span>
                <span class="stat-value font-mono">{{ kpiStats.count }}건</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">연간 총 목표액</span>
                <span class="stat-value font-mono">{{ kpiStats.totalTargetText }}원</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">연간 총 실적액</span>
                <span class="stat-value font-mono text-blue-600 dark:text-sky-400"
                    >{{ kpiStats.totalActualText }}원</span
                >
            </div>
            <div class="stat-pill">
                <span class="stat-label">전사 평균 달성률</span>
                <span
                    class="stat-value font-mono"
                    :class="
                        kpiStats.averageRate >= 100
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-blue-600 dark:text-sky-400'
                    "
                >
                    {{ kpiStats.averageRateText }}
                </span>
            </div>
        </template>

        <!-- 우측 액션 툴바 슬롯 -->
        <template #actions>
            <div class="flex items-center gap-2">
                <!-- 품목 분류 세그먼트 필터 버튼 -->
                <div class="toggle-group">
                    <button
                        v-for="cat in categoryOptions"
                        :key="cat"
                        class="toggle-item"
                        :class="selectedCategory === cat ? 'bg-blue-600 text-white font-bold' : ''"
                        type="button"
                        @click="selectedCategory = cat"
                    >
                        {{ cat }}
                    </button>
                </div>

                <!-- Excel 내보내기 버튼 -->
                <button
                    class="btn-demo btn-demo-outline ml-1"
                    type="button"
                    title="현재 그리드의 최신 데이터를 Excel(.xlsx) 파일로 고속 내보냅니다"
                    @click="exportToExcel"
                >
                    <svg
                        class="w-3.5 h-3.5 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    <span>Excel 다운로드</span>
                </button>
            </div>
        </template>

        <!-- 타키온 인셀 시각화 그리드 영역 -->
        <TachyonGrid
            ref="gridRef"
            :items="filteredItems"
            :row-height="46"
            sortable-columns
            :frozen-left="2"
            :theme="themeStore.currentTheme"
            class="w-full h-full"
        >
            <!-- 1. 품목코드 (110px, center, 좌측 고정 열) -->
            <TachyonColumn
                data-field="id"
                header-text="품목코드"
                :width="110"
                :styles="{textAlign: 'center'}"
                sortable
            />

            <!-- 2. 품목/솔루션명 (220px, left, 좌측 고정 열) -->
            <TachyonColumn data-field="productName" header-text="품목 / 솔루션명" :width="220" sortable />

            <!-- 3. 관할 사업장 (110px, center) -->
            <TachyonColumn
                data-field="location"
                header-text="관할 사업장"
                :width="110"
                :styles="{textAlign: 'center'}"
                sortable
            />

            <!-- 4. 분류 (120px, center) -->
            <TachyonColumn
                data-field="category"
                header-text="분류"
                :width="120"
                :styles="{textAlign: 'center'}"
                sortable
            />

            <!-- 5. 연간 목표액 (130px, right, 숫자 서식) -->
            <TachyonNumberColumn
                data-field="target"
                header-text="연간 목표액"
                :width="130"
                pattern="0,0"
                :styles="{textAlign: 'right'}"
                sortable
            />

            <!-- 6. 연간 실적액 및 차액 갭 (140px, right, 조건부 틴트 렌더러) -->
            <TachyonColumn
                data-field="actual"
                header-text="연간 실적액 (Gap)"
                :width="140"
                :item-renderer="ActualComparisonRenderer"
                sortable
            />

            <!-- 7. 전년비 성장률 YoY (110px, right, 증감 화살표 렌더러) -->
            <TachyonColumn
                data-field="yoyGrowth"
                header-text="전년비 YoY"
                :width="110"
                :item-renderer="YoYGrowthRenderer"
                sortable
            />

            <!-- 8. 목표 달성률 (160px, center, 프로그레스바 렌더러) -->
            <TachyonColumn
                data-field="achievementRate"
                header-text="목표 달성률 (게이지)"
                :width="160"
                :item-renderer="ProgressBarRenderer"
                sortable
            />

            <!-- 9. 12개월 매출 추세 (220px, center, 스파크라인 미니 차트 렌더러) -->
            <TachyonColumn
                data-field="monthlySales"
                header-text="12개월 매출 추세 (스파크라인)"
                :width="220"
                :item-renderer="SparklineRenderer"
            />

            <!-- 10. 추세 지표 (100px, center, 방향성 배지 렌더러) -->
            <TachyonColumn
                data-field="trendType"
                header-text="추세 지표"
                :width="100"
                :item-renderer="StatusBadgeRenderer"
                sortable
            />

            <!-- 11. 평가 (90px, center, 상태 배지 렌더러) -->
            <TachyonColumn
                data-field="status"
                header-text="성과 평가"
                :width="90"
                :item-renderer="StatusBadgeRenderer"
                sortable
            />

            <!-- 12. 위험 지수 (120px, center, 히트맵 틴트 렌더러) -->
            <TachyonColumn
                data-field="riskScore"
                header-text="위험 지수 (히트맵)"
                :width="120"
                :item-renderer="HeatmapCellRenderer"
                sortable
            />

            <!-- 13. 최종 점검일 (115px, center) -->
            <TachyonColumn
                data-field="lastAuditDate"
                header-text="최종 점검일"
                :width="115"
                :styles="{textAlign: 'center'}"
                sortable
            />
        </TachyonGrid>
    </DemoContainer>
</template>

<script setup lang="ts">
import {computed, ref, shallowRef, useTemplateRef} from 'vue';
import {TachyonGrid, TachyonColumn} from 'tachyon.vue';
import {mockSeriesData, numToStr, type VisualizationItem} from '@tachyon-showcase/shared';
import TachyonNumberColumn from '@/config/tachyon/columns/TachyonNumberColumn';
import ProgressBarRenderer from '@/components/renderers/ProgressBarRenderer.vue';
import SparklineRenderer from '@/components/renderers/SparklineRenderer.vue';
import HeatmapCellRenderer from '@/components/renderers/HeatmapCellRenderer.vue';
import StatusBadgeRenderer from '@/components/renderers/StatusBadgeRenderer.vue';
import YoYGrowthRenderer from '@/components/renderers/YoYGrowthRenderer.vue';
import ActualComparisonRenderer from '@/components/renderers/ActualComparisonRenderer.vue';
import ExportXlsx from '@/config/tachyon/addons/xlsx/export';
import DemoContainer from '@/components/common/DemoContainer.vue';
import {useThemeStore} from '@/stores/themeStore';

const themeStore = useThemeStore();
const gridRef = useTemplateRef<any>('gridRef');

/** 원본 8대 주요 품목 시각화 데이터셋 */
const items = shallowRef<VisualizationItem[]>(mockSeriesData);

const categoryOptions = ['전체', '인프라', '소프트웨어', '하드웨어', '센서/네트워크', '보안솔루션'];
const selectedCategory = ref<string>('전체');

/** 선택된 카테고리에 따른 필터링 데이터 */
const filteredItems = computed<VisualizationItem[]>(() => {
    if (selectedCategory.value === '전체') {
        return items.value;
    }
    return items.value.filter((item) => {
        return item.category === selectedCategory.value;
    });
});

/** 상단 KPI 대시보드 요약 통계 (1회 순회로 최적화) */
const kpiStats = computed(() => {
    const list = filteredItems.value;
    let totalTarget = 0;
    let totalActual = 0;

    for (let i = 0; i < list.length; i++) {
        totalTarget += list[i].target || 0;
        totalActual += list[i].actual || 0;
    }

    let averageRate = 0;
    if (totalTarget > 0) {
        averageRate = Math.round((totalActual / totalTarget) * 100);
    }

    return {
        count: list.length,
        totalTargetText: numToStr(totalTarget, '0,0'),
        totalActualText: numToStr(totalActual, '0,0'),
        averageRate,
        averageRateText: `${averageRate}%`
    };
});

/**
 * 그리드 데이터를 엑셀(XLSX) 파일로 고속 내보냅니다.
 */
async function exportToExcel(): Promise<void> {
    const exportAddon = gridRef.value?.getAddon('export');
    if (exportAddon) {
        await exportAddon.export('품목별_시각화모니터링.xlsx');
    }
}
</script>
