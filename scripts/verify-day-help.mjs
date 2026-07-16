#!/usr/bin/env npx ts-node
/**
 * verifier 단독 실행 스크립트 (루프 밖).
 * 사용: SUPABASE_URL / ANON_KEY / USER_JWT 필요 — 또는 service role.
 * 간단 검증: supabase start 후 SQL로도 가능 (loop/pre/reference).
 */
console.log(`
verify_day 단독 실행:
  1) 앱 Home 화면의 "루프 verify" 배지
  2) SQL: loop/pre/reference/README.md Verifier SQL
  3) HTTP: curl -X POST http://127.0.0.1:54321/functions/v1/loop-trigger \\
       -H "Authorization: Bearer $ANON_KEY" -H "Content-Type: application/json" \\
       -d '{"user_id":"<uuid>"}'
`);
