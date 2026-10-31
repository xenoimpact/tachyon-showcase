import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

/**
 * 빌드 결과의 index.html을 404.html로 복사합니다.
 * GitHub Pages는 없는 경로에 404.html을 응답하므로, /tachyon-showcase/excel 같은 주소로 직접 접속하거나 새로고침해도 앱이 열립니다.
 */
function spaFallback(): Plugin {
    let outDir = 'dist';
    return {
        name: 'spa-fallback-404',
        apply: 'build',
        configResolved(config) {
            outDir = path.resolve(config.root, config.build.outDir);
        },
        closeBundle() {
            fs.copyFileSync(path.join(outDir, 'index.html'), path.join(outDir, '404.html'));
        }
    };
}

export default defineConfig({
    base: process.env.NODE_ENV === 'production' ? '/tachyon-showcase/' : '/',
    plugins: [vue(), tailwindcss(), spaFallback()],
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, './src')
        }
    }
});
