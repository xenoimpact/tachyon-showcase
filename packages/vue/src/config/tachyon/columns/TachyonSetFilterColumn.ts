import {DataGridSymbol, TachyonColumn, defaultColumnProps, type DataGrid, type GridColumn} from 'tachyon.vue';
import {defineComponent, inject, provide, type InjectionKey, type PropType} from 'vue';
import FilterSetHeaderRenderer from '../renderers/FilterSetHeaderRenderer.vue';

/** 값 목록 필터 헤더 렌더러와 팝업에 전달하는 컬럼 컨텍스트입니다. */
export interface SetFilterColumnContext {
    grid: DataGrid;
    column: GridColumn;
}

export const SetFilterColumnSymbol: InjectionKey<SetFilterColumnContext> = Symbol('SetFilterColumn');

/**
 * 엑셀처럼 체크박스 값 목록으로 데이터를 걸러내는 Tachyon 컬럼 컴포넌트입니다.
 * 필터 상태는 타키온 필터 인스턴스(column.filterInstance)가 단독으로 보관합니다.
 */
export default defineComponent({
    name: 'TachyonSetFilterColumn',
    props: {
        /** 라이브러리 기본 프롭스 전개 */
        ...defaultColumnProps,
        /** 필터 헤더 렌더러 */
        headerRenderer: {
            type: Object,
            default: FilterSetHeaderRenderer
        },
        /** 타키온 필터 타입 (값 목록) */
        filter: {
            type: Object,
            default: () => ({type: 'set'})
        },
        /** 텍스트 정렬 방식 */
        textAlign: {
            type: String as PropType<'left' | 'center' | 'right'>,
            default: 'center'
        }
    },
    setup(props, context) {
        /** 태키온 라이브러리 엔진의 setup 로직을 실행하여 컬럼 인스턴스를 생성합니다. */
        const result = (TachyonColumn.setup as any)(props, context);
        const {nativeInstance: column} = result;
        const {grid} = inject(DataGridSymbol);

        /** 컬럼 인스턴스에 정렬 스타일을 적용합니다. */
        column.styles = {
            textAlign: props.textAlign
        };

        provide(SetFilterColumnSymbol, {grid, column});

        return {
            ...result
        };
    }
});
