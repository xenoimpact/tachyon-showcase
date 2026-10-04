<template>
    <DemoContainer
        title="인라인 셀 편집 및 클립보드 (Inline Editor & Excel)"
        description="더블클릭 또는 F2로 셀을 직접 편집하며, 수량·단가 변경 시 비즈니스 수식(공급가액·부가세·합계)이 실시간 연동됩니다. 엑셀 복사/붙여넣기와 고속 내보내기를 지원합니다."
    >
        <!-- 데이터 요약 통계 슬롯 (5종 실시간 연동 KPI) -->
        <template #stats>
            <div class="stat-pill">
                <span class="stat-label">데이터 건수</span>
                <span class="stat-value">{{ items.length }}건</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">수정된 행</span>
                <span
                    class="stat-value font-bold"
                    :class="
                        modifiedCount > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'
                    "
                >
                    {{ modifiedCount }}건
                </span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">공급가액</span>
                <span class="stat-value font-mono">{{ totalSupplyAmountText }}원</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">부가세(10%)</span>
                <span class="stat-value font-mono">{{ totalVatText }}원</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">총 합계금액</span>
                <span class="stat-value font-mono text-blue-600 dark:text-sky-400">{{ totalAmountText }}원</span>
            </div>
        </template>

        <!-- 액션 툴바 슬롯 (단축키 안내 및 컨트롤러) -->
        <template #actions>
            <div class="flex items-center gap-2">
                <!-- 범례(Legend) 칩: 수정 가능 vs 자동 계산/읽기 전용 구분 -->
                <div
                    class="flex items-center gap-2 px-2.5 py-1 text-[11px] rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                    <span class="inline-flex items-center gap-1.5 text-blue-600 dark:text-sky-400 font-semibold">
                        <span class="w-2 h-2 rounded-full bg-blue-500 shadow-xs"></span>
                        ✎ 더블클릭 편집
                    </span>
                    <span class="text-slate-300 dark:text-slate-600">|</span>
                    <span class="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <span class="w-2 h-2 rounded-xs bg-slate-300 dark:bg-slate-600"></span>
                        🔒 자동계산 / 고정
                    </span>
                </div>

                <!-- 수정 초기화 버튼 -->
                <button
                    class="btn-demo btn-demo-outline"
                    :disabled="modifiedCount === 0"
                    :class="
                        modifiedCount === 0
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-amber-500 hover:text-amber-500'
                    "
                    type="button"
                    title="수정된 데이터를 원래 상태로 복원합니다"
                    @click="onReset"
                >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                    </svg>
                    <span>수정 초기화</span>
                </button>

                <!-- Excel 내보내기 버튼 -->
                <button
                    class="btn-demo bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                    type="button"
                    title="현재 그리드의 최신 데이터를 Excel(.xlsx) 파일로 고속 내보냅니다"
                    @click="exportToExcel"
                >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    <span>Excel 내보내기</span>
                </button>
            </div>
        </template>

        <!-- 타키온 인라인 편집 그리드 (수정 가능 vs 읽기 전용 영역 시각 구분) -->
        <TachyonGrid
            ref="gridRef"
            :items="items"
            :row-height="40"
            editable
            sortable-columns
            :edit-on-events="['doubleClick']"
            :paste-from-clipboard="true"
            :frozen-left="2"
            :theme="themeStore.currentTheme"
            class="w-full h-full"
            @item-edit-start="onItemEditStart"
            @item-edit-cancel="onItemEditCancel"
            @item-edit-end="onItemEditEnd"
        >
            <!-- 1. 순번 (70px, center, 고정 열, 읽기 전용) -->
            <TachyonColumn
                data-field="no"
                header-text="No. 🔒"
                :width="70"
                :styles="readonlyCenterStyles"
                :editable="false"
                sortable
            />

            <!-- 2. 주문번호 (130px, center, 고정 열, 읽기 전용 식별 키) -->
            <TachyonColumn
                data-field="id"
                header-text="주문번호 🔒"
                :width="130"
                :styles="readonlyCenterStyles"
                :editable="false"
                sortable
            />

            <!-- 3. 고객사명 (140px, 텍스트 인라인 편집) -->
            <TachyonColumn data-field="customer" header-text="고객사명 ✎" :width="140" sortable />

            <!-- 4. 품목/프로젝트명 (220px, 텍스트 인라인 편집) -->
            <TachyonColumn data-field="projectName" header-text="품목/프로젝트명 ✎" :width="220" sortable />

            <!-- 5. 분류 (120px, center, 드롭다운 커스텀 에디터 & hookEditEnd) -->
            <TachyonColumn
                data-field="category"
                header-text="분류 ▾"
                :width="120"
                :styles="{textAlign: 'center'}"
                sortable
            >
                <template #itemEditor="{value, hookEditEnd}">
                    <select
                        :ref="(el) => onSelectMounted(el as HTMLSelectElement | null)"
                        :value="value"
                        class="custom-cell-select"
                        @change="hookEditEnd(($event.target as HTMLSelectElement).value)"
                    >
                        <option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
                    </select>
                </template>
            </TachyonColumn>

            <!-- 6. 수량 (90px, right, 숫자 에디터, 수식 자동 연동) -->
            <TachyonNumberColumn
                data-field="quantity"
                header-text="수량 ✎"
                :width="90"
                pattern="0,0"
                :styles="{textAlign: 'right'}"
                sortable
            />

            <!-- 7. 단가 (120px, right, 숫자 에디터, 수식 자동 연동) -->
            <TachyonNumberColumn
                data-field="unitPrice"
                header-text="단가 ✎"
                :width="120"
                pattern="0,0"
                :styles="{textAlign: 'right'}"
                sortable
            />

            <!-- 8. 공급가액 (130px, right, 자동 계산 읽기 전용) -->
            <TachyonNumberColumn
                data-field="supplyAmount"
                header-text="공급가액 (자동)"
                :width="130"
                pattern="0,0"
                :styles="calculatedRightStyles"
                :editable="false"
                sortable
            />

            <!-- 9. 부가세(10%) (110px, right, 자동 계산 읽기 전용) -->
            <TachyonNumberColumn
                data-field="vat"
                header-text="부가세(10%) (자동)"
                :width="120"
                pattern="0,0"
                :styles="calculatedRightStyles"
                :editable="false"
                sortable
            />

            <!-- 10. 합계금액 (140px, right, 자동 계산 읽기 전용) -->
            <TachyonNumberColumn
                data-field="totalAmount"
                header-text="합계금액 (자동)"
                :width="140"
                pattern="0,0"
                :styles="totalAmountCellStyles"
                :editable="false"
                sortable
            />

            <!-- 11. 진행상태 (110px, center, 드롭다운 커스텀 에디터 & 배지 렌더러) -->
            <TachyonColumn
                data-field="status"
                header-text="진행상태 ▾"
                :width="110"
                :item-renderer="StatusBadgeRenderer"
                sortable
            >
                <template #itemEditor="{value, hookEditEnd}">
                    <select
                        :ref="(el) => onSelectMounted(el as HTMLSelectElement | null)"
                        :value="value"
                        class="custom-cell-select"
                        @change="hookEditEnd(($event.target as HTMLSelectElement).value)"
                    >
                        <option v-for="st in STATUSES" :key="st" :value="st">{{ st }}</option>
                    </select>
                </template>
            </TachyonColumn>

            <!-- 12. 주문일자 (130px, center, 타키온 기본 날짜 에디터) -->
            <TachyonDateColumn
                data-field="orderDate"
                header-text="주문일자 ✎"
                :width="130"
                pattern="YYYY-MM-DD"
                :styles="{textAlign: 'center'}"
                sortable
            />

            <!-- 13. 납기일자 (130px, center, 타키온 기본 날짜 에디터) -->
            <TachyonDateColumn
                data-field="deliveryDate"
                header-text="납기일자 ✎"
                :width="130"
                pattern="YYYY-MM-DD"
                :styles="{textAlign: 'center'}"
                sortable
            />
        </TachyonGrid>
    </DemoContainer>
</template>

<script setup lang="ts">
import {computed, ref, useTemplateRef} from 'vue';
import {TachyonGrid, TachyonColumn, type GridStyles} from 'tachyon.vue';
import {mockOrders, numToStr, type OrderItem, type ProductCategory, type OrderStatus} from '@tachyon-showcase/shared';
import TachyonNumberColumn from '@/config/tachyon/columns/TachyonNumberColumn';
import TachyonDateColumn from '@/config/tachyon/columns/TachyonDateColumn';
import StatusBadgeRenderer from '@/components/renderers/StatusBadgeRenderer.vue';
import ExportXlsx from '@/config/tachyon/addons/xlsx/export';
import DemoContainer from '@/components/common/DemoContainer.vue';
import {useThemeStore} from '@/stores/themeStore';

const themeStore = useThemeStore();
const gridRef = useTemplateRef<any>('gridRef');

/**
 * 테마별 컬럼 스타일 팔레트 매핑 테이블
 * - readonly: No., 주문번호 등 기준정보 읽기 전용 셀
 * - calc: 공급가액, 부가세 등 자동계산 수식열 음영
 * - total: 합계금액 강조 블루/스카이 틴트
 */
const COLUMN_THEME_STYLES = {
    light: {
        readonlyBg: 'rgba(241, 245, 249, 0.8)',
        readonlyColor: '#475569',
        calcBg: 'rgba(243, 244, 246, 0.75)',
        calcColor: '#374151',
        totalBg: 'rgba(238, 242, 255, 0.8)',
        totalColor: '#2563eb'
    },
    dark: {
        readonlyBg: 'rgba(15, 23, 42, 0.55)',
        readonlyColor: '#94a3b8',
        calcBg: 'rgba(30, 41, 59, 0.5)',
        calcColor: '#cbd5e1',
        totalBg: 'rgba(30, 41, 59, 0.7)',
        totalColor: '#38bdf8'
    },
    'steel-blue': {
        readonlyBg: 'rgba(12, 74, 110, 0.45)',
        readonlyColor: '#bae6fd',
        calcBg: 'rgba(12, 74, 110, 0.35)',
        calcColor: '#e0f2fe',
        totalBg: 'rgba(2, 132, 199, 0.35)',
        totalColor: '#38bdf8'
    }
} as const;

/** 현재 테마 키 */
const currentThemeKey = computed<keyof typeof COLUMN_THEME_STYLES>(() => {
    const theme = themeStore.currentTheme;
    if (theme === 'dark' || theme === 'steel-blue') {
        return theme;
    }
    return 'light';
});

/**
 * 고정 열 및 기준 정보(No., 주문번호) 읽기 전용 셀 스타일
 */
const readonlyCenterStyles = computed<GridStyles>(() => {
    const palette = COLUMN_THEME_STYLES[currentThemeKey.value];
    return {
        textAlign: 'center',
        backgroundColor: palette.readonlyBg,
        color: palette.readonlyColor
    };
});

/**
 * 공급가액, 부가세 자동 계산 수식열 스타일
 */
const calculatedRightStyles = computed<GridStyles>(() => {
    const palette = COLUMN_THEME_STYLES[currentThemeKey.value];
    return {
        textAlign: 'right',
        backgroundColor: palette.calcBg,
        color: palette.calcColor
    };
});

/**
 * 합계금액 자동 계산 강조 스타일
 */
const totalAmountCellStyles = computed<GridStyles>(() => {
    const palette = COLUMN_THEME_STYLES[currentThemeKey.value];
    return {
        textAlign: 'right',
        backgroundColor: palette.totalBg,
        color: palette.totalColor
    };
});

const CATEGORIES: ProductCategory[] = ['인프라', '소프트웨어', '하드웨어', '센서/네트워크', '보안솔루션'];
const STATUSES: OrderStatus[] = ['준비중', '진행중', '검수완료', '지연', '보류'];

/**
 * 초기 데이터 복사본 생성 함수
 */
function createInitialOrders(): OrderItem[] {
    return mockOrders.map((item) => {
        return {...item};
    });
}

/** 그리드에 바인딩되는 반응형 데이터 */
const items = ref<OrderItem[]>(createInitialOrders());

/** 원본 데이터 맵 (수정 여부 추적용) */
const originalOrdersMap = new Map<string, OrderItem>();
for (const item of mockOrders) {
    originalOrdersMap.set(item.id, {...item});
}

/** 수정된 행의 ID 목록 추적 */
const modifiedRowIds = ref<Set<string>>(new Set());

/** 수정된 행의 총 개수 */
const modifiedCount = computed<number>(() => {
    return modifiedRowIds.value.size;
});

/** 총 공급가액 합계 */
const totalSupplyAmount = computed<number>(() => {
    return items.value.reduce((acc, cur) => {
        return acc + (cur.supplyAmount || 0);
    }, 0);
});

const totalSupplyAmountText = computed<string>(() => {
    return numToStr(totalSupplyAmount.value, '0,0');
});

/** 총 부가세 합계 */
const totalVat = computed<number>(() => {
    return items.value.reduce((acc, cur) => {
        return acc + (cur.vat || 0);
    }, 0);
});

const totalVatText = computed<string>(() => {
    return numToStr(totalVat.value, '0,0');
});

/** 총 주문 합계금액 */
const totalAmount = computed<number>(() => {
    return items.value.reduce((acc, cur) => {
        return acc + (cur.totalAmount || 0);
    }, 0);
});

const totalAmountText = computed<string>(() => {
    return numToStr(totalAmount.value, '0,0');
});

/**
 * 콤마(,)나 공백이 포함된 문자열 또는 숫자를 안전한 숫자로 변환합니다.
 */
function parseSafeNumber(val: any, fallback = 0): number {
    if (typeof val === 'number') {
        return isNaN(val) ? fallback : val;
    }
    if (typeof val === 'string') {
        const cleaned = val.replace(/[^0-9.-]/g, '');
        if (cleaned === '') {
            return fallback;
        }
        const num = Number(cleaned);
        return isNaN(num) ? fallback : num;
    }
    return fallback;
}

/**
 * 수량 및 단가 기반으로 공급가액, 부가세, 합계금액을 일괄 재계산합니다.
 */
function applyFormulas(item: OrderItem): void {
    const qty = item.quantity || 0;
    const price = item.unitPrice || 0;
    const supply = qty * price;
    const vat = Math.round(supply * 0.1);
    const total = supply + vat;

    item.supplyAmount = supply;
    item.vat = vat;
    item.totalAmount = total;
}

/** 편집 시작 전 원래 값 백업 (취소 복원용) */
let editingBackup: {field: string; value: any; item: OrderItem} | null = null;

/**
 * 인라인 셀 편집 시작 이벤트 핸들러
 * 편집 취소(Esc) 시 복원할 원본 값을 백업하고, 단가/수량 에디터에 콤마 없는 순수 숫자를 채워줍니다.
 */
function onItemEditStart(event: any): void {
    const detail = event?.detail || event;
    const column = detail?.column;
    const item = detail?.item as OrderItem;
    if (!item || !column) {
        return;
    }

    const field = column.dataField;
    editingBackup = {
        field,
        value: item[field as keyof OrderItem],
        item
    };

    // 단가 또는 수량 수정 시 input에 콤마 없는 순수 숫자를 표시하고 전체 선택
    if (field === 'unitPrice' || field === 'quantity') {
        requestAnimationFrame(() => {
            const input = gridRef.value?.$el?.querySelector('.tachyon-editor') as HTMLInputElement | null;
            if (input && item) {
                const rawVal = item[field as keyof OrderItem];
                if (rawVal !== undefined && rawVal !== null) {
                    input.value = String(rawVal);
                    input.select();
                }
            }
        });
    }
}

/**
 * 인라인 셀 편집 취소(Esc) 이벤트 핸들러
 * 편집 시작 전의 원래 값으로 복원합니다.
 */
function onItemEditCancel(): void {
    if (editingBackup) {
        const {field, value, item} = editingBackup;
        (item as any)[field] = value;
        if (field === 'quantity' || field === 'unitPrice') {
            applyFormulas(item);
        }
        editingBackup = null;
        if (gridRef.value?.nativeInstance) {
            gridRef.value.nativeInstance.invalidate();
            gridRef.value.nativeInstance.flush();
        }
    }
}

/**
 * 인라인 셀 편집 종료 이벤트 핸들러
 * 수량 또는 단가가 변경되면 연관된 수식(공급가액, 부가세, 합계금액)을 실시간 재계산합니다.
 */
function onItemEditEnd(event: any): void {
    const detail = event?.detail || event;
    if (!detail) {
        return;
    }

    const item = detail.item as OrderItem;
    const column = detail.column;
    const field = column?.dataField;
    if (!item) {
        return;
    }

    // 1. 수량이나 단가가 변경된 경우 비즈니스 수식 자동 재계산 (콤마 제거 안전 파싱)
    if (field === 'quantity' || field === 'unitPrice') {
        const fallback = editingBackup && editingBackup.field === field ? editingBackup.value : 0;
        const qty = Math.max(0, Math.round(parseSafeNumber(item.quantity, fallback)));
        const price = Math.max(0, Math.round(parseSafeNumber(item.unitPrice, fallback)));

        item.quantity = qty;
        item.unitPrice = price;
        applyFormulas(item);

        // 그리드 렌더러에 변경사항 즉각 반영
        if (gridRef.value?.nativeInstance) {
            gridRef.value.nativeInstance.invalidate();
            gridRef.value.nativeInstance.flush();
        }
    }

    editingBackup = null;

    // 2. 원본 데이터 대비 수정 여부 판별
    const original = originalOrdersMap.get(item.id);
    if (original) {
        const isModified =
            original.customer !== item.customer ||
            original.projectName !== item.projectName ||
            original.category !== item.category ||
            original.quantity !== item.quantity ||
            original.unitPrice !== item.unitPrice ||
            original.status !== item.status ||
            original.orderDate !== item.orderDate ||
            original.deliveryDate !== item.deliveryDate;

        const nextSet = new Set(modifiedRowIds.value);
        if (isModified) {
            nextSet.add(item.id);
        } else {
            nextSet.delete(item.id);
        }
        modifiedRowIds.value = nextSet;
    }
}

/**
 * 수정된 데이터를 초기 상태로 복원합니다.
 */
function onReset(): void {
    items.value = createInitialOrders();
    modifiedRowIds.value = new Set();
    if (gridRef.value?.nativeInstance) {
        gridRef.value.nativeInstance.invalidate();
        gridRef.value.nativeInstance.flush();
    }
}

/**
 * 드롭다운 에디터 활성화 시 브라우저 네이티브 드롭다운 메뉴를 자동으로 펼칩니다.
 */
function onSelectMounted(el: HTMLSelectElement | null): void {
    if (!el) {
        return;
    }
    el.focus();
    if (typeof el.showPicker === 'function') {
        try {
            el.showPicker();
            return;
        } catch {
            // 사용자 제스처 동기 실행 불가 시 비동기 틱에서 재시도
        }
    }
    requestAnimationFrame(() => {
        if (typeof el.showPicker === 'function') {
            try {
                el.showPicker();
            } catch {
                // 브라우저 권한 정책 예외 방어
            }
        }
    });
}

/**
 * 그리드의 최신 수정 데이터를 Web Worker를 통해 엑셀 파일로 고속 내보냅니다.
 */
async function exportToExcel(): Promise<void> {
    const nativeGrid = gridRef.value?.nativeInstance || gridRef.value?.grid || gridRef.value;
    if (nativeGrid) {
        await ExportXlsx.export.call(nativeGrid, '주문목록_인라인편집.xlsx');
    }
}
</script>

<style scoped>
/* 커스텀 셀렉트 에디터 스타일링 */
.custom-cell-select {
    width: 100%;
    height: 100%;
    padding: 0 6px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;
    border: 2px solid #3b82f6;
    outline: none;
    cursor: pointer;
    background-color: var(--app-card-bg, #ffffff);
    color: var(--app-text, #0f172a);
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.4);
}

:deep(.tachyon-grid .tachyon-editor) {
    border: 2px solid #3b82f6 !important;
    border-radius: 4px !important;
    background-color: var(--app-card-bg, #ffffff) !important;
    color: var(--app-text, #0f172a) !important;
    font-size: 12px !important;
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.4) !important;
    padding: 0 6px !important;
}
</style>
