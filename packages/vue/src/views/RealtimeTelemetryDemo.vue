<template>
    <DemoContainer
        title="실시간 데이터 갱신 (초고속 성능 & 텔레메트리 관제)"
        description="5,000대 설비 × 50개 IoT 센서(총 250,000개 셀)가 초당 수십~수백 회 갱신되는 고밀도 환경에서도 무지연 60 FPS 렌더링과 실시간 틱 플래시 잔상을 시연합니다."
    >
        <!-- 데이터 요약 통계 슬롯 (4종 KPI 대시보드) -->
        <template #stats>
            <div class="stat-pill">
                <span class="stat-label">관리 설비 수</span>
                <span class="stat-value font-mono">5,000대</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">실시간 총 셀 수</span>
                <span class="stat-value font-mono">250,000개</span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">초당 갱신량</span>
                <span class="stat-value font-mono text-blue-600 dark:text-sky-400">
                    ⚡ {{ isStreaming ? tickRate : 0 }} 셀/초
                </span>
            </div>
            <div class="stat-pill">
                <span class="stat-label">렌더링 프레임율</span>
                <span
                    class="stat-value font-mono"
                    :class="fps >= 55 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'"
                >
                    🟢 {{ fps }} FPS ({{ tickDurationMs }}ms)
                </span>
            </div>
        </template>

        <!-- 액션 버튼 툴바 슬롯 -->
        <template #actions>
            <div class="flex items-center gap-2">
                <!-- 스트리밍 재생/일시정지 토글 -->
                <button
                    class="btn-demo"
                    :class="
                        isStreaming
                            ? 'bg-amber-600 hover:bg-amber-700 text-white border-none'
                            : 'bg-blue-600 hover:bg-blue-700 text-white border-none'
                    "
                    type="button"
                    :title="isStreaming ? '실시간 스트리밍 일시 정지' : '실시간 스트리밍 재개'"
                    @click="toggleStreaming"
                >
                    <svg v-if="isStreaming" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                    <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>{{ isStreaming ? '일시 정지' : '실시간 스트리밍' }}</span>
                </button>

                <!-- 갱신 부하 강도 세그먼트 -->
                <div class="toggle-group">
                    <button
                        v-for="opt in tickRateOptions"
                        :key="opt.value"
                        class="toggle-item"
                        :class="tickRate === opt.value ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold' : ''"
                        type="button"
                        :title="opt.desc"
                        @click="setTickRate(opt.value)"
                    >
                        {{ opt.label }}
                    </button>
                </div>

                <!-- Excel 다운로드 버튼 -->
                <button
                    class="btn-demo bg-emerald-600 hover:bg-emerald-700 text-white border-none ml-1"
                    type="button"
                    title="25만 개 전체 셀 데이터를 XLSX로 내보냅니다"
                    @click="exportToExcel"
                >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    <span>Excel 다운로드</span>
                </button>
            </div>
        </template>

        <!-- 타키온 그리드 메인 영역 (5,000행 × 49열, 행 높이 24px 초고밀도 뷰) -->
        <TachyonGrid
            ref="gridRef"
            :items="items"
            :frozen-left="3"
            :row-height="24"
            :theme="themeStore.currentTheme"
            class="w-full h-full text-xs"
        >
            <!-- 1그룹: 설비 식별 (좌측 3열 틀고정, 텍스트 가독성 확보) -->
            <TachyonColumn header-text="설비 식별">
                <TachyonColumn
                    data-field="line"
                    header-text="라인"
                    :width="62"
                    :styles="{textAlign: 'center'}"
                    sortable
                />
                <TachyonColumn
                    data-field="eqId"
                    header-text="설비ID"
                    :width="72"
                    :styles="{textAlign: 'center'}"
                    sortable
                />
                <TachyonColumn data-field="eqName" header-text="설비명" :width="130" sortable />
            </TachyonColumn>

            <!-- 2그룹: 주축 온도 센서 (7열, 실시간 플래시) -->
            <TachyonColumn header-text="주축 온도(°C)">
                <TachyonColumn
                    data-field="tempMotor"
                    header-text="모터"
                    :width="46"
                    :label-function="fmtTemp"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="tempBrg1"
                    header-text="베1"
                    :width="46"
                    :label-function="fmtTemp"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="tempBrg2"
                    header-text="베2"
                    :width="46"
                    :label-function="fmtTemp"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="tempChamberUpper"
                    header-text="챔상"
                    :width="46"
                    :label-function="fmtTemp"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="tempChamberLower"
                    header-text="챔하"
                    :width="46"
                    :label-function="fmtTemp"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="tempCoolantIn"
                    header-text="냉인"
                    :width="46"
                    :label-function="fmtTemp"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="tempCoolantOut"
                    header-text="냉아웃"
                    :width="46"
                    :label-function="fmtTemp"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
            </TachyonColumn>

            <!-- 3그룹: 압력 & 유량 (6열, 실시간 플래시) -->
            <TachyonColumn header-text="압력/유량">
                <TachyonColumn
                    data-field="pressMain"
                    header-text="주압"
                    :width="46"
                    :label-function="fmtBar"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="pressSub"
                    header-text="보압"
                    :width="46"
                    :label-function="fmtBar"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="pressAir"
                    header-text="공압"
                    :width="45"
                    :label-function="fmtBar"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="flowCoolant"
                    header-text="냉각"
                    :width="46"
                    :label-function="fmtLpm"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="flowLube"
                    header-text="윤활"
                    :width="46"
                    :label-function="fmtLpm"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="flowExhaust"
                    header-text="배기"
                    :width="48"
                    :label-function="fmtCmh"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
            </TachyonColumn>

            <!-- 4그룹: 동력 & 회전 (7열, 실시간 플래시) -->
            <TachyonColumn header-text="동력/구동">
                <TachyonColumn
                    data-field="rpm"
                    header-text="RPM"
                    :width="48"
                    :label-function="fmtRpm"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="loadRate"
                    header-text="부하"
                    :width="46"
                    :label-function="fmtPct"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="powerKw"
                    header-text="전력"
                    :width="46"
                    :label-function="fmtKw"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="volt"
                    header-text="전압"
                    :width="46"
                    :label-function="fmtVolt"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="ampere"
                    header-text="전류"
                    :width="46"
                    :label-function="fmtAmp"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="torque1"
                    header-text="토크1"
                    :width="46"
                    :label-function="fmtNm"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="torque2"
                    header-text="토크2"
                    :width="46"
                    :label-function="fmtNm"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
            </TachyonColumn>

            <!-- 5그룹: 진동 & 충격 (6열, 실시간 플래시) -->
            <TachyonColumn header-text="진동/충격">
                <TachyonColumn
                    data-field="vibX"
                    header-text="X진"
                    :width="46"
                    :label-function="fmtMmS"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="vibY"
                    header-text="Y진"
                    :width="46"
                    :label-function="fmtMmS"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="vibZ"
                    header-text="Z진"
                    :width="46"
                    :label-function="fmtMmS"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="shockPeak"
                    header-text="충격"
                    :width="46"
                    :label-function="fmtG"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="freqShift"
                    header-text="변위"
                    :width="46"
                    :label-function="fmtKhz"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="noiseDb"
                    header-text="소음"
                    :width="45"
                    :label-function="fmtDb"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
            </TachyonColumn>

            <!-- 6그룹: 환경 센서 (5열, 실시간 플래시) -->
            <TachyonColumn header-text="공정 환경">
                <TachyonColumn
                    data-field="ambientTemp"
                    header-text="외기"
                    :width="46"
                    :label-function="fmtTemp"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="humidity"
                    header-text="습도"
                    :width="45"
                    :label-function="fmtPct"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="co2Ppm"
                    header-text="CO2"
                    :width="46"
                    :label-function="fmtCo2"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="vocPpm"
                    header-text="VOC"
                    :width="46"
                    :label-function="fmtVoc"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="particleCount"
                    header-text="분진"
                    :width="48"
                    :label-function="fmtParticle"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
            </TachyonColumn>

            <!-- 7그룹: 생산 & 효율 (9열, 실시간 플래시 & 캔버스 배지) -->
            <TachyonColumn header-text="생산/OEE">
                <TachyonColumn
                    data-field="oeeRate"
                    header-text="OEE"
                    :width="46"
                    :label-function="fmtPct"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonNumberColumn
                    data-field="targetQty"
                    header-text="목표"
                    :width="46"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonNumberColumn
                    data-field="actualQty"
                    header-text="실적"
                    :width="46"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="achieveRate"
                    header-text="달성"
                    :width="46"
                    :label-function="fmtPct"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonNumberColumn
                    data-field="defectQty"
                    header-text="불량"
                    :width="42"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonNumberColumn
                    data-field="defectPpm"
                    header-text="PPM"
                    :width="48"
                    pattern="0,0"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="cycleTime"
                    header-text="택트"
                    :width="45"
                    :label-function="fmtSec"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="status"
                    header-text="상태"
                    :width="52"
                    :item-renderer="CanvasStatusBadgeRenderer"
                    :styles="{textAlign: 'center'}"
                    sortable
                />
                <TachyonColumn
                    data-field="alarmLevel"
                    header-text="경보"
                    :width="52"
                    :item-renderer="CanvasStatusBadgeRenderer"
                    :styles="{textAlign: 'center'}"
                    sortable
                />
            </TachyonColumn>

            <!-- 8그룹: 네트워크 & 관제 (6열) -->
            <TachyonColumn header-text="네트워크/관제">
                <TachyonColumn
                    data-field="packetRate"
                    header-text="주기"
                    :width="46"
                    :label-function="fmtHz"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="latencyMs"
                    header-text="지연"
                    :width="45"
                    :label-function="fmtMs"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="packetLoss"
                    header-text="손실"
                    :width="46"
                    :label-function="fmtLoss"
                    :item-renderer="CanvasFlashCellRenderer"
                    :styles="{textAlign: 'right'}"
                    sortable
                />
                <TachyonColumn
                    data-field="firmwareVer"
                    header-text="FW"
                    :width="52"
                    :styles="{textAlign: 'center'}"
                    sortable
                />
                <TachyonColumn
                    data-field="maintDday"
                    header-text="점검"
                    :width="46"
                    :styles="{textAlign: 'center'}"
                    sortable
                />
                <TachyonColumn
                    data-field="updatedAt"
                    header-text="수신"
                    :width="64"
                    :styles="{textAlign: 'center', fontFamily: 'monospace'}"
                    sortable
                />
            </TachyonColumn>
        </TachyonGrid>
    </DemoContainer>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref, shallowRef, useTemplateRef, watch} from 'vue';
import {TachyonGrid, TachyonColumn} from 'tachyon.vue';
import {
    generateTelemetryData,
    mutateRandomCells,
    numToStr,
    type TelemetryEquipmentItem
} from '@tachyon-showcase/shared';
import TachyonNumberColumn from '@/config/tachyon/columns/TachyonNumberColumn';
import {CanvasStatusBadgeRenderer} from '@/components/renderers/CanvasStatusBadgeRenderer';
import {CanvasFlashCellRenderer, cellFlashMap} from '@/components/renderers/CanvasFlashCellRenderer';
import ExportXlsx from '@/config/tachyon/addons/xlsx/export';
import DemoContainer from '@/components/common/DemoContainer.vue';
import {useThemeStore} from '@/stores/themeStore';

const themeStore = useThemeStore();
const gridRef = useTemplateRef<any>('gridRef');

/** 설비 대용량 데이터셋 (5,000대, 총 250,000개 셀) */
const items = shallowRef<TelemetryEquipmentItem[]>(generateTelemetryData(5000));

/** 실시간 스트리밍 상태 */
const isStreaming = ref<boolean>(true);
const tickRate = ref<number>(1000); // 초당 갱신 셀 수 (기본 1,000)
const tickDurationMs = ref<number>(0);
const fps = ref<number>(60);

const tickRateOptions = [
    {label: '300 셀/초 (안정)', value: 300, desc: '저부하 실시간 모니터링'},
    {label: '1,000 셀/초 (표준)', value: 1000, desc: '표준 고밀도 틱 스트리밍'},
    {label: '3,000 셀/초 (스트레스)', value: 3000, desc: '초고밀도 벤치마크 부하 테스트'}
];

function setTickRate(rate: number): void {
    tickRate.value = rate;
}

function toggleStreaming(): void {
    isStreaming.value = !isStreaming.value;
}

/** Excel 다운로드 */
async function exportToExcel(): Promise<void> {
    const exportAddon = gridRef.value?.getAddon('export');
    if (exportAddon) {
        await exportAddon.export('실시간_설비_텔레메트리_25만셀.xlsx');
    }
}

// ==========================================================================
// 숫자 및 센서 라벨 포맷터 함수군 (초고속 인라인 렌더링)
// ==========================================================================
function fmtTemp(item: any, col: any): string {
    const val = item?.[col?.dataField];
    return typeof val === 'number' ? `${val.toFixed(1)}°` : '-';
}

function fmtBar(item: any, col: any): string {
    const val = item?.[col?.dataField];
    return typeof val === 'number' ? `${val.toFixed(1)}b` : '-';
}

function fmtLpm(item: any, col: any): string {
    const val = item?.[col?.dataField];
    return typeof val === 'number' ? `${val.toFixed(1)}L` : '-';
}

function fmtCmh(item: any, col: any): string {
    const val = item?.[col?.dataField];
    return typeof val === 'number' ? `${numToStr(val, '0,0')}` : '-';
}

function fmtRpm(item: any): string {
    const val = item?.rpm;
    return typeof val === 'number' ? `${numToStr(val, '0,0')}` : '-';
}

function fmtPct(item: any, col: any): string {
    const val = item?.[col?.dataField];
    return typeof val === 'number' ? `${val.toFixed(1)}%` : '-';
}

function fmtKw(item: any): string {
    const val = item?.powerKw;
    return typeof val === 'number' ? `${val.toFixed(1)}` : '-';
}

function fmtVolt(item: any): string {
    const val = item?.volt;
    return typeof val === 'number' ? `${val}V` : '-';
}

function fmtAmp(item: any): string {
    const val = item?.ampere;
    return typeof val === 'number' ? `${val.toFixed(1)}A` : '-';
}

function fmtNm(item: any, col: any): string {
    const val = item?.[col?.dataField];
    return typeof val === 'number' ? `${val.toFixed(1)}` : '-';
}

function fmtMmS(item: any, col: any): string {
    const val = item?.[col?.dataField];
    return typeof val === 'number' ? `${val.toFixed(2)}` : '-';
}

function fmtG(item: any): string {
    const val = item?.shockPeak;
    return typeof val === 'number' ? `${val.toFixed(2)}G` : '-';
}

function fmtKhz(item: any): string {
    const val = item?.freqShift;
    return typeof val === 'number' ? `${val.toFixed(1)}k` : '-';
}

function fmtDb(item: any): string {
    const val = item?.noiseDb;
    return typeof val === 'number' ? `${val.toFixed(1)}` : '-';
}

function fmtCo2(item: any): string {
    const val = item?.co2Ppm;
    return typeof val === 'number' ? `${numToStr(val, '0,0')}` : '-';
}

function fmtVoc(item: any): string {
    const val = item?.vocPpm;
    return typeof val === 'number' ? `${val.toFixed(2)}` : '-';
}

function fmtParticle(item: any): string {
    const val = item?.particleCount;
    return typeof val === 'number' ? `${numToStr(val, '0,0')}` : '-';
}

function fmtSec(item: any): string {
    const val = item?.cycleTime;
    return typeof val === 'number' ? `${val.toFixed(1)}s` : '-';
}

function fmtHz(item: any): string {
    const val = item?.packetRate;
    return typeof val === 'number' ? `${val}Hz` : '-';
}

function fmtMs(item: any): string {
    const val = item?.latencyMs;
    return typeof val === 'number' ? `${val.toFixed(1)}ms` : '-';
}

function fmtLoss(item: any): string {
    const val = item?.packetLoss;
    return typeof val === 'number' ? `${val.toFixed(2)}%` : '-';
}

// ==========================================================================
// 실시간 틱 스트리밍 및 FPS 계측 엔진
// ==========================================================================
let tickIntervalId: ReturnType<typeof setInterval> | null = null;
let animFrameId: number | null = null;
let lastFpsTime = performance.now();
let frameCount = 0;
let isUnmounted = false;

function measureFps(now: number): void {
    if (isUnmounted) {
        return;
    }
    frameCount++;
    const delta = now - lastFpsTime;
    if (delta >= 500) {
        fps.value = Math.min(60, Math.round((frameCount * 1000) / delta));
        frameCount = 0;
        lastFpsTime = now;
    }

    // 활성 플래시가 존재할 때 60 FPS 부드러운 페이드아웃 렌더링 유지
    if (isStreaming.value && cellFlashMap.size > 0 && gridRef.value?.nativeInstance) {
        gridRef.value.nativeInstance.invalidate();
        gridRef.value.nativeInstance.flush();
    }

    animFrameId = requestAnimationFrame(measureFps);
}

function getVisibleRowIndices(): number[] | undefined {
    const grid = gridRef.value?.nativeInstance;
    if (!grid) {
        return undefined;
    }

    // 1. 타키온 내부 dimensions의 가시 행 인덱스 배열 우선 조회
    const dg = (grid as any).dataGroup;
    const indices = dg?._dimensions?.rowIndices || dg?.rowIndices || dg?._rowIndices;
    if (Array.isArray(indices) && indices.length > 0) {
        return indices;
    }

    // 2. 가시 행 감지 fallback (스크롤 위치 기반 연산)
    const scroller = (grid as any)._scroller || (grid as any).element;
    const scrollTop = scroller?.scrollTop ?? 0;
    const clientHeight = scroller?.clientHeight ?? 700;
    const rowHeight = 24;
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
    const visibleCount = Math.ceil(clientHeight / rowHeight) + 4;
    const endRow = Math.min(items.value.length, startRow + visibleCount);

    const fallbackIndices: number[] = [];
    for (let r = startRow; r < endRow; r++) {
        fallbackIndices.push(r);
    }
    return fallbackIndices;
}

function runStreamTick(): void {
    if (!isStreaming.value || isUnmounted || items.value.length === 0) {
        return;
    }

    const start = performance.now();
    // 100ms마다 실행되므로 틱당 변경 셀 수는 tickRate / 10
    const countPerTick = Math.max(1, Math.round(tickRate.value / 10));
    const visibleRows = getVisibleRowIndices();
    const mutated = mutateRandomCells(items.value, countPerTick, visibleRows);

    // 변경된 셀 플래시 맵 등록 (상승: up, 하강: down)
    const now = performance.now();
    for (let i = 0; i < mutated.length; i++) {
        const m = mutated[i];
        const key = `${m.rowIndex}_${m.field}`;
        cellFlashMap.set(key, {
            time: now,
            type: m.newValue >= m.oldValue ? 'up' : 'down'
        });
    }

    // 타키온 캔버스 즉각 재렌더링
    if (gridRef.value?.nativeInstance) {
        gridRef.value.nativeInstance.invalidate();
    }

    const end = performance.now();
    tickDurationMs.value = Number((end - start).toFixed(1));
}

onMounted(() => {
    // 100ms 간격(초당 10회) 스트리밍 틱 발생
    tickIntervalId = setInterval(runStreamTick, 100);
    animFrameId = requestAnimationFrame(measureFps);
});

onUnmounted(() => {
    isUnmounted = true;
    if (tickIntervalId) {
        clearInterval(tickIntervalId);
        tickIntervalId = null;
    }
    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
    cellFlashMap.clear();
});

// 테마 변경 시 그리드 캔버스 재렌더링
watch(
    () => themeStore.currentTheme,
    () => {
        if (gridRef.value?.nativeInstance) {
            gridRef.value.nativeInstance.invalidate();
            gridRef.value.nativeInstance.flush();
        }
    }
);
</script>
