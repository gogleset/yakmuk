# yakmuk — Agent guide

가족 건강 안부 · 복약 체크 앱 (**약콕**).  
stage: **pre** · store: **local-supabase** · app: **Kotlin Compose** (`android-app/`).  
RN [`mobile/`](mobile/) = **freeze 스펙** (2026-09-08) — 기능 추가·삭제 금지. 패리티 참조만.

이 파일이 에이전트 진입점이다. 세부 규칙은 `.agents/rules/`, 워크플로는 `.agents/skills/`를 본다.

## Repo map

```
yakmuk/
├── AGENTS.md                 # 이 파일
├── TRACK.md                  # 트랙·스테이지
├── docs/design/              # 시각·톤·카피 원칙 (섹션별)
├── docs/migration/           # Kotlin Android 이전 체크리스트
├── docs/product/             # 제품 목표 · 안심 구독 (신뢰→glance→주간요약)
├── docs/brand/               # 약콕·콕이 브랜드 플랜 (갭·beat·토스형 퍼널·design 수정안)
├── docs/prd/                 # PRD 요약
├── docs/flows/               # 화면 플로우 브리프
├── loop/pre/                 # CONTRACT · CHECKLIST · DECISIONS
├── supabase/                 # migrations · functions · seed
├── android-app/              # Kotlin Compose (Android) — **현재 앱**
├── mobile/                   # Expo RN **freeze 스펙** (기능 추가·삭제 금지)
│   ├── app/                  # 라우트 thin wrapper만
│   └── src/                  # providers · pages · widgets · features · entities · shared
├── .agents/
│   ├── rules/                # 파일 범위 규칙 (.mdc)
│   └── skills/               # 작업 스킬
└── .cursor/
    ├── agents/               # FSD·알람·RPC 전담 subagent
    └── hooks.json            # 위험 셸 ask · 편집 힌트
```

## Stack

| 영역 | 기술 |
|------|------|
| App | Kotlin · Compose · Hilt · supabase-kt (`android-app/`) |
| Spec | Expo ~57 FSD (`mobile/`) — freeze. 새 기능은 여기 넣지 말 것 |
| DB | Supabase local (`supabase start`) · SQL migrations · RPC |
| Loop | `run=(user_id, date_kst)` · verify/stuck — [loop/pre/CONTRACT.md](loop/pre/CONTRACT.md) |

## Mobile (FSD) — freeze 스펙

경로: `mobile/src/`. **새 화면·기능은 `android-app/`.** 패리티 대조할 때만 FSD 규칙:

상세: [`.agents/rules/fsd-architecture.mdc`](.agents/rules/fsd-architecture.mdc) · 안티패턴: [`.agents/rules/rn-fsd-anti-patterns.mdc`](.agents/rules/rn-fsd-anti-patterns.mdc)

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
- 사용자 메시지 키(raise exception) ↔ `android-app/core/.../Errors.kt` · (`mobile/src/shared/copy/errors.ts` freeze 스펙)
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

- 구현 토큰 먼저: [`Colors.kt`](android-app/core/src/main/kotlin/com/jinlabs/yakok/core/theme/Colors.kt) · copy/constants는 `:core`. RN 스펙: [`theme.ts`](mobile/src/shared/config/theme.ts) freeze
- 원칙: [docs/design/](docs/design/README.md) ([color](docs/design/color.md) · [surface](docs/design/surface.md) Tone outline·카피)
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
| [add-fsd-feature](.agents/skills/add-fsd-feature/SKILL.md) | RN freeze — thaw 때만. 새 기능은 `android-app/` |
| [add-supabase-migration](.agents/skills/add-supabase-migration/SKILL.md) | RPC·테이블·한도 변경 |
| [document-user-flows](.agents/skills/document-user-flows/SKILL.md) | 사용자 플로우·갭 브리프 (GPT 이미지용) |
| [store-review-check](.agents/skills/store-review-check/SKILL.md) | 스토어 심사 리젝 후보 스캔 |
| [git-commit](.agents/skills/git-commit/SKILL.md) | `@git-commit` → 작업별 스테이징·커밋 |
| [git-pr](.agents/skills/git-pr/SKILL.md) | `@git-pr` → `pr-body.md` 생성 |

## Cursor agents · hooks (프로젝트)

| 경로 | 역할 |
|------|------|
| [`.cursor/agents/fsd-reviewer`](.cursor/agents/fsd-reviewer.md) | mobile FSD/Query 안티패턴 리뷰 |
| [`.cursor/agents/android-alarm-debugger`](.cursor/agents/android-alarm-debugger.md) | 복약 FSI·AlarmClock·logcat |
| [`.cursor/agents/supabase-rpc-auditor`](.cursor/agents/supabase-rpc-auditor.md) | migration/RPC/ERRORS 감사 |
| [`.cursor/hooks.json`](.cursor/hooks.json) | 위험 셸·시크릿 ask · 편집 후 경로 힌트 |

훅이 안 보이면 Cursor **Hooks** 탭에서 프로젝트 훅 허용·리로드.

## Do / Don’t

**Do**

- 새 앱 코드는 `android-app/` (`:core` JVM 테스트 + `:app`)
- 사용자 문구는 `core/copy`, 매직넘버는 `core/constants` (RN 스펙은 `mobile/src/shared/` freeze)
- 실패/Alert는 안부 톤 (`강퇴` → `내보내기` 등)
- 구현과 함께 `:core` 테스트 (TDD)

**Don’t**

- `mobile/`에 기능 추가·삭제 (freeze)
- `features/medication/` 같은 domain slice (RN 스펙 읽을 때)
- 마이그레이션 in-place 수정 · 시크릿 커밋
- G0.4 실기기 수신 전 가짜 PASS

## Quick start

```bash
supabase start
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home
./gradlew -p android-app :core:test :app:assembleDebug
```

상세: [README.md](README.md) · 스펙: [mobile/README.md](mobile/README.md)
