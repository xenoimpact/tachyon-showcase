import numeral from 'numeral';

/**
 * 숫자 포맷팅 시 숫자가 아닌 문자를 분리하기 위한 정규표현식입니다.
 */
const NUMBER_REGEXP = /^([^0-9]*)(?:[0-9.,]*)?([^0-9]*)$/;

/**
 * 숫자의 스케일을 조정하기 위한 단위 정의 타입입니다.
 */
type NumberUnit = 'T' | 'B' | 'M' | 'K' | '%' | '억' | '' | null;

/**
 * 숫자의 소수점 처리 방식(올림, 내림, 반올림)을 정의하는 타입입니다.
 */
type NumberRounding = 'ceil' | 'floor' | 'round';

/**
 * 단위별 실제 스케일 값을 매핑한 객체 타입입니다.
 */
type NumberUnitScale = {[p in NumberUnit]: number};

/**
 * 각 단위별 곱해지거나 나누어질 스케일 상수 정의입니다.
 */
const UNIT_SCALE: NumberUnitScale = {
    '': 1,
    K: 1e3,
    M: 1e6,
    B: 1e9,
    T: 1e12,
    '%': 100,
    억: 100000000
};

/**
 * 단위를 포함하지 않는 숫자 포맷이 적용된 문자열을 반환합니다.
 * @param value 포맷팅할 숫자 값입니다.
 * @param format 숫자 포맷 문자열입니다. (예: '0,0.0')
 * @returns 포맷팅된 문자열입니다.
 *
 * ```typescript
 * numToStr(1000000000.234, '0,0.0'); // 1,000,000,000.2
 * numToStr(1000000000.234, '0,0'); // 1,000,000,000
 * ```
 */
export function numToStr(value: number, format: string): string;

/**
 * 단위를 포함하지 않는 숫자 포맷이 적용된 문자열을 반환합니다.
 * @param value 포맷팅할 숫자 값입니다.
 * @param format 숫자 포맷 문자열입니다.
 * @param rounding 소수점 처리 방식(ceil, floor, round)입니다.
 * @returns 포맷팅된 문자열입니다.
 *
 * ```typescript
 * numToStr(1000000000.234, '0,0.0', 'round'); // 1,000,000,000.2
 * numToStr(1000000000.234, '0,0.0', 'floor'); // 1,000,000,000.2
 * numToStr(1000000000.234, '0,0.0', 'ceil'); // 1,000,000,000.3
 * ```
 */
export function numToStr(value: number, format: string, rounding: NumberRounding): string;

/**
 * 단위를 포함한 숫자 포멧 적용된 문자열을 반환합니다.
 * @param value 포맷팅할 숫자 값입니다.
 * @param format 숫자 포맷 문자열입니다.
 * @param unit 스케일을 조정할 단위(K, M, B, T, %, 억)입니다.
 * @param rounding 소수점 처리 방식입니다.
 * @returns 포맷팅 및 단위가 적용된 문자열입니다.
 *
 * ```typescript
 * // K: 1000, M: 1000000, B: 1000000000
 * numToStr(1000000000.234, '0,0.0', 'K'); // 1,000,000.0K
 * numToStr(1000000000.235, '0,0.0', 'M'); // 1,000.0M
 * numToStr(1000000000.235, '0,0.0', 'B'); // 1.0B
 * ```
 */
export function numToStr(value: number, format: string, unit: NumberUnit, rounding?: NumberRounding): string;

/**
 * 사용자 지정 스케일이 적용된 숫자 포맷 문자열을 반환합니다.
 * @param value 포맷팅할 숫자 값입니다.
 * @param format 숫자 포맷 문자열입니다.
 * @param scale 나눌 숫자 값(스케일)입니다.
 * @param rounding 소수점 처리 방식입니다.
 * @returns 스케일 및 포맷팅이 적용된 문자열입니다.
 *
 * ```typescript
 * numToStr(123456789.234, '0,0.00', 1000000, 'floor'); // 123.45
 * numToStr(123456789.235, '0,0.00', 1000); // 123,456.79
 * ```
 */
export function numToStr(value: number, format: string, scale: number, rounding?: NumberRounding): string;

/**
 * 숫자를 지정된 포맷과 스케일에 따라 문자열로 변환하는 통합 함수입니다.
 * @param value 원본 숫자 값입니다.
 * @param format 변환할 포맷입니다.
 * @param scale 단위 또는 수치형 스케일 값입니다.
 * @param rounding 소수점 처리 방식입니다. (기본값: 'round')
 * @returns 최종 변환된 문자열입니다.
 */
export function numToStr(value: number, format: string, scale: any = 1, rounding: NumberRounding = 'round'): string {
    let unit;

    // 3번째 인자가 rounding 방식인 경우 처리합니다.
    if (scale === 'round' || scale === 'ceil' || scale === 'floor') {
        rounding = scale;
        scale = 1;
    }
    // 3번째 인자가 미리 정의된 단위 문자열인 경우 처리합니다.
    else if (typeof scale === 'string' && scale in UNIT_SCALE) {
        unit = scale;
        scale = UNIT_SCALE[scale as NumberUnit];
    }

    // 포맷 문자열에서 앞뒤에 붙은 숫자가 아닌 문자(단위 등)를 분리합니다.
    const [, first, last] = format.match(NUMBER_REGEXP) || [];
    if (first) {
        format = format.replace(first, '');
    }
    if (last) {
        format = format.replace(last, '');
    }

    // 지정된 스케일 값으로 원본 숫자를 나눕니다.
    if (typeof scale === 'number' && scale > 0) {
        value = value / scale;
    }

    // numeral.js를 사용하여 지정된 포맷과 반올림 정책에 따라 포맷팅합니다.
    let result = numeral(value).format(format, (v) => {
        if (rounding === 'ceil') {
            return Math.ceil(v);
        } else if (rounding === 'floor') {
            return Math.floor(v);
        }
        return Math.round(v);
    });

    // 변환 결과가 숫자가 아닌 경우 빈 문자열을 반환합니다.
    if (result === 'NaN') {
        return '';
    }

    // 분리했던 앞쪽 문자를 다시 결합합니다.
    if (first) {
        result = first + result;
    }

    // 단위가 지정된 경우 단위를 붙이고, 그렇지 않으면 포맷 문자열의 뒤쪽 문자를 붙입니다.
    if (unit) {
        result += unit;
    } else if (last) {
        result += last;
    }

    return result;
}
