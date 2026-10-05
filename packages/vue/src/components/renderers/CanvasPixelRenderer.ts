import type {DataGrid} from 'tachyon.vue';

/**
 * 픽셀 매트릭스 도트(LED) 렌더러
 * 각 그리드 셀을 1개의 정밀 LED 픽셀로 취급하여 고속 Canvas 2D로 렌더링합니다.
 */
export const CanvasPixelRenderer = {
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
        const val = state?.item?.[state?.column?.dataField];
        const isLight = document.querySelector('[data-theme="default"]') != null;

        ctx.save();

        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.38;

        // 1. 꺼진 LED 기본 베이스 드로잉
        if (!val || val === 0) {
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';
            ctx.fill();
            ctx.restore();
            return;
        }

        // 2. 켜진 LED 컬러 결정 (숫자 또는 hex 색상 코드)
        let primaryColor = '#10b981'; // 기본 네온 에메랄드
        let glowColor = 'rgba(16, 185, 129, 0.35)';

        if (typeof val === 'string' && val.startsWith('#')) {
            primaryColor = val;
            glowColor = `${val}55`;
        } else if (typeof val === 'number') {
            if (val === 1) {
                // 그린 (정상 / 티커 메인)
                primaryColor = '#10b981';
                glowColor = 'rgba(16, 185, 129, 0.4)';
            } else if (val === 2) {
                // 시안 / 네온 블루
                primaryColor = '#06b6d4';
                glowColor = 'rgba(6, 182, 212, 0.4)';
            } else if (val === 3) {
                // 앰버 오렌지
                primaryColor = '#f59e0b';
                glowColor = 'rgba(245, 158, 11, 0.4)';
            } else if (val === 4) {
                // 네온 레드 (경보 / 핫스팟)
                primaryColor = '#f43f5e';
                glowColor = 'rgba(244, 63, 94, 0.4)';
            } else if (val === 5) {
                // 마젠타 / 바이올렛
                primaryColor = '#a855f7';
                glowColor = 'rgba(168, 85, 247, 0.4)';
            } else {
                // 기타 수치: HSL 기반 무지개 스펙트럼
                const hue = (val * 37) % 360;
                primaryColor = `hsl(${hue}, 90%, 55%)`;
                glowColor = `hsla(${hue}, 90%, 55%, 0.4)`;
            }
        }

        // 3. 외곽 네온 글로우 (Glow Ring)
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
        ctx.fillStyle = glowColor;
        ctx.fill();

        // 4. LED 본체 닷 드로잉
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor;
        ctx.fill();

        // 5. LED 중심부 화이트 하이라이트 코어
        ctx.beginPath();
        ctx.arc(cx - radius * 0.25, cy - radius * 0.25, radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fill();

        ctx.restore();
    }
};
