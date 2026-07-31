---
name: rn-fsd-anti-patterns
description: >-
  yakmuk mobile(Expo RN + FSD + TanStack Query + NativeWind)의 구조적 안티패턴 점검 문서.
  코드 리뷰·디버그·리팩토링·새 컴포넌트/화면 작성 시, 또는 "이 코드 괜찮아?", "구조 좀 봐줘",
  "리팩토링 해줘", "안티패턴" 요청 시 사용. nested component, index key, FSD public API 우회,
  pages 비대화, useQuery↔useState 이중화, queryKey 매직스트링, useEffect+fetch,
  FlatList 콜백, className/style 혼용을 우선 점검한다.
---

# RN + FSD 안티패턴 체크리스트 (yakmuk)

**용도**: 디버그·구조 점검·리뷰·리팩토링 시 참고하는 배드 패턴 문서.  
신규 구현은 [add-fsd-feature](../add-fsd-feature/SKILL.md) · 레이어 규칙 [fsd-architecture.mdc](../../rules/fsd-architecture.mdc).

점검 순서: **① TanStack Query → ② FSD → ③ React 렌더링 → ④ RN/Expo → ⑤ NativeWind**

보고 형식:

```
[카테고리 - 항목번호] 파일:라인
문제: (한 줄)
수정 제안: (Good 스니펫 또는 프로젝트 경로)
```

---

## 1. TanStack Query

### 1-1. 쿼리 데이터의 로컬 state 이중화

`useQuery` `data`를 `useState`에 복사하면 캐시와 로컬이 어긋난다.

```tsx
// Bad
const { data } = useMedications(userId);
const [meds, setMeds] = useState(data);
useEffect(() => setMeds(data), [data]);

// Good — data를 그대로 소비. 가공은 select
const { data: meds } = useQuery({
  queryKey: medicationKeys.list(userId),
  queryFn: () => listMedications(userId),
  select: (list) => list.filter((m) => m.active),
});
```

### 1-2. queryKey 매직 배열 난립

키는 **`model/queryKeys.ts` factory**만. (`api/queryKeys.ts` 아님)

| 위치 | 예 |
|------|-----|
| `entities/<entity>/model/queryKeys.ts` | `medicationKeys`, `familyKeys`, `userKeys` |
| `features/<use-case>/model/queryKeys.ts` | mutation key (`addMedicationKeys` 등) |

```ts
// Bad
useQuery({ queryKey: ['medication', 'list', userId], ... });
qc.invalidateQueries({ queryKey: ['medications', userId] }); // 오타 → 무효화 실패

// Good
import { medicationKeys } from '@/entities/medication/model/queryKeys';
useQuery({ queryKey: medicationKeys.list(userId), queryFn: () => listMedications(userId) });
```

### 1-3. API / useQuery가 UI에 인라인

supabase·queryFn·useQuery는 UI에 두지 않는다.

```
entities/<entity>/
├── api/<action>.ts          # supabase RPC/쿼리 (1파일 1동작)
├── model/
│   ├── queryKeys.ts
│   └── queries.ts           # useQuery / useQueries 래핑
└── ui/                      # model 훅만 소비

features/<use-case>/
└── model/useXxxMutation.ts  # entity api + invalidateKeys + invalidation
```

```tsx
// Bad — MedRow.tsx 안에서 supabase / useQuery
// Good — entities/medication/model/queries.ts 의 훅만 소비
```

- features → `@/shared/api/client` **금지** (entity api만)
- pages → entity `api/*` **직접 금지** (model/queries·feature mutation 경유)

### 1-4. mutation 후 무분별한 invalidate

```tsx
// Bad
onSuccess: () => queryClient.invalidateQueries(),

// Good — 영향 키만. cross-entity면 shared helper
import { invalidateHomeActivity } from '@/shared/lib/query-invalidation';
onSuccess: () => invalidateHomeActivity(qc),
// 또는 entity invalidateMedicationLists / invalidateMedicationActivity
```

entity 간 무효화를 여기저기 흩뿌리지 말 것 → `shared/lib/query-invalidation.ts`.

### 1-5. useEffect + fetch 수동 페칭

```tsx
// Bad
useEffect(() => {
  setLoading(true);
  listMedications(userId).then(setMeds).finally(() => setLoading(false));
}, [userId]);

// Good
const { data: meds, isLoading } = useHomeMedicationQueries({ userId, ... });
```

---

## 2. FSD 계층

의존: `providers → pages → widgets → features → entities → shared`

### 2-1. Public API(`index.ts`) 우회

```tsx
// Bad — 슬라이스 내부 deep import (같은 슬라이스 내부는 OK)
import { MedRow } from '@/entities/medication/ui/MedRow';

// Good
import { MedRow } from '@/entities/medication';
```

예외: 같은 슬라이스 안, 또는 `model/types`·`model/queryKeys`처럼 이미 관례적으로 직접 쓰는 경우. **다른 슬라이스의 `ui/`·`api/` deep import는 피한다.**

### 2-2. Pages / Expo Router 비대화

```
mobile/app/(tabs)/home.tsx     ← re-export만
mobile/src/pages/home/ui/…     ← widgets/features 조립
```

```tsx
// Bad — app/*.tsx 또는 Page 안에서 useQuery·긴 JSX·비즈니스 로직
// Good
// mobile/app/(tabs)/home.tsx
export { HomePage as default } from '@/pages/home';
```

⚠️ `mobile/src/app/` **금지** (Expo 라우트 충돌). FSD app = `providers/`.

### 2-3. shared에 도메인 로직

`shared/api` = supabase client·공통 throw 유틸만.  
User/Medication fetch·타입·MedRow → entities.  
문구 → `shared/copy`, 한도 → `shared/constants`.

### 2-4. Model–UI 강결합 / domain feature

- 슬라이스 내 `ui/` vs `model/` 분리 유지
- ❌ `features/medication/` (domain) → ✅ `features/add-medication/` (use-case)

### 2-5. (yakmuk) 테스트 위치

소스 옆 `*.test.ts` 금지 → `mobile/src/__tests__/` FSD 미러. ([tdd.mdc](../../rules/tdd.mdc))

---

## 3. React 렌더링

### 3-1. 컴포넌트 내부 컴포넌트 선언

매 렌더 identity 변경 → 자식 리마운트·state 유실.

```tsx
// Bad
function HomePage() {
  const Row = ({ label }: { label: string }) => <Text>{label}</Text>;
  return <Row label="hi" />;
}

// Good — 모듈 스코프로 분리
function Row({ label }: { label: string }) {
  return <Text>{label}</Text>;
}
```

### 3-2. 리스트 key = index

`map` / `FlatList` `keyExtractor` 모두.

```tsx
// Bad
keyExtractor={(_, i) => String(i)}

// Good
keyExtractor={(item) => String(item.id)}
```

안정 id가 없으면 데이터 쪽에서 합성 키를 만들고, 순서가 바뀌는 리스트에 index를 쓰지 않는다.

### 3-3. 성급한 상태 끌어올리기

모달 open, 시트 입력 등 **한 화면 로컬**이면 `useState`. zustand/상위 승격은 실제 공유 필요할 때만.

---

## 4. React Native / Expo

### 4-1. FlatList 콜백 인라인 (memo 자식 무력화)

```tsx
// Bad
<FlatList renderItem={({ item }) => <Row onPress={() => go(item.id)} item={item} />} />

// Good — 안정 참조 (또는 리스트 row를 메모하고 핸들러를 id 기준으로)
const renderItem = useCallback(
  ({ item }: { item: Member }) => <Row item={item} onPress={handlePress} />,
  [handlePress],
);
```

### 4-2. Platform 분기 산재

반복 `Platform.OS`는 `shared/` 유틸·한곳으로. 키보드 회피 등 기존 (`Sheet`, `FunnelShell`) 패턴을 따른다.

---

## 5. NativeWind

### 5-1. className / style 혼용

- 레이아웃·간격·flex → `className` 우선
- 디자인 토큰 색/그림자 → `COLORS` / `LAYOUT` (`@/shared/config/theme`)를 `style`로 쓰는 건 **허용** (프로젝트 관례)
- ❌ 같은 속성 경쟁 (`className="mt-2"` + `style={{ marginTop: 8 }}`)
- ❌ 하드코딩 hex (`#7A8783`, `text-[#3A3A3A]`) — `COLORS.*` 또는 `text-muted-foreground` 등 토큰

```tsx
// Bad
<Text className="text-[15.5px] text-[#7A8783]" style={{ marginTop: 8 }} />

// Good
<Text className="mt-2 text-sm" style={{ color: COLORS.muted }} />
// 또는 NativeWind 토큰
<Text className="mt-2 text-sm text-muted-foreground" />
```

동적 애니메이션(reanimated)만 className 불가 시 style + 짧은 주석.

### 5-2. Arbitrary value 남발

`w-[123px]`, `p-[13px]` → `shared/constants` / theme / Tailwind `theme.extend` 토큰화.

### 5-3. 조건부 className 수기 결합

```tsx
// Bad
className={`${active ? 'bg-brand' : ''} p-2`}

// Good
import { cn } from '@/shared/lib/cn';
className={cn('p-2', active && 'bg-brand')}
```

---

## 우선 점검 숏리스트

새 코드·리뷰·디버그 시 먼저:

1. useQuery data → useState 복사?
2. queryKey 매직 스트링? (`model/queryKeys` factory 여부)
3. UI 안 supabase / useQuery 인라인?
4. `invalidateQueries()` 전체?
5. pages/app 비대화 · public API 우회 · domain feature?
6. nested component · index key?
7. FlatList `renderItem` 인라인?
8. className↔style 속성 충돌 · hex 하드코딩 · `cn` 미사용?

관련: [fsd-architecture.mdc](../../rules/fsd-architecture.mdc) · [add-fsd-feature](../add-fsd-feature/SKILL.md) · [docs/design.md](../../../docs/design.md)
