<template>
    <DemoContainer
        title="엑셀 내보내기 & 가져오기 (Excel Export & Import)"
        description="멀티헤더와 숫자 서식을 유지한 채 대량 데이터를 엑셀 파일로 내보내고, 다시 가져와 원본과 같은지 확인합니다."
    >
        <!-- 내보내기·가져오기 성능 지표 슬롯 -->
        <template #stats>
            <div class="stat-pill">
                <span class="stat-label">데이터 건수</span>
                <span class="stat-value text-blue-600 dark:text-sky-400 font-mono">{{ rowCountText }}건</span>
            </div>
            <div class="stat-pill" :title="exportBreakdownText">
                <span class="stat-label">내보내기</span>
                <span class="stat-value font-mono">
                    {{ exportTotalText }}
                    <span class="stat-label ml-1">메인 {{ exportMainText }}</span>
                </span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">파일 크기</span>
                <span class="stat-value font-mono">{{ fileSizeText }}</span>
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
                        :disabled="isBusy"
                        type="button"
                        @click="changeDataset(opt.value)"
                    >
                        {{ opt.label }}
                    </button>
                </div>

                <!-- 엑셀 가져오기 (숨김 파일 입력) -->
                <input ref="fileInputRef" type="file" accept=".xlsx" class="hidden" @change="onFileSelected" />
                <button class="btn-demo btn-demo-outline" type="button" :disabled="isBusy" @click="openFileDialog">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    {{ busyTask === 'import' ? '가져오는 중…' : '엑셀 가져오기' }}
                </button>

                <button
                    class="btn-demo bg-emerald-600 hover:bg-emerald-700 text-white border-none ml-1"
                    type="button"
                    :disabled="isBusy"
                    @click="exportToExcel"
                >
                    <span
                        v-if="busyTask === 'export'"
                        class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
                    />
                    <svg
                        v-else
                        class="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    {{ busyTask === 'export' ? '내보내는 중…' : 'Excel 다운로드' }}
                </button>
            </div>
        </template>

        <!-- 타키온 그리드 영역 (멀티헤더 + 좌우 고정) -->
        <TachyonGrid
            ref="gridRef"
            :items="items"
            :frozen-left="1"
            :frozen-right="1"
            :theme="themeStore.currentTheme"
            class="w-full h-full"
        >
            <TachyonNumberColumn
                data-field="no"
                header-text="No."
                :width="70"
                pattern="0,0"
                :styles="{textAlign: 'right'}"
            />
            <TachyonColumn header-text="주문 정보">
                <TachyonColumn data-field="id" header-text="주문번호" :width="150" :styles="{textAlign: 'center'}" />
                <TachyonColumn data-field="customer" header-text="고객사명" :width="160" />
                <TachyonColumn data-field="department" header-text="담당부서" :width="150" />
            </TachyonColumn>
            <TachyonColumn header-text="품목 정보">
                <TachyonColumn data-field="projectName" header-text="프로젝트/품목명" :width="260" />
                <TachyonColumn data-field="category" header-text="분류" :width="120" :styles="{textAlign: 'center'}" />
            </TachyonColumn>
            <TachyonColumn header-text="금액 정보">
                <TachyonNumberColumn
                    data-field="quantity"
                    header-text="수량"
                    :width="80"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                />
                <TachyonNumberColumn
                    data-field="unitPrice"
                    header-text="단가"
                    :width="120"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                />
                <TachyonNumberColumn
                    data-field="supplyAmount"
                    header-text="공급가액"
                    :width="140"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                />
                <TachyonNumberColumn
                    data-field="vat"
                    header-text="부가세"
                    :width="120"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                />
                <TachyonNumberColumn
                    data-field="totalAmount"
                    header-text="합계금액"
                    :width="150"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                />
            </TachyonColumn>
            <TachyonColumn header-text="일정">
                <TachyonDateColumn
                    data-field="orderDate"
                    header-text="주문일자"
                    :width="110"
                    pattern="YYYY-MM-DD"
                    :styles="{textAlign: 'center'}"
                />
                <TachyonDateColumn
                    data-field="deliveryDate"
                    header-text="납기일자"
                    :width="110"
                    pattern="YYYY-MM-DD"
                    :styles="{textAlign: 'center'}"
                />
            </TachyonColumn>
            <TachyonColumn
                data-field="status"
                header-text="진행상태"
                :width="110"
                :item-renderer="StatusBadgeRenderer"
            />
        </TachyonGrid>
    </DemoContainer>
</template>

<script setup lang="ts">
import {computed, ref, shallowRef, useTemplateRef} from 'vue';
import {TachyonGrid, TachyonColumn} from 'tachyon.vue';
import {generateLargeDataset, numToStr, type OrderItem} from '@tachyon-showcase/shared';
import TachyonNumberColumn from '@/config/tachyon/columns/TachyonNumberColumn';
import TachyonDateColumn from '@/config/tachyon/columns/TachyonDateColumn';
import StatusBadgeRenderer from '@/components/renderers/StatusBadgeRenderer.vue';
import DemoContainer from '@/components/common/DemoContainer.vue';
import type {XlsxExportMetrics, XlsxExportResult} from '@/config/tachyon/addons/xlsx/types';
import {useThemeStore} from '@/stores/themeStore';

/** 초기 데이터 건수 */
const INITIAL_COUNT = 10_000;

type BusyTask = 'export' | 'import' | null;

interface CountOption {
    label: string;
    value: number;
}

const countOptions: CountOption[] = [
    {label: '1만 건', value: 10_000},
    {label: '5만 건', value: 50_000},
    {label: '10만 건', value: 100_000}
];

const themeStore = useThemeStore();
const gridRef = useTemplateRef<any>('gridRef');
const fileInputRef = useTemplateRef<HTMLInputElement>('fileInputRef');

const selectedCount = ref<number>(INITIAL_COUNT);
/** 건수 전환 시 생성한 원본 데이터셋 */
let sourceItems: OrderItem[] = generateLargeDataset(INITIAL_COUNT);
const items = shallowRef<OrderItem[]>(sourceItems);

const busyTask = ref<BusyTask>(null);
const exportMetrics = shallowRef<XlsxExportMetrics | null>(null);

const isBusy = computed<boolean>(() => busyTask.value !== null);

/**
 * 밀리초 값을 표시용 문자열로 변환합니다.
 * @param value 밀리초 값
 * @returns 표시 문자열입니다. 값이 없으면 '-'입니다.
 */
function formatMs(value: number | null | undefined): string {
    return value == null ? '-' : `${numToStr(Math.round(value), '0,0')}ms`;
}

const rowCountText = computed<string>(() => numToStr(items.value.length, '0,0'));

const exportTotalText = computed<string>(() => formatMs(exportMetrics.value?.total));

/** 메인 스레드 처리 시간 (데이터 추출 + 전송 전 진단 복제) */
const exportMainText = computed<string>(() => {
    const metrics = exportMetrics.value;
    return formatMs(metrics ? metrics.extract + metrics.clone : null);
});

/** 내보내기 구간별 소요시간 (마우스 오버 표시) */
const exportBreakdownText = computed<string>(() => {
    const metrics = exportMetrics.value;
    if (!metrics) {
        return '내보내기를 실행하면 구간별 소요시간이 표시됩니다.';
    }
    const worker = metrics.worker;
    return [
        `[메인 스레드] 데이터 추출 ${formatMs(metrics.extract)} / 전송 전 진단 복제 ${formatMs(metrics.clone)}`,
        `[워커 시작·전송] ${formatMs(metrics.transfer)}`,
        `[워커 내부] 헤더 ${formatMs(worker.header)} / 행 추가 ${formatMs(worker.rows)} / 트리 계층 ${formatMs(worker.outline)}`,
        `셀 병합 ${formatMs(worker.merge)} / 테두리·배경 ${formatMs(worker.style)} / 파일 생성 ${formatMs(worker.zip)}`
    ].join('\n');
});

const fileSizeText = computed<string>(() => {
    const size = exportMetrics.value?.fileSize;
    return size == null ? '-' : `${(size / 1024 / 1024).toFixed(2)}MB`;
});

/**
 * 다음 화면 갱신까지 한 프레임 양보합니다.
 */
function nextFrame(): Promise<void> {
    return new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
    });
}

/**
 * 진행 표시를 켠 상태로 작업을 실행합니다.
 * @param task 작업 종류
 * @param job 실행할 작업
 * @returns 작업 결과입니다.
 */
async function runBusy<T>(task: Exclude<BusyTask, null>, job: () => Promise<T>): Promise<T> {
    busyTask.value = task;
    // 진행 표시가 먼저 그려진 뒤 작업을 시작합니다.
    await nextFrame();
    try {
        return await job();
    } finally {
        busyTask.value = null;
    }
}

/**
 * 데이터 건수를 변경하고 원본 데이터셋을 새로 생성합니다.
 * @param count 변경할 건수
 */
function changeDataset(count: number): void {
    if (selectedCount.value === count && items.value === sourceItems) {
        return;
    }
    selectedCount.value = count;
    sourceItems = generateLargeDataset(count);
    items.value = sourceItems;
}

/**
 * 현재 그리드를 엑셀 파일로 내보내고 구간별 소요시간을 기록합니다.
 */
async function exportToExcel(): Promise<void> {
    const exportAddon = gridRef.value?.getAddon('export');
    if (!exportAddon) {
        console.warn('export 애드온을 찾을 수 없습니다.');
        return;
    }
    const result = await runBusy<XlsxExportResult | null>('export', () =>
        exportAddon.export(`주문목록_${items.value.length}건.xlsx`)
    );
    if (result) {
        exportMetrics.value = result.metrics;
    }
}

/**
 * 파일 선택 창을 엽니다.
 */
function openFileDialog(): void {
    fileInputRef.value?.click();
}

/**
 * 선택한 엑셀 파일을 가져와 그리드 데이터를 교체합니다.
 * @param event 파일 입력 변경 이벤트
 */
async function onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    // 같은 파일을 다시 선택해도 변경 이벤트가 발생하도록 비웁니다.
    input.value = '';
    const importAddon = gridRef.value?.getAddon('import');
    if (!file || !importAddon) {
        return;
    }
    const rows: Array<Record<string, any>> | null = await runBusy('import', () => importAddon.import(file));
    if (rows) {
        items.value = rows as OrderItem[];
    }
}
</script>
