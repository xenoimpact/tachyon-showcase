# 코드 스타일 및 명명 규칙 가이드 (Code Style & Naming Rules)

본 문서는 프로젝트의 일관된 코드 품질, 가독성, 명명 규칙 및 `<script setup>` 구조 표준을 정의합니다.

---

## 1. 명명 규칙 (Naming Conventions)

| 대상                        | 표기법                                     | 설명 및 예시                                                                                                                                |
| :-------------------------- | :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **Vue SFC 파일**            | `PascalCase.vue`                           | `UserProfile.vue`, `DeviceListTable.vue`                                                                                                    |
| **TS 유틸 / 스토어 / 설정** | `camelCase.ts`                             | `authStore.ts`, `dateUtil.ts`, `apiService.ts`                                                                                              |
| **타입 정의 파일**          | `types.ts`, `kebab-case.d.ts`              | `types.ts`, `agent-event.d.ts`                                                                                                              |
| **폴더명**                  | `kebab-case`                               | `shared/components`, `stores`, `layouts`                                                                                                    |
| **변수 / 인스턴스**         | `camelCase`                                | `userData`, `isLoading`, `deviceCount`                                                                                                      |
| **Template Ref 변수**       | `camelCase` + `Ref` 접미사                 | `searchInputRef`, `gridRef`, `modalRef`                                                                                                     |
| **비즈니스 / 액션 함수**    | `camelCase` (동사+명사)                    | 도메인 로직 및 액션 수행 함수 (`createNewThread()`, `deleteItem(id)`) ※ 단순 호출용 `onXxx` 래핑 대신 일반 함수를 템플릿에 직접 바인딩 권장 |
| **UI 이벤트 핸들러**        | `on` + `PascalCase`                        | DOM 이벤트 객체 제어(`e.preventDefault()` 등)나 순수 UI 전처리가 필요한 경우 (`onClickOutside(e)`, `onKeyDownEnter(e)`)                     |
| **Props 바인딩**            | 스크립트 `camelCase` / 템플릿 `kebab-case` | `<custom-card :item-id="id" />`                                                                                                             |
| **Emits 이벤트명**          | `kebab-case`                               | `emit('update-item')`, `@update-item="onUpdate"`                                                                                            |
| **타입 / 인터페이스**       | `PascalCase` (`I` 접두사 지양)             | `UserInfo`, `DeviceStatusResponse`                                                                                                          |
| **Pinia 스토어**            | `use[Domain]Store` (`[domain]Store.ts`)    | `export const useAuthStore = defineStore(...)`                                                                                              |

---

## 2. `<script setup>` 선언 순서 (Script Element Ordering)

컴포넌트 내 가독성과 일관성을 위해 반드시 아래 순서대로 작성합니다.

### 📌 순서 요약

> ※ **주의**: 선언 순서 구분을 위한 기계적인 번호 주석(`// 1. ...`, `// 2. ...`)은 코드 가독성을 저해하므로 **실제 코드에 작성하지 않으며**, 코드의 물리적인 배치 순서만 일치시킵니다.

1. **타입 & 로컬 상수** (`type`, `interface`, `const CONSTANT_KEY`)
2. **컴포넌트 옵션** (`defineOptions`)
3. **Emits 정의** (`defineEmits`)
4. **Props 정의** (`defineProps` / Reactive Destructure)
5. **Stores & Composables & 의존성 주입** (`useStore()`, `useRouter()`, `inject()`)
6. **Template / DOM Ref** (`useTemplateRef()` 또는 `ref() + xxxRef`)
7. **반응형 상태** (`ref()`, `reactive()`)
8. **계산된 속성** (`computed()`)
9. **감시자** (`watch()`, `watchEffect()`)
10. **비즈니스 로직 및 액션 함수** (`fetchData()`, `createItem()`)
11. **UI 이벤트 핸들러** (`onKeyDownEnter()`, `onClickFilter()`)
12. **라이프사이클 훅** (`onMounted()`, `onUnmounted()`)
13. **Provide & 외부 노출** (`provide()`, `defineExpose()`)

### 📝 표준 코드 예시

> ※ **주의**: 아래 예시의 번호 주석(`// 1. ...`, `// 2. ...`)은 선언 순서 안내용이며, **실제 컴포넌트 코드 작성 시에는 작성하지 않고 순서만 준수**합니다.

```typescript
<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, provide, reactive, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import type { UserInfo } from './types';

// 1. 타입 & 로컬 상수
const DEFAULT_PAGE_SIZE = 20;

// 2. 컴포넌트 옵션
defineOptions({
    name: 'UserProfileCard'
});

// 3. Emits 정의 (Props보다 상단)
const emit = defineEmits<{
    'update:modelValue': [value: string];
    'submit': [];
}>();

// 4. Props 정의 (Vue 3.5+ Reactive Destructure 권장)
const {
    modelValue = '',
    loading = false,
    pageSize = DEFAULT_PAGE_SIZE
} = defineProps<{
    modelValue?: string;
    loading?: boolean;
    pageSize?: number;
}>();

// 5. Stores & Composables & Inject
const authStore = useAuthStore();
const router = useRouter();
const theme = inject('theme', 'light');

// 6. Template / DOM Ref (xxxRef 명명, useTemplateRef 권장)
const searchInputRef = useTemplateRef<HTMLInputElement>('searchInputRef');
const gridRef = useTemplateRef<InstanceType<typeof VxGrid>>('gridRef');

// 7. 반응형 상태 (State)
const keyword = ref<string>('');
const userList = ref<UserInfo[]>([]);
const formState = reactive({
    name: '',
    role: 'user'
});

// 8. 계산된 속성 (Computed)
const filteredList = computed(() => {
    return userList.value.filter((user) => {
        return user.name.includes(keyword.value);
    });
});

// 9. 감시자 (Watch)
watch(() => modelValue, (newVal) => {
    keyword.value = newVal;
});

// 10. 비즈니스 로직 및 액션 함수 (동사+명사)
/**
 * 사용자 목록을 조회합니다.
 * @param query 검색 키워드
 */
async function fetchUserList(query: string): Promise<void> {
    // API 호출 로직...
}

/**
 * 새 스레드를 생성합니다.
 */
async function createNewThread(): Promise<void> {
    // 비즈니스 액션 로직...
}

// 11. UI 이벤트 핸들러 (onXxx)
/**
 * 검색 입력창 Enter 키 입력 이벤트를 처리합니다.
 * @param e 키보드 이벤트 객체
 */
function onKeyDownEnter(e: KeyboardEvent): void {
    if (e.isComposing) {
        return;
    }
    fetchUserList(keyword.value);
}

// 12. 라이프사이클 훅
onMounted(() => {
    fetchUserList('');
});

onUnmounted(() => {
    // 리소스 해제...
});

// 13. Provide & 외부 노출
provide('parentContext', { keyword });

defineExpose({
    fetchUserList,
    searchInputRef
});
</script>
```

---

## 3. 구문 및 주석 스타일 가이드라인 (Syntax & Comments)

- **제어문 중괄호 필수**: 한 줄 코드라도 `if`, `else`, `for`, `while` 등 모든 제어문에 `{}`를 필수 적용합니다.

    ```typescript
    // 올바른 예시
    if (isValid) {
        return true;
    }
    ```

- **기계적인 번호 주석 작성 금지**: `// 1. Props 정의`, `// 2. Emits 정의` 등 선언부 구분을 위한 인위적인 번호 주석은 코드 가독성을 저해하므로 작성하지 않습니다. 물리적인 선언 순서와 적절한 빈 줄(공백)로 구분하며, 주석은 함수/클래스/인터페이스 설명용 JSDoc(`/** ... */`) 위주로 작성합니다.
- **함수 반환 타입 명시**: 모든 함수와 메서드는 반환 타입(`Promise<void>`, `boolean`, `string` 등)을 명시합니다.
- **JSDoc 블록 주석**: 모든 함수, 메서드 및 클래스 상단에는 `/** ... */` 형식으로 작성합니다.
- **주석 문체**: 모든 주석은 격식체 높임말(~입니다, ~합니다)로 종결합니다.

---

## 4. 컴포넌트 이벤트 및 통신 가드레일 (Events & YAGNI Principle)

- **추측성/미사용 Emits 선언 금지 (YAGNI 원칙)**:
  - "나중에 쓸 수도 있겠다"는 막연한 추측으로 자식 컴포넌트의 모든 버튼/액션에 습관적으로 `defineEmits`를 생성하지 않습니다.
  - 컴포넌트 자체에서 완결 가능한 비즈니스 로직(스토어 직접 연동, 단순 다운로드, 자체 상태 저장 등)은 컴포넌트 내부에서 직접 처리합니다.
  - `emit`은 오직 **화면 상태 동기화나 라우트 변경 등 부모/형제 컴포넌트와의 연동이 '실제로' 필요한 경우에만** 정의합니다.
- **부모의 무의미한 더미 핸들러 바인딩 금지**:
  - 부모 컴포넌트에서 `console.log`만 찍거나 아무 동작도 하지 않는 빈 핸들러 바인딩을 금지합니다.

---

## 5. 타입 정의 가이드라인 (Type Definition & Null/Undefined Elimination)

- **`| null` 및 `| undefined` 유니온 결합 전면 금지 (Null & Undefined Elimination)**:
  - 본 프로젝트는 `tsconfig.json`에서 `"strictNullChecks": false`로 동작합니다.
  - 인터페이스 및 타입 정의 시 기계적인 `| null` 또는 `| undefined` 결합(`string | null`, `string | undefined`, `title?: string | null`, `title?: string | undefined` 등)을 **절대 작성하지 않습니다**.
  - 값이 비어있거나 존재하지 않을 수 있는 필드는 반드시 **선택적 프로퍼티(`?: string`, `?: number`)** 하나로만 선언합니다. (`?:`를 붙이면 이미 선택적 필드로 처리되므로 `| undefined`나 `| null`을 붙일 이유가 전혀 없습니다.)
  - 변수/상수 선언 시에도 `let x: string | null = null;`이나 `let x: string | undefined = undefined;`와 같은 불필요한 보일러플레이트를 금지하며, `let x = '';` 형태로 초기화하여 TypeScript의 자동 타입 추론을 활용합니다.
  - 불필요한 방어 코드(`?? null`, `|| null`, `?? undefined`, `|| undefined`) 작성을 엄격히 금지하고 깔끔한 기본값 지정이나 falsy 체크를 활용합니다.
- **구체적인 도메인 유니온 타입 우선**:
  - 상태, 종류, 코드값 등 유한한 집합을 가지는 필드는 모호한 원시 타입(`string`, `number`)을 단독으로 사용하지 않고, 도메인에 정의된 구체적인 유니온 타입을 명확히 지정하여 오타 방지 및 코드 자동완성(IntelliSense)을 극대화합니다.
