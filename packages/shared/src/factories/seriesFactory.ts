import {Factory} from 'fishery';
import type {VisualizationItem} from '../seriesData';

const VIZ_PRODUCTS = [
    {name: '차세대 MES 관제 솔루션', category: '소프트웨어', target: 120_000_000, actual: 135_000_000},
    {name: 'AI 비전 표면 검사 패키지', category: '하드웨어', target: 200_000_000, actual: 190_000_000},
    {name: '스마트 IoT 게이트웨이 랙', category: '센서/네트워크', target: 80_000_000, actual: 62_000_000},
    {name: '고가용성 엣지 서버 솔루션', category: '인프라', target: 150_000_000, actual: 165_000_000},
    {name: '산업제어망 방화벽 어플라이언스', category: '보안솔루션', target: 100_000_000, actual: 98_000_000},
    {name: '실시간 공정 데이터 레이크', category: '소프트웨어', target: 250_000_000, actual: 210_000_000},
    {name: '예지보전 센서 진단 모듈', category: '센서/네트워크', target: 70_000_000, actual: 45_000_000},
    {name: '공정 자동화 PLC 인터페이스', category: '하드웨어', target: 110_000_000, actual: 125_000_000}
];

export const seriesFactory = Factory.define<VisualizationItem>(({sequence, params}) => {
    const seq = sequence;
    const base = VIZ_PRODUCTS[(seq - 1) % VIZ_PRODUCTS.length];

    const target = params.target ?? base.target;
    const actual = params.actual ?? base.actual;

    // 수식: 달성률 자동 계산
    const achievementRate = target > 0 ? Math.round((actual / target) * 100) : 0;

    // 비즈니스 룰: 추세 및 상태 자동 판별
    let trendType: '상승' | '보합' | '하강' = '보합';
    if (achievementRate > 105) {
        trendType = '상승';
    } else if (achievementRate < 80) {
        trendType = '하강';
    }

    let status: '우수' | '양호' | '경고' = '양호';
    if (achievementRate >= 100) {
        status = '우수';
    } else if (achievementRate < 80) {
        status = '경고';
    }

    // 위험 지수 (달성률과 반비례)
    const riskScore = params.riskScore ?? Math.max(5, Math.min(95, 100 - achievementRate + ((seq * 7) % 15)));

    // 12개월 스파크라인 배열 생성 (월별 수치 패턴)
    const baseMonthly = Math.round(actual / 12 / 1_000_000);
    const monthlySales = Array.from({length: 12}, (_, i) => {
        const trendFactor = trendType === '상승' ? i * 0.5 : trendType === '하강' ? (12 - i) * 0.4 : 0;
        return Math.max(1, Math.round(baseMonthly + trendFactor + ((seq + i) % 3) - 1));
    });

    return {
        id: `VIZ-${String(seq).padStart(3, '0')}`,
        productName: params.productName ?? base.name,
        category: params.category ?? base.category,
        target,
        actual,
        achievementRate,
        monthlySales,
        trendType: params.trendType ?? trendType,
        status: params.status ?? status,
        riskScore
    };
});
