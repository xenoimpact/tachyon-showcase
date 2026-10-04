<template>
    <DemoContainer
        title="기본 그리드 (상·하·좌·우 4방향 고정)"
        description="스크롤 중에도 기준 정보와 합계 요약이 유지되도록 다단 헤더 및 상·하·좌·우 틀고정을 제공합니다."
    >
        <!-- 데이터 요약 통계 슬롯 (4종 KPI 대시보드 - Tailwind + CSS 하이브리드) -->
        <template #stats>
            <div class="stat-pill">
                <span class="stat-label">데이터 건수</span>
                <span class="stat-value">{{ baseOrdersCount }}건</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">검수완료</span>
                <span class="stat-value text-emerald-600 dark:text-emerald-400">{{ completedCount }}건</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">공급가액</span>
                <span class="stat-value font-mono">{{ totalSupplyAmountText }}원</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">총 합계금액</span>
                <span class="stat-value font-mono text-blue-600 dark:text-sky-400">{{ totalOrderAmountText }}원</span>
            </div>
        </template>

        <!-- 액션 버튼 툴바 슬롯 (4방향 고정 컨트롤러 - Tailwind + CSS 하이브리드) -->
        <template #actions>
            <div class="flex items-center gap-2">
                <!-- 4방향 마스터 토글 버튼 -->
                <button
                    class="btn-demo"
                    :class="
                        isAllFrozen ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'btn-demo-outline'
                    "
                    type="button"
                    title="4방향 전체 고정 프리셋 토글"
                    @click="cycleFrozenMode"
                >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
                    </svg>
                    <span>{{ frozenPresetLabel }}</span>
                </button>

                <!-- 개별 방향 미니 토글 그룹 -->
                <div class="toggle-group">
                    <button
                        class="toggle-item"
                        :class="frozenLeft > 0 ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold' : ''"
                        type="button"
                        title="좌측 2열 고정: 주문번호 & 고객사 식별자"
                        @click="toggleDirection('left')"
                    >
                        좌: 2열 (식별자)
                    </button>
                    <button
                        class="toggle-item"
                        :class="frozenRight > 0 ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold' : ''"
                        type="button"
                        title="우측 1열 고정: 진행상태 배지 상시 주시"
                        @click="toggleDirection('right')"
                    >
                        우: 1열 (상태)
                    </button>
                    <button
                        class="toggle-item"
                        :class="frozenTop > 0 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold' : ''"
                        type="button"
                        title="상단 2행 고정: 긴급 집중 관리 품의"
                        @click="toggleDirection('top')"
                    >
                        상: 2행 (긴급)
                    </button>
                    <button
                        class="toggle-item"
                        :class="frozenBottom > 0 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold' : ''"
                        type="button"
                        title="하단 1행 고정: 전사 총 합계 요약행"
                        @click="toggleDirection('bottom')"
                    >
                        하: 1행 (합계)
                    </button>
                </div>

                <!-- Excel 다운로드 버튼 -->
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

        <!-- 타키온 기본 그리드 영역 (상·하·좌·우 4방향 고정 적용) -->
        <TachyonGrid
            ref="gridRef"
            :items="items"
            :frozen-left="frozenLeft"
            :frozen-right="frozenRight"
            :frozen-top="frozenTop"
            :frozen-bottom="frozenBottom"
            :theme="themeStore.currentTheme"
            :styles="gridStyles"
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
            <TachyonColumn data-field="customer" header-text="고객사명" :width="160" sortable />

            <!-- 2단 다단 헤더: 프로젝트 정보 -->
            <TachyonColumn header-text="프로젝트 정보">
                <TachyonColumn data-field="projectName" header-text="프로젝트/품목명" :width="320" sortable />
                <TachyonColumn
                    data-field="category"
                    header-text="분류"
                    :width="120"
                    :styles="{textAlign: 'center'}"
                    sortable
                />
                <TachyonColumn data-field="department" header-text="담당부서" :width="160" sortable />
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
                    :width="130"
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
                    :width="160"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
            </TachyonColumn>

            <!-- 우선순위 & 일정 정보 -->
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

            <!-- 우측 열 고정 대상: 진행상태 (가로 스크롤에 상관없이 우측 상시 고정) -->
            <TachyonColumn
                data-field="status"
                header-text="진행상태"
                :width="120"
                :item-renderer="StatusBadgeRenderer"
                sortable
            />
        </TachyonGrid>
    </DemoContainer>
</template>

<script setup lang="ts">
import {computed, ref, shallowRef, useTemplateRef, watch} from 'vue';
import {TachyonGrid, TachyonColumn, type GridStyles} from 'tachyon.vue';
import {mockOrders, numToStr, type OrderItem} from '@tachyon-showcase/shared';
import TachyonNumberColumn from '@/config/tachyon/columns/TachyonNumberColumn';
import TachyonDateColumn from '@/config/tachyon/columns/TachyonDateColumn';
import StatusBadgeRenderer from '@/components/renderers/StatusBadgeRenderer.vue';
import ExportXlsx from '@/config/tachyon/addons/xlsx/export';
import DemoContainer from '@/components/common/DemoContainer.vue';
import {useThemeStore} from '@/stores/themeStore';

const themeStore = useThemeStore();
const gridRef = useTemplateRef<any>('gridRef');

/**
 * 테마별 고정행 및 일반행 배경색 매핑 테이블
 * - urgent: 상단 긴급 주문 고정행 (앰버/골드 틴트)
 * - summary: 하단 전사 결산 합계 고정행 (인디고/블루 틴트)
 * - stripeEven / stripeOdd: 가독성을 위한 은은한 제브라 스트라이프
 */
const ROW_THEME_COLORS = {
    light: {
        urgent: 'rgba(254, 243, 199, 0.75)',
        summary: 'rgba(224, 231, 255, 0.85)',
        stripeEven: 'rgba(248, 250, 252, 0.75)',
        stripeOdd: '#ffffff'
    },
    dark: {
        urgent: 'rgba(180, 83, 9, 0.28)',
        summary: 'rgba(37, 99, 235, 0.3)',
        stripeEven: 'rgba(30, 41, 59, 0.35)',
        stripeOdd: 'transparent'
    },
    'steel-blue': {
        urgent: 'rgba(217, 119, 6, 0.35)',
        summary: 'rgba(2, 132, 199, 0.4)',
        stripeEven: 'rgba(12, 74, 110, 0.4)',
        stripeOdd: 'transparent'
    }
} as const;

/**
 * 실무 고정(Frozen) 데모를 위해 상단 긴급 주문 2건과 하단 전사 총 결산 요약행 1건을 결합한 데이터셋을 생성합니다.
 */
function createShowcaseOrders(): OrderItem[] {
    const rawOrders: OrderItem[] = JSON.parse(JSON.stringify(mockOrders));

    if (rawOrders.length >= 2) {
        rawOrders[0] = {
            ...rawOrders[0],
            projectName: '[긴급 집중관리] 차세대 반도체 공정 모니터링 시스템',
            priority: '긴급',
            status: '진행중'
        };
        rawOrders[1] = {
            ...rawOrders[1],
            projectName: '[긴급 당일출하] 자율주행 센서 텔레메트리 파이프라인',
            priority: '긴급',
            status: '진행중'
        };
    }

    const totalQty = rawOrders.reduce((sum, item) => {
        return sum + (item.quantity || 0);
    }, 0);
    const totalSupply = rawOrders.reduce((sum, item) => {
        return sum + (item.supplyAmount || 0);
    }, 0);
    const totalVat = rawOrders.reduce((sum, item) => {
        return sum + (item.vat || 0);
    }, 0);
    const grandTotal = rawOrders.reduce((sum, item) => {
        return sum + (item.totalAmount || 0);
    }, 0);
    const totalTarget = rawOrders.reduce((sum, item) => {
        return sum + (item.targetAmount || 0);
    }, 0);

    const summaryRow: OrderItem = {
        id: '[합계]',
        customer: '전사 100건 결산',
        department: '경영기획본부',
        projectName: '전사 수주 총 결산 집계 (하단 고정 요약행)',
        category: '소프트웨어',
        quantity: totalQty,
        unitPrice: 0,
        supplyAmount: totalSupply,
        vat: totalVat,
        totalAmount: grandTotal,
        targetAmount: totalTarget,
        achievementRate: totalTarget > 0 ? Math.round((grandTotal / totalTarget) * 100) : 100,
        status: '검수완료',
        priority: '긴급',
        orderDate: '2026-03-31',
        deliveryDate: '2026-12-31',
        monthlyTrend: []
    };

    return [...rawOrders, summaryRow];
}

const items = shallowRef<OrderItem[]>(createShowcaseOrders());

const frozenLeft = ref<number>(2);
const frozenRight = ref<number>(1);
const frozenTop = ref<number>(2);
const frozenBottom = ref<number>(1);

/** 현재 적용 중인 테마 키 */
const currentThemeKey = computed<keyof typeof ROW_THEME_COLORS>(() => {
    const theme = themeStore.currentTheme;
    if (theme === 'dark' || theme === 'steel-blue') {
        return theme;
    }
    return 'light';
});

/**
 * 상단 긴급 고정행(2행) 및 하단 전사 합계 고정행(1행)을 시각적으로 강조하는 그리드 스타일
 */
const gridStyles = computed<GridStyles>(() => {
    const topCount = frozenTop.value;
    const bottomCount = frozenBottom.value;
    const totalCount = items.value.length;
    const colors = ROW_THEME_COLORS[currentThemeKey.value];

    return {
        rowColors: (rowIndex: number) => {
            // 1. 상단 긴급 주문 고정행 (앰버/골드 틴트 강조)
            if (topCount > 0 && rowIndex < topCount) {
                return colors.urgent;
            }

            // 2. 하단 전사 결산 합계 고정행 (인디고/블루 틴트 강조)
            if (bottomCount > 0 && rowIndex >= totalCount - bottomCount) {
                return colors.summary;
            }

            // 3. 일반 데이터 행 (가독성을 위한 제브라 스트라이프)
            return rowIndex % 2 === 0 ? colors.stripeEven : colors.stripeOdd;
        }
    };
});

// 테마 또는 고정 방향 상태 변경 시 그리드 배경 즉각 재렌더링
watch([() => themeStore.currentTheme, frozenTop, frozenBottom], () => {
    if (gridRef.value?.nativeInstance) {
        gridRef.value.nativeInstance.invalidate();
        gridRef.value.nativeInstance.flush();
    }
});

/**
 * 요약 행([합계])을 제외한 순수 주문 데이터 목록입니다.
 */
const baseOrders = computed<OrderItem[]>(() => {
    return items.value.filter((item) => {
        return item.id !== '[합계]';
    });
});

/** 순수 주문 데이터 건수 */
const baseOrdersCount = computed<number>(() => {
    return baseOrders.value.length;
});

/** 총 주문 합계금액 텍스트 */
const totalOrderAmountText = computed<string>(() => {
    const total = baseOrders.value.reduce((acc, cur) => {
        return acc + (cur.totalAmount || 0);
    }, 0);
    return numToStr(total, '0,0');
});

/** 총 공급가액 텍스트 */
const totalSupplyAmountText = computed<string>(() => {
    const total = baseOrders.value.reduce((acc, cur) => {
        return acc + (cur.supplyAmount || 0);
    }, 0);
    return numToStr(total, '0,0');
});

/** 검수완료 건수 */
const completedCount = computed<number>(() => {
    return baseOrders.value.filter((item) => {
        return item.status === '검수완료';
    }).length;
});

/** 4방향 전체 고정 여부 */
const isAllFrozen = computed<boolean>(() => {
    return frozenLeft.value > 0 && frozenRight.value > 0 && frozenTop.value > 0 && frozenBottom.value > 0;
});

/** 고정 프리셋 상태 안내 라벨 */
const frozenPresetLabel = computed<string>(() => {
    if (isAllFrozen.value) {
        return '4방향 고정중';
    }
    if (frozenLeft.value > 0 && frozenRight.value === 0 && frozenTop.value === 0 && frozenBottom.value === 0) {
        return '좌측 열 고정중';
    }
    if (frozenLeft.value === 0 && frozenRight.value === 0 && frozenTop.value === 0 && frozenBottom.value === 0) {
        return '고정 해제됨';
    }
    return '사용자 정의 고정';
});

/**
 * 4방향 고정 프리셋 상태를 순환 변경합니다. (4방향 전체 ↔ 좌측만 ↔ 전체 해제)
 */
function cycleFrozenMode(): void {
    if (isAllFrozen.value) {
        frozenLeft.value = 2;
        frozenRight.value = 0;
        frozenTop.value = 0;
        frozenBottom.value = 0;
    } else if (frozenLeft.value > 0 && frozenRight.value === 0 && frozenTop.value === 0 && frozenBottom.value === 0) {
        frozenLeft.value = 0;
        frozenRight.value = 0;
        frozenTop.value = 0;
        frozenBottom.value = 0;
    } else {
        frozenLeft.value = 2;
        frozenRight.value = 1;
        frozenTop.value = 2;
        frozenBottom.value = 1;
    }
}

/**
 * 특정 방향의 고정 상태를 개별 토글합니다.
 * @param dir 토글할 고정 방향 ('left' | 'right' | 'top' | 'bottom')
 */
function toggleDirection(dir: 'left' | 'right' | 'top' | 'bottom'): void {
    if (dir === 'left') {
        frozenLeft.value = frozenLeft.value > 0 ? 0 : 2;
    } else if (dir === 'right') {
        frozenRight.value = frozenRight.value > 0 ? 0 : 1;
    } else if (dir === 'top') {
        frozenTop.value = frozenTop.value > 0 ? 0 : 2;
    } else if (dir === 'bottom') {
        frozenBottom.value = frozenBottom.value > 0 ? 0 : 1;
    }
}

/**
 * 현재 그리드 상태와 데이터를 스프레드시트(xlsx) 파일로 내보냅니다.
 */
async function exportToExcel(): Promise<void> {
    const nativeGrid = gridRef.value?.nativeInstance || gridRef.value?.grid || gridRef.value;
    if (nativeGrid) {
        await ExportXlsx.export.call(nativeGrid, '기본그리드_주문현황.xlsx');
    } else {
        console.warn('그리드 인스턴스를 찾을 수 없습니다.');
    }
}
</script>
