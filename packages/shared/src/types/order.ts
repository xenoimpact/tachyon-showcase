export type OrderStatus = '준비중' | '진행중' | '검수완료' | '지연' | '보류';

export type OrderPriority = '낮음' | '보통' | '높음' | '긴급';

export type ProductCategory = '인프라' | '소프트웨어' | '하드웨어' | '센서/네트워크' | '보안솔루션';

export interface OrderItem {
    id: string;
    customer: string;
    department: string;
    projectName: string;
    category: ProductCategory;
    quantity: number;
    unitPrice: number;
    supplyAmount: number;
    vat: number;
    totalAmount: number;
    targetAmount: number;
    achievementRate: number;
    status: OrderStatus;
    priority: OrderPriority;
    orderDate: string;
    deliveryDate: string;
    completionDate?: string;
    monthlyTrend: number[];
}
