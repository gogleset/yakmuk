#!/usr/bin/env python3
"""yakmuk: 편집 후 경로별 짧은 리마인더 (블로킹 없음)."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def paths_from_payload(payload: dict) -> list[str]:
    out: list[str] = []
    for key in ("file_path", "filePath", "path"):
        v = payload.get(key)
        if isinstance(v, str) and v:
            out.append(v)
    # tool input 중첩
    inp = payload.get("input") or payload.get("tool_input") or {}
    if isinstance(inp, dict):
        for key in ("path", "file_path", "filePath", "target_notebook"):
            v = inp.get(key)
            if isinstance(v, str) and v:
                out.append(v)
    # edits 배열
    edits = payload.get("edits") or inp.get("edits") if isinstance(inp, dict) else None
    if isinstance(edits, list):
        for e in edits:
            if isinstance(e, dict):
                p = e.get("path") or e.get("file_path")
                if isinstance(p, str):
                    out.append(p)
    return out


def hint_for(path: str) -> str | None:
    p = path.replace("\\", "/")
    # mobile FSD
    if "/mobile/src/" in p or p.startswith("mobile/src/"):
        return (
            "yakmuk FSD: pages→entity api 직접 금지 · queryKey는 model/queryKeys factory · "
            "테스트는 mobile/src/__tests__/ · copy는 shared/copy. "
            "상세: .agents/rules/rn-fsd-anti-patterns.mdc"
        )
    if "/mobile/plugins/" in p or p.startswith("mobile/plugins/"):
        return (
            "yakmuk native: mobile/plugins/ (+ prebuild)가 SoT. "
            "mobile/android/는 생성물 — 플러그인만 고치고 prebuild/재빌드."
        )
    if "/supabase/migrations/" in p or p.startswith("supabase/migrations/"):
        return (
            "yakmuk supabase: 기존 migration in-place 수정 금지 · 새 파일 추가. "
            "사용자 raise 메시지 ↔ mobile/src/shared/copy/errors.ts 동기. "
            "상세: .agents/rules/supabase.mdc"
        )
    if "/supabase/functions/" in p or p.startswith("supabase/functions/"):
        return (
            "yakmuk edge: care-push는 약 스케줄이 아님 · JWT 검증 · "
            "클라이언트 invoke는 entities/family api만."
        )
    return None


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        print("{}")
        return 0

    hints: list[str] = []
    seen: set[str] = set()
    for path in paths_from_payload(payload):
        h = hint_for(path)
        if h and h not in seen:
            seen.add(h)
            hints.append(h)

    if not hints:
        # path를 못 뽑으면 toolName/args 문자열에서 추정
        blob = json.dumps(payload, ensure_ascii=False)
        for needle, kind in (
            ("mobile/src/", "mobile"),
            ("mobile/plugins/", "plugins"),
            ("supabase/migrations/", "mig"),
            ("supabase/functions/", "fn"),
        ):
            if needle in blob:
                fake = {
                    "mobile": "mobile/src/x.ts",
                    "plugins": "mobile/plugins/x.js",
                    "mig": "supabase/migrations/x.sql",
                    "fn": "supabase/functions/x/index.ts",
                }[kind]
                h = hint_for(fake)
                if h and h not in seen:
                    seen.add(h)
                    hints.append(h)

    if not hints:
        print("{}")
        return 0

    print(
        json.dumps(
            {"additional_context": "\n".join(hints)},
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
