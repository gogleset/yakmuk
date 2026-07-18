---
name: add-fsd-feature
description: >-
  yakmuk mobile에 FSD use-case feature(또는 entity/page/widget)를 추가할 때 사용.
  Expo Router thin wrapper, mutation, entity api, copy/constants 연동 포함.
---

# Add FSD feature (yakmuk mobile)

## When

- 새 사용자 행동(mutation + UI)
- 기존 entity에 api/query 추가 후 feature에서 소비
- 새 화면(page) + 라우트 wrapper

## Before coding

1. [AGENTS.md](../../../AGENTS.md) · [fsd-architecture.mdc](../../rules/fsd-architecture.mdc) 확인
2. 도메인 slice(`features/medication/`)가 아닌지 확인 → **use-case 이름**만
3. UI/카피면 [docs/design.md](../../../docs/design.md) · [copy-constants.mdc](../../rules/copy-constants.mdc)

## Feature slice

```
mobile/src/features/<use-case>/
├── index.ts
├── model/
│   ├── queryKeys.ts          # 필요 시
│   └── useXxxMutation.ts     # entity api 호출 · showMutationError(ERRORS.*)
└── ui/
    └── XxxSheet.tsx          # 필요 시
```

- supabase는 **entity api만**. feature에서 `@/shared/api/client` 금지
- 에러 타이틀: `import { ERRORS } from '@/shared/copy'`
- 무효화: `shared/lib/query-invalidation` 또는 entity `invalidate*`

## Entity api (필요 시)

```
mobile/src/entities/<entity>/api/<action>.ts   # 1파일 1동작
mobile/src/entities/<entity>/model/{types,queryKeys,queries}.ts
```

- `throwIfError(error, ERRORS.…)` / `throw new Error(ERRORS.…)`
- public export는 `entities/<entity>/index.ts`

## Page + route

```
mobile/src/pages/<route>/ui/<Name>Page.tsx
mobile/src/pages/<route>/index.ts
mobile/app/<route>.tsx          # export { XPage as default } from '@/pages/...'
```

pages는 widget/feature 조립만. api 직접 호출 금지.

## Checklist

- [ ] 의존 방향: pages → widgets → features → entities → shared
- [ ] `mobile/src/app/` 만들지 않음
- [ ] 새 문구/한도는 copy·constants에
- [ ] design §6.2 (짧은 카피, border 남발 금지)
