// @ts-nocheck
import {wrap} from 'comlink';
import {DataGrid} from 'tachyon.vue';
import XlsxWorker from '@/workers/XlsxWorker?worker';
import type {XlsxWorkerApi} from '@/workers/XlsxWorker';
import type {ColumnJSON} from './types';

function toColumns(grid: DataGrid): Array<ColumnJSON> {
    return grid.columns.map((column) => column.toJSON());
}

export default {
    /**
     * 컴포넌트 생성 시 초기화를 수행합니다.
     */
    created() {},

    /**
     * 엑셀 파일을 읽어 그리드 데이터로 가져옵니다.
     * @param file 가져올 엑셀 파일입니다.
     * @returns 변환된 로우 데이터 배열을 담은 프로미스입니다.
     * @remarks
     * `this.grid`는 IAddon 기반 클래스에서 제공하는 속성입니다.
     * 이 Addon 객체는 등록 시 IAddon 인스턴스와 병합되므로, 메서드 내에서 this를 통해 그리드에 접근할 수 있습니다.
     */
    async import(this: {grid: DataGrid}, file: File) {
        const columns = toColumns(this.grid);

        // 작업 단위로 새로운 워커 인스턴스를 생성합니다.
        const worker = new XlsxWorker();
        const api = wrap<XlsxWorkerApi>(worker);

        try {
            return await api.read(file, columns);
        } catch (error) {
            console.warn('엑셀 파일을 읽는 중 오류가 발생했습니다:', error);
        } finally {
            // 작업이 끝나면 워커를 종료하여 리소스를 해제합니다.
            worker.terminate();
        }
        return null;
    }
};
