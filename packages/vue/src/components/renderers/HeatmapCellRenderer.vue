<template>
    <div class="heatmap-cell-wrapper" :style="display.wrapperStyle">
        <span class="heatmap-badge" :class="display.badgeClass">
            <span class="w-1.5 h-1.5 rounded-full" :class="display.dotClass" />
            <span class="font-mono font-bold">{{ score }}</span>
            <span class="text-[10px] font-semibold">({{ display.label }})</span>
        </span>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref, toRaw, triggerRef} from 'vue';

export default defineComponent({
    name: 'HeatmapCellRenderer',
    props: {
        initState: {
            type: Object
        }
    },
    setup(props) {
        const state = ref(props.initState);

        function setState(newState: Record<string, any>): void {
            if (toRaw(state.value) !== newState) {
                state.value = newState;
            } else {
                triggerRef(state);
            }
        }

        const score = computed<number>(() => {
            if (!state.value) {
                return 0;
            }
            const field = state.value.column?.dataField || 'riskScore';
            const val = state.value.item?.[field] ?? state.value.value;
            const num = Number(val);
            return isNaN(num) ? 0 : Math.round(num);
        });

        // 점수 구간별 스타일 및 라벨 설정 (낮음 0~34: 안전, 보통 35~69: 보통, 높음 70~100: 위험)
        const display = computed(() => {
            const s = score.value;
            if (s >= 70) {
                return {
                    label: '위험',
                    dotClass: 'bg-rose-600 dark:bg-rose-400',
                    badgeClass:
                        'text-[#e11d48] bg-[#fff1f2] border-[#fecdd3] dark:text-[#fda4af] dark:bg-rose-950/60 dark:border-rose-800',
                    wrapperStyle: {backgroundColor: 'rgba(244, 63, 94, 0.05)'}
                };
            }
            if (s >= 35) {
                return {
                    label: '보통',
                    dotClass: 'bg-amber-600 dark:bg-amber-400',
                    badgeClass:
                        'text-[#d97706] bg-[#fffbeb] border-[#fde68a] dark:text-[#fcd34d] dark:bg-amber-950/60 dark:border-amber-800',
                    wrapperStyle: {backgroundColor: 'rgba(245, 158, 11, 0.04)'}
                };
            }
            return {
                label: '안전',
                dotClass: 'bg-emerald-600 dark:bg-emerald-400',
                badgeClass:
                    'text-[#059669] bg-[#ecfdf5] border-[#a7f3d0] dark:text-[#6ee7b7] dark:bg-emerald-950/60 dark:border-emerald-800',
                wrapperStyle: {backgroundColor: 'rgba(16, 185, 129, 0.04)'}
            };
        });

        return {
            state,
            score,
            display,
            setState
        };
    },
    prepare(state: any): void {
        this.setState(state);
    }
});
</script>

<style scoped>
.heatmap-cell-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 0 6px;
    transition: background-color 0.2s ease;
}

.heatmap-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 11px;
    border-width: 1px;
    border-style: solid;
    line-height: 1.2;
}
</style>
