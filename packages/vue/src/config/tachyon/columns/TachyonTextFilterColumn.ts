import {DataGridSymbol, TachyonColumn, defaultColumnProps, type DataGrid, type GridColumn} from 'tachyon.vue';
import {defineComponent, inject, provide, type InjectionKey, type PropType} from 'vue';
import FilterTextHeaderRenderer from '../renderers/FilterTextHeaderRenderer.vue';

/** 타키온 문자열 필터가 지원하는 비교 연산자입니다. */
export type TextFilterOperator = 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'equals';

/** 문자열 조건 필터 헤더 렌더러와 팝업에 전달하는 컬럼 컨텍스트입니다. */
export interface TextFilterColumnContext {
    grid: DataGrid;
    column: GridColumn;
}

export const TextFilterColumnSymbol: InjectionKey<TextFilterColumnContext> = Symbol('TextFilterColumn');

/**
 * 포함/미포함/시작 문자/끝 문자/전체 일치 조건으로 데이터를 걸러내는 Tachyon 컬럼 컴포넌트입니다.
 * 필터 상태는 타키온 필터 인스턴스(column.filterInstance)가 단독으로 보관합니다.
 */
export default defineComponent({
    name: 'TachyonTextFilterColumn',
    props: {
        /** 라이브러리 기본 프롭스 전개 */
        ...defaultColumnProps,
        /** 필터 헤더 렌더러 */
        headerRenderer: {
            type: Object,
            default: FilterTextHeaderRenderer
        },
        /** 타키온 필터 타입 (문자열 조건) */
        filter: {
            type: Object,
            default: () => ({type: 'string'})
        },
        /** 텍스트 정렬 방식 */
        textAlign: {
            type: String as PropType<'left' | 'center' | 'right'>,
            default: 'left'
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

        provide(TextFilterColumnSymbol, {grid, column});

        return {
            ...result
        };
    }
});
