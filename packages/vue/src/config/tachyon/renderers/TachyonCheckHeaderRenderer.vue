<template>
    <div class="tachyon-checkbox">
        <label class="c-checkbox theme--single" :class="checkClass">
            <input ref="checkRef" type="checkbox" :checked="checked" :disabled="disabled" @change="onChange" />
            <span></span>
        </label>
    </div>
</template>

<script lang="ts">
import {CheckColumnSymbol} from '../columns/TachyonCheckColumn';
import {computed, defineComponent, inject, ref, toRaw, triggerRef} from 'vue';

export default defineComponent({
    name: 'TachyonCheckHeaderRenderer',
    props: {
        initState: {
            type: Object
        }
    },
    setup(props) {
        const provider = inject(CheckColumnSymbol);
        const {grid, items} = provider;
        const checkRef = ref();
        const state = ref(props.initState);
        const disabled = ref(provider.disabled);
        const checked = computed(() => {
            /* prepare 호출 시 재계산을 보장하기 위해 state를 의존성으로 추가합니다. */
            void state.value;
            return grid.collection?.length > 0 && grid.collection?.length === items.value.length;
        });
        const checkClass = computed(() => {
            return {'status--half': items.value.length > 0 && grid.collection?.length > items.value.length};
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

        function onChange(_event: Event): void {
            if (checkRef.value.checked) {
                provider.addItems(grid.items);
            } else {
                provider.clear();
            }
        }

        return {
            checkRef,
            state,
            disabled,
            checked,
            checkClass,
            setState,
            onChange
        };
    },
    prepare(state): void {
        this.setState(state);
    }
});
</script>

<style scoped>
.tachyon-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
