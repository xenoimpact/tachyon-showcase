/// <reference lib="webworker" />
import {expose} from 'comlink';
import {Column as WorkColumn, Workbook, Alignment, Borders, Border} from 'exceljs';
import type {CellPositionJSON, ColumnJSON, Options} from '@/config/tachyon/addons/xlsx/types';

type GridSource = {columns: Array<ColumnJSON>; rows: Array<object>; mergeCells: Array<CellPositionJSON>};
type GridHeaderInfo = {
    column: ColumnJSON;
    level: number;
    isOpened: boolean;
    visible: boolean;
    start: number;
    end: number;
    isLeaf: boolean;
};

/**
 * 계층 구조의 컬럼 배열을 평탄화하여 헤더 정보 목록으로 변환합니다.
 * @param columns 컬럼 JSON 배열입니다.
 * @param level 현재 계층 레벨입니다.
 * @param start 시작 컬럼 인덱스입니다.
 * @param visible 가시성 여부입니다.
 * @returns 평탄화된 헤더 정보 배열입니다.
 */
function parseColumns(columns: Array<ColumnJSON>, level = 1, start = 1, visible = true): Array<GridHeaderInfo> {
    return columns.reduce<Array<GridHeaderInfo>>((array, column) => {
        const children = column.children;
        const isOpened = column.open !== false;
        const item = {
            column: column,
            level: level,
            isOpened: isOpened,
            visible: visible,
            start: -1,
            end: -1,
            isLeaf: false
        };
        if (children?.length > 0) {
            const items = parseColumns(children, level + 1, start, visible && isOpened);
            item.start = items[0].start;
            item.end = items[items.length - 1].end;
            array = array.concat(items);
            start = item.end + 1;
        } else {
            item.end = item.start = start;
            item.isLeaf = true;
            start++;
        }
        array.push(item);
        return array;
    }, []);
}

/**
 * FileReader를 Promise로 감싸 ArrayBuffer를 반환하는 헬퍼 함수입니다.
 * @param file 읽어올 파일 객체입니다.
 * @returns 파일의 ArrayBuffer 데이터를 담은 프로미스입니다.
 */
function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

/**
 * 엑셀 파일(.xlsx)을 읽어 그리드 데이터 배열로 변환합니다.
 * @param file 읽어올 엑셀 파일입니다.
 * @param columns 그리드 컬럼 정보입니다.
 * @returns 변환된 로우 데이터 배열을 담은 프로미스입니다.
 */
async function read(file: File, columns: Array<ColumnJSON>): Promise<Array<Record<string, any>>> {
    const workbook = new Workbook();
    const buffer = await readAsArrayBuffer(file);
    await workbook.xlsx.load(buffer);

    const headerItems = parseColumns(columns);
    const leafMetas = headerItems.filter((item) => item.isLeaf);
    const maxDepth = headerItems.reduce((max, item) => Math.max(max, item.level), 0);

    const sheet = workbook.getWorksheet();
    const start = maxDepth + 1;
    const end = sheet.rowCount;

    const items: Array<Record<string, any>> = [];
    for (let i = start; i <= end; i++) {
        const row = sheet.getRow(i);
        const values = row.values;
        const item: Record<string, any> = {};

        // exceljs의 row.values는 1-based index이므로 j=1부터 시작합니다.
        // Array 타입인 경우에만 루프를 실행합니다.
        if (Array.isArray(values)) {
            const rowLen = values.length;
            for (let j = 1; j < rowLen; j++) {
                const meta = leafMetas[j - 1];
                if (meta) {
                    item[meta.column.dataField] = values[j];
                }
            }
        }
        items.push(item);
    }
    return items;
}

/**
 * 그리드 데이터를 엑셀 파일(.xlsx)로 내보냅니다.
 * 내부 헬퍼 함수들은 클로저를 통해 sheet, headerItems, normalizedColumns를 공유합니다.
 * @param source 내보낼 그리드 데이터 소스입니다.
 * @param options 내보내기 옵션입니다.
 * @returns 내보낸 결과(Blob)를 담은 프로미스입니다.
 */
async function write(source: GridSource, options: Options = {date: new Date(), hideHeader: false}): Promise<Blob> {
    const workbook = new Workbook();
    workbook.created = workbook.modified = options.date || new Date();
    const sheet = workbook.addWorksheet('Sheet1');

    //계층구조 -> 리스트
    const headerItems = parseColumns(source.columns);
    const normalizedColumns = headerItems
        .filter((item) => item.isLeaf)
        .sort((v1, v2) => Math.sign(v1.start - v2.start))
        .map((item) => item.column);

    /**
     * 시트 컬럼 설정 및 헤더 셀을 작성합니다.
     * @param startRow 시작 행 인덱스입니다.
     * @param startColumn 시작 컬럼 인덱스입니다.
     * @returns 작성된 헤더 영역의 범위 정보입니다.
     */
    function writeColumns(startRow = 1, startColumn = 1) {
        //시트 컬럼 설정
        sheet.columns = normalizedColumns.map(
            (column) =>
                ({
                    key: column.dataField,
                    width: column.width ? Math.max(12, Math.round(column.width * 0.13)) : 15,
                    style: {numFmt: column.format && column.format.type === 'number' ? '#,##0' : '@'}
                }) as WorkColumn
        );

        //헤더 데이터
        const items = headerItems.filter((item) => item.visible);
        const maxDepth = items.reduce((max, item) => Math.max(max, item.level), 0);
        const ALIGNMENT: Partial<Alignment> = {vertical: 'middle', horizontal: 'center'};

        return items.reduce(
            (cur, item) => {
                const sr = item.level + startRow - 1;
                const sc = item.start + startColumn - 1;
                const er = (item.isLeaf || !item.isOpened ? maxDepth : item.level) + startRow - 1;
                const ec = item.end + startColumn - 1;

                cur.sr = Math.min(cur.sr, sr);
                cur.sc = Math.min(cur.sc, sc);
                cur.er = Math.max(cur.er, er);
                cur.ec = Math.max(cur.ec, ec);

                const cell = sheet.getCell(sr, sc);
                cell.alignment = ALIGNMENT;
                cell.value = '' + item.column.headerText;

                if (sr !== er || sc !== ec) {
                    sheet.mergeCells(sr, sc, er, ec);
                }
                return cur;
            },
            {sr: Number.MAX_VALUE, sc: Number.MAX_VALUE, er: 0, ec: 0}
        );
    }

    /**
     * 데이터 행을 시트에 추가합니다.
     * @param startRow 시작 행 인덱스입니다.
     * @param startColumn 시작 컬럼 인덱스입니다.
     * @returns 작성된 데이터 영역의 범위 정보입니다.
     */
    function writeRows(startRow: number, startColumn: number) {
        sheet.addRows(source.rows);
        return {
            sr: startRow,
            sc: startColumn,
            er: startRow + source.rows.length - 1,
            ec: startColumn + sheet.columnCount - 1
        };
    }

    /**
     * 병합 셀 정보를 시트에 적용합니다.
     * @param startRow 시작 행 인덱스입니다.
     * @param startColumn 시작 컬럼 인덱스입니다.
     */
    function writeMergeCells(startRow: number, startColumn: number) {
        const ALIGNMENT: Partial<Alignment> = {vertical: 'middle'};
        source.mergeCells.forEach((cell) => {
            const sr = cell.rowIndex + startRow + (cell.isCrossed ? 1 : 0);
            const er = cell.endRowIndex + startRow;
            const sc = cell.columnIndex + startColumn;
            const ec = cell.endColumnIndex + startColumn;

            if (sr !== er || sc !== ec) {
                sheet.mergeCells(sr, sc, er, ec);
                sheet.getCell(sr, sc).alignment = ALIGNMENT;
            }
        });
    }

    /**
     * 시트에 테두리 및 배경색 스타일을 적용합니다.
     * @param startRow 데이터 시작 행 인덱스입니다.
     * @param startColumn 데이터 시작 컬럼 인덱스입니다.
     */
    function writeStyles(startRow: number, startColumn: number) {
        const LINE_STYLE: Border = {style: 'thin', color: {argb: 'FF000000'}};
        const rowCount = sheet.rowCount;
        const columnCount = sheet.columnCount;

        //전체 테두리 적용
        for (let i = 1; i <= rowCount; i++) {
            for (let j = 1; j <= columnCount; j++) {
                const border: Partial<Borders> = {top: LINE_STYLE, left: LINE_STYLE};
                if (i === rowCount) {
                    border.bottom = LINE_STYLE;
                }
                if (j === columnCount) {
                    border.right = LINE_STYLE;
                }
                sheet.getCell(i, j).border = border;
            }
        }

        //헤더 영역 배경색 적용
        for (let i = 1; i < startRow; i++) {
            for (let j = 1; j <= columnCount; j++) {
                sheet.getCell(i, j).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: {argb: 'FFF1F1F1'}
                };
            }
        }

        //교차 병합 셀 특수 스타일 적용
        source.mergeCells.forEach((cell) => {
            if (cell.isCrossed) {
                const sr = cell.rowIndex + startRow + 1;
                const er = cell.endRowIndex + startRow;
                const sc = cell.columnIndex + startColumn;
                const ec = cell.endColumnIndex + startColumn;
                sheet.getCell(sr, sc).border = {
                    top: {style: 'thin', color: {argb: 'FFFFFFFF'}},
                    left: {style: 'thin', color: {argb: 'FF000000'}},
                    bottom: {style: 'thin', color: {argb: 'FF000000'}},
                    right: {style: 'thin', color: {argb: 'FF000000'}}
                };
            }
        });
    }

    //헤더 영역 작성
    const headerRange = !options.hideHeader ? writeColumns(1, 1) : null;
    const rowStart = (headerRange ? headerRange.er : 0) + 1;
    const columnStart = 1;

    //행 고정 설정
    sheet.views = [{state: 'frozen', ySplit: rowStart - 1}];

    //데이터 영역 작성
    writeRows(rowStart, columnStart);
    //셀 병합 적용
    writeMergeCells(rowStart, columnStart);
    //스타일 적용
    writeStyles(rowStart, columnStart);

    return workbook.xlsx.writeBuffer().then((buffer) => {
        return new Blob([buffer], {type: 'application/octet-stream'});
    });
}

/** Comlink를 통해 메인 스레드에 노출할 API 객체입니다. */
const api = {read, write};

expose(api);

/** 메인 스레드에서 타입 추론에 사용하는 워커 API 타입입니다. */
export type XlsxWorkerApi = typeof api;
