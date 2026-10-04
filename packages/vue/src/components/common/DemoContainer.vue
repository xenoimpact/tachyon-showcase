<template>
    <div class="flex flex-col gap-4 w-full h-full transition-colors duration-200">
        <!-- 상단 헤더 카드 -->
        <div
            class="flex flex-wrap justify-between items-center p-5 rounded-xl border transition-all duration-200 gap-4 shadow-xs bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-title)]"
        >
            <!-- 화면 정보 (배지, 태그, 제목, 설명) -->
            <div class="flex flex-col gap-2 max-w-2xl">
                <div v-if="badge || tags.length > 0" class="flex flex-wrap items-center gap-1.5">
                    <span
                        v-if="badge"
                        class="text-xs font-bold px-2 py-0.5 rounded-md border bg-[var(--badge-bg)] text-[var(--badge-text)] border-[var(--badge-border)]"
                    >
                        {{ badge }}
                    </span>
                    <span
                        v-for="tag in tags"
                        :key="tag"
                        class="text-xs font-semibold px-2 py-0.5 rounded-md border bg-[var(--tag-bg)] text-[var(--tag-text)] border-[var(--tag-border)]"
                    >
                        {{ tag }}
                    </span>
                </div>
                <h2 class="text-xl font-extrabold tracking-tight m-0">{{ title }}</h2>
                <p v-if="description" class="text-xs m-0 leading-relaxed text-[var(--text-desc)]">
                    {{ description }}
                </p>
            </div>

            <!-- 컨트롤 툴바 (통계 슬롯 + 액션 버튼 슬롯) -->
            <div class="flex items-center gap-4 flex-wrap">
                <!-- 통계 슬롯 -->
                <div v-if="$slots.stats" class="flex items-center gap-2">
                    <slot name="stats" />
                </div>

                <!-- 화면별 액션 버튼 슬롯 -->
                <div v-if="$slots.actions" class="flex items-center gap-2">
                    <slot name="actions" />
                </div>
            </div>
        </div>

        <!-- 메인 그리드 카드 영역 -->
        <div
            class="rounded-xl border p-4 shadow-xs h-[620px] flex flex-col transition-all duration-200 bg-[var(--grid-card-bg)] border-[var(--grid-card-border)]"
        >
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    title: string;
    description?: string;
    badge?: string;
    tags?: string[];
}

const {
    title,
    description = '',
    badge = '',
    tags = []
} = defineProps<Props>();
</script>
