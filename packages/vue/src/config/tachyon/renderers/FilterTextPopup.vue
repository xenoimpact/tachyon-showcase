<template>
    <vx-popup ref="popupRef" close-on-outside-down>
        <div class="filter-popup">
            <div class="filter-popup__field">
                <span class="filter-popup__title">조건</span>
                <vx-combobox v-model="operator" class="filter-popup__select" :items="OPERATOR_OPTIONS" label-field="label" value-field="value" require-selection />
                <input ref="keywordInputRef" v-model="keyword" class="filter-popup__input" placeholder="검색할 문자 입력" @keydown.enter="onKeyDownEnter" />
            </div>

            <div class="filter-popup__footer filter-popup__footer--between">
                <button type="button" class="filter-popup__button filter-popup__button--link" @click="clearFilter">필터 해제</button>
                <div class="filter-popup__actions">
                    <button type="button" class="filter-popup__button" @click="close()">취소</button>
                    <button type="button" class="filter-popup__button filter-popup__button--primary" @click="applyFilter">적용</button>
                </div>
            </div>
        </div>
    </vx-popup>
</template>

<script setup lang="ts">
import {inject, ref, useTemplateRef} from 'vue';
import type {VxPopup} from 'vrix.vue';
import {TextFilterColumnSymbol, type TextFilterOperator} from '../columns/TachyonTextFilterColumn';

const OPERATOR_OPTIONS: {label: string; value: TextFilterOperator}[] = [
    {label: '포함', value: 'contains'},
    {label: '포함하지 않음', value: 'notContains'},
    {label: '시작 문자', value: 'startsWith'},
    {label: '끝 문자', value: 'endsWith'},
    {label: '전체 일치', value: 'equals'}
];

defineOptions({
    name: 'FilterTextPopup'
});

const {column} = inject(TextFilterColumnSymbol);

const popupRef = useTemplateRef<InstanceType<typeof VxPopup>>('popupRef');
const keywordInputRef = useTemplateRef<HTMLInputElement>('keywordInputRef');

const operator = ref<TextFilterOperator>('contains');
const keyword = ref('');

/**
 * 현재 필터 검색어로 입력 상태를 복원한 뒤 팝업을 엽니다. 팝업이 닫히면 완료되는 Promise를 반환합니다.
 * 타키온 필터는 연산자를 비교 함수로 보관하므로, 연산자는 마지막으로 고른 값을 팝업이 기억합니다.
 */
function open(): Promise<void> {
    const filter = column.filterInstance;
    keyword.value = filter.canCompare ? filter.getValues()[0] : '';

    return new Promise(resolve => {
        popupRef.value
            .open()
            .opened(() => {
                keywordInputRef.value?.focus();
            })
            .closed(() => {
                resolve();
            });
    });
}

/**
 * 팝업을 닫습니다.
 */
function close(): void {
    popupRef.value?.close();
}

/**
 * 입력한 조건으로 필터를 적용하고 팝업을 닫습니다. 검색어가 비어 있으면 필터를 해제합니다.
 */
function applyFilter(): void {
    const filter = column.filterInstance;
    const text = keyword.value.trim();
    filter.setConditions(text ? [operator.value] : null);
    filter.setValues(text ? [text] : null);
    filter.refresh();
    close();
}

/**
 * 필터를 해제하고 팝업을 닫습니다.
 */
function clearFilter(): void {
    keyword.value = '';
    applyFilter();
}

/**
 * 검색어 입력창에서 Enter 키를 누르면 필터를 적용합니다.
 * @param e 키보드 이벤트 객체
 */
function onKeyDownEnter(e: KeyboardEvent): void {
    if (e.isComposing) {
        return;
    }
    applyFilter();
}

defineExpose({
    open,
    close
});
</script>
