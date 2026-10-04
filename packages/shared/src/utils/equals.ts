type Compare = (a, b) => boolean;

function is(a: any, b: any): boolean {
    return (
        a === b || (a == null && b == null) || (a instanceof Date && b instanceof Date && a.getTime() === b.getTime())
    );
}

function equal(a: any, b: any, isDeep = false, compare: Compare = is): boolean {
    if (compare(a, b)) {
        return true;
    }

    if (typeof a !== 'object' || a == null || typeof b !== 'object' || b == null) {
        return false;
    }

    //array, object
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
        return false;
    }

    return keysA.every((key) =>
        key in b && isDeep ? equal(a[key], b[key], isDeep, compare) : compare(a[key], b[key])
    );
}

/**
 * a와 b의 얕은 비교를 수행하는 함수입니다.
 * 즉, 두 값이 첫 번째 레벨에서만 동일한지 확인합니다.
 * compare 이용해 사용자 정의 비교 로직을 적용할 수 있습니다.
 * @param a
 * @param b
 * @param compare 사용자 정의 비교 함수
 */
export function shallowEqual(a: any, b: any, compare: Compare = is): boolean {
    return equal(a, b, false, compare);
}

/**
 * 'a와 b의 깊은 비교를 수행하는 함수입니다.
 * 즉, 중첩된 배열이나 객체까지 비교하여 두 값이 동일한지 확인합니다.
 * compare 이용해 사용자 정의 비교 로직을 적용할 수 있습니다.
 * @param a
 * @param b
 * @param compare 사용자 정의 비교 함수
 */
export function deepEqual(a: any, b: any, compare: Compare = is): boolean {
    return equal(a, b, true, compare);
}
