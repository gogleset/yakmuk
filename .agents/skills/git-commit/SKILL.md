---
name: git-commit
description: >-
  변경분을 작업 단위로 스테이징하고 커밋한다.
  Use when the user invokes @git-commit or asks to commit with the git-commit skill.
disable-model-invocation: true
---

# git-commit

`@git-commit` 호출 = **즉시 스테이징 + 커밋 실행**. 승인 묻지 않는다. push 하지 않는다.

## 1. Inspect (병렬)

```bash
git status
git diff && git diff --staged
git log --oneline -15
```

시크릿(`.env`, credentials, 키)은 절대 스테이징하지 않는다. 있으면 스킵하고 경고.

변경 없으면: “커밋할 변경 없음”만 보고 종료.

## 2. Group

한 커밋 = 한 의도. 축:

| 축 | paths |
|----|--------|
| `supabase` | `supabase/migrations/**` 등 |
| `mobile` | `mobile/**` |
| `docs` / `loop` | `docs/**`, `loop/**`, `TRACK.md` … |
| `chore` | ignore, prettier-only, lockfile-only, 스크립트 |
| agents | `.agents/**`, `AGENTS.md` → `chore` 또는 `docs` |

규칙:

- migration + LIMITS/ERRORS 동기화 → 같은 커밋 (또는 supabase → mobile 순)
- 포맷-only는 `chore` 분리
- 무관한 화면/도메인은 쪼개기

## 3. Commit (그룹마다 순차)

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
