# 화면 05: 계층형 트리 그리드 (Tree Grid)

- **스펙 문서**: [.agents/specs/05-tree-grid.md](../../.agents/specs/05-tree-grid.md)
- **데모 뷰**: `packages/vue/src/views/TreeGridDemo.vue`
- **렌더러**: `packages/vue/src/components/renderers/TreeItemRenderer.vue`

## 작업 체크리스트
- [x] `packages/vue/src/components/renderers/TreeItemRenderer.vue` 커스텀 트리 노드 렌더러 구현 (들여쓰기, 접힘/펼침 토글, 계층 아이콘)
- [x] `packages/vue/src/views/TreeGridDemo.vue` 메인 뷰 구현 (TachyonTreeGrid, TachyonTreeColumn, Box Mode 토글, 전체 펼치기/접기 액션)
- [x] `packages/vue/src/App.vue` 05번 메뉴 컴포넌트 라우팅 연결
- [x] `pnpm build` 타입 및 빌드 검증
