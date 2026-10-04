import {seriesFactory} from './factories/seriesFactory';

export interface VisualizationItem {
    id: string;
    productName: string;
    category: string;
    target: number;
    actual: number;
    achievementRate: number;
    monthlySales: number[];
    trendType: '상승' | '보합' | '하강';
    status: '우수' | '양호' | '경고';
    riskScore: number;
}

/**
 * seriesFactory 기반으로 수식 및 12개월 추세가 검증된 8개 대표 품목 시각화 데이터셋
 */
export const mockSeriesData: VisualizationItem[] = seriesFactory.buildList(8);

export function getMockSeriesData(count = 8): VisualizationItem[] {
    return seriesFactory.buildList(count);
}
