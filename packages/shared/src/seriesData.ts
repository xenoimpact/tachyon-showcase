import {seriesFactory} from './factories/seriesFactory';

export interface VisualizationItem {
    id: string;
    productName: string;
    location: string;
    category: string;
    target: number;
    actual: number;
    yoyGrowth: number;
    achievementRate: number;
    monthlySales: number[];
    trendType: '상승' | '보합' | '하강';
    status: '우수' | '양호' | '경고';
    riskScore: number;
    lastAuditDate: string;
}

/**
 * seriesFactory 기반으로 수식 및 12개월 추세가 검증된 대표 품목 시각화 데이터셋 (500건)
 */
export const mockSeriesData: VisualizationItem[] = seriesFactory.buildList(500);

export function getMockSeriesData(count = 500): VisualizationItem[] {
    return seriesFactory.buildList(count);
}
