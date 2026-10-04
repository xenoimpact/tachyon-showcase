import {orderFactory} from './factories/orderFactory';
import type {OrderItem} from './types/order';

/**
 * 기본 그리드, 정렬/필터, 셀 수정 화면에서 사용하는 정합성 보장 100건 데이터셋
 */
export const mockOrders: OrderItem[] = orderFactory.buildList(100);
export const basicMockOrders: OrderItem[] = mockOrders;

export function getMockOrders(count = 100): OrderItem[] {
    return orderFactory.buildList(count);
}
