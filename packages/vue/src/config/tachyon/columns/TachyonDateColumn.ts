import {defaultColumnProps, GridStyles, TachyonColumn} from 'tachyon.vue';
import {defineComponent, PropType} from 'vue';

/**
 * 날짜 데이터를 지정된 패턴으로 포맷팅하여 표시하기 위한 Tachyon 컬럼 컴포넌트입니다.
 * 라이브러리 엔진과의 호환성을 위해 .ts 파일 구조를 유지합니다.
 */
export default defineComponent({
    name: 'TachyonDateColumn',
    props: {
        /** 라이브러리 기본 프롭스 전개 */
        ...defaultColumnProps,
        /** 날짜 포맷 패턴 (기본값: 'YYYY-MM-DD') */
        pattern: {
            type: String,
            default: 'YYYY-MM-DD'
        },
        styles: {
            type: Object as PropType<GridStyles>,
            default: () => {
                return {
                    textAlign: 'center'
                };
            }
        }
    },
    setup(props, context) {
        /** 태키온 라이브러리 엔진의 setup 로직을 실행합니다. */
        const result = (TachyonColumn.setup as any)(props, context);
        const {nativeInstance: column} = result;

        /** 날짜 데이터의 포맷 유형과 패턴을 엔진 인스턴스에 설정합니다. */
        column.format = {
            type: 'date',
            pattern: props.pattern
        };

        return {
            ...result
        };
    }
});
