<template>
    <div class="status-badge-wrapper">
        <span class="status-badge" :class="badgeClass">
            <span class="status-dot"></span>
            {{ text }}
        </span>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref, toRaw, triggerRef} from 'vue';

/**
 * 타키온 그리드용 상태 배지 셀 아이템 렌더러입니다.
 * 타키온의 가상화 스크롤 재사용 사이클(prepare)을 지원합니다.
 */
export default defineComponent({
    name: 'StatusBadgeRenderer',
    props: {
        initState: {
            type: Object
        }
    },
    setup(props) {
        const state = ref(props.initState);

        /**
         * 타키온 엔진에서 셀을 재사용할 때 호출하는 prepare에 의해 갱신됩니다.
         */
        function setState(newState: Record<string, any>): void {
            if (toRaw(state.value) !== newState) {
                state.value = newState;
            } else {
                triggerRef(state);
            }
        }

        const text = computed(() => {
            if (!state.value) {
                return '';
            }
            if (state.value.text != null && state.value.text !== '') {
                return state.value.text;
            }
            const field = state.value.column?.dataField;
            if (field && state.value.item) {
                return state.value.item[field] ?? '';
            }
            return '';
        });

        const badgeClass = computed(() => {
            const val = text.value;
            switch (val) {
                case '완료': {
                    return 'badge--success';
                }
                case '진행중': {
                    return 'badge--primary';
                }
                case '검수중': {
                    return 'badge--warning';
                }
                case '대기': {
                    return 'badge--neutral';
                }
                case '취소': {
                    return 'badge--danger';
                }
                default: {
                    return 'badge--neutral';
                }
            }
        });

        return {
            state,
            text,
            badgeClass,
            setState
        };
    },
    /**
     * 타키온 코어 엔진이 렌더링 시점에 직접 호출하는 라이프사이클 메서드입니다.
     */
    prepare(state: any): void {
        this.setState(state);
    }
});
</script>

<style scoped>
.status-badge-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.2;
    transition: all 0.2s ease;
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: currentColor;
}

/* 완료 (에메랄드/그린) */
.badge--success {
    background-color: #ecfdf5;
    color: #059669;
    border: 1px solid #a7f3d0;
}

/* 진행중 (블루/인디고) */
.badge--primary {
    background-color: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
}

/* 검수중 (앰버/오렌지) */
.badge--warning {
    background-color: #fffbeb;
    color: #d97706;
    border: 1px solid #fde68a;
}

/* 대기 (슬레이트/그레이) */
.badge--neutral {
    background-color: #f1f5f9;
    color: #475569;
    border: 1px solid #cbd5e1;
}

/* 취소 (로즈/레드) */
.badge--danger {
    background-color: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
}
</style>
