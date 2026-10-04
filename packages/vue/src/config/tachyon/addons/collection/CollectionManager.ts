import {DataGrid} from 'tachyon.vue';
import {shallowEqual} from '@tachyon-showcase/shared';

/** 그리드에서 사용하는 데이터 아이템 타입입니다. */
type DataItem = Record<string, any>;

/** 컬렉션 변경 이벤트의 종류입니다. */
type CollectionChangeKind = 'add' | 'remove' | 'update' | 'reset';

/** 그리드 컬렉션 변경 이벤트 타입입니다. */
type CollectionChangeEvent = CustomEvent<{
    kind: CollectionChangeKind;
    items?: Array<DataItem>;
    location?: number;
}>;

/**
 * 두 원시 값을 기본 비교 함수로 비교합니다.
 * null 동등성과 Date 객체의 시간 비교를 지원합니다.
 */
function defaultCompare(a: any, b: any): boolean {
    return (
        a == b || (a == null && b == null) || (a instanceof Date && b instanceof Date && a.getTime() === b.getTime())
    );
}

/**
 * 배열에서 특정 항목을 제거합니다.
 * @returns 제거에 성공하면 true, 항목이 없으면 false를 반환합니다.
 */
function removeArrayItem<T>(array: Array<T>, item: T): boolean {
    const index = array.indexOf(item);
    if (index >= 0) {
        array.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * 그리드의 데이터 변경 내역(생성·수정·삭제)을 추적하는 클래스입니다.
 * 그리드의 'collection-change' 이벤트를 구독하여 자동으로 히스토리를 관리합니다.
 */
class CollectionManager {
    private readonly grid: DataGrid;
    private _createdItems: Array<DataItem> = [];
    private _removedItems: Array<DataItem> = [];
    private _updatedItems: Array<DataItem> = [];
    private _oldDataMap: Map<DataItem, Record<string, any>> = new Map();

    constructor(grid: DataGrid) {
        this.grid = grid;
        this.grid.addEventListener('collection-change', this.onCollectionChange.bind(this), false);
        this.clear();
    }

    /**
     * 새로 생성된 아이템 목록입니다.
     */
    get createdItems(): Array<DataItem> {
        return this._createdItems.slice();
    }

    /**
     * 삭제된 아이템 목록입니다.
     */
    get removedItems(): Array<DataItem> {
        return this._removedItems.slice();
    }

    /**
     * 갱신된 아이템 목록입니다.
     */
    get updatedItems(): Array<DataItem> {
        return this._updatedItems.slice();
    }

    /**
     * 생성·수정·삭제 항목 중 하나라도 존재하면 true를 반환합니다.
     */
    get isChanged(): boolean {
        return this._createdItems.length > 0 || this._updatedItems.length > 0 || this._removedItems.length > 0;
    }

    /**
     * 모든 변경 내역을 초기화합니다.
     */
    clear(): void {
        this._createdItems = [];
        this._updatedItems = [];
        this._removedItems = [];
        this._oldDataMap = new Map();
    }

    /** 두 값을 shallowEqual 기반으로 비교합니다. */
    private compareValue(a: any, b: any): boolean {
        return shallowEqual(a, b, defaultCompare);
    }

    /** 컬렉션에 항목이 추가되었을 때 생성 히스토리를 기록합니다. */
    private collectionAdded(items: Array<DataItem>): void {
        this._createdItems.push(...items);
    }

    /** 컬렉션에서 항목이 제거되었을 때 히스토리를 처리합니다. */
    private collectionRemoved(items: Array<DataItem>): void {
        for (const item of items) {
            if (this._createdItems.includes(item)) {
                // 아직 서버에 저장되지 않은 신규 항목이면 생성 목록에서만 제거합니다.
                removeArrayItem(this._createdItems, item);
            } else {
                // 기존 항목이면 수정 목록에서 제거 후 삭제 목록에 추가합니다.
                removeArrayItem(this._updatedItems, item);
                this._removedItems.push(item);
            }
        }
    }

    /** 컬렉션 항목의 속성이 변경되었을 때 수정 히스토리를 기록합니다. */
    private collectionUpdated(items: Array<any>): void {
        for (const item of items) {
            const {source, property, newValue, oldValue} = item;

            // 신규 생성된 항목은 수정 추적 대상에서 제외합니다.
            if (this._createdItems.includes(source)) {
                continue;
            }

            // 최초 변경 시 원본 값을 스냅샷으로 저장합니다.
            let oldData = this._oldDataMap.get(source);
            if (!oldData) {
                oldData = {};
                this._oldDataMap.set(source, oldData);
            }

            if (!(property in oldData)) {
                oldData[property] = oldValue;
            }

            // 원본 값과 현재 값을 비교하여 실제 변경 여부를 판단합니다.
            const isChanged = !this.compareValue(oldData[property], newValue);
            if (isChanged) {
                if (!this._updatedItems.includes(source)) {
                    this._updatedItems.push(source);
                }
            } else {
                // 원본으로 되돌아온 경우 수정 목록에서 제거합니다.
                delete oldData[property];
                if (Object.keys(oldData).length === 0) {
                    removeArrayItem(this._updatedItems, source);
                }
            }
        }
    }

    /** 그리드 컬렉션 변경 이벤트를 수신하여 적절한 핸들러를 호출합니다. */
    onCollectionChange(event: CollectionChangeEvent): void {
        const {kind, items = [], location} = event.detail;
        switch (kind) {
            case 'add':
                this.collectionAdded(items);
                break;
            case 'remove':
                this.collectionRemoved(items);
                break;
            case 'update':
                this.collectionUpdated(items);
                break;
            case 'reset':
                this.clear();
                break;
        }
    }
}

export default {
    manager: null,

    /**
     * Addon 등록 시 CollectionManager 인스턴스를 생성하고 그리드에 연결합니다.
     * @remarks
     * `this.grid`는 IAddon 기반 클래스에서 제공하는 속성입니다.
     * 이 Addon 객체는 등록 시 IAddon 인스턴스와 병합되므로, 메서드 내에서 this를 통해 그리드에 접근할 수 있습니다.
     */
    created(grid: DataGrid) {
        this.manager = new CollectionManager(grid);
    },

    /**
     * 현재 변경된 아이템들의 상태를 반환합니다.
     */
    get itemsState() {
        return {
            created: this.manager!.createdItems,
            removed: this.manager!.removedItems,
            updated: this.manager!.updatedItems
        };
    },

    /**
     * 생성·수정·삭제 항목 중 하나라도 존재하면 true를 반환합니다.
     */
    get isChanged() {
        return this.manager!.isChanged;
    },

    /**
     * 모든 변경 내역을 초기화합니다.
     */
    clear() {
        this.manager!.clear();
    }
};
