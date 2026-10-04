import {toRaw} from 'vue';
import {wrap} from 'comlink';
import {TreeGrid, GridColumn, DataGrid} from 'tachyon.vue';
import {downloadBlob} from '@tachyon-showcase/shared';
import XlsxWorker from '@/workers/XlsxWorker?worker';
import type {XlsxWorkerApi} from '@/workers/XlsxWorker';
import type {ColumnJSON, CellPositionJSON, Options} from './types';

/**
 * 자식 컬럼의 데이터 필드명을 생성합니다.
 * @param field 부모 필드명
 * @param index 자식 인덱스
 * @returns 생성된 필드명입니다.
 */
function generateChildField(field: string, index: number): string {
    return field + '_' + index;
}

/**
 * 컬럼 목록을 정규화합니다. 보이지 않는 컬럼이나 자식이 없는 박스 모드 컬럼을 제거합니다.
 * @param columns 정규화할 컬럼 배열
 * @returns 정규화된 컬럼 배열입니다.
 */
function normalizeColumns(columns: Array<ColumnJSON & {boxMode?: boolean}>): Array<ColumnJSON> {
    for (let i = columns.length - 1; i >= 0; i--) {
        const column = columns[i];
        const children = column.children;
        if (children && children.length > 0) {
            if (column.boxMode === true) {
                children.forEach((child, index) => {
                    child.dataField = generateChildField(child.dataField, index);
                });
            }
            normalizeColumns(children);
            if (children.length === 0) {
                columns.splice(i, 1);
            }
        } else if (!column.visible) {
            columns.splice(i, 1);
        }
    }
    return columns;
}

/**
 * 값을 숫자 타입으로 변환합니다. 빈 값인 경우 null을 반환합니다.
 * @param value 변환할 값
 * @returns 변환된 숫자 또는 null입니다.
 */
function toNumber(value: any): number | null {
    return value != null && value !== '' ? +value : null;
}

/**
 * 컬럼이 숫자 포맷인지 확인합니다.
 * @param column 확인할 컬럼
 * @returns 숫자 포맷 여부입니다.
 */
function isNumberColumn(column: GridColumn): boolean {
    return column.format?.type === 'number';
}

/**
 * Web Worker(postMessage)로 안전하게 전송하기 위해
 * 컴포넌트 객체(itemRenderer), 함수(labelFunction) 등 복제 불가능한 프로퍼티를 제거합니다.
 */
function sanitizeColumn(col: any): ColumnJSON {
    if (!col) {
        return col;
    }
    const clean: any = {
        dataField: col.dataField,
        headerText: col.headerText,
        width: typeof col.width === 'number' ? col.width : 100,
        visible: col.visible !== false,
        open: col.open !== false,
        boxMode: col.boxMode
    };
    if (col.styles) {
        clean.styles = {
            textAlign: col.styles.textAlign,
            color: col.styles.color,
            backgroundColor: col.styles.backgroundColor
        };
    }
    if (col.format) {
        clean.format = {
            type: col.format.type,
            pattern: col.format.pattern,
            scale: col.format.scale
        };
    }
    if (Array.isArray(col.children) && col.children.length > 0) {
        clean.children = col.children.map(sanitizeColumn);
    }
    return clean;
}

/**
 * 워커에서 사용할 컬럼 정보 배열을 생성합니다.
 * @param grid 데이터 그리드 인스턴스
 * @returns 컬럼 JSON 배열입니다.
 */
function toColumns(grid: DataGrid): Array<ColumnJSON> {
    const rawCols = grid.columns.map((column: GridColumn) => column.toJSON());
    const normalized = normalizeColumns(rawCols);
    return normalized.map(sanitizeColumn);
}

/**
 * 워커에서 사용할 셀 병합 정보 배열을 생성합니다.
 * @param grid 데이터 그리드 인스턴스
 * @returns 셀 병합 정보 배열입니다.
 */
function toMergeCells(grid: DataGrid): Array<CellPositionJSON> {
    const mergeCells = grid.getMergeCells() || [];
    return mergeCells.reduce((array: Array<CellPositionJSON>, cell: any) => {
        const json = cell && typeof cell.toJSON === 'function' ? cell.toJSON() : cell || {};
        array.push({
            rowIndex: json.rowIndex,
            endRowIndex: json.endRowIndex,
            columnIndex: json.columnIndex,
            endColumnIndex: json.endColumnIndex,
            isCrossed: !!json.isCrossed
        });
        if (Array.isArray(cell.crossCells)) {
            cell.crossCells.forEach((c: any) => {
                const cJson = c && typeof c.toJSON === 'function' ? c.toJSON() : c || {};
                array.push({
                    rowIndex: cJson.rowIndex,
                    endRowIndex: cJson.endRowIndex,
                    columnIndex: cJson.columnIndex,
                    endColumnIndex: cJson.endColumnIndex,
                    isCrossed: !!cJson.isCrossed
                });
            });
        }
        return array;
    }, []);
}

/**
 * 워커에서 사용할 로우 데이터 배열을 생성합니다.
 * @param grid 데이터 그리드 인스턴스
 * @returns 로우 데이터 배열입니다.
 */
function toRows(grid: DataGrid): Array<Record<string, any>> {
    const items = grid.collection.toArray() as Array<Record<string, any>>;
    const columns = grid.normalizedColumns as Array<GridColumn>;
    const numColumns = columns.length;

    let resultRows: Array<Record<string, any>> = [];

    if (grid instanceof TreeGrid) {
        resultRows = items.map((item) => {
            const rawItem = toRaw(item);
            const row: Record<string, any> = {};
            for (let i = 0; i < numColumns; i++) {
                const column = columns[i];
                //컬럼에 포멧터 설정 숫자로 되었을때
                const dataField =
                    'hostColumn' in column
                        ? generateChildField(column.dataField, (column as any).hostColumn.children.indexOf(column))
                        : column.dataField;
                const value = column.itemToLabel(rawItem);
                const original = column.itemToValue(rawItem);
                //컬럼이 숫자포멧인 경우만 순수데이타로 전달
                row[dataField] = isNumberColumn(column) ? toNumber(original ?? value) : value;
            }
            return row;
        });
    } else {
        // labelFunction 또는 숫자 포맷이 적용된 컬럼만 필터링합니다.
        const filtered = columns.filter(
            (column) => !!(column.labelFunction instanceof Function || isNumberColumn(column))
        );
        if (filtered.length === 0) {
            resultRows = items.map((item) => ({...toRaw(item)}));
        } else {
            resultRows = items.map((item) => {
                const rawItem = toRaw(item);
                const row = {...rawItem};
                filtered.forEach((column) => {
                    if (column.dataField != null) {
                        //컬럼에 포멧터 설정 숫자로 되었을때
                        const value = column.itemToLabel(rawItem);
                        const original = column.itemToValue(rawItem);
                        //컬럼이 숫자포멧인 경우만 순수데이타로 전달
                        row[column.dataField] = isNumberColumn(column) ? toNumber(original ?? value) : value;
                    }
                });
                return row;
            });
        }
    }

    // Web Worker로 postMessage 가능한 순수 Plain Data만 추출 (함수, Symbol 등 필터링)
    return resultRows.map((row) => {
        const clean: Record<string, any> = {};
        for (const [k, v] of Object.entries(row)) {
            if (typeof v !== 'function' && typeof v !== 'symbol') {
                clean[k] = v;
            }
        }
        return clean;
    });
}

export default {
    /**
     * 컴포넌트 생성 시 초기화를 수행합니다.
     */
    created() {},

    /**
     * 그리드 데이터를 엑셀 파일(.xlsx)로 내보냅니다.
     * @param name 저장할 파일명입니다. 기본값은 'excel.xlsx'입니다.
     * @param options 내보내기 옵션입니다.
     * @returns 내보낸 결과(Blob)를 담은 프로미스입니다.
     * @remarks
     * `this.grid`는 IAddon 기반 클래스에서 제공하는 속성입니다.
     * 이 Addon 객체는 등록 시 IAddon 인스턴스와 병합되므로, 메서드 내에서 this를 통해 그리드에 접근할 수 있습니다.
     */
    async export(
        this: {grid: DataGrid},
        name = 'excel.xlsx',
        options: Options = {date: new Date(), hideHeader: false}
    ) {
        const columns = toColumns(this.grid);
        const mergeCells = toMergeCells(this.grid);
        const rows = toRows(this.grid);

        // Structured Clone 사전 진단 (콘솔 출력)
        try {
            structuredClone(columns);
        } catch (err) {
            console.error('[XLSX Export] columns clone 실패:', err);
        }
        try {
            structuredClone(rows);
        } catch (err) {
            console.error('[XLSX Export] rows clone 실패:', err);
        }
        try {
            structuredClone(mergeCells);
        } catch (err) {
            console.error('[XLSX Export] mergeCells clone 실패:', err);
        }

        // 작업 단위로 새로운 워커 인스턴스를 생성합니다.
        const worker = new XlsxWorker();
        const api = wrap<XlsxWorkerApi>(worker);

        try {
            const result = await api.write({columns, rows, mergeCells}, options);
            downloadBlob(result, name);
            return result;
        } catch (error) {
            console.error('엑셀 파일을 생성하는 중 오류가 발생했습니다:', error);
        } finally {
            // 작업이 끝나면 워커를 종료하여 리소스를 해제합니다.
            worker.terminate();
        }
        return null;
    }
};
