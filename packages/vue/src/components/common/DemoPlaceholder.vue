<template>
    <DemoContainer
        :title="menuName ? `${menuName} (준비 중)` : '데모 준비 중'"
        description="해당 화면의 공통 목(Mock) 데이터 및 화면 명세(specs)에 맞춰 순차적으로 오픈됩니다."
    >
        <div class="w-full h-full flex items-center justify-center p-8 bg-[var(--app-bg)]">
            <div
                class="flex flex-col items-center gap-4 max-w-md p-8 rounded-2xl border text-center shadow-xs transition-colors duration-200 bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-title)]"
            >
                <div
                    class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-sky-400"
                >
                    ⚡
                </div>
                <div class="flex flex-col gap-1.5">
                    <h3 class="text-base font-bold m-0 tracking-tight">
                        {{ menuName }}
                    </h3>
                    <p class="text-xs m-0 leading-relaxed text-[var(--text-desc)]">
                        현재 기본 그리드(화면 1)와 대용량 가상 스크롤(화면 2)이 활성화되어 있습니다.<br />
                        다음 단계에서 타키온 고급 기능 데모가 제공됩니다.
                    </p>
                </div>
                <button
                    class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-150 cursor-pointer border-none shadow-xs"
                    type="button"
                    @click="$emit('select-menu', 'basic')"
                >
                    기본 그리드 데모 보기
                </button>
            </div>
        </div>
    </DemoContainer>
</template>

<script setup lang="ts">
import DemoContainer from '@/components/common/DemoContainer.vue';

defineProps<{
    menuName?: string;
}>();

defineEmits<{
    (e: 'select-menu', menuId: string): void;
}>();
</script>
