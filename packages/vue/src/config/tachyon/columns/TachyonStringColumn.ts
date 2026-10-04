import {TachyonColumn, defaultColumnProps} from 'tachyon.vue';
import {defineComponent, type PropType} from 'vue';

/**
 * 일반 문자열 데이터를 표시하기 위한 Tachyon 컬럼 컴포넌트입니다.
 * 라이브러리 엔진과의 호환성을 위해 .ts 파일 구조를 유지하며, Vue 3.5 스타일로 구현되었습니다.
 */
export default defineComponent({
    name: 'TachyonStringColumn',
    props: {
        /** 라이브러리 기본 프롭스 전개 */
        ...defaultColumnProps,
        /** 문자열 컬럼 전용: 텍스트 정렬 방식 */
        textAlign: {
            type: String as PropType<'left' | 'center' | 'right'>,
            default: 'center'
        }
    },
    setup(props, context) {
        /** 태키온 라이브러리 엔진의 setup 로직을 실행하여 컬럼 인스턴스를 생성합니다. */
        const result = (TachyonColumn.setup as any)(props, context);
        const {nativeInstance: column} = result;

        /** 컬럼 인스턴스에 정렬 스타일을 적용합니다. */
        column.styles = {
            textAlign: props.textAlign
        };

        return {
            ...result
        };
    }
});
