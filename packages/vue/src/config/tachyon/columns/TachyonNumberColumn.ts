import {DataGrid, DataGridSymbol, defaultColumnProps, TachyonColumn} from 'tachyon.vue';
import {defineComponent, inject, watchEffect} from 'vue';

/**
 * 숫자 데이터를 포맷팅하여 표시하기 위한 Tachyon 컬럼 컴포넌트입니다.
 * 실시간 속성 변경(scale, pattern) 감지 및 그리드 무효화 로직이 포함되어 있습니다.
 */
export default defineComponent({
    name: 'TachyonNumberColumn',
    props: {
        /** 라이브러리 기본 프롭스 전개 */
        ...defaultColumnProps,
        /** 숫자 배율 (Scale) */
        scale: {
            type: Number,
            default: 1
        },
        /** 숫자 포맷 패턴 (예: '0,0.0') */
        pattern: {
            type: String,
            default: '0,0.0'
        }
    },
    setup(props, context) {
        /** 상위 그리드 라이브러리 인스턴스를 주입받습니다. */
        const grid = (inject(DataGridSymbol) as {grid: DataGrid}).grid;

        /** 태키온 라이브러리 엔진의 setup 로직을 상속합니다. */
        const result = (TachyonColumn.setup as any)(props, context);
        const {nativeInstance: column} = result;

        /** 초기 데이터 포맷 및 정렬 설정 */
        column.format = {
            type: 'number',
            pattern: props.pattern,
            scale: props.scale
        };
        column.sortCompare = 'number';
        column.isSortOriginal = true;

        /**
         * Vue의 반응성 시스템을 통해 프롭스 변경을 감지합니다.
         * scale이나 pattern이 변경되면 그리드를 다시 그립니다.
         */
        watchEffect(() => {
            if (column.format) {
                column.format.scale = props.scale;
                column.format.pattern = props.pattern;
                grid.invalidate();
            }
        });

        return {
            ...result
        };
    }
});
