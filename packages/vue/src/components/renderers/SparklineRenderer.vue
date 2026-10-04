<template>
    <div class="sparkline-wrapper">
        <svg
            v-if="points.length > 0"
            class="sparkline-svg"
            :viewBox="`0 0 ${viewWidth} ${viewHeight}`"
            preserveAspectRatio="none"
        >
            <defs>
                <!-- 곡선 하단 은은한 그라데이션 필 -->
                <linearGradient :id="`sparkline-grad-${uid}`" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0" />
                </linearGradient>
            </defs>

            <!-- 면적 영역 패스 -->
            <path v-if="areaPath" :d="areaPath" :fill="`url(#sparkline-grad-${uid})`" />

            <!-- 추세 선 패스 -->
            <path
                v-if="linePath"
                :d="linePath"
                fill="none"
                stroke="#38bdf8"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <!-- 최저점 포인트 닷 (주황/적색) -->
            <circle
                v-if="minPoint"
                :cx="minPoint.x"
                :cy="minPoint.y"
                r="2.5"
                fill="#f43f5e"
                stroke="#ffffff"
                stroke-width="1"
            />

            <!-- 최고점 포인트 닷 (녹색) -->
            <circle
                v-if="maxPoint"
                :cx="maxPoint.x"
                :cy="maxPoint.y"
                r="2.5"
                fill="#10b981"
                stroke="#ffffff"
                stroke-width="1"
            />
        </svg>

        <!-- 데이터가 없을 때의 안전 대체 텍스트 -->
        <span v-else class="text-[11px] text-slate-400 font-mono">-</span>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref, toRaw, triggerRef} from 'vue';

let sparklineCounter = 0;

export default defineComponent({
    name: 'SparklineRenderer',
    props: {
        initState: {
            type: Object
        }
    },
    setup(props) {
        const state = ref(props.initState);
        const uid = ref(++sparklineCounter);
        const viewWidth = 180;
        const viewHeight = 32;
        const paddingY = 4;
        const paddingX = 6;

        function setState(newState: Record<string, any>): void {
            if (toRaw(state.value) !== newState) {
                state.value = newState;
            } else {
                triggerRef(state);
            }
        }

        const dataSeries = computed<number[]>(() => {
            if (!state.value) {
                return [];
            }
            const field = state.value.column?.dataField || 'monthlySales';
            const val = state.value.item?.[field] || state.value.value;
            if (Array.isArray(val)) {
                return val.map((v) => Number(v) || 0);
            }
            return [];
        });

        interface Point {
            x: number;
            y: number;
            val: number;
            index: number;
        }

        const points = computed<Point[]>(() => {
            const series = dataSeries.value;
            if (series.length < 2) {
                return [];
            }

            const min = Math.min(...series);
            const max = Math.max(...series);
            const range = max - min || 1;
            const drawWidth = viewWidth - paddingX * 2;
            const drawHeight = viewHeight - paddingY * 2;
            const step = drawWidth / (series.length - 1);

            return series.map((val, idx) => {
                const x = paddingX + idx * step;
                // SVG 좌표계는 아래로 갈수록 y가 커지므로 반전
                const y = paddingY + drawHeight - ((val - min) / range) * drawHeight;
                return {x, y, val, index: idx};
            });
        });

        // 스무스 라인 패스 생성
        const linePath = computed<string>(() => {
            const pts = points.value;
            if (pts.length < 2) {
                return '';
            }

            let path = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
            for (let i = 1; i < pts.length; i++) {
                path += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
            }
            return path;
        });

        // 하단 면적 그라데이션 패스 생성
        const areaPath = computed<string>(() => {
            const pts = points.value;
            if (pts.length < 2) {
                return '';
            }
            const first = pts[0];
            const last = pts[pts.length - 1];
            const bottom = viewHeight;

            let path = `M ${first.x.toFixed(1)} ${bottom} L ${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
            for (let i = 1; i < pts.length; i++) {
                path += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
            }
            path += ` L ${last.x.toFixed(1)} ${bottom} Z`;
            return path;
        });

        // 최고점 및 최저점 포인트
        const maxPoint = computed<Point | null>(() => {
            const pts = points.value;
            if (pts.length === 0) {
                return null;
            }
            return pts.reduce((max, p) => (p.val > max.val ? p : max), pts[0]);
        });

        const minPoint = computed<Point | null>(() => {
            const pts = points.value;
            if (pts.length === 0) {
                return null;
            }
            return pts.reduce((min, p) => (p.val < min.val ? p : min), pts[0]);
        });

        return {
            uid,
            viewWidth,
            viewHeight,
            points,
            linePath,
            areaPath,
            maxPoint,
            minPoint,
            setState
        };
    },
    prepare(state: any): void {
        this.setState(state);
    }
});
</script>

<style scoped>
.sparkline-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 2px 10px;
}

.sparkline-svg {
    width: 100%;
    height: 32px;
    overflow: visible;
}
</style>
