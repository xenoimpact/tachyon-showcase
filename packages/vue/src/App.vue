<template>
    <div
        class="h-screen flex flex-col transition-colors duration-200 bg-[var(--app-bg)] text-[var(--app-text)] overflow-hidden"
        :data-theme="themeStore.currentTheme"
    >
        <!-- 상단 글로벌 헤더 -->
        <header
            class="flex justify-between items-center px-7 py-3 border-b shrink-0 transition-colors duration-200"
            :class="
                themeStore.currentTheme === 'default'
                    ? 'bg-white text-slate-900 border-slate-200/90'
                    : 'bg-slate-900 text-white border-slate-800'
            "
        >
            <div class="flex items-center gap-4">
                <div
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-md shadow-blue-600/25 text-white"
                >
                    <span class="text-base leading-none">⚡</span>
                    <span class="font-extrabold text-base tracking-wide">Tachyon</span>
                </div>
                <div class="flex flex-col gap-0.5">
                    <h1 class="text-base font-bold tracking-tight m-0 leading-tight">UI Grid Showcase</h1>
                    <span
                        class="text-xs transition-colors"
                        :class="themeStore.currentTheme === 'default' ? 'text-slate-500' : 'text-slate-400'"
                    >
                        대용량 데이터를 지원하는 가상 스크롤 & 엔터프라이즈 데이터 그리드
                    </span>
                </div>
            </div>

            <div class="flex items-center gap-2.5">
                <!-- 글로벌 테마 전환 컨트롤러 -->
                <div
                    class="flex items-center rounded-lg p-0.5 gap-0.5 transition-colors"
                    :class="
                        themeStore.currentTheme === 'default'
                            ? 'bg-slate-100 border border-slate-200/90'
                            : 'bg-slate-800 border border-slate-700'
                    "
                >
                    <button
                        v-for="t in themeStore.themeOptions"
                        :key="t.id"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer border-none"
                        :class="[
                            themeStore.currentTheme === t.id
                                ? themeStore.currentTheme === 'default'
                                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                                    : 'bg-slate-700 text-sky-400 shadow-xs font-bold'
                                : themeStore.currentTheme === 'default'
                                  ? 'bg-transparent text-slate-600 hover:text-slate-900'
                                  : 'bg-transparent text-slate-400 hover:text-white'
                        ]"
                        type="button"
                        :title="t.label + ' 테마로 전환'"
                        @click="themeStore.setTheme(t.id)"
                    >
                        <span class="text-xs">{{ t.icon }}</span>
                        <span>{{ t.label }}</span>
                    </button>
                </div>
            </div>
        </header>

        <!-- 하단 영역: 좌측 사이드바 + 우측 메인 컨텐츠 -->
        <div class="flex-1 flex overflow-hidden">
            <!-- 좌측 네비게이터 사이드바 -->
            <aside
                class="w-64 shrink-0 flex flex-col border-r transition-colors duration-200 bg-[var(--nav-bg)] border-[var(--nav-border)]"
            >
                <nav class="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
                    <button
                        v-for="menu in menuItems"
                        :key="menu.id"
                        class="flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-lg transition-all duration-150 text-left cursor-pointer border-none relative group"
                        :class="
                            activeMenu === menu.id
                                ? 'bg-[var(--nav-tab-hover-bg)] text-[var(--nav-tab-active-text)] font-bold shadow-xs'
                                : 'bg-transparent text-[var(--nav-tab-inactive-text)] hover:text-[var(--nav-tab-hover-text)] hover:bg-[var(--nav-tab-hover-bg)]'
                        "
                        type="button"
                        @click="onSelectMenu(menu.id)"
                    >
                        <!-- 활성 메뉴 인디케이터 바 -->
                        <span
                            v-if="activeMenu === menu.id"
                            class="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[var(--nav-tab-active-border)]"
                        />
                        <span
                            class="text-[11px] px-1.5 py-0.5 rounded font-mono border"
                            :class="
                                activeMenu === menu.id
                                    ? 'bg-[var(--nav-index-active-bg)] text-[var(--nav-index-active-text)] border-[var(--nav-index-active-border)]'
                                    : 'bg-[var(--nav-index-bg)] text-[var(--nav-index-text)] border-[var(--nav-index-border)]'
                            "
                        >
                            {{ menu.index }}
                        </span>
                        <span class="flex-1 truncate">{{ menu.name }}</span>
                    </button>
                </nav>
            </aside>

            <!-- 우측 메인 데모 컨텐츠 영역 (라우트별 단일 렌더링) -->
            <main class="flex-1 overflow-hidden flex flex-col min-w-0">
                <RouterView v-slot="{Component: routeView}">
                    <component
                        :is="routeView"
                        :key="activeMenu"
                        :menu-name="currentMenuName"
                        @select-menu="onSelectMenu"
                    />
                </RouterView>
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useThemeStore} from '@/stores/themeStore';
import {HOME_MENU_ID, menuItems, type MenuItem} from '@/router';

const themeStore = useThemeStore();
const route = useRoute();
const router = useRouter();

/** 현재 라우트 이름을 활성 메뉴 id로 사용합니다. */
const activeMenu = computed<string>(() => (typeof route.name === 'string' ? route.name : HOME_MENU_ID));

const currentMenu = computed<MenuItem | undefined>(() => {
    return menuItems.find((m) => m.id === activeMenu.value);
});

const currentMenuName = computed<string>(() => {
    return currentMenu.value ? currentMenu.value.name : '';
});

/**
 * 메뉴를 선택하고 해당 화면 경로로 이동합니다.
 * @param menuId 선택할 메뉴의 식별자
 */
function onSelectMenu(menuId: string): void {
    void router.push({name: menuId});
}
</script>
