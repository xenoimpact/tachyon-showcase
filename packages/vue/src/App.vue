<template>
    <div class="showcase-app">
        <!-- 상단 글로벌 헤더 -->
        <header class="app-header">
            <div class="header-left">
                <div class="brand-badge">
                    <span class="brand-logo-icon">⚡</span>
                    <span class="brand-name">Tachyon</span>
                </div>
                <div class="header-titles">
                    <h1 class="header-title">UI Grid Showcase</h1>
                    <span class="header-subtitle"
                        >대용량 데이터를 지원하는 가상 스크롤 & 엔터프라이즈 데이터 그리드</span
                    >
                </div>
            </div>
            <div class="header-right">
                <span class="version-badge">Vue 3 + Vite</span>
                <span class="registry-badge">Enterprise Edition</span>
            </div>
        </header>

        <!-- 네비게이션 탭 바 -->
        <nav class="app-nav">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                class="nav-tab"
                :class="{'nav-tab--active': activeTab === tab.id}"
                @click="activeTab = tab.id"
            >
                <span class="tab-index">{{ tab.index }}</span>
                <span class="tab-label">{{ tab.name }}</span>
            </button>
        </nav>

        <!-- 메인 컨텐츠 영역 -->
        <main class="app-content">
            <BasicGridDemo v-if="activeTab === 'basic'" />

            <!-- 아직 미구현된 탭 안내 카드 -->
            <div v-else class="placeholder-card">
                <div class="placeholder-content">
                    <span class="placeholder-icon">🚧</span>
                    <h3>{{ currentTabName }} 데모 준비 중</h3>
                    <p>현재 기본 그리드(화면 1) 데모가 활성화되어 있습니다. 다음 단계에서 순차 오픈됩니다.</p>
                    <button class="btn btn--primary" @click="activeTab = 'basic'">기본 그리드 데모 보기</button>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
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

const activeTab = ref<string>('basic');

const currentTabName = computed(() => {
    const tab = tabs.find((t) => t.id === activeTab.value);
    return tab ? tab.name : '';
});
</script>

<style>
/* 전역 기본 스타일 초기화 및 모던 폰트 적용 */
* {
    box-sizing: border-box;
}

html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    background-color: #f8fafc;
    color: #0f172a;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
}

#app {
    height: 100%;
}
</style>

<style scoped>
.showcase-app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #0f172a;
    color: #ffffff;
    padding: 14px 28px;
    border-bottom: 1px solid #1e293b;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.brand-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    padding: 6px 12px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
}

.brand-logo-icon {
    font-size: 16px;
}

.brand-name {
    font-weight: 800;
    font-size: 16px;
    letter-spacing: 0.5px;
}

.header-titles {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.header-title {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.3px;
}

.header-subtitle {
    font-size: 12px;
    color: #94a3b8;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 8px;
}

.version-badge {
    font-size: 11px;
    font-weight: 600;
    background: #1e293b;
    color: #38bdf8;
    padding: 4px 10px;
    border-radius: 9999px;
    border: 1px solid #334155;
}

.registry-badge {
    font-size: 11px;
    font-weight: 600;
    background: #1e293b;
    color: #a78bfa;
    padding: 4px 10px;
    border-radius: 9999px;
    border: 1px solid #334155;
}

.app-nav {
    display: flex;
    gap: 4px;
    background: #ffffff;
    padding: 8px 24px 0 24px;
    border-bottom: 1px solid #e2e8f0;
    overflow-x: auto;
}

.nav-tab {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.nav-tab:hover {
    color: #0f172a;
    background: #f1f5f9;
    border-radius: 6px 6px 0 0;
}

.nav-tab--active {
    color: #2563eb;
    border-bottom-color: #2563eb;
}

.nav-tab--active .tab-index {
    background: #eff6ff;
    color: #2563eb;
    border-color: #bfdbfe;
}

.tab-index {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    background: #f1f5f9;
    color: #94a3b8;
    border: 1px solid #e2e8f0;
    font-family: ui-monospace, SFMono-Regular, monospace;
}

.app-content {
    flex: 1;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
}

.placeholder-card {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 60px 24px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    max-width: 400px;
}

.placeholder-icon {
    font-size: 40px;
}

.placeholder-content h3 {
    margin: 0;
    font-size: 18px;
    color: #1e293b;
}

.placeholder-content p {
    margin: 0;
    font-size: 13px;
    color: #64748b;
    line-height: 1.5;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 8px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn--primary {
    background: #2563eb;
    color: #ffffff;
}

.btn--primary:hover {
    background: #1d4ed8;
}
</style>
