<template>
    <div class="flex flex-col w-full h-full min-h-0 overflow-hidden transition-colors duration-200 bg-[var(--app-bg)]">
        <!-- 1층: 타이틀 & 설명 바 -->
        <div
            class="flex items-center px-6 py-2.5 border-b shrink-0 transition-colors duration-200 gap-3 bg-[var(--card-bg)] border-[var(--card-border)]"
        >
            <h2 class="text-sm font-bold tracking-tight m-0 shrink-0 text-[var(--text-title)]">
                {{ title }}
            </h2>
            <div v-if="description" class="w-px h-3.5 bg-[var(--card-border)] shrink-0"></div>
            <p v-if="description" class="text-xs m-0 leading-relaxed text-[var(--text-desc)] flex-1">
                {{ description }}
            </p>
        </div>

        <!-- 2층: 통계 요약 및 액션 컨트롤 툴바 (캔버스 플로팅 툴바) -->
        <div
            v-if="$slots.stats || $slots.actions"
            class="flex flex-wrap justify-between items-center px-6 pt-3 pb-2 shrink-0 transition-colors duration-200 gap-4"
        >
            <!-- 좌측: 데이터 분석 요약 통계 슬롯 -->
            <div class="flex items-center gap-2.5 flex-wrap">
                <slot name="stats" />
            </div>

            <!-- 우측: 화면별 조작 액션 버튼 슬롯 -->
            <div class="flex items-center gap-2 shrink-0">
                <slot name="actions" />
            </div>
        </div>

        <!-- 3층: 메인 그리드 플로팅 카드 아일랜드 (상단 컨트롤러와 명확히 분리된 독립 카드) -->
        <div class="flex-1 min-h-0 px-6 pb-6 pt-1 flex flex-col">
            <div
                class="flex-1 min-h-0 w-full flex flex-col rounded-xl border border-[var(--grid-card-border)] shadow-sm bg-[var(--grid-card-bg)] overflow-hidden"
            >
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    title: string;
    description?: string;
}

const {title, description = ''} = defineProps<Props>();
</script>
