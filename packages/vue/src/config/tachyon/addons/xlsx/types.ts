import type {GridColumn, CellPosition} from 'tachyon.vue';

/**
 * xlsx 워커와 메인 스레드 간에 공유되는 타입 정의 파일입니다.
 * 순환 참조를 방지하기 위해 export.ts 및 XlsxWorker.ts 양측에서 이 파일을 참조합니다.
 */

/** 그리드 컬럼의 직렬화 가능한 JSON 표현 타입입니다. */
export type ColumnJSON = Partial<GridColumn>;

/** 셀 병합 위치의 직렬화 가능한 JSON 표현 타입입니다. */
export type CellPositionJSON = Partial<CellPosition>;

/** xlsx 내보내기 옵션 타입입니다. */
export type Options = {date: Date; hideHeader: boolean};
