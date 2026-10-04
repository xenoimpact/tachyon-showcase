<template>
    <div class="tree-item-wrapper">
        <!-- 인덴트 모드일 때 계층 레벨(Level)에 따른 들여쓰기 여백 -->
        <div v-if="indentStyle" class="tree-indent" :style="indentStyle" />

        <!-- 자식 노드가 있는 경우 펼침/접힘 토글 버튼 -->
        <button
            v-if="hasChildren"
            class="tree-toggle-btn"
            type="button"
            :title="isOpened ? '접기' : '펼치기'"
            @mousedown.prevent
            @click.stop="toggle"
        >
            <svg
                class="tree-toggle-icon"
                :class="{'tree-toggle-icon--opened': isOpened}"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fill-rule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clip-rule="evenodd"
                />
            </svg>
        </button>
        <span v-else class="tree-leaf-spacer" />

        <!-- 계층 구분별 시각 아이콘 -->
        <span class="tree-node-icon" :class="categoryIconClass">
            {{ categoryIcon }}
        </span>

        <!-- 노드 라벨 텍스트 -->
        <span class="tree-node-label" :class="labelClass">
            {{ label }}
        </span>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, inject, ref, toRaw, triggerRef} from 'vue';
import {GridColumnSymbol} from 'tachyon.vue';

/**
 * 타키온 트리 그리드 전용 인셀 노드 렌더러
 * TachyonCheckHeaderRenderer와 동일한 상태 동기화 아키텍처를 채택하여 가상 스크롤 및 노드 토글 시 완벽한 반응성을 보장합니다.
 */
export default defineComponent({
    name: 'TreeItemRenderer',
    props: {
        initState: {
            type: Object
        }
    },
    setup(props) {
        // 타키온 그리드 컬럼 프로바이더로부터 grid 인스턴스 주입
        const columnProvider = inject<any>(GridColumnSymbol, null);

        const state = ref(props.initState);

        /**
         * Tachyon 네이티브 그리드의 prepare 호출 시 상태를 갱신합니다.
         * proxy를 거치지 않고 ref에 직접 할당하여 반응성을 보장합니다.
         */
        function setState(newState: Record<string, any>): void {
            if (toRaw(state.value) !== newState) {
                state.value = newState;
            } else {
                triggerRef(state);
            }
        }

        const item = computed(() => {
            void state.value;
            return state.value?.item || {};
        });

        const label = computed(() => {
            void state.value;
            return state.value?.label ?? item.value?.name ?? '';
        });

        const category = computed(() => {
            void state.value;
            return item.value?.category || '';
        });

        const hasChildren = computed(() => {
            void state.value;
            if (state.value?.hasChildren != null) {
                return Boolean(state.value.hasChildren);
            }
            return Boolean(item.value?.children && item.value.children.length > 0);
        });

        const isOpened = computed(() => {
            void state.value;
            if (state.value?.isOpened != null) {
                return Boolean(state.value.isOpened);
            }
            const grid = columnProvider?.grid;
            if (grid?.isOpenNode && state.value?.item) {
                return Boolean(grid.isOpenNode(toRaw(state.value.item)));
            }
            return false;
        });

        const level = computed<number>(() => {
            void state.value;
            if (state.value?.level != null) {
                return Number(state.value.level) || 0;
            }
            const grid = columnProvider?.grid;
            if (grid?.getNodeLevel && state.value?.item) {
                return Number(grid.getNodeLevel(toRaw(state.value.item))) || 0;
            }
            return 0;
        });

        const isBoxMode = computed(() => {
            void state.value;
            const col = state.value?.column || columnProvider?.column;
            return Boolean(col?.boxMode || col?.parent?.boxMode);
        });

        const indentStyle = computed(() => {
            if (isBoxMode.value) {
                return null;
            }
            const col = state.value?.column || columnProvider?.column;
            const indent = col?.indent ?? 24;
            return {
                width: `${indent * level.value}px`
            };
        });

        const categoryIcon = computed(() => {
            if (category.value === '사업본부') {
                return '🏢';
            }
            if (category.value === '부서') {
                return '📁';
            }
            return '📋';
        });

        const categoryIconClass = computed(() => {
            if (category.value === '사업본부') {
                return 'text-blue-600 dark:text-sky-400';
            }
            if (category.value === '부서') {
                return 'text-amber-600 dark:text-amber-400';
            }
            return 'text-slate-500 dark:text-slate-400';
        });

        const labelClass = computed(() => {
            if (category.value === '사업본부') {
                return 'font-bold text-slate-900 dark:text-slate-100';
            }
            if (category.value === '부서') {
                return 'font-semibold text-slate-800 dark:text-slate-200';
            }
            return 'font-normal text-slate-700 dark:text-slate-300';
        });

        function toggle(): void {
            const grid = columnProvider?.grid;
            if (grid?.toggleNode && state.value?.item) {
                grid.toggleNode(toRaw(state.value.item));
            }
        }

        return {
            state,
            item,
            label,
            hasChildren,
            isOpened,
            indentStyle,
            categoryIcon,
            categoryIconClass,
            labelClass,
            toggle,
            setState
        };
    },
    prepare(state): void {
        this.setState(state);
    }
});
</script>

<style scoped>
.tree-item-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0 4px;
    user-select: none;
}

.tree-indent {
    display: inline-block;
    flex-shrink: 0;
}

.tree-toggle-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin-right: 2px;
    border-radius: 4px;
    background: transparent;
    border: none;
    color: currentColor;
    opacity: 0.7;
    cursor: pointer;
    flex-shrink: 0;
}

.tree-toggle-btn:hover {
    opacity: 1;
    background-color: rgba(100, 116, 139, 0.15);
}

.tree-toggle-icon {
    width: 14px;
    height: 14px;
}

.tree-toggle-icon--opened {
    transform: rotate(90deg);
}

.tree-leaf-spacer {
    width: 20px;
    height: 20px;
    margin-right: 2px;
    flex-shrink: 0;
}

.tree-node-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    margin-right: 6px;
    flex-shrink: 0;
}

.tree-node-label {
    font-size: 12px;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
