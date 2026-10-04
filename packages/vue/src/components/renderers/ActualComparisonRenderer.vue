<template>
    <div class="actual-cell-wrapper" :style="cellDisplay.wrapperStyle">
        <div class="actual-content">
            <!-- 메인 실적액 수치 -->
            <span class="actual-value font-mono font-semibold">{{ cellDisplay.actualText }}</span>
            <!-- 목표 대비 차액 (Gap) 배지 -->
            <span class="gap-pill" :class="cellDisplay.pillClass">
                {{ cellDisplay.gapText }}
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref, toRaw, triggerRef} from 'vue';
import {numToStr} from '@tachyon-showcase/shared';

/**
 * 차액 절대값을 억/만 단위 친화적인 한글 문자열로 포맷팅합니다.
 */
function formatDiffAmount(diffAbs: number): string {
    if (diffAbs >= 100_000_000) {
        return `${(diffAbs / 100_000_000).toFixed(1)}억`;
    }
    if (diffAbs >= 10_000) {
        return `${Math.round(diffAbs / 10_000)}만`;
    }
    return `${diffAbs}`;
}

/**
 * 연간 실적액 및 목표 대비 초과/미달 차액(Gap)을 조건부 배경 틴트와 함께 시각화하는 인셀 렌더러
 */
export default defineComponent({
    name: 'ActualComparisonRenderer',
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

        const cellDisplay = computed(() => {
            const item = state.value?.item;
            const actual = Number(item?.actual) || 0;
            const target = Number(item?.target) || 0;
            const diff = actual - target;
            const amountText = formatDiffAmount(Math.abs(diff));

            if (diff > 0) {
                return {
                    actualText: numToStr(actual, '0,0'),
                    gapText: `+${amountText} ▲`,
                    pillClass:
                        'text-[#059669] bg-[#ecfdf5] border-[#a7f3d0] dark:text-[#6ee7b7] dark:bg-emerald-950/50 dark:border-emerald-800',
                    wrapperStyle: {backgroundColor: 'rgba(16, 185, 129, 0.03)'}
                };
            }
            if (diff < 0) {
                const isUnder80 = target > 0 && actual / target < 0.8;
                return {
                    actualText: numToStr(actual, '0,0'),
                    gapText: `-${amountText} ▼`,
                    pillClass:
                        'text-[#e11d48] bg-[#fff1f2] border-[#fecdd3] dark:text-[#fda4af] dark:bg-rose-950/50 dark:border-rose-800',
                    wrapperStyle: {backgroundColor: isUnder80 ? 'rgba(244, 63, 94, 0.03)' : 'transparent'}
                };
            }
            return {
                actualText: numToStr(actual, '0,0'),
                gapText: '0 (달성)',
                pillClass:
                    'text-[#475569] bg-[#f8fafc] border-[#e2e8f0] dark:text-[#cbd5e1] dark:bg-slate-800 dark:border-slate-700',
                wrapperStyle: {backgroundColor: 'transparent'}
            };
        });

        return {
            state,
            cellDisplay,
            setState
        };
    },
    prepare(state: any): void {
        this.setState(state);
    }
});
</script>

<style scoped>
.actual-cell-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    height: 100%;
    padding: 0 8px;
    transition: background-color 0.2s ease;
}

.actual-content {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 3px;
}

.actual-value {
    font-size: 12px;
    line-height: 1.1;
    color: currentColor;
}

.gap-pill {
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-weight: 600;
    line-height: 1.1;
    border-width: 1px;
    border-style: solid;
}
</style>
