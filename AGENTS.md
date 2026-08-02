# yakmuk — Agent guide

가족 건강 안부 · 복약 체크 앱 (**약콕**).  
stage: **pre** · store: **local-supabase** · app: Expo RN 57.

이 파일이 에이전트 진입점이다. 세부 규칙은 `.agents/rules/`, 워크플로는 `.agents/skills/`를 본다.

## Repo map

```
yakmuk/
├── AGENTS.md                 # 이 파일
├── TRACK.md                  # 트랙·스테이지
├── docs/design.md            # 시각·톤·카피 원칙
├── docs/product/             # 제품 목표 · 안심 구독 (신뢰→glance→주간요약)
├── docs/brand/               # 약콕·콕이 브랜드 플랜 (갭·beat·토스형 퍼널·design 수정안)
├── docs/prd/                 # PRD 요약
├── docs/flows/               # 화면 플로우 브리프
├── loop/pre/                 # CONTRACT · CHECKLIST · DECISIONS
├── supabase/                 # migrations · functions · seed
├── mobile/                   # Expo Router + FSD
│   ├── app/                  # 라우트 thin wrapper만
│   └── src/                  # providers · pages · widgets · features · entities · shared
└── .agents/
    ├── rules/                # 파일 범위 규칙 (.mdc)
    └── skills/               # 작업 스킬
```

## Stack

| 영역 | 기술 |
|------|------|
| App | Expo ~57 · Expo Router · NativeWind · TanStack Query · Supabase JS |
| DB | Supabase local (`supabase start`) · SQL migrations · RPC |
| Loop | `run=(user_id, date_kst)` · verify/stuck — [loop/pre/CONTRACT.md](loop/pre/CONTRACT.md) |

## Mobile (FSD)

경로: `mobile/src/`. 상세: [`.agents/rules/fsd-architecture.mdc`](.agents/rules/fsd-architecture.mdc) · 안티패턴: [`.agents/rules/rn-fsd-anti-patterns.mdc`](.agents/rules/rn-fsd-anti-patterns.mdc)

```
providers/ → pages/ → widgets/ → features/ → entities/ → shared/
```

- `mobile/app/*` = `@/pages/*` re-export만
- **`mobile/src/app/` 금지** (Expo 라우트 충돌) → FSD app = `providers/`
- `features/<use-case>/` (도메인 slice 금지). entities api만 supabase 호출
- 문구: `shared/copy/` · 숫자 한도: `shared/constants/` · 테마: `shared/config/theme.ts` (`COLORS` · `TONE_OUTLINE`)
- 테스트: `mobile/src/__tests__/` (FSD 미러, 소스 옆 금지) — [`.agents/rules/tdd.mdc`](.agents/rules/tdd.mdc)
- 로컬 Supabase면 entity api·RPC는 `*.api.test.ts`로 실제 호출 (가능하면)

Expo 문서: https://docs.expo.dev/versions/v57.0.0/

## Supabase

- 스키마 변경 = `supabase/migrations/` 새 파일 (기존 마이그레이션 수정 금지)
- 사용자 메시지 키(raise exception) ↔ `mobile/src/shared/copy/errors.ts` 동기
- 상세: [`.agents/rules/supabase.mdc`](.agents/rules/supabase.mdc)

## Product goals (안심 루프)

유료(~월 1200) · 우선순위 · “전화 안 해도 된다” 신뢰 축: **[docs/product/](docs/product/)**.

| 문서 | 언제 |
|------|------|
| [thesis](docs/product/thesis.md) | 가치·무료/유료 경계 |
| [gates](docs/product/gates.md) | 단계 게이트 (0 신뢰 → 1 glance → 2 주간 → 3 soft) |
| [priorities](docs/product/priorities.md) | 보완 순서·코드 갭 |
| [decisions](docs/product/decisions.md) | 잠근 결정 · 하지 말 것 |

브랜드 예쁨/beat는 [docs/brand/](docs/brand/) (플랜 닫힘 → [deferred](docs/brand/deferred.md)). **축을 섞지 말 것.**  
안심·푸시·stuck·위젯 플랜 시 `docs/product/` 선독 + [plan-with-gates](.agents/rules/plan-with-gates.mdc).

## Design & copy

- 구현 토큰 먼저: [`theme.ts`](mobile/src/shared/config/theme.ts) (`COLORS` · `TONE_OUTLINE`) · [`shared/constants/`](mobile/src/shared/constants/) · tailwind
- 원칙: [docs/design.md](docs/design.md) (§6 색 · §8.1 Tone outline · §8.2 카피)
- UI 작업 규칙: [`.agents/rules/design.mdc`](.agents/rules/design.mdc)
- 상수/문구: [`.agents/rules/copy-constants.mdc`](.agents/rules/copy-constants.mdc)
- TDD·테스트 위치: [`.agents/rules/tdd.mdc`](.agents/rules/tdd.mdc)

## Rules (지속 규칙)

| Rule | 언제 |
|------|------|
| [plan-with-gates](.agents/rules/plan-with-gates.mdc) | **플랜·Plan mode·다단계 작업** — Part A/B · S-step · 회귀 게이트 (`alwaysApply`) · [템플릿](.agents/rules/plan-with-gates-TEMPLATE.md) |
| [fsd-architecture](.agents/rules/fsd-architecture.mdc) | mobile 레이어·의존·Empty UI |
| [rn-fsd-anti-patterns](.agents/rules/rn-fsd-anti-patterns.mdc) | Query/FSD/RN/NativeWind 안티패턴 (리뷰·디버그·커밋 게이트) |
| [tdd](.agents/rules/tdd.mdc) | 테스트 위치·API 통합 |
| [supabase](.agents/rules/supabase.mdc) | 마이그레이션·RPC·ERRORS 동기 |
| [design](.agents/rules/design.mdc) · [copy-constants](.agents/rules/copy-constants.mdc) | UI·카피·상수 |

## Skills (워크플로)

| Skill | 언제 |
|-------|------|
| [product-goals](.agents/skills/product-goals/SKILL.md) | 안심 구독·유료·우선순위 · [docs/product/](docs/product/) |
| [add-fsd-feature](.agents/skills/add-fsd-feature/SKILL.md) | mobile feature/entity/page 추가 |
| [add-supabase-migration](.agents/skills/add-supabase-migration/SKILL.md) | RPC·테이블·한도 변경 |
| [document-user-flows](.agents/skills/document-user-flows/SKILL.md) | 사용자 플로우·갭 브리프 (GPT 이미지용) |
| [store-review-check](.agents/skills/store-review-check/SKILL.md) | 스토어 심사 리젝 후보 스캔 |
| [git-commit](.agents/skills/git-commit/SKILL.md) | `@git-commit` → 작업별 스테이징·커밋 |
| [git-pr](.agents/skills/git-pr/SKILL.md) | `@git-pr` → `pr-body.md` 생성 |

## Do / Don’t

**Do**

- FSD 의존 방향 지키기 · use-case feature 이름
- 사용자 문구는 `shared/copy`, 매직넘버는 `shared/constants`
- 실패/Alert는 안부 톤 (`강퇴` → `내보내기` 등)
- 구현과 함께 `mobile/src/__tests__/` 테스트 (TDD)

**Don’t**

- `features/medication/` 같은 domain slice
- pages에서 entity api 직접 / features에서 supabase client 직접
- border 남발 · 설명 카피 남발 (design.md §8 — Tone outline·focus만)
- 마이그레이션 in-place 수정 · 시크릿 커밋
- 소스 옆에 `*.test.ts` 흩뿌리기

## Quick start

```bash
supabase start
# anon key → mobile/.env
cd mobile && pnpm install && pnpm start
```

상세: [mobile/README.md](mobile/README.md) · [README.md](README.md)
