import type {GridColumnDef} from './types/column';

/**
 * 화면 1: 기본 그리드용 컬럼 정의 (멀티헤더, 좌측 열 고정, 상태 배지, 숫자 콤마)
 */
export const basicGridColumns: GridColumnDef[] = [
    {field: 'id', headerName: '주문번호', width: 130, pinned: 'left', align: 'center', sortable: true},
    {field: 'customer', headerName: '고객사명', width: 140, pinned: 'left', sortable: true},
    {
        field: 'projectInfo',
        headerName: '프로젝트 정보',
        children: [
            {field: 'projectName', headerName: '프로젝트/품목명', width: 220, sortable: true},
            {field: 'category', headerName: '분류', width: 120, align: 'center', sortable: true},
            {field: 'department', headerName: '담당부서', width: 140, sortable: true}
        ]
    },
    {
        field: 'amountInfo',
        headerName: '금액 및 수량 (VAT 포함)',
        children: [
            {field: 'quantity', headerName: '수량', width: 90, align: 'right', sortable: true},
            {field: 'unitPrice', headerName: '단가', width: 120, align: 'right', sortable: true},
            {field: 'supplyAmount', headerName: '공급가액', width: 130, align: 'right', sortable: true},
            {field: 'vat', headerName: '부가세(10%)', width: 110, align: 'right', sortable: true},
            {field: 'totalAmount', headerName: '합계금액', width: 140, align: 'right', sortable: true}
        ]
    },
    {field: 'status', headerName: '진행상태', width: 110, align: 'center', renderer: 'badge', sortable: true},
    {field: 'priority', headerName: '우선순위', width: 100, align: 'center', sortable: true},
    {field: 'orderDate', headerName: '주문일자', width: 120, align: 'center', sortable: true},
    {field: 'deliveryDate', headerName: '납기일자', width: 120, align: 'center', sortable: true}
];

/**
 * 화면 2: 트리 그리드용 컬럼 정의
 */
export const treeGridColumns: GridColumnDef[] = [
    {field: 'name', headerName: '조직 / 단위 프로젝트명', width: 300, pinned: 'left'},
    {field: 'code', headerName: '코드', width: 110, align: 'center'},
    {field: 'category', headerName: '구분', width: 120, align: 'center'},
    {field: 'manager', headerName: '담당자/책임자', width: 130, align: 'center'},
    {field: 'budget', headerName: '배정 예산', width: 140, align: 'right'},
    {field: 'spent', headerName: '집행 실적', width: 140, align: 'right'},
    {field: 'achievementRate', headerName: '집행률(%)', width: 110, align: 'right', renderer: 'progress'},
    {field: 'status', headerName: '상태', width: 100, align: 'center', renderer: 'badge'}
];

/**
 * 화면 5: 셀 시각화 그리드용 컬럼 정의
 */
export const visualizationGridColumns: GridColumnDef[] = [
    {field: 'id', headerName: '품목코드', width: 110, pinned: 'left', align: 'center', sortable: true},
    {field: 'productName', headerName: '품목 / 솔루션명', width: 220, pinned: 'left', sortable: true},
    {field: 'location', headerName: '관할 사업장', width: 110, align: 'center', sortable: true},
    {field: 'category', headerName: '분류', width: 120, align: 'center', sortable: true},
    {field: 'target', headerName: '연간 목표액', width: 130, align: 'right', sortable: true},
    {field: 'actual', headerName: '연간 실적액', width: 130, align: 'right', sortable: true},
    {field: 'yoyGrowth', headerName: '전년비 YoY', width: 110, align: 'right', renderer: 'yoyGrowth', sortable: true},
    {
        field: 'achievementRate',
        headerName: '목표 달성률 (게이지)',
        width: 160,
        renderer: 'progressBar',
        align: 'center',
        sortable: true
    },
    {
        field: 'monthlySales',
        headerName: '12개월 매출 추세 (스파크라인)',
        width: 220,
        renderer: 'sparkline',
        align: 'center'
    },
    {field: 'trendType', headerName: '추세 지표', width: 90, align: 'center', sortable: true},
    {field: 'status', headerName: '성과 평가', width: 90, align: 'center', renderer: 'badge', sortable: true},
    {
        field: 'riskScore',
        headerName: '위험 지수 (히트맵)',
        width: 120,
        align: 'center',
        renderer: 'heatmap',
        sortable: true
    },
    {field: 'lastAuditDate', headerName: '최종 점검일', width: 115, align: 'center', sortable: true}
];
