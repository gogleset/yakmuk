# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Source layout (FSD)

```
mobile/app/                 # Expo Router → pages thin wrapper
src/
├── providers/              # FSD app (Provider, Auth) — src/app 금지
├── pages/<route>/          # 화면 조립
├── widgets/<block>/        # UI 블록
├── features/<use-case>/    # 사용자 행동 (mutation + action UI)
├── entities/<entity>/      # api + types + read queries + entity UI
└── shared/                 # api client, ui, lib, config
```

- **shared** — 비즈니스 개념 없는 공통 코드
- **entities** — Supabase api, types, queryKeys, read queries, MedRow 등
- **features** — use-case slice (`add-medication`, `guardian-auth` …)
- **widgets** — features + entities 조합
- **pages** — widgets/features 배치
- **providers/** — FSD app 레이어 (`src/app`은 Expo 라우트 충돌)
- **app/** (Expo) — `@/pages/*` re-export만

자세한 규칙: `.cursor/rules/fsd-architecture.mdc`
