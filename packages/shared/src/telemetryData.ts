import type {TelemetryEquipmentItem} from './types/telemetry';

const ZONES = ['A동 (정밀가공)', 'B동 (초정밀조립)', 'C동 (열처리·도장)', 'D동 (스마트물류)'];
const EQ_NAMES = [
    '5축 초정밀 머시닝센터',
    'CNC 복합 자동선반',
    '스마트 갠트리 로더',
    '초고속 파이버 레이저 절단기',
    '초정밀 CNC 평면 연삭기',
    '초음파 다단 세척기',
    'AI 비전 고속 선별기',
    '진공 가압 열처리 챔버',
    '고정밀 로봇 용접 스테이션',
    '다관절 조립 서보 프레스'
];

/**
 * 실시간 틱 갱신 대상 수치 필드 목록 (40개 센서 및 생산 지표)
 */
export const MUTABLE_NUMERIC_FIELDS: (keyof TelemetryEquipmentItem)[] = [
    'tempMotor',
    'tempBrg1',
    'tempBrg2',
    'tempChamberUpper',
    'tempChamberLower',
    'tempCoolantIn',
    'tempCoolantOut',
    'pressMain',
    'pressSub',
    'pressAir',
    'flowCoolant',
    'flowLube',
    'flowExhaust',
    'rpm',
    'loadRate',
    'powerKw',
    'volt',
    'ampere',
    'torque1',
    'torque2',
    'vibX',
    'vibY',
    'vibZ',
    'shockPeak',
    'freqShift',
    'noiseDb',
    'ambientTemp',
    'humidity',
    'co2Ppm',
    'vocPpm',
    'particleCount',
    'oeeRate',
    'actualQty',
    'achieveRate',
    'defectQty',
    'defectPpm',
    'cycleTime',
    'packetRate',
    'latencyMs',
    'packetLoss'
];

/**
 * 지정된 범위 내 무작위 실수를 소수점 자릿수에 맞춰 반환합니다.
 */
function randomFloat(min: number, max: number, decimals = 1): number {
    const val = Math.random() * (max - min) + min;
    return Number(val.toFixed(decimals));
}

/**
 * 지정된 범위 내 무작위 정수를 반환합니다.
 */
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 현재 시분초 문자열(HH:mm:ss)을 반환합니다.
 */
function getCurrentTimeString(): string {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

/**
 * 스마트 팩토리 2,000대 설비의 초기 텔레메트리 데이터셋을 고속 생성합니다.
 * @param count 생성할 설비 대수 (기본값 2,000대)
 */
export function generateTelemetryData(count = 2000): TelemetryEquipmentItem[] {
    const list: TelemetryEquipmentItem[] = new Array(count);
    const timeStr = getCurrentTimeString();

    for (let i = 0; i < count; i++) {
        const zone = ZONES[i % ZONES.length];
        const lineNum = (i % 12) + 1;
        const line = `LINE-${String(lineNum).padStart(2, '0')}`;
        const eqId = `EQ-${String(i + 1).padStart(4, '0')}`;
        const eqName = EQ_NAMES[i % EQ_NAMES.length];

        const targetQty = randomInt(1500, 3000);
        const actualQty = randomInt(800, targetQty);
        const achieveRate = Number(((actualQty / targetQty) * 100).toFixed(1));
        const defectQty = randomInt(0, 25);
        const defectPpm = actualQty > 0 ? Math.round((defectQty / actualQty) * 1_000_000) : 0;

        const statusRoll = Math.random();
        const status: TelemetryEquipmentItem['status'] =
            statusRoll > 0.15 ? '가동' : statusRoll > 0.05 ? '대기' : '점검';
        const alarmLevel: TelemetryEquipmentItem['alarmLevel'] =
            defectPpm > 1000 ? '경보' : defectPpm > 400 ? '주의' : '정상';

        list[i] = {
            zone,
            line,
            eqId,
            eqName,
            tempMotor: randomFloat(42.0, 68.0, 1),
            tempBrg1: randomFloat(38.0, 55.0, 1),
            tempBrg2: randomFloat(39.0, 56.0, 1),
            tempChamberUpper: randomFloat(28.0, 40.0, 1),
            tempChamberLower: randomFloat(25.0, 35.0, 1),
            tempCoolantIn: randomFloat(16.0, 22.0, 1),
            tempCoolantOut: randomFloat(22.0, 30.0, 1),
            pressMain: randomFloat(130.0, 160.0, 1),
            pressSub: randomFloat(70.0, 90.0, 1),
            pressAir: randomFloat(5.5, 7.2, 1),
            flowCoolant: randomFloat(38.0, 52.0, 1),
            flowLube: randomFloat(9.0, 15.0, 1),
            flowExhaust: randomInt(1100, 1400),
            rpm: randomInt(3200, 5800),
            loadRate: randomFloat(45.0, 88.0, 1),
            powerKw: randomFloat(25.0, 48.0, 1),
            volt: randomInt(375, 385),
            ampere: randomFloat(38.0, 58.0, 1),
            torque1: randomFloat(22.0, 36.0, 1),
            torque2: randomFloat(20.0, 34.0, 1),
            vibX: randomFloat(0.35, 1.25, 2),
            vibY: randomFloat(0.4, 1.35, 2),
            vibZ: randomFloat(0.3, 1.1, 2),
            shockPeak: randomFloat(0.6, 2.1, 2),
            freqShift: randomFloat(10.5, 18.2, 1),
            noiseDb: randomFloat(65.0, 78.5, 1),
            ambientTemp: randomFloat(21.0, 26.5, 1),
            humidity: randomFloat(40.0, 55.0, 1),
            co2Ppm: randomInt(420, 650),
            vocPpm: randomFloat(0.05, 0.35, 2),
            particleCount: randomInt(800, 2200),
            oeeRate: randomFloat(78.0, 96.0, 1),
            targetQty,
            actualQty,
            achieveRate,
            defectQty,
            defectPpm,
            cycleTime: randomFloat(3.5, 6.2, 1),
            status,
            alarmLevel,
            packetRate: randomInt(90, 110),
            latencyMs: randomFloat(1.2, 4.8, 1),
            packetLoss: randomFloat(0.0, 0.05, 2),
            firmwareVer: `v${(i % 3) + 2}.${(i % 5) + 1}.0`,
            maintDday: `D-${(i % 45) + 1}`,
            updatedAt: timeStr
        };
    }

    return list;
}

/**
 * 실시간 틱에서 변경된 셀의 정보를 담는 인터페이스
 */
export interface MutatedCellInfo {
    rowIndex: number;
    field: keyof TelemetryEquipmentItem;
    oldValue: any;
    newValue: any;
}

/**
 * 2,000개 데이터셋 중 지정된 셀 개수만큼 무작위로 선택하여 현실적인 미세 변동(Tick)을 적용합니다.
 * @param items 전체 설비 데이터셋
 * @param cellCount 한 틱당 변경할 셀 수 (예: 20, 60, 150)
 * @returns 변경된 셀들의 좌표 및 값 정보 목록
 */
export function mutateRandomCells(
    items: TelemetryEquipmentItem[],
    cellCount: number,
    visibleRowIndices?: number[]
): MutatedCellInfo[] {
    const total = items.length;
    if (total === 0) {
        return [];
    }

    const fieldCount = MUTABLE_NUMERIC_FIELDS.length;
    const mutatedList: MutatedCellInfo[] = [];
    const timeStr = getCurrentTimeString();
    const hasVisibleRows = Array.isArray(visibleRowIndices) && visibleRowIndices.length > 0;

    for (let c = 0; c < cellCount; c++) {
        // 80% 확률로 사용자가 현재 스크롤하여 보고 있는 뷰포트 영역에서 선택
        let rowIndex: number;
        if (hasVisibleRows && Math.random() < 0.8) {
            const vIdx = Math.floor(Math.random() * visibleRowIndices.length);
            rowIndex = visibleRowIndices[vIdx];
            // 인덱스 범위 안전성 보장
            if (rowIndex < 0 || rowIndex >= total) {
                rowIndex = Math.floor(Math.random() * total);
            }
        } else if (!hasVisibleRows && Math.random() < 0.75 && total > 80) {
            rowIndex = Math.floor(Math.random() * Math.min(80, total));
        } else {
            rowIndex = Math.floor(Math.random() * total);
        }

        const field = MUTABLE_NUMERIC_FIELDS[Math.floor(Math.random() * fieldCount)];
        const target = items[rowIndex];
        if (!target) {
            continue;
        }

        const oldVal = target[field];

        if (typeof oldVal === 'number') {
            // 산업 텔레메트리 현장 특성을 반영한 현실적 미세 변동 (±1.5% ~ ±5.0%)
            const deltaPercent = Math.random() * 0.08 - 0.04;
            let newVal = oldVal * (1 + deltaPercent);

            // 필드 특성에 따른 반올림/자릿수 보정 및 최소 변동값 보장
            if (Number.isInteger(oldVal) || field === 'rpm' || field === 'co2Ppm' || field === 'particleCount') {
                newVal = Math.round(newVal);
                if (newVal === oldVal) {
                    newVal += Math.random() > 0.5 ? 1 : -1;
                }
            } else if (
                field === 'vibX' ||
                field === 'vibY' ||
                field === 'vibZ' ||
                field === 'shockPeak' ||
                field === 'vocPpm'
            ) {
                newVal = Number(newVal.toFixed(2));
                if (newVal === oldVal) {
                    newVal = Number((newVal + (Math.random() > 0.5 ? 0.02 : -0.02)).toFixed(2));
                }
            } else {
                newVal = Number(newVal.toFixed(1));
                if (newVal === oldVal) {
                    newVal = Number((newVal + (Math.random() > 0.5 ? 0.2 : -0.2)).toFixed(1));
                }
            }

            // 음수 방지
            if (newVal < 0) {
                newVal = 0;
            }

            (target[field] as any) = newVal;
            target.updatedAt = timeStr;

            mutatedList.push({
                rowIndex,
                field,
                oldValue: oldVal,
                newValue: newVal
            });
        }
    }

    return mutatedList;
}
