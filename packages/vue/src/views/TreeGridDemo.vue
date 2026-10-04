<template>
    <DemoContainer
        title="계층형 트리 그리드 (Tree Grid)"
        description="조직 체계(본부 > 부서 > 단위 프로젝트) 및 다단계 예산/실적 구조를 시각화하는 계층형 트리 그리드"
    >
        <!-- 상단 4종 KPI 대시보드 슬롯 -->
        <template #stats>
            <div class="stat-pill">
                <span class="stat-label">관리 조직/과제</span>
                <span class="stat-value font-mono">{{ kpiStats.totalNodes }}개</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">총 배정 예산</span>
                <span class="stat-value font-mono">{{ kpiStats.totalBudgetText }}원</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">총 집행 실적</span>
                <span class="stat-value font-mono text-blue-600 dark:text-sky-400"
                    >{{ kpiStats.totalSpentText }}원</span
                >
            </div>
            <div class="stat-pill">
                <span class="stat-label">전사 평균 집행률</span>
                <span
                    class="stat-value font-mono"
                    :class="
                        kpiStats.averageRate >= 90
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                    "
                >
                    {{ kpiStats.averageRateText }}
                </span>
            </div>
        </template>

        <!-- 우측 액션 툴바 슬롯 -->
        <template #actions>
            <div class="flex items-center gap-2">
                <!-- 전체 펼치기 / 접기 버튼 그룹 -->
                <div class="inline-flex rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-0.5">
                    <button
                        class="btn-demo btn-demo-outline border-none shadow-none text-xs px-2.5 py-1"
                        type="button"
                        title="모든 계층 노드를 펼칩니다"
                        @click="expandAllNodes"
                    >
                        <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fill-rule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <span>전체 펼치기</span>
                    </button>
                    <button
                        class="btn-demo btn-demo-outline border-none shadow-none text-xs px-2.5 py-1"
                        type="button"
                        title="최상위 본부 노드만 남기고 접습니다"
                        @click="collapseAllNodes"
                    >
                        <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fill-rule="evenodd"
                                d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <span>전체 접기</span>
                    </button>
                </div>

                <!-- 트리 스타일 모드 전환 (Box Mode ↔ Simple Mode) 토글 버튼 -->
                <button
                    class="btn-demo"
                    :class="isBoxMode ? 'bg-sky-600 text-white hover:bg-sky-700' : 'btn-demo-outline'"
                    type="button"
                    :title="
                        isBoxMode ? '일반 들여쓰기 모드로 전환합니다' : '역 ㄱ자 계층 구조선(Box Mode)으로 전환합니다'
                    "
                    @click="toggleBoxMode"
                >
                    <span class="font-mono text-sm leading-none">{{ isBoxMode ? '┌' : '↳' }}</span>
                    <span>{{ isBoxMode ? 'Box 라인 모드' : '심플 인덴트 모드' }}</span>
                </button>

                <!-- Excel 내보내기 버튼 -->
                <button
                    class="btn-demo btn-demo-outline"
                    type="button"
                    title="현재 트리 데이터를 Excel(.xlsx) 파일로 내보냅니다"
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

        <!-- 타키온 트리 그리드 영역 (모드 전환 시 크로스 셀 완전 재생성을 위해 동적 key 바인딩) -->
        <TachyonTreeGrid
            :key="isBoxMode ? 'tree-box-grid' : 'tree-indent-grid'"
            ref="gridRef"
            :items="treeItems"
            :row-height="35"
            :auto-expand-level="2"
            :frozen-top="1"
            :theme="themeStore.currentTheme"
            :styles="gridStyles"
            class="w-full h-full"
        >
            <!-- 1그룹: 조직 및 과제 식별 (다단 헤더 - 기본 배경) -->
            <TachyonColumn header-text="조직 및 과제 식별">
                <!-- 박스 모드: item-renderer 배제하여 타키온 내장 역 'ㄱ'자 크로스 셀 전용 템플릿 사용 -->
                <TachyonTreeColumn
                    v-if="isBoxMode"
                    data-field="name"
                    header-text="조직 / 단위 프로젝트명"
                    :width="320"
                    box-mode
                    collapse
                    :indent="35"
                />
                <!-- 심플 인덴트 모드: 아이콘 기반 커스텀 트리 렌더러 적용 -->
                <TachyonTreeColumn
                    v-else
                    data-field="name"
                    header-text="조직 / 단위 프로젝트명"
                    :width="320"
                    :item-renderer="TreeItemRenderer"
                    collapse
                    :indent="35"
                />
                <TachyonColumn data-field="code" header-text="코드" :width="110" :styles="{textAlign: 'center'}" />
                <TachyonColumn data-field="category" header-text="구분" :width="110" :styles="{textAlign: 'center'}" />
            </TachyonColumn>

            <!-- 2그룹: 관리 책임 (다단 헤더 - 은은한 슬레이트 틴트) -->
            <TachyonColumn header-text="관리 책임">
                <TachyonColumn
                    data-field="manager"
                    header-text="담당자/책임자"
                    :width="130"
                    :styles="managementColumnStyle"
                />
            </TachyonColumn>

            <!-- 3그룹: 예산 및 집행 현황 (다단 헤더 - 세련된 스카이블루 틴트) -->
            <TachyonColumn header-text="예산 및 집행 현황">
                <TachyonNumberColumn
                    data-field="budget"
                    header-text="배정 예산"
                    :width="140"
                    pattern="0,0"
                    :styles="financeRightStyle"
                />
                <TachyonNumberColumn
                    data-field="spent"
                    header-text="집행 실적"
                    :width="140"
                    pattern="0,0"
                    :styles="financeRightStyle"
                />
                <TachyonColumn
                    data-field="achievementRate"
                    header-text="집행률(%)"
                    :width="110"
                    :label-function="formatRate"
                    :styles="financeRightStyle"
                />
            </TachyonColumn>

            <!-- 4그룹: 상태 관리 (다단 헤더 - 은은한 에메랄드 틴트) -->
            <TachyonColumn header-text="상태 관리">
                <TachyonColumn
                    data-field="status"
                    header-text="진행상태"
                    :width="100"
                    :item-renderer="StatusBadgeRenderer"
                    :styles="statusColumnStyle"
                />
            </TachyonColumn>
        </TachyonTreeGrid>
    </DemoContainer>
</template>

<script setup lang="ts">
import {computed, ref, shallowRef, useTemplateRef} from 'vue';
import {TachyonTreeGrid, TachyonTreeColumn, TachyonColumn, type GridStyles} from 'tachyon.vue';
import {mockTreeData, numToStr, type TreeNode} from '@tachyon-showcase/shared';
import TachyonNumberColumn from '@/config/tachyon/columns/TachyonNumberColumn';
import TreeItemRenderer from '@/components/renderers/TreeItemRenderer.vue';
import StatusBadgeRenderer from '@/components/renderers/StatusBadgeRenderer.vue';
import ExportXlsx from '@/config/tachyon/addons/xlsx/export';
import DemoContainer from '@/components/common/DemoContainer.vue';
import {useThemeStore} from '@/stores/themeStore';

const themeStore = useThemeStore();
const gridRef = useTemplateRef<any>('gridRef');

/**
 * 1. 통계 및 요약행 단일 계산 (전체 노드 수, 총 예산, 총 실적)
 */
function calculateTreeTotals(nodes: TreeNode[]) {
    let totalNodes = 0;
    let totalBudget = 0;
    let totalSpent = 0;

    function traverse(nodeList: TreeNode[], isRoot = false): void {
        for (let i = 0; i < nodeList.length; i++) {
            const node = nodeList[i];
            if (node.id === 'ORG-TOTAL') {
                continue;
            }
            totalNodes++;
            if (isRoot) {
                totalBudget += node.budget || 0;
                totalSpent += node.spent || 0;
            }
            if (node.children && node.children.length > 0) {
                traverse(node.children, false);
            }
        }
    }

    traverse(nodes, true);

    const averageRate = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    return {
        totalNodes,
        totalBudget,
        totalSpent,
        averageRate,
        averageRateText: `${averageRate}%`,
        totalBudgetText: numToStr(totalBudget, '0,0'),
        totalSpentText: numToStr(totalSpent, '0,0')
    };
}

const initialTotals = calculateTreeTotals(mockTreeData);

/**
 * 전사 8개 사업본부 총집계 합계행을 최상단(0번 행)에 결합한 트리 데이터셋
 */
function createTreeDataWithSummary(): TreeNode[] {
    const summaryRow: TreeNode = {
        id: 'ORG-TOTAL',
        name: '[전사 총괄] 사업본부 예산 집행 총계 (상단 고정 요약행)',
        code: 'TOTAL-SUM',
        category: '전사합계',
        manager: '경영총괄본부',
        budget: initialTotals.totalBudget,
        spent: initialTotals.totalSpent,
        achievementRate: initialTotals.averageRate,
        status: '정상'
    };

    return [summaryRow, ...mockTreeData];
}

/** 원본 계층형 트리 데이터셋 (최상단 합계행 포함) */
const treeItems = shallowRef<TreeNode[]>(createTreeDataWithSummary());

/** 상단 4종 KPI 통계 */
const kpiStats = computed(() => calculateTreeTotals(treeItems.value));

/** Box Mode (역 'ㄱ'자 계층 연결선) 활성화 상태 (기본값: 심플 인덴트 모드) */
const isBoxMode = ref<boolean>(false);

function toggleBoxMode(): void {
    isBoxMode.value = !isBoxMode.value;
}

/**
 * 2. 그리드 인스턴스 헬퍼
 */
function getGridInstance() {
    return gridRef.value?.gridInstance || gridRef.value?.nativeInstance || gridRef.value;
}

function expandAllNodes(): void {
    getGridInstance()?.expandAll?.();
}

function collapseAllNodes(): void {
    getGridInstance()?.collapseAll?.();
}

async function exportToExcel(): Promise<void> {
    const exportAddon = gridRef.value?.getAddon('export');
    if (exportAddon) {
        await exportAddon.export('조직_프로젝트_예산실적.xlsx');
    }
}

/**
 * 3. 테마 기반 컬럼 영역별 스타일
 */
const gridStyles = computed<GridStyles>(() => {
    const isDark = themeStore.currentTheme === 'dark';
    const isSteel = themeStore.currentTheme === 'steel-blue';
    const summaryColor = isDark
        ? 'rgba(37, 99, 235, 0.3)'
        : isSteel
          ? 'rgba(2, 132, 199, 0.4)'
          : 'rgba(224, 231, 255, 0.85)';

    return {
        rowColors: (rowIndex: number) => {
            if (rowIndex === 0) {
                return summaryColor;
            }
            return isDark ? 'transparent' : '#ffffff';
        }
    };
});

function getThemeColumnBg(type: 'management' | 'finance' | 'status'): string {
    const isDark = themeStore.currentTheme === 'dark';
    const isSteel = themeStore.currentTheme === 'steel-blue';

    switch (type) {
        case 'management':
            return isDark ? 'rgba(30, 41, 59, 0.4)' : isSteel ? 'rgba(12, 74, 110, 0.35)' : 'rgba(241, 245, 249, 0.65)';
        case 'finance':
            return isDark
                ? 'rgba(30, 58, 138, 0.22)'
                : isSteel
                  ? 'rgba(3, 105, 161, 0.25)'
                  : 'rgba(239, 246, 255, 0.75)';
        case 'status':
            return isDark ? 'rgba(6, 78, 59, 0.22)' : isSteel ? 'rgba(4, 120, 87, 0.25)' : 'rgba(236, 253, 245, 0.65)';
    }
}

const managementColumnStyle = computed<GridStyles>(() => ({
    textAlign: 'center',
    backgroundColor: getThemeColumnBg('management')
}));

const financeRightStyle = computed<GridStyles>(() => ({
    textAlign: 'right',
    backgroundColor: getThemeColumnBg('finance')
}));

const statusColumnStyle = computed<GridStyles>(() => ({
    textAlign: 'center',
    backgroundColor: getThemeColumnBg('status')
}));

/** 집행률(%) 라벨 포맷터 */
function formatRate(item: any): string {
    const rate = Number(item?.achievementRate);
    if (!isNaN(rate)) {
        return `${rate.toFixed(1)}%`;
    }
    return '0.0%';
}
</script>

<style scoped>
/* ==========================================================================
   타키온 공식 CSS (.tachyon-tree__item 오타) 보정: 수직 중앙 정렬 스타일
   ========================================================================== */
:deep(.tachyon-tree-item) {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-left: 8px;
    padding-right: 6px;
}

:deep(.tachyon-tree-item .item-label) {
    line-height: normal;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
