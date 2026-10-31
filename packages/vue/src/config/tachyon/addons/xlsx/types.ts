import type {GridColumn} from 'tachyon.vue';

/**
 * xlsx 워커와 메인 스레드 간에 공유되는 타입 정의 파일입니다.
 * 순환 참조를 방지하기 위해 export.ts 및 XlsxWorker.ts 양측에서 이 파일을 참조합니다.
 */

/** 그리드 컬럼의 직렬화 가능한 JSON 표현 타입입니다. */
export type ColumnJSON = Omit<Partial<GridColumn>, 'children'> & {
    children?: Array<ColumnJSON>;
    /** 박스 모드 하위 열의 원래 데이터 필드명입니다. */
    sourceField?: string;
    /** 박스 모드 하위 열의 계층 깊이(0부터 시작)입니다. */
    treeLevel?: number;
    /** 심플 인덴트 모드 트리 컬럼 여부입니다. (엑셀 들여쓰기 적용 대상) */
    isTree?: boolean;
};

/** 가져오기 시 원래 필드명과 계층을 복원하기 위해 숨김 시트에 기록하는 메타 정보 타입입니다. */
export type XlsxMeta = {
    version: number;
    /** 헤더가 차지하는 행 수입니다. */
    headerRows: number;
    /** 엑셀 열 순서대로 나열한 필드 정보입니다. */
    fields: Array<{key: string; field: string; treeLevel?: number}>;
    /** 행 그룹(개요) 깊이로 트리 계층을 기록했는지 여부입니다. */
    outline?: boolean;
};

/** 셀 병합 위치의 직렬화 가능한 JSON 표현 타입입니다. */
export type CellPositionJSON = {
    rowIndex: number;
    columnIndex: number;
    endRowIndex: number;
    endColumnIndex: number;
    isCrossed?: boolean;
};

/** xlsx 내보내기 옵션 타입입니다. */
export type Options = {date: Date; hideHeader: boolean};
