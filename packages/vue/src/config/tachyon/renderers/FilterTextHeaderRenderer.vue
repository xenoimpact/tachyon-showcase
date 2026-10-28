<template>
    <div ref="rootRef" class="filter-header">
        <span class="filter-header__label" :title="state?.label">{{ state?.label }}</span>
        <span v-if="sortType === 'asc'" class="filter-header__sort" title="오름차순 정렬">↑</span>
        <span v-else-if="sortType === 'desc'" class="filter-header__sort" title="내림차순 정렬">↓</span>
        <button type="button" class="filter-header__button" :class="{'is-active': isFiltered}" title="문자열 조건 필터" @mousedown.prevent @click="togglePopup">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M2.5 3h11a.5.5 0 0 1 .39.81L9.5 9.3V13a.5.5 0 0 1-.28.45l-2 1A.5.5 0 0 1 6.5 14V9.3L2.11 3.81A.5.5 0 0 1 2.5 3z" />
            </svg>
        </button>
        <filter-text-popup ref="popupRef" :anchor="rootRef" anchor-align="left bottom" />
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, inject, onMounted, onUnmounted, ref, toRaw, triggerRef} from 'vue';
import {TextFilterColumnSymbol} from '../columns/TachyonTextFilterColumn';
import FilterTextPopup from './FilterTextPopup.vue';

/**
 * 문자열 조건(Text) 필터 컬럼의 헤더 렌더러입니다.
 * 헤더 라벨, 정렬 방향, 필터 버튼을 표시하고 조건 입력 팝업을 엽니다.
 */
export default defineComponent({
    name: 'FilterTextHeaderRenderer',
    components: {FilterTextPopup},
    props: {
        initState: {
            type: Object
        }
    },
    setup(props) {
        const provider = inject(TextFilterColumnSymbol);
        const rootRef = ref<HTMLElement>();
        const popupRef = ref<InstanceType<typeof FilterTextPopup>>();
        const state = ref(props.initState);
        const isOpened = ref(false);
        const isFiltered = ref(false);

        const sortType = computed(() => {
            const column = state.value?.column;
            if (!column || provider.grid.getSortColumns()?.indexOf(column) < 0) {
                return 'none';
            }
            return column.sortDescending ? 'desc' : 'asc';
        });

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

        /**
         * 타키온 필터 인스턴스의 적용 여부를 읽어 필터 버튼 강조 상태를 갱신합니다.
         */
        function syncFiltered(): void {
            isFiltered.value = !!provider.column.filterInstance?.canCompare;
        }

        /**
         * 문자열 조건 필터 팝업을 열거나 닫습니다.
         */
        function togglePopup(): void {
            if (isOpened.value) {
                popupRef.value.close();
                return;
            }
            isOpened.value = true;
            popupRef.value.open().then(() => {
                isOpened.value = false;
            });
        }

        onMounted(() => {
            provider.grid.addEventListener('collection-change', syncFiltered, false);
            syncFiltered();
        });

        onUnmounted(() => {
            provider.grid.removeEventListener('collection-change', syncFiltered, false);
        });

        return {
            rootRef,
            popupRef,
            state,
            isFiltered,
            sortType,
            setState,
            togglePopup
        };
    },
    prepare(state): void {
        this.setState(state);
    }
});
</script>
