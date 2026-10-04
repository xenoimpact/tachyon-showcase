import {Factory} from 'fishery';
import type {OrderItem, OrderPriority, OrderStatus, ProductCategory} from '../types/order';

const CUSTOMERS = [
    '현대모비스',
    '삼성전자',
    'LG에너지솔루션',
    'SK하이닉스',
    '현대자동차',
    '포스코홀딩스',
    '현대제철',
    '한화에어로스페이스',
    '네이버클라우드',
    '카카오엔터프라이즈'
];

const DEPARTMENTS = [
    '스마트팩토리기획팀',
    '생산기술혁신팀',
    '품질보증추진부',
    '모빌리티DX센터',
    '글로벌구매운영팀',
    'IT인프라관제팀',
    '선행공정개발실',
    '안전환경경영팀'
];

const PROJECTS: {name: string; category: ProductCategory; basePrice: number}[] = [
    {name: '스마트 팩토리 IoT 센서 모듈', category: '센서/네트워크', basePrice: 150_000},
    {name: '차세대 MES 관제 플랫폼 라이선스', category: '소프트웨어', basePrice: 12_000_000},
    {name: 'AI 기반 표면 비전 검사기', category: '하드웨어', basePrice: 45_000_000},
    {name: '고가용성 엣지 컴퓨팅 서버 랙', category: '인프라', basePrice: 8_500_000},
    {name: '산업용 제어망 방화벽 어플라이언스', category: '보안솔루션', basePrice: 5_200_000},
    {name: '공정 데이터 실시간 레이크 하우스', category: '소프트웨어', basePrice: 24_000_000},
    {name: '초고속 무선 AP 산업용 패키지', category: '센서/네트워크', basePrice: 850_000},
    {name: '통합 장애 예지보전 AI 알고리즘', category: '소프트웨어', basePrice: 18_000_000}
];

const PRIORITIES: OrderPriority[] = ['보통', '높음', '긴급', '낮음'];

export const orderFactory = Factory.define<OrderItem>(({sequence, params}) => {
    const seq = sequence;
    const project = PROJECTS[(seq - 1) % PROJECTS.length];
    const customer = CUSTOMERS[(seq - 1) % CUSTOMERS.length];
    const department = DEPARTMENTS[(seq - 1) % DEPARTMENTS.length];
    const priority = PRIORITIES[(seq - 1) % PRIORITIES.length];

    // 수량 및 단가 (단가에 100원 단위 정돈)
    const quantity = params.quantity ?? 1 + ((seq * 7) % 50);
    const unitPrice = params.unitPrice ?? project.basePrice;

    // 수식 계산
    const supplyAmount = quantity * unitPrice;
    const vat = Math.round(supplyAmount * 0.1);
    const totalAmount = supplyAmount + vat;

    // 목표 금액 설정 (수량 기반 적정 목표치)
    const targetAmount = params.targetAmount ?? Math.round(supplyAmount * (0.8 + ((seq * 13) % 40) / 100));
    const rawRate = targetAmount > 0 ? Math.round((supplyAmount / targetAmount) * 100) : 0;
    const achievementRate = params.achievementRate ?? rawRate;

    // 날짜 생성 (2026년 기준 인과관계 보장)
    const month = 1 + ((seq - 1) % 12);
    const day = 1 + ((seq * 3) % 25);
    const orderDate = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // 납기일은 주문일로부터 15~45일 뒤
    const deliveryMonth = month + (day > 15 ? 1 : 0);
    const deliveryDay = day > 15 ? day - 15 : day + 14;
    const validDeliveryMonth = deliveryMonth > 12 ? 12 : deliveryMonth;
    const deliveryDate = `2026-${String(validDeliveryMonth).padStart(2, '0')}-${String(deliveryDay).padStart(2, '0')}`;

    // 상태 계산 (비즈니스 인과관계 보장)
    let status: OrderStatus = '진행중';
    let completionDate: string | undefined = undefined;

    if (achievementRate >= 100) {
        status = '검수완료';
        completionDate = deliveryDate;
    } else if (seq % 11 === 0) {
        status = '지연';
    } else if (seq % 17 === 0) {
        status = '보류';
    } else if (achievementRate < 30) {
        status = '준비중';
    } else {
        status = '진행중';
    }

    if (params.status) {
        status = params.status;
    }

    // 12개월 추세 데이터 (스파크라인 및 미니 차트용)
    const monthlyTrend = Array.from({length: 12}, (_, i) => {
        const base = Math.round(quantity * (0.5 + ((seq + i * 3) % 10) / 10));
        return base;
    });

    return {
        no: seq,
        id: `ORD-2026-${String(seq).padStart(4, '0')}`,
        customer,
        department,
        projectName: project.name,
        category: project.category,
        quantity,
        unitPrice,
        supplyAmount,
        vat,
        totalAmount,
        targetAmount,
        achievementRate,
        status,
        priority,
        orderDate,
        deliveryDate,
        completionDate,
        monthlyTrend
    };
});
