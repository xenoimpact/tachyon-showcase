<template>
    <div class="progress-cell-wrapper" :style="{backgroundColor: colorConfig.bgTint}">
        <div class="progress-bar-container">
            <!-- 수치 라벨 및 상태 -->
            <div class="progress-text-row">
                <span class="progress-rate-text" :class="colorConfig.textColor">
                    {{ rateText }}
                </span>
            </div>

            <!-- 프로그레스 게이지 트랙 & 바 -->
            <div class="progress-track">
                <div class="progress-fill" :class="colorConfig.barClass" :style="{width: `${fillPercent}%`}" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref, toRaw, triggerRef} from 'vue';

export default defineComponent({
    name: 'ProgressBarRenderer',
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

        const rateValue = computed<number>(() => {
            if (!state.value) {
                return 0;
            }
            if (state.value.value != null && !isNaN(Number(state.value.value))) {
                return Number(state.value.value);
            }
            const field = state.value.column?.dataField || 'achievementRate';
            const rawVal = state.value.item?.[field];
            return rawVal != null && !isNaN(Number(rawVal)) ? Number(rawVal) : 0;
        });

        const rateText = computed<string>(() => {
            return `${Math.round(rateValue.value)}%`;
        });

        // 게이지 바 채움 비율 (최대 100%로 클램핑하여 시각적 안정성 유지)
        const fillPercent = computed<number>(() => {
            return Math.min(100, Math.max(0, rateValue.value));
        });

        // 달성률 구간별 색상 테마 (WCAG AA 4.5:1 준수: 라이트 -700 / 다크 -300)
        const colorConfig = computed(() => {
            const val = rateValue.value;
            if (val >= 100) {
                return {
                    textColor: 'text-[#047857] dark:text-[#6ee7b7] font-bold',
                    barClass: 'bg-gradient-to-r from-emerald-600 to-teal-500',
                    bgTint: 'rgba(16, 185, 129, 0.05)'
                };
            }
            if (val >= 80) {
                return {
                    textColor: 'text-[#0369a1] dark:text-[#7dd3fc] font-bold',
                    barClass: 'bg-gradient-to-r from-blue-600 to-sky-500',
                    bgTint: 'rgba(37, 99, 235, 0.03)'
                };
            }
            if (val >= 60) {
                return {
                    textColor: 'text-[#b45309] dark:text-[#fcd34d] font-bold',
                    barClass: 'bg-gradient-to-r from-amber-600 to-yellow-500',
                    bgTint: 'rgba(245, 158, 11, 0.04)'
                };
            }
            return {
                textColor: 'text-[#be123c] dark:text-[#fda4af] font-bold',
                barClass: 'bg-gradient-to-r from-rose-600 to-red-500',
                bgTint: 'rgba(244, 63, 94, 0.05)'
            };
        });

        return {
            state,
            rateValue,
            rateText,
            fillPercent,
            colorConfig,
            setState
        };
    },
    prepare(state: any): void {
        this.setState(state);
    }
});
</script>

<style scoped>
.progress-cell-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0 12px;
}

.progress-bar-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 4px;
}

.progress-text-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.progress-rate-text {
    font-size: 11px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    line-height: 1;
}

.progress-track {
    width: 100%;
    height: 6px;
    background-color: rgba(148, 163, 184, 0.2);
    border-radius: 9999px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 9999px;
    transition: width 0.3s ease;
}
</style>
