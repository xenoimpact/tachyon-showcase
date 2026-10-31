import {toRaw} from 'vue';
import {wrap} from 'comlink';
import {TreeGrid, GridColumn, DataGrid} from 'tachyon.vue';
import {downloadBlob} from '@tachyon-showcase/shared';
import XlsxWorker from '@/workers/XlsxWorker?worker';
import type {XlsxWorkerApi} from '@/workers/XlsxWorker';
import type {ColumnJSON, CellPositionJSON, Options, XlsxExportMetrics, XlsxExportResult} from './types';

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
                    // 가져오기 시 원래 필드와 계층으로 되돌릴 수 있도록 기록합니다.
                    child.sourceField = child.dataField;
                    child.treeLevel = index;
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
 * 컬럼 인스턴스에서 필요한 값만 읽어 새 객체를 만들므로 원본 그리드 컬럼은 변경되지 않습니다.
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
        boxMode: col.boxMode,
        // 트리 컬럼만 boxMode 속성을 가지며, false이면 심플 인덴트 모드입니다.
        isTree: col.boxMode === false
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
 * 워커에서 사용할 컬럼 정보 배열을 생성합니다. 내보내기와 가져오기가 같은 열 구성을 쓰도록 공유합니다.
 * @param grid 데이터 그리드 인스턴스
 * @returns 컬럼 JSON 배열입니다.
 */
export function toColumns(grid: DataGrid): Array<ColumnJSON> {
    return normalizeColumns(grid.columns.map(sanitizeColumn));
}

/**
 * 워커에서 사용할 셀 병합 정보 배열을 생성합니다.
 * @param grid 데이터 그리드 인스턴스
 * @returns 셀 병합 정보 배열입니다.
 */
function toMergeCells(grid: DataGrid): Array<CellPositionJSON> {
    const mergeCells = grid.getMergeCells() || [];
    const formatCell = (c: any): CellPositionJSON => {
        return {
            rowIndex: c.rowIndex,
            endRowIndex: c.endRowIndex,
            columnIndex: c.columnIndex,
            endColumnIndex: c.endColumnIndex,
            isCrossed: !!c.isCrossed
        };
    };

    return mergeCells.reduce((array: Array<CellPositionJSON>, cell: any) => {
        if (!cell) {
            return array;
        }
        array.push(formatCell(cell));

        if (Array.isArray(cell.crossCells)) {
            cell.crossCells.forEach((c: any) => {
                if (c) {
                    array.push(formatCell(c));
                }
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

/**
 * 트리 그리드의 행별 계층 깊이(0부터 시작) 배열을 생성합니다. 트리 그리드가 아니면 undefined를 반환합니다.
 * @param grid 데이터 그리드 인스턴스
 * @returns 행별 계층 깊이 배열입니다.
 */
function toLevels(grid: DataGrid): Array<number> | undefined {
    if (!(grid instanceof TreeGrid)) {
        return undefined;
    }
    const collection = grid.collection as any;
    return collection.toArray().map((item: any) => collection.getNodeLevel(toRaw(item)));
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
     * @returns 내보낸 결과(Blob)와 구간별 소요시간을 담은 프로미스입니다. 실패 시 null입니다.
     * @remarks
     * `this.grid`는 IAddon 기반 클래스에서 제공하는 속성입니다.
     * 이 Addon 객체는 등록 시 IAddon 인스턴스와 병합되므로, 메서드 내에서 this를 통해 그리드에 접근할 수 있습니다.
     */
    async export(
        this: {grid: DataGrid},
        name = 'excel.xlsx',
        options: Options = {date: new Date(), hideHeader: false}
    ): Promise<XlsxExportResult | null> {
        const startTime = performance.now();
        const columns = toColumns(this.grid);
        const mergeCells = toMergeCells(this.grid);
        const rows = toRows(this.grid);
        const levels = toLevels(this.grid);
        const extractTime = performance.now();

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
        const cloneTime = performance.now();

        // 작업 단위로 새로운 워커 인스턴스를 생성합니다.
        const worker = new XlsxWorker();
        const api = wrap<XlsxWorkerApi>(worker);

        try {
            const {blob, metrics: workerMetrics} = await api.write({columns, rows, mergeCells, levels}, options);
            const endTime = performance.now();
            downloadBlob(blob, name);
            const metrics: XlsxExportMetrics = {
                rowCount: rows.length,
                fileSize: blob.size,
                extract: extractTime - startTime,
                clone: cloneTime - extractTime,
                // 워커 생성·데이터 전송·결과 수신은 직접 잴 수 없어 전체 왕복에서 워커 내부 시간을 뺀 값으로 계산합니다.
                transfer: Math.max(0, endTime - cloneTime - workerMetrics.total),
                worker: workerMetrics,
                total: endTime - startTime
            };
            return {blob, metrics};
        } catch (error) {
            console.error('엑셀 파일을 생성하는 중 오류가 발생했습니다:', error);
        } finally {
            // 작업이 끝나면 워커를 종료하여 리소스를 해제합니다.
            worker.terminate();
        }
        return null;
    }
};
