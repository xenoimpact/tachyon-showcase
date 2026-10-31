import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router';
import type {Component} from 'vue';
import IntroductionView from '@/views/IntroductionView.vue';
import BasicGridDemo from '@/views/BasicGridDemo.vue';
import VirtualScrollDemo from '@/views/VirtualScrollDemo.vue';
import CellEditorDemo from '@/views/CellEditorDemo.vue';
import CellVisualDemo from '@/views/CellVisualDemo.vue';
import FilterGridDemo from '@/views/FilterGridDemo.vue';
import TreeGridDemo from '@/views/TreeGridDemo.vue';
import RealtimeTelemetryDemo from '@/views/RealtimeTelemetryDemo.vue';
import ExcelIoDemo from '@/views/ExcelIoDemo.vue';
import PixelMatrixDemo from '@/views/PixelMatrixDemo.vue';
import DemoPlaceholder from '@/components/common/DemoPlaceholder.vue';

export interface MenuItem {
    id: string;
    index: string;
    name: string;
    component?: Component;
}

/** 사이드바 메뉴 목록입니다. 메뉴 id가 곧 라우트 이름이자 경로(/id)입니다. */
export const menuItems: MenuItem[] = [
    {id: 'intro', index: '00', name: '제품 개요 및 기능 가이드', component: IntroductionView},
    {id: 'basic', index: '01', name: '기본 그리드 (멀티헤더 & 고정)', component: BasicGridDemo},
    {id: 'virtual', index: '02', name: '대용량 가상 스크롤', component: VirtualScrollDemo},
    {id: 'editor', index: '03', name: '엑셀형 셀 에디터 & 연동', component: CellEditorDemo},
    {id: 'visual', index: '04', name: '셀 시각화', component: CellVisualDemo},
    {id: 'filter', index: '05', name: '헤더 필터링', component: FilterGridDemo},
    {id: 'tree', index: '06', name: '계층형 트리 그리드', component: TreeGridDemo},
    {id: 'realtime', index: '07', name: '실시간 데이터 갱신', component: RealtimeTelemetryDemo},
    {id: 'excel', index: '08', name: '엑셀 내보내기 & 가져오기', component: ExcelIoDemo},
    {id: 'pixel', index: '09', name: '픽셀 매트릭스 & 전광판', component: PixelMatrixDemo}
];

/** 첫 화면(제품 개요) 메뉴 id입니다. */
export const HOME_MENU_ID = 'intro';

const routes: RouteRecordRaw[] = [
    {path: '/', redirect: {name: HOME_MENU_ID}},
    ...menuItems.map((menu) => ({
        path: `/${menu.id}`,
        name: menu.id,
        component: menu.component || DemoPlaceholder
    })),
    // 없는 경로는 첫 화면으로 보냅니다.
    {path: '/:pathMatch(.*)*', redirect: {name: HOME_MENU_ID}}
];

/**
 * HTML5 history 모드 라우터입니다. (/excel 형식, 배포 시 base 경로 하위)
 * GitHub Pages는 경로 대체 기능이 없어, 빌드 시 index.html을 404.html로 복사해 직접 접속·새로고침을 처리합니다. (vite.config.ts)
 */
export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});
