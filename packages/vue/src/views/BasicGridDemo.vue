<template>
    <div class="demo-container">
        <!-- 상단 화면 소개 및 기능 제어 바 -->
        <div class="demo-header-card">
            <div class="demo-info">
                <div class="demo-tags">
                    <span class="badge-tag">화면 1</span>
                    <span class="badge-tag tag--accent">2단 다단 헤더</span>
                    <span class="badge-tag tag--accent">좌측 열 고정</span>
                    <span class="badge-tag tag--accent">상태 배지</span>
                    <span class="badge-tag tag--accent">천단위 콤마</span>
                </div>
                <h2 class="demo-title">기본 그리드 (다단 헤더 & 열 고정)</h2>
                <p class="demo-desc">
                    복잡한 비즈니스 품의 및 주문 데이터를 직관적으로 구조화한 2단 다단 헤더와 좌측 열 고정(Frozen
                    Columns), 그리고 통화/수량 콤마 포맷터와 상태 배지 렌더러를 시연합니다.
                </p>
            </div>

            <!-- 데이터 요약 통계 및 액션 버튼 -->
            <div class="demo-actions">
                <div class="stat-pill">
                    <span class="stat-label">데이터 건수</span>
                    <span class="stat-value">{{ items.length }}건</span>
                </div>
                <div class="stat-pill">
                    <span class="stat-label">총 합계금액</span>
                    <span class="stat-value font-mono">{{ totalOrderAmountText }}원</span>
                </div>
                <div class="action-buttons">
                    <button class="btn btn--outline" @click="toggleFrozen">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
                        </svg>
                        열 고정: {{ frozenColumnsCount > 0 ? '2개 열 고정중' : '해제됨' }}
                    </button>
                    <button class="btn btn--primary" @click="exportToExcel">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        Excel 다운로드
                    </button>
                </div>
            </div>
        </div>

        <!-- 타키온 기본 그리드 영역 -->
        <div class="grid-card">
            <TachyonGrid ref="gridRef" :items="items" :frozenLeft="frozenColumnsCount" class="tachyon-grid-instance">
                <!-- 1. 좌측 열 고정 대상 (주문번호, 고객사명) -->
                <TachyonColumn
                    dataField="id"
                    headerText="주문번호"
                    :width="130"
                    :styles="{textAlign: 'center'}"
                    sortable
                />
                <TachyonColumn dataField="customer" headerText="고객사명" :width="140" sortable />

                <!-- 2. 2단 다단 헤더 1: 프로젝트 정보 -->
                <TachyonColumn headerText="프로젝트 정보">
                    <TachyonColumn dataField="projectName" headerText="프로젝트/품목명" :width="220" sortable />
                    <TachyonColumn
                        dataField="category"
                        headerText="분류"
                        :width="120"
                        :styles="{textAlign: 'center'}"
                        sortable
                    />
                    <TachyonColumn dataField="department" headerText="담당부서" :width="140" sortable />
                </TachyonColumn>

                <!-- 2단 다단 헤더 2: 금액 및 수량 (VAT 포함) + 3. 숫자 콤마 표시 -->
                <TachyonColumn headerText="금액 및 수량 (VAT 포함)">
                    <TachyonNumberColumn
                        dataField="quantity"
                        headerText="수량"
                        :width="90"
                        pattern="0,0"
                        :styles="{textAlign: 'right'}"
                        sortable
                    />
                    <TachyonNumberColumn
                        dataField="unitPrice"
                        headerText="단가"
                        :width="120"
                        pattern="0,0"
                        :styles="{textAlign: 'right'}"
                        sortable
                    />
                    <TachyonNumberColumn
                        dataField="supplyAmount"
                        headerText="공급가액"
                        :width="130"
                        pattern="0,0"
                        :styles="{textAlign: 'right'}"
                        sortable
                    />
                    <TachyonNumberColumn
                        dataField="vat"
                        headerText="부가세(10%)"
                        :width="110"
                        pattern="0,0"
                        :styles="{textAlign: 'right'}"
                        sortable
                    />
                    <TachyonNumberColumn
                        dataField="totalAmount"
                        headerText="합계금액"
                        :width="140"
                        pattern="0,0"
                        :styles="{textAlign: 'right'}"
                        sortable
                    />
                </TachyonColumn>

                <!-- 4. 상태 배지 렌더러 -->
                <TachyonColumn
                    dataField="status"
                    headerText="진행상태"
                    :width="110"
                    :itemRenderer="StatusBadgeRenderer"
                    sortable
                />
                <TachyonColumn
                    dataField="priority"
                    headerText="우선순위"
                    :width="90"
                    :styles="{textAlign: 'center'}"
                    sortable
                />
                <TachyonDateColumn
                    dataField="orderDate"
                    headerText="주문일자"
                    :width="120"
                    pattern="YYYY-MM-DD"
                    :styles="{textAlign: 'center'}"
                    sortable
                />
                <TachyonDateColumn
                    dataField="deliveryDate"
                    headerText="납기일자"
                    :width="120"
                    pattern="YYYY-MM-DD"
                    :styles="{textAlign: 'center'}"
                    sortable
                />
            </TachyonGrid>
        </div>
    </div>
</template>

<script setup lang="ts">
import {computed, ref, shallowRef} from 'vue';
import {TachyonGrid, TachyonColumn} from 'tachyon.vue';
import {mockOrders, numToStr} from '@tachyon-showcase/shared';
import TachyonNumberColumn from '@/config/tachyon/columns/TachyonNumberColumn';
import TachyonDateColumn from '@/config/tachyon/columns/TachyonDateColumn';
import StatusBadgeRenderer from '@/components/renderers/StatusBadgeRenderer.vue';
import ExportXlsx from '@/config/tachyon/addons/xlsx/export';

// 그리드 레퍼런스
const gridRef = ref<any>(null);

// 비즈니스 정합성 100건 목업 데이터셋 바인딩 (성능 및 Web Worker 전달을 위해 shallowRef 사용)
const items = shallowRef(mockOrders);

// 좌측 열 고정 개수 상태 (기본 2개 열 고정)
const frozenColumnsCount = ref(2);

// 총 주문 금액 합산
const totalOrderAmountText = computed(() => {
    const total = items.value.reduce((acc, cur) => acc + (cur.totalAmount || 0), 0);
    return numToStr(total, '0,0');
});

// 열 고정 토글 핸들러
function toggleFrozen(): void {
    if (frozenColumnsCount.value > 0) {
        frozenColumnsCount.value = 0;
    } else {
        frozenColumnsCount.value = 2;
    }
}

// 엑셀 내보내기 핸들러 (최신 ExportXlsx 모듈 직접 호출)
async function exportToExcel(): Promise<void> {
    const nativeGrid = gridRef.value?.nativeInstance || gridRef.value?.grid || gridRef.value;
    if (nativeGrid) {
        await ExportXlsx.export.call({grid: nativeGrid}, '기본그리드_주문현황.xlsx');
    } else {
        console.warn('그리드 인스턴스를 찾을 수 없습니다.');
    }
}
</script>

<style scoped>
.demo-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    height: 100%;
}

.demo-header-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.demo-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.demo-tags {
    display: flex;
    gap: 6px;
    align-items: center;
}

.badge-tag {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
    background: #f1f5f9;
    color: #475569;
}

.tag--accent {
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
}

.demo-title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
}

.demo-desc {
    font-size: 13px;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
}

.demo-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.stat-pill {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 6px 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
}

.stat-label {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 500;
}

.stat-value {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
}

.font-mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 8px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-icon {
    width: 16px;
    height: 16px;
}

.btn--outline {
    background: #ffffff;
    border-color: #cbd5e1;
    color: #334155;
}

.btn--outline:hover {
    background: #f8fafc;
    border-color: #94a3b8;
}

.btn--primary {
    background: #2563eb;
    color: #ffffff;
}

.btn--primary:hover {
    background: #1d4ed8;
}

.grid-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    height: 620px;
    display: flex;
    flex-direction: column;
}

.tachyon-grid-instance {
    width: 100%;
    height: 100%;
}
</style>
