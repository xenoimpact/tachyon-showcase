import type {DataGrid} from 'tachyon.vue';

export interface CellFlashInfo {
    time: number;
    type: 'up' | 'down';
}

/**
 * 실시간 변경된 셀의 플래시 잔상 정보를 관리하는 전역 맵입니다.
 * key: `${rowIndex}_${field}`
 */
export const cellFlashMap = new Map<string, CellFlashInfo>();

/**
 * 타키온 네이티브 Canvas 2D 기반 실시간 플래시(Flash) 수치 렌더러
 * 값이 갱신될 때 캔버스에 즉각적인 레드(상승)/블루(하강) 플래시 잔상을 페이드아웃하며 고대비 텍스트를 드로잉합니다.
 */
export const CanvasFlashCellRenderer = {
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
        const cp = state?.cellPosition;
        const col = state?.column;
        const field = col?.dataField;

        // 1. 컬럼의 labelFunction을 우선 반영하여 완성형 문자열(단위 포함) 획득
        let val = '';
        if (typeof col?.labelFunction === 'function') {
            val = col.labelFunction(state?.item, col);
        } else if (state?.label != null && state?.label !== '') {
            val = String(state.label);
        } else if (state?.item && field) {
            val = String(state.item[field] ?? '');
        }

        ctx.save();

        // 2. 실시간 틱 플래시 잔상 검사 (최근 550ms 페이드아웃)
        let isFlashing = false;
        let flashType: 'up' | 'down' = 'up';
        let flashProgress = 1;

        if (cp && field) {
            const key = `${cp.rowIndex}_${field}`;
            const flash = cellFlashMap.get(key);
            if (flash) {
                const elapsed = performance.now() - flash.time;
                if (elapsed < 550) {
                    isFlashing = true;
                    flashType = flash.type;
                    flashProgress = elapsed / 550;
                } else {
                    cellFlashMap.delete(key);
                }
            }
        }

        const isLight = document.querySelector('[data-theme="default"]') != null;

        // 3. 플래시 배경 틴트 및 좌측 액센트 바 드로잉
        if (isFlashing) {
            // 변경 직후 선명하게 점등된 후 부드럽게 감쇠되는 알파 커브 (0.38 ~ 0)
            const bgAlpha = Math.max(0, (1 - flashProgress) * 0.38);
            const edgeAlpha = Math.max(0.2, 1 - flashProgress);

            if (flashType === 'up') {
                // 상승: 금융/산업 표준 레드 틴트 + 네온 엣지 바
                ctx.fillStyle = `rgba(239, 68, 68, ${bgAlpha})`;
                ctx.fillRect(0, 0, w, h);

                ctx.fillStyle = `rgba(239, 68, 68, ${edgeAlpha})`;
                ctx.fillRect(0, 0, 2.5, h);
            } else {
                // 하강: 스카이블루 틴트 + 네온 엣지 바
                ctx.fillStyle = `rgba(14, 165, 233, ${bgAlpha})`;
                ctx.fillRect(0, 0, w, h);

                ctx.fillStyle = `rgba(14, 165, 233, ${edgeAlpha})`;
                ctx.fillRect(0, 0, 2.5, h);
            }
        }

        // 4. 고대비 텍스트 색상 및 폰트 설정
        let textColor: string;
        if (isFlashing) {
            if (flashType === 'up') {
                textColor = isLight ? '#dc2626' : '#f87171';
            } else {
                textColor = isLight ? '#0284c7' : '#38bdf8';
            }
            ctx.font = 'bold 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        } else {
            textColor = isLight ? '#0f172a' : '#f8fafc';
            ctx.font = '10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        }

        const align = (state?.styles?.textAlign as CanvasTextAlign) || 'right';
        ctx.fillStyle = textColor;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';

        let textX = w - 3;
        if (align === 'center') {
            textX = w / 2;
        } else if (align === 'left') {
            textX = 5;
        }
        const textY = h / 2;

        // 5. 플래시 활성화 시 수치 앞 미니 인디케이터 화살표 (▲ / ▼) 드로잉
        if (isFlashing && align === 'right') {
            const textWidth = ctx.measureText(val).width;
            const arrowX = textX - textWidth - 4;
            if (arrowX > 3) {
                ctx.fillStyle =
                    flashType === 'up' ? (isLight ? '#dc2626' : '#f87171') : isLight ? '#0284c7' : '#38bdf8';

                ctx.beginPath();
                if (flashType === 'up') {
                    // 작은 상승 삼각형 ▲
                    ctx.moveTo(arrowX, textY - 3);
                    ctx.lineTo(arrowX - 2.5, textY + 2);
                    ctx.lineTo(arrowX + 2.5, textY + 2);
                } else {
                    // 작은 하강 삼각형 ▼
                    ctx.moveTo(arrowX, textY + 3);
                    ctx.lineTo(arrowX - 2.5, textY - 2);
                    ctx.lineTo(arrowX + 2.5, textY - 2);
                }
                ctx.closePath();
                ctx.fill();
            }
        }

        // 6. 완성형 텍스트 렌더링
        ctx.fillStyle = textColor;
        ctx.fillText(val, textX, textY);

        ctx.restore();
    }
};
