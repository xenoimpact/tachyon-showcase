import type {OrderItem, OrderPriority, OrderStatus, ProductCategory} from './types/order';

const CUSTOMER_POOL = [
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

const DEPT_POOL = [
    '스마트팩토리기획팀',
    '생산기술혁신팀',
    '품질보증추진부',
    '모빌리티DX센터',
    '글로벌구매운영팀',
    'IT인프라관제팀',
    '선행공정개발실',
    '안전환경경영팀'
];

const PRODUCT_POOL: {name: string; category: ProductCategory; price: number}[] = [
    {name: '스마트 팩토리 IoT 센서 모듈', category: '센서/네트워크', price: 150_000},
    {name: '차세대 MES 관제 플랫폼 라이선스', category: '소프트웨어', price: 12_000_000},
    {name: 'AI 기반 표면 비전 검사기', category: '하드웨어', price: 45_000_000},
    {name: '고가용성 엣지 컴퓨팅 서버 랙', category: '인프라', price: 8_500_000},
    {name: '산업용 제어망 방화벽 어플라이언스', category: '보안솔루션', price: 5_200_000},
    {name: '공정 데이터 실시간 레이크 하우스', category: '소프트웨어', price: 24_000_000},
    {name: '초고속 무선 AP 산업용 패키지', category: '센서/네트워크', price: 850_000},
    {name: '통합 장애 예지보전 AI 알고리즘', category: '소프트웨어', price: 18_000_000}
];

const STATUS_POOL: OrderStatus[] = ['진행중', '검수완료', '지연', '준비중', '보류'];
const PRIORITY_POOL: OrderPriority[] = ['보통', '높음', '긴급', '낮음'];

// 사전 캐싱된 12개월 추세 패턴 (대용량 메모리 효율화)
const TREND_PATTERNS: number[][] = [
    [10, 12, 14, 15, 16, 18, 17, 19, 20, 22, 21, 23],
    [25, 24, 25, 23, 22, 21, 22, 20, 19, 18, 17, 16],
    [15, 15, 16, 16, 15, 15, 16, 16, 15, 15, 16, 16],
    [5, 8, 12, 16, 20, 25, 30, 35, 40, 44, 48, 52]
];

/**
 * 대용량 데이터(1만 / 10만 / 100만 건)를 밀리초 단위로 초고속 생성하는 고성능 제너레이터
 * @param count 생성할 레코드 건수
 */
export function generateLargeDataset(count: number): OrderItem[] {
    const result = new Array<OrderItem>(count);
    const custLen = CUSTOMER_POOL.length;
    const deptLen = DEPT_POOL.length;
    const prodLen = PRODUCT_POOL.length;
    const statLen = STATUS_POOL.length;
    const prioLen = PRIORITY_POOL.length;
    const trendLen = TREND_PATTERNS.length;

    for (let i = 0; i < count; i++) {
        const seq = i + 1;
        const prod = PRODUCT_POOL[i % prodLen];
        const qty = 1 + ((i * 7) % 50);
        const unitPrice = prod.price;
        const supplyAmount = qty * unitPrice;
        const vat = Math.round(supplyAmount * 0.1);
        const totalAmount = supplyAmount + vat;
        const targetAmount = Math.round(supplyAmount * 0.9);
        const achievementRate = targetAmount > 0 ? Math.round((supplyAmount / targetAmount) * 100) : 100;

        const m = 1 + (i % 12);
        const d = 1 + ((i * 3) % 25);
        const monthStr = m < 10 ? `0${m}` : `${m}`;
        const dayStr = d < 10 ? `0${d}` : `${d}`;
        const orderDate = `2026-${monthStr}-${dayStr}`;

        const delM = m === 12 ? 12 : m + 1;
        const delMonthStr = delM < 10 ? `0${delM}` : `${delM}`;
        const deliveryDate = `2026-${delMonthStr}-${dayStr}`;

        const status = STATUS_POOL[i % statLen];

        result[i] = {
            id: `ORD-2026-${String(seq).padStart(7, '0')}`,
            customer: CUSTOMER_POOL[i % custLen],
            department: DEPT_POOL[i % deptLen],
            projectName: prod.name,
            category: prod.category,
            quantity: qty,
            unitPrice,
            supplyAmount,
            vat,
            totalAmount,
            targetAmount,
            achievementRate,
            status,
            priority: PRIORITY_POOL[i % prioLen],
            orderDate,
            deliveryDate,
            completionDate: status === '검수완료' ? deliveryDate : undefined,
            monthlyTrend: TREND_PATTERNS[i % trendLen]
        };
    }

    return result;
}
