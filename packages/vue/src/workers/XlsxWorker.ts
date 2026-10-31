/// <reference lib="webworker" />
import {expose} from 'comlink';
import {Column as WorkColumn, Workbook, Alignment, Borders, Border} from 'exceljs';
import type {
    CellPositionJSON,
    ColumnJSON,
    Options,
    XlsxMeta,
    XlsxWorkerMetrics
} from '@/config/tachyon/addons/xlsx/types';

/** 가져오기 복원용 메타 정보를 기록하는 숨김 시트 이름입니다. */
const META_SHEET_NAME = '_tachyon_meta';
/** 트리 계층을 복원할 때 사용하는 자식 노드 필드명입니다. (타키온 childrenField 기본값) */
const CHILDREN_FIELD = 'children';
/** 엑셀 행 그룹(개요)이 지원하는 최대 깊이입니다. */
const MAX_OUTLINE_LEVEL = 7;

type GridSource = {
    columns: Array<ColumnJSON>;
    rows: Array<object>;
    mergeCells: Array<CellPositionJSON>;
    /** 트리 그리드의 행별 계층 깊이입니다. */
    levels?: Array<number>;
};
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
 * 숨김 시트에 기록된 메타 정보를 읽습니다. 메타 시트가 없거나 형식이 맞지 않으면 null을 반환합니다.
 * @param workbook 읽어온 워크북입니다.
 * @returns 메타 정보 또는 null입니다.
 */
function readMeta(workbook: Workbook): XlsxMeta | null {
    const metaSheet = workbook.getWorksheet(META_SHEET_NAME);
    const value = metaSheet?.getCell(1, 1).value;
    if (typeof value !== 'string') {
        return null;
    }
    try {
        const meta = JSON.parse(value) as XlsxMeta;
        return Array.isArray(meta.fields) ? meta : null;
    } catch {
        return null;
    }
}

/**
 * 계층 깊이 목록을 기준으로 평평한 행 목록을 트리 구조로 묶습니다.
 * 바로 위쪽에 있는, 깊이가 하나 작은 행을 부모로 연결합니다.
 * @param items 평평한 행 목록입니다.
 * @param levels 각 행의 계층 깊이입니다.
 * @returns 최상위 노드 목록입니다.
 */
function buildTree(items: Array<Record<string, any>>, levels: Array<number>): Array<Record<string, any>> {
    const roots: Array<Record<string, any>> = [];
    const stack: Array<Record<string, any>> = [];
    items.forEach((item, index) => {
        // 깊이가 건너뛰는 잘못된 입력은 가능한 가장 깊은 부모 아래로 붙입니다.
        const level = Math.max(0, Math.min(levels[index], stack.length));
        stack.length = level;
        const parent = stack[level - 1];
        if (parent) {
            (parent[CHILDREN_FIELD] ??= []).push(item);
        } else {
            roots.push(item);
        }
        stack.push(item);
    });
    return roots;
}

/**
 * 엑셀 파일(.xlsx)을 읽어 그리드 데이터 배열로 변환합니다.
 * 메타 시트가 있으면 그 기준으로 열을 매핑하고, 박스 모드 트리 열은 원래 필드명과 계층으로 복원합니다.
 * @param file 읽어올 엑셀 파일입니다.
 * @param columns 그리드 컬럼 정보입니다.
 * @returns 변환된 로우 데이터 배열을 담은 프로미스입니다.
 */
async function read(file: File, columns: Array<ColumnJSON>): Promise<Array<Record<string, any>>> {
    const workbook = new Workbook();
    const buffer = await readAsArrayBuffer(file);
    await workbook.xlsx.load(buffer);

    // 메타 시트가 없는 파일은 현재 그리드의 리프 컬럼 순서로 매핑합니다.
    let meta = readMeta(workbook);
    if (!meta) {
        const headerItems = parseColumns(columns);
        const maxDepth = headerItems.filter((item) => item.visible).reduce((max, item) => Math.max(max, item.level), 0);
        meta = {
            version: 1,
            headerRows: maxDepth,
            fields: headerItems
                .filter((item) => item.isLeaf)
                .map(({column}) => ({
                    key: column.dataField,
                    field: column.sourceField ?? column.dataField,
                    treeLevel: column.treeLevel
                }))
        };
    }
    const fields = meta.fields;
    const hasTree = meta.outline === true || fields.some((field) => field.treeLevel != null);

    const sheet = workbook.getWorksheet();
    const start = meta.headerRows + 1;
    const end = sheet.rowCount;

    const items: Array<Record<string, any>> = [];
    const levels: Array<number> = [];
    for (let i = start; i <= end; i++) {
        const row = sheet.getRow(i);
        const values = row.values;
        const item: Record<string, any> = {};
        let level = -1;

        // exceljs의 row.values는 1-based index이므로 j=1부터 시작합니다.
        // Array 타입인 경우에만 루프를 실행합니다.
        if (Array.isArray(values)) {
            const rowLen = values.length;
            for (let j = 1; j < rowLen; j++) {
                const field = fields[j - 1];
                if (!field) {
                    continue;
                }
                const value = values[j];
                if (field.treeLevel == null) {
                    item[field.field] = value;
                } else if (level < 0 && value != null && value !== '') {
                    // 박스 모드는 노드 깊이 이상의 열에만 값이 있으므로 처음 값이 나온 열이 곧 깊이입니다.
                    item[field.field] = value;
                    level = field.treeLevel;
                }
            }
        }
        if (meta.outline) {
            // 행 그룹 깊이가 기록된 파일은 그 값을 우선합니다. (이름이 빈 노드도 복원됩니다.)
            level = row.outlineLevel;
        } else if (hasTree && level < 0) {
            // 깊이를 판단할 수 없는 행은 직전 행과 같은 깊이로 둡니다.
            level = levels.length > 0 ? levels[levels.length - 1] : 0;
        }
        items.push(item);
        levels.push(level);
    }
    return hasTree ? buildTree(items, levels) : items;
}

/**
 * 그리드 데이터를 엑셀 파일(.xlsx)로 내보냅니다.
 * 내부 헬퍼 함수들은 클로저를 통해 sheet, headerItems, normalizedColumns를 공유합니다.
 * @param source 내보낼 그리드 데이터 소스입니다.
 * @param options 내보내기 옵션입니다.
 * @returns 내보낸 결과(Blob)와 구간별 소요시간을 담은 프로미스입니다.
 */
async function write(
    source: GridSource,
    options: Options = {date: new Date(), hideHeader: false}
): Promise<{blob: Blob; metrics: XlsxWorkerMetrics}> {
    const startTime = performance.now();
    let markTime = startTime;
    /** 직전 측정 시점부터 지금까지의 소요시간(ms)을 반환하고 측정 시점을 갱신합니다. */
    const lap = (): number => {
        const now = performance.now();
        const elapsed = now - markTime;
        markTime = now;
        return elapsed;
    };

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

    /**
     * 가져오기 복원용 메타 정보를 숨김 시트에 기록합니다.
     * @param headerRows 헤더가 차지하는 행 수입니다.
     */
    function writeMeta(headerRows: number) {
        const meta: XlsxMeta = {
            version: 1,
            headerRows,
            fields: normalizedColumns.map((column) => ({
                key: column.dataField,
                field: column.sourceField ?? column.dataField,
                treeLevel: column.treeLevel
            })),
            outline: !!source.levels
        };
        const metaSheet = workbook.addWorksheet(META_SHEET_NAME, {state: 'veryHidden'});
        metaSheet.getCell(1, 1).value = JSON.stringify(meta);
    }

    /**
     * 트리 계층을 엑셀 행 그룹(개요)과 들여쓰기로 표현합니다.
     * 부모 행에 펼치기/접기 버튼이 생기며, 심플 인덴트 모드의 트리 컬럼에는 깊이만큼 들여쓰기를 적용합니다.
     * @param startRow 데이터 시작 행 인덱스입니다.
     */
    function writeOutline(startRow: number) {
        const levels = source.levels;
        if (!levels) {
            return;
        }
        // 부모 행이 자식 행 위에 있으므로 요약 행(펼치기 버튼) 위치를 위쪽으로 지정합니다.
        sheet.properties.outlineProperties = {summaryBelow: false, summaryRight: false};
        const treeColumn = normalizedColumns.findIndex((column) => column.isTree) + 1;
        let maxLevel = 0;
        levels.forEach((level, index) => {
            const outlineLevel = Math.min(level, MAX_OUTLINE_LEVEL);
            const row = sheet.getRow(startRow + index);
            row.outlineLevel = outlineLevel;
            maxLevel = Math.max(maxLevel, outlineLevel);
            if (treeColumn > 0 && level > 0) {
                const cell = row.getCell(treeColumn);
                // 스타일 객체가 공유될 수 있으므로 일부만 고치지 않고 새 객체로 대입합니다.
                cell.style = {...cell.style, alignment: {vertical: 'middle', indent: level * 2}};
            }
        });
        sheet.properties.outlineLevelRow = maxLevel;
    }

    //헤더 영역 작성
    const headerRange = !options.hideHeader ? writeColumns(1, 1) : null;
    const rowStart = (headerRange ? headerRange.er : 0) + 1;
    const columnStart = 1;

    //행 고정 설정
    sheet.views = [{state: 'frozen', ySplit: rowStart - 1}];
    const header = lap();

    //데이터 영역 작성
    writeRows(rowStart, columnStart);
    const rows = lap();
    //트리 계층 표현 (행 그룹 및 들여쓰기)
    writeOutline(rowStart);
    const outline = lap();
    //셀 병합 적용
    writeMergeCells(rowStart, columnStart);
    const merge = lap();
    //스타일 적용
    writeStyles(rowStart, columnStart);
    const style = lap();
    //가져오기 복원용 메타 정보 기록
    writeMeta(rowStart - 1);

    const buffer = await workbook.xlsx.writeBuffer();
    const zip = lap();
    return {
        blob: new Blob([buffer], {type: 'application/octet-stream'}),
        metrics: {header, rows, outline, merge, style, zip, total: performance.now() - startTime}
    };
}

/** Comlink를 통해 메인 스레드에 노출할 API 객체입니다. */
const api = {read, write};

expose(api);

/** 메인 스레드에서 타입 추론에 사용하는 워커 API 타입입니다. */
export type XlsxWorkerApi = typeof api;
