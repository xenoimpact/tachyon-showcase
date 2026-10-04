import {DataGrid, DataGridSymbol, defaultColumnProps, GridColumn, GridStyles, TachyonColumn} from 'tachyon.vue';
import {defineComponent, inject, InjectionKey, PropType, provide, Ref, useModel, watch, toRaw} from 'vue';
import TachyonCheckHeaderRenderer from '../renderers/TachyonCheckHeaderRenderer.vue';
import TachyonCheckItemRenderer from '../renderers/TachyonCheckItemRenderer.vue';

export declare type DataItem = Record<string, any>;

export const CheckColumnSymbol: InjectionKey<{
    grid: DataGrid;
    column: GridColumn;
    disabled: boolean;
    readonly items: Ref<Array<object>>;
    hasItem: (item: DataItem) => boolean;
    addItem: (item: DataItem) => boolean;
    addItems: (items: DataItem[]) => void;
    removeItem: (item: DataItem) => boolean;
    clear: () => void;
}> = Symbol.for('CheckColumnInstance');

export default defineComponent({
    name: 'TachyonCheckColumn',
    props: {
        ...defaultColumnProps,
        modelValue: {
            type: Array as PropType<Array<DataItem>>
        },
        headerRenderer: {
            type: Object,
            default: TachyonCheckHeaderRenderer
        },
        itemRenderer: {
            type: Object,
            default: TachyonCheckItemRenderer
        },
        trueAs: {
            type: [String, Boolean],
            default: true
        },
        falseAs: {
            type: [String, Boolean],
            default: false
        },
        sortable: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        styles: {
            type: Object as PropType<GridStyles>,
            default: () => {
                return {
                    textAlign: 'center'
                };
            }
        },
        editable: {
            type: Boolean,
            default: false,
            validator: (value) => value === false
        }
    },
    setup(props, context) {
        const result = (TachyonColumn.setup as any)(props, context);
        const {nativeInstance: column} = result;
        const grid = inject(DataGridSymbol).grid as DataGrid;
        const model = useModel(props, 'modelValue');

        watch(
            model,
            (value) => {
                grid.invalidate();
            },
            {deep: true}
        );

        function hasItem(item: DataItem): boolean {
            const raw = toRaw(item);
            return model.value.some((i) => toRaw(i) === raw);
        }

        function addItem(item: DataItem): boolean {
            if (internalAddItem(item)) {
                grid.invalidate();
                //$emit('item-add', item);
                //emitItemsChange();
                return true;
            }
            return false;
        }

        function addItems(items: Array<DataItem>) {
            if (items) {
                items?.forEach((item) => internalAddItem(item));
                grid.invalidate();
            }
        }

        function removeItem(item: DataItem): boolean {
            if (internalRemoveItem(item)) {
                grid.invalidate();
                //this.$emit('item-remove', item);
                //this.emitItemsChange();
                return true;
            }
            return false;
        }

        function internalAddItem(item: DataItem): boolean {
            if (!hasItem(item)) {
                model.value.push(item);
                updateItemValue(item, true);
                return true;
            }
            return false;
        }

        function internalRemoveItem(item: DataItem): boolean {
            const raw = toRaw(item);
            const index = model.value.findIndex((o) => toRaw(o) === raw);
            if (index >= 0) {
                model.value.splice(index, 1);
                updateItemValue(item, false);
                return true;
            }
            return false;
        }

        function updateItemValue(item: DataItem, flag: boolean) {
            if (props.dataField) {
                grid.collection.setItemValue(item, props.dataField, flag ? props.trueAs : props.falseAs);
            }
        }

        /**
         * 선택된 목록 삭제
         */
        function clear() {
            if (model.value?.length > 0) {
                model.value.slice(0).forEach((item) => internalRemoveItem(item));
                grid.invalidate();
            }
        }

        grid.addEventListener(
            'collection-change',
            (event: any) => {
                const {collection, kind, items} = event.detail;
                if (kind === 'reset') {
                    //this.initCache();
                    model.value = collection
                        .toArray()
                        .filter((item: DataItem) => column.itemToValue(item) === props.trueAs);
                } else if (kind === 'update') {
                    const {property, newValue, source: item} = items[0];
                    if (props.trueAs === newValue) {
                        internalAddItem(item);
                    } else {
                        internalRemoveItem(item);
                    }
                } else if (kind === 'remove') {
                    items.forEach((item: DataItem) => {
                        internalRemoveItem(item);
                    });
                }
            },
            false
        );

        provide(CheckColumnSymbol, {
            grid: grid,
            column: column,
            disabled: props.disabled,
            get items() {
                return model;
            },
            hasItem,
            addItem,
            addItems,
            removeItem,
            clear
        });

        return {
            ...result,
            getItems() {
                return model.value;
            },
            hasItem,
            addItem,
            addItems,
            removeItem,
            clear
        };
    }
});
