<template>
    <vx-popup ref="popupRef" close-on-outside-down>
        <div class="filter-popup">
            <input ref="searchInputRef" v-model="keyword" class="filter-popup__input" placeholder="검색어 입력" />

            <div class="filter-popup__list">
                <template v-if="!isNotFound">
                    <div class="filter-popup__list-header">
                        <label class="filter-popup__check">
                            <input
                                type="checkbox"
                                :checked="isAllChecked"
                                @change="selectAll(($event.target as HTMLInputElement).checked)"
                            />
                            <span>{{ debouncedKeyword ? '검색 결과 모두 선택' : '모두 선택' }}</span>
                        </label>
                        <label v-if="debouncedKeyword" class="filter-popup__check">
                            <input v-model="isIncludeSelected" type="checkbox" />
                            <span>현재 선택 내용에 추가</span>
                        </label>
                    </div>

                    <vx-list :items="displayItems" :row-count="Math.min(LIST_ROW_COUNT, displayItems.length || 1)">
                        <template #default="{item}">
                            <label class="filter-popup__check">
                                <input
                                    type="checkbox"
                                    :checked="selectedValues.has(item.value)"
                                    @change="selectItem(item, ($event.target as HTMLInputElement).checked)"
                                />
                                <span class="filter-popup__check-text" :title="item.label">
                                    {{ item.label }}<span class="filter-popup__count">({{ item.count }})</span>
                                </span>
                            </label>
                        </template>
                    </vx-list>
                </template>
                <div v-else class="filter-popup__empty">일치하는 항목이 없습니다.</div>
            </div>

            <div class="filter-popup__footer">
                <button type="button" class="filter-popup__button" @click="close()">취소</button>
                <button
                    type="button"
                    class="filter-popup__button filter-popup__button--primary"
                    :disabled="selectedValues.size === 0"
                    @click="applyFilter"
                >
                    적용
                </button>
            </div>
        </div>
    </vx-popup>
</template>

<script setup lang="ts">
import {computed, inject, ref, useTemplateRef, watch} from 'vue';
import {refDebounced} from '@vueuse/core';
import type {VxPopup} from 'vrix.vue';
import {SetFilterColumnSymbol} from '../columns/TachyonSetFilterColumn';

/** 필터 목록에 표시할 값과 건수입니다. */
interface FilterItem {
    label: string;
    value: string;
    count: number;
}

const LIST_ROW_COUNT = 8;
const EMPTY_LABEL = '(값 없음)';

defineOptions({
    name: 'FilterSetPopup'
});

const {grid, column} = inject(SetFilterColumnSymbol);

const popupRef = useTemplateRef<InstanceType<typeof VxPopup>>('popupRef');
const searchInputRef = useTemplateRef<HTMLInputElement>('searchInputRef');

const keyword = ref('');
const debouncedKeyword = refDebounced(keyword, 300);
const items = ref<FilterItem[]>([]);
const selectedValues = ref(new Set<string>());
const isIncludeSelected = ref(false);

const displayItems = computed(() => {
    const word = debouncedKeyword.value.toLowerCase();
    return word ? items.value.filter((item) => item.label.toLowerCase().includes(word)) : items.value;
});

const isAllChecked = computed(
    () => displayItems.value.length > 0 && displayItems.value.every((item) => selectedValues.value.has(item.value))
);

const isNotFound = computed(
    () => !!debouncedKeyword.value && displayItems.value.length === 0 && items.value.length > 0
);

/** 검색어가 바뀌면 검색 결과 전체를 선택하고, 검색어를 지우면 기존 필터 값으로 되돌립니다. */
watch(debouncedKeyword, (word) => {
    selectedValues.value = new Set(word ? displayItems.value.map((item) => item.value) : getAppliedValues());
    isIncludeSelected.value = false;
});

/**
 * 팝업을 엽니다. 팝업이 닫히면 완료되는 Promise를 반환합니다.
 */
function open(): Promise<void> {
    return new Promise((resolve) => {
        popupRef.value
            .open()
            .opened(() => {
                loadItems();
                searchInputRef.value?.focus();
            })
            .closed(() => {
                resolve();
                keyword.value = '';
                isIncludeSelected.value = false;
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
 * 선택한 값 목록으로 필터를 적용하고 팝업을 닫습니다.
 * 모든 값이 선택된 경우 빈 배열로 필터를 해제합니다.
 */
function applyFilter(): void {
    const filter = column.filterInstance;
    let result = selectedValues.value.size === items.value.length ? [] : Array.from(selectedValues.value);

    if (isIncludeSelected.value && filter.canCompare) {
        result = Array.from(new Set([...filter.getValues(), ...result]));
    }

    filter.setValues(result);
    filter.refresh();
    close();
}

/**
 * 다른 컬럼 필터를 통과한 행에서 고유 값과 건수를 모아 필터 목록을 만들고,
 * 현재 필터에 적용된 값을 선택 상태로 복원합니다.
 */
function loadItems(): void {
    const filter = column.filterInstance;
    const itemMap = new Map<string, FilterItem>();

    grid.collection?.forEach((row: Record<string, any>) => {
        if (!filter.compareOtherFilters(row)) {
            return;
        }
        const value = filter.itemToValue(row);
        const item = itemMap.get(value);
        if (item) {
            item.count++;
        } else {
            itemMap.set(value, {label: value === '' ? EMPTY_LABEL : value, value, count: 1});
        }
    });

    items.value = Array.from(itemMap.values()).sort((a, b) =>
        a.label.localeCompare(b.label, undefined, {numeric: true, sensitivity: 'base'})
    );
    selectedValues.value = new Set(getAppliedValues());
}

/**
 * 현재 컬럼 필터에 적용된 값 목록을 반환합니다. 필터가 없으면 전체 값을 반환합니다.
 */
function getAppliedValues(): string[] {
    const filter = column.filterInstance;
    return filter.canCompare ? filter.getValues() : filter.getPossibleValues();
}

/**
 * 개별 값의 선택 여부를 변경합니다.
 * @param item 대상 필터 항목
 * @param checked 선택 여부
 */
function selectItem(item: FilterItem, checked: boolean): void {
    if (checked) {
        selectedValues.value.add(item.value);
    } else {
        selectedValues.value.delete(item.value);
    }
}

/**
 * 현재 목록에 보이는 값을 모두 선택하거나 해제합니다.
 * @param checked 선택 여부
 */
function selectAll(checked: boolean): void {
    selectedValues.value = new Set(checked ? displayItems.value.map((item) => item.value) : []);
}

defineExpose({
    open,
    close
});
</script>
