#!/usr/bin/env python3
"""yakmuk: 위험한 셸 / 시크릿 노출 의 → ask (기본 fail-open)."""

from __future__ import annotations

import json
import re
import sys


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        print(json.dumps({"permission": "allow"}))
        return 0

    cmd = payload.get("command") or ""
    c = cmd.strip()
    low = c.lower()

    # --- deny에 가까운 파괴적 git ---
    deny_patterns = [
        (r"\bgit\s+push\b.*(--force\b|-f\b|--force-with-lease\b)", "force push"),
        (r"\bgit\s+reset\s+--hard\b", "git reset --hard"),
        (r"\bgit\s+clean\s+-[a-z]*f", "git clean -f"),
        (r"\bgit\s+checkout\s+--\s+\.|git\s+restore\s+--source=HEAD\s+--\s+\.", "working tree wipe"),
    ]
    for pat, label in deny_patterns:
        if re.search(pat, c, re.I):
            print(
                json.dumps(
                    {
                        "permission": "ask",
                        "user_message": f"위험한 명령 ({label}). 확인 후 진행하세요.",
                        "agent_message": (
                            f"Hook: `{label}` 감지. 사용자 승인 없이는 실행하지 마세요. "
                            "force push / hard reset은 명시 요청이 있을 때만."
                        ),
                    },
                    ensure_ascii=False,
                )
            )
            return 0

    # --- DB 파괴 / 광역 삭제 ---
    ask_patterns = [
        (r"\bsupabase\s+db\s+reset\b", "supabase db reset (로컬 DB 초기화)"),
        (r"\brm\s+(-[a-zA-Z]*f[a-zA-Z]*|--force).*\b(mobile|supabase|\.git)\b", "rm -f on repo paths"),
        (r"\bdocker\s+compose\s+down\s+-v\b|\bdocker-compose\s+down\s+-v\b", "docker compose down -v"),
    ]
    for pat, label in ask_patterns:
        if re.search(pat, c, re.I):
            print(
                json.dumps(
                    {
                        "permission": "ask",
                        "user_message": f"주의: {label}",
                        "agent_message": f"Hook: `{label}` — 사용자 확인 후 진행.",
                    },
                    ensure_ascii=False,
                )
            )
            return 0

    # --- 시크릿 / .env ---
    secret_hit = False
    reasons: list[str] = []
    if re.search(r"(^|[|&;]\s*)(cat|less|more|head|tail|bat)\s+[^\n]*\.env(\.local)?\b", c):
        secret_hit = True
        reasons.append(".env 내용 출력")
    if re.search(r"\bgit\s+(add|commit|push)\b[^\n]*\.env\b", c) and ".env.example" not in low:
        secret_hit = True
        reasons.append(".env 스테이징/커밋")
    if re.search(
        r"(service_role|supabase_service_role|sk_live_|sk_test_|BEGIN (RSA |OPENSSH )?PRIVATE KEY)",
        c,
        re.I,
    ):
        secret_hit = True
        reasons.append("시크릿/키 문자열")

    if secret_hit:
        why = ", ".join(reasons)
        print(
            json.dumps(
                {
                    "permission": "ask",
                    "user_message": f"시크릿 관련 명령 의 ({why})",
                    "agent_message": (
                        f"Hook: 시크릿 위험 ({why}). "
                        ".env / service_role / 개인키는 커밋·로그에 넣지 마세요."
                    ),
                },
                ensure_ascii=False,
            )
        )
        return 0

    # --- 기존 migration in-place 수정 유도 명령 (경고만 ask) ---
    if re.search(r"\bgit\s+add\b[^\n]*supabase/migrations/", c) and re.search(
        r"migrations/\d{14}_", c
    ):
        # soft: allow — after-edit hint가 담당. 여기선 패스
        pass

    print(json.dumps({"permission": "allow"}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
