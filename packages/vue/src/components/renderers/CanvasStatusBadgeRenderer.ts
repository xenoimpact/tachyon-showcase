import type {DataGrid} from 'tachyon.vue';

/**
 * 타키온 네이티브 Canvas 2D 기반 상태 배지 렌더러
 * DOM 노드를 일절 생성하지 않고 타키온 메인 그리드 캔버스 컨텍스트에서 직접 고속 드로잉합니다.
 */
export const CanvasStatusBadgeRenderer = {
    grid: null as DataGrid,

    created(grid: DataGrid): void {
        this.grid = grid;
    },

    prepare(grid: DataGrid, state: any): void {
        if (grid) {
            this.grid = grid;
        }
    },

    paint(ctx: CanvasRenderingContext2D, state: any, w: number, h: number): void {
        const val = state?.label ?? state?.item?.[state?.column?.dataField] ?? '';
        if (!val) {
            return;
        }

        ctx.save();

        // 1. 상태별 색상 팔레트 정의 (은은한 틴트 배경 + 또렷한 포인트 닷/텍스트)
        let bg = 'rgba(16, 185, 129, 0.16)';
        let text = '#10b981';
        let dot = '#10b981';

        if (val === '대기' || val === '주의' || val === '양호') {
            bg = 'rgba(245, 158, 11, 0.18)';
            text = '#f59e0b';
            dot = '#f59e0b';
        } else if (val === '점검' || val === '경보' || val === '경고' || val === '하강' || val === '지연') {
            bg = 'rgba(239, 68, 68, 0.18)';
            text = '#ef4444';
            dot = '#ef4444';
        }

        // 2. 캡슐 배지 치수 및 좌표 계산 (24px 행 높이에 맞는 16px 콤팩트 배지)
        const badgeW = Math.min(w - 6, 44);
        const badgeH = 16;
        const x = Math.round((w - badgeW) / 2);
        const y = Math.round((h - badgeH) / 2);
        const radius = 3;

        // 3. 둥근 캡슐 배경 드로잉
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, badgeW, badgeH, radius);
        } else {
            ctx.rect(x, y, badgeW, badgeH);
        }
        ctx.fillStyle = bg;
        ctx.fill();

        // 4. 상태 인디케이터 원형 닷 드로잉
        const dotX = x + 6;
        const dotY = y + badgeH / 2;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
        ctx.fillStyle = dot;
        ctx.fill();

        // 5. 텍스트 라벨 드로잉
        ctx.font = 'bold 9.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = text;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(val), dotX + 5, dotY);

        ctx.restore();
    }
};
