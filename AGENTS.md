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
├── docs/brand/               # 약콕·콕이 브랜드 플랜 (갭·beat·토스형 퍼널·design 수정안)
├── docs/prd/                 # PRD 요약
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

경로: `mobile/src/`. 상세: [`.agents/rules/fsd-architecture.mdc`](.agents/rules/fsd-architecture.mdc)

```
providers/ → pages/ → widgets/ → features/ → entities/ → shared/
```

- `mobile/app/*` = `@/pages/*` re-export만
- **`mobile/src/app/` 금지** (Expo 라우트 충돌) → FSD app = `providers/`
- `features/<use-case>/` (도메인 slice 금지). entities api만 supabase 호출
- 문구: `shared/copy/` · 숫자 한도: `shared/constants/` · 테마: `shared/config/theme.ts`
- 테스트: `mobile/src/__tests__/` (FSD 미러, 소스 옆 금지) — [`.agents/rules/tdd.mdc`](.agents/rules/tdd.mdc)
- 로컬 Supabase면 entity api·RPC는 `*.api.test.ts`로 실제 호출 (가능하면)

Expo 문서: https://docs.expo.dev/versions/v57.0.0/

## Supabase

- 스키마 변경 = `supabase/migrations/` 새 파일 (기존 마이그레이션 수정 금지)
- 사용자 메시지 키(raise exception) ↔ `mobile/src/shared/copy/errors.ts` 동기
- 상세: [`.agents/rules/supabase.mdc`](.agents/rules/supabase.mdc)

## Design & copy

- 기준: [docs/design.md](docs/design.md) (§6.2 카피 — 짧음·해요체·안부 톤)
- UI 작업 전 design.md 읽기: [`.agents/rules/design.mdc`](.agents/rules/design.mdc)
- 상수/문구: [`.agents/rules/copy-constants.mdc`](.agents/rules/copy-constants.mdc)
- TDD·테스트 위치: [`.agents/rules/tdd.mdc`](.agents/rules/tdd.mdc)

## Skills (워크플로)

| Skill | 언제 |
|-------|------|
| [add-fsd-feature](.agents/skills/add-fsd-feature/SKILL.md) | mobile feature/entity/page 추가 |
| [add-supabase-migration](.agents/skills/add-supabase-migration/SKILL.md) | RPC·테이블·한도 변경 |
| [rn-fsd-anti-patterns](.agents/skills/rn-fsd-anti-patterns/SKILL.md) | 디버그·리뷰·리팩토링 시 FSD/Query/RN 안티패턴 점검 |
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
- border 남발 · 설명 카피 남발 (design.md §6)
- 마이그레이션 in-place 수정 · 시크릿 커밋
- 소스 옆에 `*.test.ts` 흩뿌리기

## Quick start

```bash
supabase start
# anon key → mobile/.env
cd mobile && pnpm install && pnpm start
```

상세: [mobile/README.md](mobile/README.md) · [README.md](README.md)
