<template>
    <div class="yoy-cell-wrapper" :style="display.wrapperStyle">
        <span class="yoy-badge" :class="display.badgeClass">
            <span class="text-[10px] font-bold">{{ display.arrow }}</span>
            <span class="font-mono font-bold">{{ display.text }}</span>
        </span>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref, toRaw, triggerRef} from 'vue';

/**
 * 전년비 성장률(YoY)을 셀 전체 조건부 배경 틴트와 함께 렌더링하는 커스텀 인셀 렌더러
 */
export default defineComponent({
    name: 'YoYGrowthRenderer',
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

        const growthValue = computed<number>(() => {
            if (!state.value) {
                return 0;
            }
            const field = state.value.column?.dataField || 'yoyGrowth';
            const rawVal = state.value.item?.[field] ?? state.value.value;
            const num = Number(rawVal);
            return isNaN(num) ? 0 : num;
        });

        // 엑셀 조건부 서식 테마 (성장: 에메랄드, 역성장: 로즈, 보합: 뉴트럴)
        const display = computed(() => {
            const val = growthValue.value;
            if (val > 0) {
                return {
                    arrow: '▲',
                    text: `+${val.toFixed(1)}%`,
                    badgeClass:
                        'text-[#059669] bg-[#ecfdf5] border-[#a7f3d0] dark:text-[#6ee7b7] dark:bg-emerald-950/60 dark:border-emerald-800',
                    wrapperStyle: {backgroundColor: 'rgba(16, 185, 129, 0.04)'}
                };
            }
            if (val < 0) {
                return {
                    arrow: '▼',
                    text: `${val.toFixed(1)}%`,
                    badgeClass:
                        'text-[#e11d48] bg-[#fff1f2] border-[#fecdd3] dark:text-[#fda4af] dark:bg-rose-950/60 dark:border-rose-800',
                    wrapperStyle: {backgroundColor: 'rgba(244, 63, 94, 0.04)'}
                };
            }
            return {
                arrow: '—',
                text: '0.0%',
                badgeClass:
                    'text-[#475569] bg-[#f8fafc] border-[#e2e8f0] dark:text-[#cbd5e1] dark:bg-slate-800 dark:border-slate-700',
                wrapperStyle: {backgroundColor: 'transparent'}
            };
        });

        return {
            state,
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
.yoy-cell-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    height: 100%;
    padding: 0 8px;
    transition: background-color 0.2s ease;
}

.yoy-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
    border-width: 1px;
    border-style: solid;
    line-height: 1.2;
}
</style>
