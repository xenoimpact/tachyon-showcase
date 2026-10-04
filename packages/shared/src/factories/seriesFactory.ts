import {Factory} from 'fishery';
import type {VisualizationItem} from '../seriesData';

/**
 * 20종의 현실적 산업군별 핵심 솔루션/설비 베이스
 */
const VIZ_BASE_PRODUCTS = [
    // 인프라 (2.5억 ~ 7.5억)
    {name: '데이터센터 고가용성 블레이드 랙', category: '인프라', minTarget: 380, maxTarget: 680},
    {name: '초고속 백본 스위치 패브릭 시스템', category: '인프라', minTarget: 290, maxTarget: 520},
    {name: '데이터센터 랙형 수랭 항온항습기', category: '인프라', minTarget: 210, maxTarget: 390},
    {name: '무정전 전원 공급 장치 (UPS Cluster)', category: '인프라', minTarget: 240, maxTarget: 440},

    // 소프트웨어 (1.8억 ~ 4.8억)
    {name: '스마트 MES 제조공정 실행 솔루션', category: '소프트웨어', minTarget: 220, maxTarget: 450},
    {name: '실시간 SCADA 통합 관제 플랫폼', category: '소프트웨어', minTarget: 190, maxTarget: 380},
    {name: '디지털 트윈 공정 3D 시뮬레이터', category: '소프트웨어', minTarget: 260, maxTarget: 480},
    {name: '시계열 빅데이터 분석 레이크', category: '소프트웨어', minTarget: 230, maxTarget: 420},

    // 하드웨어 (1.2억 ~ 3.5억)
    {name: 'AI 딥러닝 비전 표면 검사기', category: '하드웨어', minTarget: 180, maxTarget: 340},
    {name: '6축 다관절 로봇 서보 컨트롤러', category: '하드웨어', minTarget: 160, maxTarget: 310},
    {name: '초정밀 모션 제어 PLC 유닛', category: '하드웨어', minTarget: 130, maxTarget: 260},
    {name: '스마트 자동창고 WMS 스태커 크레인', category: '하드웨어', minTarget: 200, maxTarget: 350},

    // 센서/네트워크 (4천만 ~ 1.8억)
    {name: '3축 초음파 진동 예지보전 센서', category: '센서/네트워크', minTarget: 60, maxTarget: 130},
    {name: '비접촉 적외선 정밀 온도 트랜스미터', category: '센서/네트워크', minTarget: 45, maxTarget: 95},
    {name: 'LoRaWAN 장거리 산업 게이트웨이', category: '센서/네트워크', minTarget: 55, maxTarget: 110},
    {name: '작업장 유해가스 환경 감지 센서 팩', category: '센서/네트워크', minTarget: 40, maxTarget: 85},

    // 보안솔루션 (1억 ~ 3억)
    {name: 'OT/ICS 산업제어망 전용 방화벽', category: '보안솔루션', minTarget: 140, maxTarget: 280},
    {name: '제로 트러스트 엔드포인트 EDR 시스템', category: '보안솔루션', minTarget: 160, maxTarget: 300},
    {name: '산업 프로토콜 이상 트래픽 IDS 탐지기', category: '보안솔루션', minTarget: 120, maxTarget: 240},
    {name: '암호화 하드웨어 보안 모듈 (HSM)', category: '보안솔루션', minTarget: 150, maxTarget: 270}
];

const LOCATIONS = [
    '판교 R&D센터',
    '울산 1공장',
    '화성 FAB-3',
    '구미 스마트센터',
    '창원 제조라인',
    '청주 모듈공장',
    '송도 스마트랩',
    '광주 물류센터',
    '아산 조립공장',
    '여수 플랜트'
];

const PRODUCT_TAGS = [
    '라인 1호기',
    '라인 2호기',
    '메인 센터',
    '백업 시스템',
    'Rev.A',
    'Rev.B',
    'Cluster 01',
    'Cluster 02',
    '증설팩',
    '개체분할'
];

/**
 * 모순 없는 수학적·비즈니스적 정합성을 갖춘 시리즈 데이터 팩토리
 */
export const seriesFactory = Factory.define<VisualizationItem>(({sequence, params}) => {
    const seq = sequence;
    const base = VIZ_BASE_PRODUCTS[(seq - 1) % VIZ_BASE_PRODUCTS.length];
    const location = LOCATIONS[(seq - 1) % LOCATIONS.length];
    const tag = PRODUCT_TAGS[Math.floor((seq - 1) / VIZ_BASE_PRODUCTS.length) % PRODUCT_TAGS.length];

    // 1. 목표액 (target): 품목별 최소~최대 범위에서 백만 원 단위로 자연스럽게 분산
    const targetRange = base.maxTarget - base.minTarget;
    const targetMillion = base.minTarget + Math.round((((seq * 37) % 100) / 100) * targetRange);
    const calculatedTarget = targetMillion * 1_000_000;
    const target = params.target ?? calculatedTarget;

    // 2. 달성률 (achievementRate) 및 실적액 (actual):
    // 65% ~ 135% 사이의 연속 정규형 분포 (특정 상한값 115% 캡 제거)
    // 중심값 96% 안팎, 좌우로 자연스럽게 분산
    const pseudoNorm = ((((seq * 17) % 31) - 15) / 15) * 0.25 + ((((seq * 43) % 23) - 11) / 11) * 0.12;
    let rateFactor = 0.96 + pseudoNorm; // 약 0.65 ~ 1.33
    rateFactor = Math.max(0.65, Math.min(1.35, rateFactor));

    // 실적액을 백만 원 단위 정수로 계산
    const calculatedActual = Math.round((target * rateFactor) / 1_000_000) * 1_000_000;
    const actual = params.actual ?? calculatedActual;

    // 수식: 달성률을 정수로 정확히 계산 (모순 0)
    const achievementRate = target > 0 ? Math.round((actual / target) * 100) : 0;

    // 3. 전년비 성장률 (yoyGrowth, %):
    // 달성률에 강하게 연동되면서 자연스러운 개별 편차 반영 (-18.0% ~ +36.0%)
    const growthBase = (achievementRate - 95) * 0.75;
    const growthNoise = (((seq * 19) % 21) - 10) * 0.35;
    const rawGrowth = Number((growthBase + growthNoise).toFixed(1));
    const yoyGrowth = params.yoyGrowth ?? Math.max(-20.0, Math.min(40.0, rawGrowth));

    // 4. 추세 지표 (trendType): yoyGrowth와 100% 일치 (모순 0)
    // yoyGrowth >= +4.0%: 상승
    // -4.0% < yoyGrowth < +4.0%: 보합
    // yoyGrowth <= -4.0%: 하강
    let trendType: '상승' | '보합' | '하강' = '보합';
    if (yoyGrowth >= 4.0) {
        trendType = '상승';
    } else if (yoyGrowth <= -4.0) {
        trendType = '하강';
    }

    // 5. 성과 평가 (status): achievementRate와 100% 일치
    let status: '우수' | '양호' | '경고' = '양호';
    if (achievementRate >= 100) {
        status = '우수';
    } else if (achievementRate < 80) {
        status = '경고';
    }

    // 6. 위험 지수 (riskScore, 0~100):
    // 달성률과 100% 반비례하는 단조 감소 함수 (달성률이 높을수록 위험도는 반드시 낮음)
    // 달성률 130% -> risk ~ 8 (안전)
    // 달성률 100% -> risk ~ 22 (안전)
    // 달성률 85%  -> risk ~ 45 (보통)
    // 달성률 70%  -> risk ~ 75 (위험)
    const baseRisk = 110 - achievementRate;
    const riskNoise = ((seq * 7) % 7) - 3; // -3 ~ +3 미세 변동
    const calculatedRisk = Math.max(5, Math.min(95, Math.round(baseRisk + riskNoise)));
    const riskScore = params.riskScore ?? calculatedRisk;

    // 7. 12개월 매출 배열 (monthlySales):
    // 원칙: 12개월 매출(백만 원 단위)의 총합이 정확히 actual / 1_000_000과 일치하도록 정규화!
    const totalMillion = Math.round(actual / 1_000_000);
    const patternType = seq % 4;

    // 12개월 상대 가중치 생성
    const rawWeights = Array.from({length: 12}, (_, i) => {
        const month = i + 1;
        // 분기말(3, 6, 9, 12월) 실적 집중 계절성 반영
        const quarterEndBoost = month % 3 === 0 ? 1.18 : 0.95;

        let trendWeight = 1.0;
        if (patternType === 0) {
            // 상승형
            trendWeight = 0.75 + i * 0.05;
        } else if (patternType === 1) {
            // 하향형
            trendWeight = 1.25 - i * 0.04;
        } else if (patternType === 2) {
            // U자형
            const distFromMid = Math.abs(i - 5.5) / 5.5;
            trendWeight = 0.85 + distFromMid * 0.35;
        } else {
            // 횡보형
            trendWeight = 0.95 + ((i + seq) % 5) * 0.025;
        }

        return trendWeight * quarterEndBoost;
    });

    const sumWeights = rawWeights.reduce((a, b) => a + b, 0);

    // 정규화하여 12개월 정수 배열 생성
    let currentSum = 0;
    const monthlySales = rawWeights.map((w, idx) => {
        if (idx === 11) {
            // 마지막 달에 나머지 차액을 할당하여 sum === totalMillion 100% 보장
            return Math.max(1, totalMillion - currentSum);
        }
        const val = Math.max(1, Math.round((w / sumWeights) * totalMillion));
        currentSum += val;
        return val;
    });

    // 8. 최종 점검일자 (2026-09-01 ~ 2026-10-04)
    const dayOffset = (seq * 3) % 34;
    const auditDate = new Date(2026, 9, 4 - dayOffset);
    const yyyy = auditDate.getFullYear();
    const mm = String(auditDate.getMonth() + 1).padStart(2, '0');
    const dd = String(auditDate.getDate()).padStart(2, '0');
    const lastAuditDate = `${yyyy}-${mm}-${dd}`;

    const productName = params.productName ?? `${base.name} (${tag})`;

    return {
        id: `VIZ-${String(seq).padStart(4, '0')}`,
        productName,
        location: params.location ?? location,
        category: params.category ?? base.category,
        target,
        actual,
        yoyGrowth,
        achievementRate,
        monthlySales,
        trendType: params.trendType ?? trendType,
        status: params.status ?? status,
        riskScore,
        lastAuditDate: params.lastAuditDate ?? lastAuditDate
    };
});
