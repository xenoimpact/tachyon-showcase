<template>
    <div class="tachyon-checkbox">
        <label class="c-checkbox theme--single" :class="checkClass">
            <input ref="checkRef" type="checkbox" :checked="checked" :disabled="disabled" @change="onChange" />
            <span></span>
        </label>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, inject, ref, toRaw, triggerRef} from 'vue';
import {CheckColumnSymbol} from '../columns/TachyonCheckColumn';

export default defineComponent({
    name: 'TachyonCheckItemRenderer',
    props: {
        initState: {
            type: Object
        }
    },
    setup(props) {
        const provider = inject(CheckColumnSymbol);

        const checkRef = ref();
        const state = ref(props.initState);
        const disabled = ref(provider.disabled);
        const checked = computed(() => provider.hasItem(state.value.item));
        const checkClass = computed(() => {
            return {'status--half': false /*checkState.toLowerCase() === 'half'*/};
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
                provider.addItem(state.value.item);
            } else {
                provider.removeItem(state.value.item);
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
