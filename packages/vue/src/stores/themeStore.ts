import {ref} from 'vue';
import {defineStore} from 'pinia';

/** 지원하는 타키온 그리드 테마 식별자 유니온 타입입니다. */
export type ThemeMode = 'default' | 'dark' | 'steel-blue';

/** 테마 메타데이터 옵션 인터페이스입니다. */
export interface ThemeOption {
    id: ThemeMode;
    label: string;
    icon: string;
}

/**
 * 전역 그리드 및 쇼케이스 테마 상태를 관리하는 Pinia 스토어입니다.
 */
export const useThemeStore = defineStore('theme', () => {
    const currentTheme = ref<ThemeMode>('default');

    const themeOptions: ThemeOption[] = [
        {id: 'default', label: '라이트', icon: '☀️'},
        {id: 'dark', label: '다크', icon: '🌙'},
        {id: 'steel-blue', label: '스틸블루', icon: '🏭'}
    ];

    /**
     * 현재 적용된 테마를 변경합니다.
     * @param theme 새로 적용할 테마 모드
     */
    function setTheme(theme: ThemeMode): void {
        currentTheme.value = theme;
    }

    return {
        currentTheme,
        themeOptions,
        setTheme
    };
});
