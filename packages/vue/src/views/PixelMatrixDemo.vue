<template>
    <DemoContainer
        title="07. 픽셀 도트 매트릭스 & 전광판 관제"
        subtitle="그리드의 각 셀을 1개의 LED 픽셀로 전환하여 3,840개 셀을 60 FPS로 실시간 제어하는 인터랙티브 쇼케이스"
    >
        <!-- 2-Tier 슬림 툴바 -->
        <template #toolbar>
            <!-- 1단: 모드 선택 & 실시간 애니메이션 제어 -->
            <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs">
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-slate-700 dark:text-slate-200">시연 모드:</span>
                    <div class="inline-flex rounded-lg p-0.5 bg-slate-200 dark:bg-slate-800">
                        <button
                            v-for="mode in modes"
                            :key="mode.id"
                            type="button"
                            class="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                            :class="currentMode === mode.id
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
                            @click="selectManualMode(mode.id)"
                        >
                            {{ mode.label }}
                        </button>
                    </div>

                    <!-- 애니메이션 일시정지/재생 -->
                    <button
                        type="button"
                        class="ml-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border transition-colors"
                        :class="isPlaying
                            ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900 hover:bg-emerald-100'"
                        @click="togglePlay"
                    >
                        <span>{{ isPlaying ? '⏸ 일시정지' : '▶ 재생' }}</span>
                    </button>

                    <!-- 완전 자동 순환 토글 버튼 -->
                    <button
                        type="button"
                        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border transition-all"
                        :class="isAutoCycle
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500 dark:text-emerald-400 dark:border-emerald-500 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-100'"
                        @click="toggleAutoCycle"
                    >
                        <span class="w-1.5 h-1.5 rounded-full" :class="isAutoCycle ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'"></span>
                        <span>🔄 자동 순환: {{ isAutoCycle ? 'ON' : 'OFF' }}</span>
                    </button>
                </div>

                <!-- 텍스트 입력창 (전광판 모드일 때만 표시) -->
                <div v-if="currentMode === 'marquee'" class="flex items-center gap-2">
                    <span class="text-slate-500 dark:text-slate-400">전광판 문구:</span>
                    <input
                        v-model="marqueeText"
                        type="text"
                        class="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs w-64 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="표시할 텍스트 입력"
                        @input="onTextChange"
                    />
                </div>

                <!-- 레이더 감지 현황 (레이더 모드일 때 표시) -->
                <div v-if="currentMode === 'radar'" class="flex items-center gap-3">
                    <span class="text-slate-500 dark:text-slate-400">탐지 타깃:</span>
                    <div class="flex items-center gap-2 font-mono">
                        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 font-semibold text-[11px]">
                            🚨 경보 타깃: {{ detectedCount }}대
                        </span>
                        <span class="text-slate-400 text-[11px]">반경 28NM (360° Sweep)</span>
                    </div>
                </div>
            </div>

            <!-- 2단: 실시간 렌더링 성능 모니터링 패널 및 자동 순환 게이지 바 -->
            <div class="relative flex flex-wrap items-center justify-between gap-4 px-4 py-2 bg-white dark:bg-slate-950/60 text-xs border-b border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-5">
                    <div class="flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full" :class="isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
                        <span class="text-slate-500 dark:text-slate-400">매트릭스 규모:</span>
                        <span class="font-mono font-semibold text-slate-800 dark:text-slate-200">64열 × 60행 (3,840개 픽셀 셀)</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="text-slate-500 dark:text-slate-400">초당 프레임:</span>
                        <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{{ fps }} FPS</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="text-slate-500 dark:text-slate-400">프레임 렌더 소요:</span>
                        <span class="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{{ frameTimeMs }} ms</span>
                    </div>
                    <!-- 자동 순환 안내 카운트다운 -->
                    <div v-if="isAutoCycle && isPlaying" class="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-mono text-[11px]">
                        <span>다음 모드 전환까지:</span>
                        <span class="font-bold">{{ cycleCountdownSec }}초</span>
                    </div>
                </div>

                <div class="text-slate-400 dark:text-slate-500 text-[11px]">
                    ※ 타키온 캔버스 2D 네이티브 렌더러 기반 3,840개 셀 초고속 동시 갱신
                </div>

                <!-- 자동 순환 시 하단에서 부드럽게 차오르는 슬림 프로그레스 게이지 바 -->
                <div v-if="isAutoCycle && isPlaying" class="absolute bottom-0 left-0 h-[2px] bg-emerald-500/80 transition-all duration-100 ease-linear" :style="{width: `${cycleProgress}%`}"></div>
            </div>
        </template>

        <!-- 타키온 그리드 메인 영역 (64열 × 60행, 행 높이 16px 정밀 도트 매트릭스) -->
        <TachyonGrid
            ref="gridRef"
            :items="matrixItems"
            :row-height="16"
            :theme="themeStore.currentTheme"
            class="w-full h-full text-xs"
        >
            <TachyonColumn
                v-for="colIndex in TOTAL_COLS"
                :key="`c${colIndex - 1}`"
                :data-field="`c${colIndex - 1}`"
                :header-text="`${colIndex}`"
                :width="16"
                :item-renderer="CanvasPixelRenderer"
            />
        </TachyonGrid>
    </DemoContainer>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref, shallowRef, useTemplateRef} from 'vue';
import {TachyonGrid, TachyonColumn} from 'tachyon.vue';
import DemoContainer from '@/components/common/DemoContainer.vue';
import {useThemeStore} from '@/stores/themeStore';
import {CanvasPixelRenderer} from '@/components/renderers/CanvasPixelRenderer';

const themeStore = useThemeStore();
const gridRef = useTemplateRef<any>('gridRef');

// 64열 × 60행 정밀 캔버스 매트릭스
const TOTAL_COLS = 64;
const TOTAL_ROWS = 60;

type MatrixMode = 'radar' | 'marquee' | 'wafer' | 'life';

const modes = [
    {id: 'radar' as MatrixMode, label: '🛰️ 360° 회전 레이더'},
    {id: 'marquee' as MatrixMode, label: '📺 LED 전광판 티커'},
    {id: 'wafer' as MatrixMode, label: '🌊 반도체 웨이퍼 파동'},
    {id: 'life' as MatrixMode, label: '🧬 생명 게임(Life Game)'}
];

const currentMode = ref<MatrixMode>('radar');
const isPlaying = ref(true);
const isAutoCycle = ref(true);
const marqueeText = ref('TACHYON CANVAS GRID 60 FPS ULTRA FAST 🚀');
const fps = ref(60);
const frameTimeMs = ref(0.1);
const detectedCount = ref(0);

// 자동 순환 타이머 상태 (7초 주기)
const CYCLE_INTERVAL_MS = 7000;
let lastModeSwitchTime = performance.now();
const cycleProgress = ref(0);
const cycleCountdownSec = ref(7);

// 60행 × 64열 픽셀 데이터 매트릭스
const matrixItems = shallowRef<Record<string, number>[]>([]);

// --------------------------------------------------------------------------
// 데이터 초기화
// --------------------------------------------------------------------------
function initMatrix(): Record<string, number>[] {
    const list: Record<string, number>[] = [];
    for (let r = 0; r < TOTAL_ROWS; r++) {
        const row: Record<string, number> = {id: r};
        for (let c = 0; c < TOTAL_COLS; c++) {
            row[`c${c}`] = 0;
        }
        list.push(row);
    }
    return list;
}

matrixItems.value = initMatrix();

// --------------------------------------------------------------------------
// 64×60 맞춤 레이더 타깃 블립 (Target Blips) 정의
// --------------------------------------------------------------------------
interface TargetBlip {
    x: number;
    y: number;
    angle: number;
    lastDetected: number;
    color: number;
    name: string;
}

const CENTER_X = TOTAL_COLS / 2; // 32
const CENTER_Y = TOTAL_ROWS / 2; // 30
const MAX_RADAR_RADIUS = 28.0;

const targetBlips: TargetBlip[] = [
    {x: 20, y: 16, angle: 0, lastDetected: 0, color: 4, name: 'TGT-ALPHA'},
    {x: 44, y: 18, angle: 0, lastDetected: 0, color: 4, name: 'TGT-BRAVO'},
    {x: 48, y: 38, angle: 0, lastDetected: 0, color: 3, name: 'TGT-CHARLIE'},
    {x: 38, y: 48, angle: 0, lastDetected: 0, color: 4, name: 'TGT-DELTA'},
    {x: 18, y: 42, angle: 0, lastDetected: 0, color: 3, name: 'TGT-ECHO'},
    {x: 15, y: 28, angle: 0, lastDetected: 0, color: 4, name: 'TGT-FOXTROT'},
    {x: 30, y: 8, angle: 0, lastDetected: 0, color: 4, name: 'TGT-GOLF'},
    {x: 46, y: 12, angle: 0, lastDetected: 0, color: 3, name: 'TGT-HOTEL'}
];

for (let i = 0; i < targetBlips.length; i++) {
    const t = targetBlips[i];
    let a = Math.atan2(t.y - CENTER_Y, t.x - CENTER_X);
    if (a < 0) {
        a += Math.PI * 2;
    }
    t.angle = a;
}

// --------------------------------------------------------------------------
// 60행 맞춤 오프스크린 캔버스 텍스트 비트맵 제너레이터 (크기 확대)
// --------------------------------------------------------------------------
let textBitmap: number[][] = [];
let scrollOffset = 0;

function generateTextBitmap(text: string): void {
    const offCanvas = document.createElement('canvas');
    const ctx = offCanvas.getContext('2d');
    if (!ctx) {
        return;
    }

    // 60행 매트릭스에 어울리도록 폰트 크기를 34px로 확대
    const fontSize = 34;
    ctx.font = `bold ${fontSize}px "Pretendard", "Segoe UI", sans-serif`;
    const textWidth = Math.ceil(ctx.measureText(text).width) + 30;
    const textHeight = 48;

    offCanvas.width = textWidth;
    offCanvas.height = textHeight;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, textWidth, textHeight);

    ctx.font = `bold ${fontSize}px "Pretendard", "Segoe UI", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 15, textHeight / 2);

    const imgData = ctx.getImageData(0, 0, textWidth, textHeight);
    const data = imgData.data;

    const bitmap: number[][] = [];
    for (let y = 0; y < textHeight; y++) {
        const row: number[] = [];
        for (let x = 0; x < textWidth; x++) {
            const idx = (y * textWidth + x) * 4;
            const brightness = data[idx];
            row.push(brightness > 120 ? 1 : 0);
        }
        bitmap.push(row);
    }

    textBitmap = bitmap;
    scrollOffset = 0;
}

function onTextChange(): void {
    generateTextBitmap(marqueeText.value || 'TACHYON');
}

// --------------------------------------------------------------------------
// 생명 게임 (Conway's Game of Life) 시뮬레이션
// --------------------------------------------------------------------------
let lifeGrid: number[][] = [];

function initLifeGrid(): void {
    lifeGrid = [];
    for (let r = 0; r < TOTAL_ROWS; r++) {
        const row: number[] = [];
        for (let c = 0; c < TOTAL_COLS; c++) {
            row.push(Math.random() < 0.22 ? 1 : 0);
        }
        lifeGrid.push(row);
    }
}

function stepLifeGrid(): void {
    const next: number[][] = [];
    for (let r = 0; r < TOTAL_ROWS; r++) {
        const nextRow: number[] = [];
        for (let c = 0; c < TOTAL_COLS; c++) {
            let neighbors = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) {
                        continue;
                    }
                    const nr = (r + dr + TOTAL_ROWS) % TOTAL_ROWS;
                    const nc = (c + dc + TOTAL_COLS) % TOTAL_COLS;
                    if (lifeGrid[nr][nc] > 0) {
                        neighbors++;
                    }
                }
            }

            const current = lifeGrid[r][c];
            if (current > 0) {
                if (neighbors === 2 || neighbors === 3) {
                    nextRow.push(Math.min(5, current + 1));
                } else {
                    nextRow.push(0);
                }
            } else {
                if (neighbors === 3) {
                    nextRow.push(1);
                } else {
                    nextRow.push(0);
                }
            }
        }
        next.push(nextRow);
    }
    lifeGrid = next;
}

// --------------------------------------------------------------------------
// 모드 전환 및 제어
// --------------------------------------------------------------------------
function switchMode(mode: MatrixMode): void {
    currentMode.value = mode;
    if (mode === 'marquee') {
        generateTextBitmap(marqueeText.value);
    } else if (mode === 'life') {
        initLifeGrid();
    }
}

function selectManualMode(mode: MatrixMode): void {
    switchMode(mode);
    lastModeSwitchTime = performance.now();
    cycleProgress.value = 0;
    cycleCountdownSec.value = 7;
}

function togglePlay(): void {
    isPlaying.value = !isPlaying.value;
}

function toggleAutoCycle(): void {
    isAutoCycle.value = !isAutoCycle.value;
    lastModeSwitchTime = performance.now();
    cycleProgress.value = 0;
    cycleCountdownSec.value = 7;
}

// --------------------------------------------------------------------------
// 실시간 렌더링 애니메이션 루프
// --------------------------------------------------------------------------
let animFrameId: number | null = null;
let lastFpsUpdate = performance.now();
let framesThisSecond = 0;
let tickCount = 0;

function renderFrame(now: number): void {
    if (!isPlaying.value) {
        animFrameId = requestAnimationFrame(renderFrame);
        return;
    }

    const start = performance.now();
    framesThisSecond++;
    tickCount++;

    // 1. 자동 순환(Auto-Cycle) 타이머 및 모드 전환 로직
    if (isAutoCycle.value) {
        const elapsed = now - lastModeSwitchTime;
        cycleProgress.value = Math.min(100, (elapsed / CYCLE_INTERVAL_MS) * 100);
        cycleCountdownSec.value = Math.max(1, Math.ceil((CYCLE_INTERVAL_MS - elapsed) / 1000));

        if (elapsed >= CYCLE_INTERVAL_MS) {
            const currentIndex = modes.findIndex((m) => m.id === currentMode.value);
            const nextIndex = (currentIndex + 1) % modes.length;
            switchMode(modes[nextIndex].id);
            lastModeSwitchTime = now;
            cycleProgress.value = 0;
            cycleCountdownSec.value = 7;
        }
    }

    // 2. FPS 계산 (0.5초마다 갱신)
    if (now - lastFpsUpdate >= 500) {
        fps.value = Math.min(60, Math.round((framesThisSecond * 1000) / (now - lastFpsUpdate)));
        framesThisSecond = 0;
        lastFpsUpdate = now;
    }

    const items = matrixItems.value;

    // ======================================================================
    // 모드 1: 360° 회전 레이더 스캐너 (64×60 맞춤)
    // ======================================================================
    if (currentMode.value === 'radar') {
        const sweepAngle = (tickCount * 0.04) % (Math.PI * 2);

        let activeDetected = 0;
        for (let i = 0; i < targetBlips.length; i++) {
            const blip = targetBlips[i];
            let diff = sweepAngle - blip.angle;
            if (diff < 0) {
                diff += Math.PI * 2;
            }
            if (diff < 0.08) {
                blip.lastDetected = now;
            }
            if (now - blip.lastDetected < 1600) {
                activeDetected++;
            }
        }
        detectedCount.value = activeDetected;

        for (let r = 0; r < TOTAL_ROWS; r++) {
            const row = items[r];
            const dy = r - CENTER_Y;

            for (let c = 0; c < TOTAL_COLS; c++) {
                const dx = c - CENTER_X;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > MAX_RADAR_RADIUS) {
                    row[`c${c}`] = 0;
                    continue;
                }

                // 외곽 원형 바운더리
                if (Math.abs(dist - MAX_RADAR_RADIUS) < 0.75) {
                    row[`c${c}`] = 2;
                    continue;
                }

                // 동심원 거리 링 (7칸, 14칸, 21칸)
                if (Math.abs(dist - 7) < 0.55 || Math.abs(dist - 14) < 0.55 || Math.abs(dist - 21) < 0.55) {
                    row[`c${c}`] = 1;
                    continue;
                }

                // 십자선 (Crosshairs)
                if ((c === CENTER_X || r === CENTER_Y) && dist < MAX_RADAR_RADIUS) {
                    row[`c${c}`] = 1;
                    continue;
                }

                // 타깃 블립 검사
                let isBlip = false;
                for (let i = 0; i < targetBlips.length; i++) {
                    const blip = targetBlips[i];
                    const bDist = Math.hypot(c - blip.x, r - blip.y);
                    if (bDist <= 1.25) {
                        const elapsed = now - blip.lastDetected;
                        if (elapsed < 1600) {
                            row[`c${c}`] = blip.color;
                            isBlip = true;
                            break;
                        }
                    }
                }
                if (isBlip) {
                    continue;
                }

                // 스위프 빔 & 잔상 꼬리
                let cellAngle = Math.atan2(dy, dx);
                if (cellAngle < 0) {
                    cellAngle += Math.PI * 2;
                }

                let angleDiff = sweepAngle - cellAngle;
                if (angleDiff < 0) {
                    angleDiff += Math.PI * 2;
                }

                if (angleDiff < 0.07) {
                    row[`c${c}`] = 2;
                } else if (angleDiff < 0.75) {
                    const fade = 1 - angleDiff / 0.75;
                    if (Math.random() < fade * 0.9) {
                        row[`c${c}`] = fade > 0.5 ? 2 : 1;
                    } else {
                        row[`c${c}`] = 0;
                    }
                } else {
                    row[`c${c}`] = 0;
                }
            }
        }
    }
    // ======================================================================
    // 모드 2: LED 전광판 티커 (64×60 맞춤)
    // ======================================================================
    else if (currentMode.value === 'marquee') {
        if (textBitmap.length > 0) {
            const bmpHeight = textBitmap.length;
            const bmpWidth = textBitmap[0].length;
            const yOffset = Math.floor((TOTAL_ROWS - bmpHeight) / 2);

            if (tickCount % 2 === 0) {
                scrollOffset = (scrollOffset + 1) % (bmpWidth + TOTAL_COLS);
            }

            for (let r = 0; r < TOTAL_ROWS; r++) {
                const row = items[r];
                const bmpY = r - yOffset;

                for (let c = 0; c < TOTAL_COLS; c++) {
                    const bmpX = scrollOffset + c - TOTAL_COLS;
                    if (bmpY >= 0 && bmpY < bmpHeight && bmpX >= 0 && bmpX < bmpWidth) {
                        const pixel = textBitmap[bmpY][bmpX];
                        row[`c${c}`] = pixel ? (r % 3 === 0 ? 1 : r % 3 === 1 ? 2 : 5) : 0;
                    } else {
                        row[`c${c}`] = 0;
                    }
                }
            }
        }
    }
    // ======================================================================
    // 모드 3: 반도체 웨이퍼 파동 (64×60 맞춤)
    // ======================================================================
    else if (currentMode.value === 'wafer') {
        const timeScale = tickCount * 0.12;

        for (let r = 0; r < TOTAL_ROWS; r++) {
            const row = items[r];
            for (let c = 0; c < TOTAL_COLS; c++) {
                const dist = Math.sqrt((c - CENTER_X) * (c - CENTER_X) + (r - CENTER_Y) * (r - CENTER_Y));
                const wave = Math.sin(dist * 0.35 - timeScale);
                if (wave > 0.55) {
                    row[`c${c}`] = 2; // 네온 시안
                } else if (wave > 0.15) {
                    row[`c${c}`] = 1; // 네온 에메랄드
                } else if (wave > -0.25) {
                    row[`c${c}`] = 3; // 앰버
                } else {
                    row[`c${c}`] = 0;
                }
            }
        }
    }
    // ======================================================================
    // 모드 4: 생명 게임 (64×60 맞춤)
    // ======================================================================
    else if (currentMode.value === 'life') {
        if (tickCount % 4 === 0) {
            stepLifeGrid();
        }
        for (let r = 0; r < TOTAL_ROWS; r++) {
            const row = items[r];
            for (let c = 0; c < TOTAL_COLS; c++) {
                row[`c${c}`] = lifeGrid[r][c];
            }
        }
    }

    // 타키온 그리드 캔버스 재렌더링
    if (gridRef.value?.nativeInstance) {
        gridRef.value.nativeInstance.invalidate();
        gridRef.value.nativeInstance.flush();
    }

    const end = performance.now();
    frameTimeMs.value = Number((end - start).toFixed(2));

    animFrameId = requestAnimationFrame(renderFrame);
}

onMounted(() => {
    generateTextBitmap(marqueeText.value);
    lastModeSwitchTime = performance.now();
    animFrameId = requestAnimationFrame(renderFrame);
});

onUnmounted(() => {
    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
});
</script>
