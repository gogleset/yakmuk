---
name: git-commit
description: >-
  변경분을 작업 단위로 스테이징하고 커밋한다.
  Use when the user invokes @git-commit or asks to commit with the git-commit skill.
disable-model-invocation: true
---

# git-commit

`@git-commit` 호출 = **정적 검사 + 안티패턴 게이트 후** 스테이징 + 커밋 실행. 승인 묻지 않는다. push 하지 않는다.

## 1. Inspect (병렬)

```bash
git status
git diff && git diff --staged
git log --oneline -15
```

시크릿(`.env`, credentials, 키) 파일은 절대 스테이징하지 않는다. 있으면 스킵하고 경고.

추가로 working tree diff에서 시크릿 패턴을 grep한다:

```bash
git diff HEAD | grep -inE '(api[_-]?key|secret|token|password)\s*[:=]\s*["\047][a-zA-Z0-9]{8,}' || true
```

걸리면 해당 라인/파일을 스테이징에서 제외하고 경고 후 계속 진행.

`mobile/**` diff에서 `console.log(` / `debugger` 잔재도 grep. 의도적 로깅으로 주석이 붙어있지 않으면 제거한 뒤 커밋.

```bash
git diff HEAD -- 'mobile/**' | grep -nE '^\+.*(console\.log\(|debugger)' || true
```

변경 없으면: "커밋할 변경 없음"만 보고 종료.

## 2. Static checks gate (필수, anti-patterns보다 먼저)

> 이 단계는 **`git add` 전**이다. `--staged`만 보면 빈다 → **HEAD 기준 working tree**(`git diff HEAD`)로 검사한다.

`mobile/**` 변경이 있으면:

```bash
cd mobile && pnpm exec tsc --noEmit
```

- `tsc` 실패 → 타입 에러 수정 없이 커밋 금지
- package manager는 **pnpm** (`npx` 말고 `pnpm exec`)
- `__tests__`는 `tsconfig` exclude — 테스트 타입은 이 게이트 밖

**eslint**: 현재 mobile에 eslint 미도입. `eslint.config.*` / `.eslintrc*`가 생기면 그때 아래를 추가한다 (레포 루트에서 경로 보정):

```bash
# eslint 도입 후에만
cd mobile && pnpm exec eslint \
  $(git -C .. diff --name-only HEAD -- 'mobile/**/*.{ts,tsx}' | sed 's|^mobile/||' | tr '\n' ' ') \
  --max-warnings=0
```

`supabase/**` 변경이 있으면:

- `supabase/migrations/**`의 **새/수정** 파일이 destructive(`DROP`, `TRUNCATE`, `ALTER ... DROP COLUMN` 등)를 포함하면 **강조 경고만** 하고 진행 (커밋 막지 않음, 최종 확인은 사용자 책임)

## 3. Anti-patterns gate (필수)

`mobile/**` 변경이 있으면 **커밋 전에** [rn-fsd-anti-patterns](../rn-fsd-anti-patterns/SKILL.md)를 읽고, working tree(unstaged+staged) mobile diff를 점검한다.

- 점검 순서·보고 형식은 해당 스킬을 따른다
- Must-fix(캐시 이중화, queryKey 매직, FSD 우회/계층 위반, nested component, index key 등) → **고친 뒤** 커밋
- 추가로: 새로 추가/수정된 `useQuery`/`useMutation`이 **`model/queryKeys.ts` factory**를 거치지 않고 매직 배열(`['medication', id]` 등)을 직접 쓰면 must-fix
  - entity: `entities/<entity>/model/queryKeys.ts`
  - feature mutation: `features/<use-case>/model/queryKeys.ts`
  - ❌ `api/queryKeys.ts` 아님
- mobile 변경 없으면 이 단계 전체를 스킵 (agents/docs/supabase-only 포함)

## 4. Group

한 커밋 = 한 의도. 축:

| 축 | paths |
|----|--------|
| `supabase` | `supabase/migrations/**` 등 |
| `mobile` | `mobile/**` (아래 `mobile-native` 제외) |
| `mobile-native` | `mobile/app.json`, `mobile/app.config.*`, `mobile/ios/**`, `mobile/android/**` (prebuild/EAS 영향) |
| `docs` / `loop` | `docs/**`, `loop/**`, `TRACK.md` … |
| `chore` | ignore, prettier-only, lockfile-only, 스크립트 |
| agents | `.agents/**`, `AGENTS.md` → `chore` 또는 `docs` |

규칙:

- migration + LIMITS/ERRORS 동기화 → 같은 커밋 (또는 supabase → mobile 순)
- 포맷-only는 `chore` 분리
- `mobile-native` 변경은 다른 mobile 변경과 섞지 않고 별도 커밋 (EAS/build 추적)
- 무관한 화면/도메인은 쪼개기

## 5. Commit (그룹마다 순차)

메시지: [commit-template.md](commit-template.md)

```bash
git add <group-paths…>    # -i / -p 금지
git commit -m "$(cat <<'EOF'
<type>(<scope>): <요약>

<본문 선택>
EOF
)"
```

전부 끝난 뒤 `git status` + 만든 커밋 해시/메시지 목록만 짧게 보고.

## Safety

- `git config` / force push / hard reset / `--no-verify` 금지
- amend 금지 (이 스킬에서는 항상 새 커밋)
- hook 실패 → 고치고 **새 커밋** (amend로 재시도 금지)
- push 금지 — 사용자가 따로 요청할 때만
