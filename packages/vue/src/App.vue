<template>
    <div
        class="min-h-screen flex flex-col transition-colors duration-200 bg-[var(--app-bg)] text-[var(--app-text)]"
        :data-theme="themeStore.currentTheme"
    >
        <!-- 상단 글로벌 헤더 -->
        <header class="flex justify-between items-center px-7 py-3.5 bg-slate-900 text-white border-b border-slate-800">
            <div class="flex items-center gap-4">
                <div
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-md shadow-blue-600/30"
                >
                    <span class="text-base leading-none">⚡</span>
                    <span class="font-extrabold text-base tracking-wide">Tachyon</span>
                </div>
                <div class="flex flex-col gap-0.5">
                    <h1 class="text-lg font-bold tracking-tight m-0 leading-tight">UI Grid Showcase</h1>
                    <span class="text-xs text-slate-400"
                        >대용량 데이터를 지원하는 가상 스크롤 & 엔터프라이즈 데이터 그리드</span
                    >
                </div>
            </div>

            <div class="flex items-center gap-2.5">
                <!-- 글로벌 테마 전환 컨트롤러 -->
                <div class="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 gap-0.5">
                    <button
                        v-for="t in themeStore.themeOptions"
                        :key="t.id"
                        class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer border-none"
                        :class="
                            themeStore.currentTheme === t.id
                                ? 'bg-slate-700 text-sky-400 shadow-xs'
                                : 'bg-transparent text-slate-400 hover:text-white'
                        "
                        type="button"
                        :title="t.label + ' 테마로 전환'"
                        @click="themeStore.setTheme(t.id)"
                    >
                        <span class="text-xs">{{ t.icon }}</span>
                        <span>{{ t.label }}</span>
                    </button>
                </div>

                <div class="w-px h-5 bg-slate-700 mx-0.5"></div>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
                    Vue 3 + Vite
                </span>
                <span
                    class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-purple-400 border border-slate-700"
                >
                    Enterprise Edition
                </span>
            </div>
        </header>

        <!-- 네비게이션 탭 바 -->
        <nav class="flex gap-1 px-6 pt-2 border-b overflow-x-auto transition-colors duration-200 bg-[var(--nav-bg)] border-[var(--nav-border)]">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer border-t-0 border-x-0 bg-transparent"
                :class="
                    activeTab === tab.id
                        ? 'text-[var(--nav-tab-active-text)] border-[var(--nav-tab-active-border)]'
                        : 'text-[var(--nav-tab-inactive-text)] border-transparent hover:text-[var(--nav-tab-hover-text)] hover:bg-[var(--nav-tab-hover-bg)] rounded-t-md'
                "
                type="button"
                @click="onSelectTab(tab.id)"
            >
                <span
                    class="text-[11px] px-1.5 py-0.5 rounded font-mono border"
                    :class="
                        activeTab === tab.id
                            ? 'bg-[var(--nav-index-active-bg)] text-[var(--nav-index-active-text)] border-[var(--nav-index-active-border)]'
                            : 'bg-[var(--nav-index-bg)] text-[var(--nav-index-text)] border-[var(--nav-index-border)]'
                    "
                >
                    {{ tab.index }}
                </span>
                <span>{{ tab.name }}</span>
            </button>
        </nav>

        <!-- 메인 컨텐츠 영역 -->
        <main class="flex-1 px-7 py-6 flex flex-col">
            <BasicGridDemo v-if="activeTab === 'basic'" />

            <!-- 아직 미구현된 탭 안내 카드 -->
            <div
                v-else
                class="flex items-center justify-center p-16 rounded-xl border text-center shadow-xs transition-colors duration-200 bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-title)]"
            >
                <div class="flex flex-col items-center gap-3 max-w-md">
                    <span class="text-4xl">🚧</span>
                    <h3 class="text-lg font-bold m-0">{{ currentTabName }} 데모 준비 중</h3>
                    <p class="text-xs m-0 leading-relaxed text-[var(--text-desc)]">
                        현재 기본 그리드(화면 1) 데모가 활성화되어 있습니다. 다음 단계에서 순차 오픈됩니다.
                    </p>
                    <button
                        class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-150 cursor-pointer border-none"
                        type="button"
                        @click="onSelectTab('basic')"
                    >
                        기본 그리드 데모 보기
                    </button>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {useThemeStore} from '@/stores/themeStore';
import BasicGridDemo from '@/views/BasicGridDemo.vue';

interface TabItem {
    id: string;
    index: string;
    name: string;
}

const tabs: TabItem[] = [
    {id: 'basic', index: '01', name: '기본 그리드 (다단 헤더 & 고정)'},
    {id: 'tree', index: '02', name: '계층형 트리 그리드'},
    {id: 'virtual', index: '03', name: '대용량 가상 스크롤 (100만 건)'},
    {id: 'editor', index: '04', name: '엑셀형 셀 에디터 & 연동'},
    {id: 'visual', index: '05', name: '셀 시각화 (스파크라인 & 히트맵)'}
];

const themeStore = useThemeStore();

const activeTab = ref<string>('basic');

const currentTabName = computed<string>(() => {
    const tab = tabs.find((t) => t.id === activeTab.value);
    return tab ? tab.name : '';
});

/**
 * 탭을 선택하고 활성화합니다.
 * @param tabId 선택할 탭의 식별자
 */
function onSelectTab(tabId: string): void {
    activeTab.value = tabId;
}
</script>
