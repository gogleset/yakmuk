---
name: add-supabase-migration
description: >-
  yakmuk Supabase에 테이블·RPC·한도·RLS 변경 마이그레이션을 추가할 때 사용.
  앱 LIMITS/ERRORS 동기화와 db reset 검증 포함.
---

# Add Supabase migration (yakmuk)

## When

- 스키마/RPC/RLS/체크 제약 변경
- 초대 한도·코드 길이 등 서버 한도 변경
- `raise exception` 메시지 추가·변경

## Steps

1. **새 파일만** 생성: `supabase/migrations/YYYYMMDDHHMMSS_<name>.sql`  
   이미 적용된 마이그레이션 수정 금지.
2. RPC는 `security definer`/`invoker`·권한 검사 명확히. 가족장 전용은 SQL에서 검증.
3. 사용자용 `raise exception 'key…'` 키는 앱과 맞출 것:
   - [`mobile/src/shared/copy/errors.ts`](../../../mobile/src/shared/copy/errors.ts) `BACKEND_ERROR_MESSAGES`
4. 숫자 한도 변경 시:
   - [`mobile/src/shared/constants/limits.ts`](../../../mobile/src/shared/constants/limits.ts)
5. 루프/검증 로직이면 [loop/pre/CONTRACT.md](../../../loop/pre/CONTRACT.md) · DECISIONS 확인.

## Verify

```bash
# repo root
supabase db reset    # 또는 migration up
```

앱에서 해당 RPC/에러 경로 한 번 실행해 문구가 `formatUserFacingError`로 나오는지 확인.

## Don’t

- service role 키를 mobile에 넣기
- 영문 leak fallback (`add med failed` 등) — ERRORS 한국어 사용
- 초대 한도 등 서버만 바꾸고 LIMITS 안 맞추기

## Related

- rule: [supabase.mdc](../../rules/supabase.mdc)
- seed: `supabase/seed.sql`
