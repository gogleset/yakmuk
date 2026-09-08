# Reference — yakmuk loop pre

## run 경계

- **run** = `(care_recipient user_id, date_kst)` 하루 goal  
- **turn** = 체크/롤백/컨디션 한 액션  
- 매 탭마다 새 run 열지 않음

## 루프 의사코드

```
on trigger(event):  # in_app | http
  run = open_run(goal=(user_id, date_kst), bounds, trigger=event)
  while true:
    if exceeded(bounds): finish(run, failed_bound); break
    ctx = perceive(run)
    plan = reason(ctx)
    result = act(plan)
    obs = observe(result)
    append_turn(store, run, plan, result, obs)
    v = verify_day(user_id, date_kst)
    if v == success: finish(run, success); break
    if v == failed_verify: finish(run, failed_verify); break
    if stuck(run): finish(run, stuck_abort|stuck_escalate); break
```

## Auth · 초대 흐름

```text
FamilyLeader: OAuth -> create family (name + nickname)
       -> add guardian | care_recipient slot (invited_as + target_role)
       -> issue invite_code + QR
Guardian/CareRecipient: scan QR | type code + optional nickname
       -> claim_family_invite -> anon session on slot
All: same family_id -> RLS
```

QR: `yakok://join?code=XXXXXX`. 표시명 = nickname (없으면 invited_as).

## Postgres 스키마 스케치

```sql
CREATE TABLE families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL            -- family_leader auth.users.id
);

CREATE TABLE family_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id),
  invite_code text NOT NULL UNIQUE,  -- 6자 · QR 동일
  invited_as text NOT NULL,          -- 가족장이 지정한 호칭
  target_role text NOT NULL CHECK (target_role IN ('guardian', 'care_recipient')),
  claimed_by uuid REFERENCES auth.users(id),
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  nickname text NOT NULL,
  invited_as text,                   -- 리더는 null
  role text NOT NULL CHECK (role IN ('family_leader', 'guardian', 'care_recipient')),
  family_id uuid REFERENCES families(id),
  push_token text                    -- 구 expo_push_token. Android FCM
);
```

```sql
-- medications / daily_logs / runs / turns — 기존과 동일 골격
CREATE TABLE medications (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  name text NOT NULL,
  scheduled_time time NOT NULL,
  days_mask text NOT NULL DEFAULT 'daily'
);

CREATE TABLE daily_logs (
  id bigserial PRIMARY KEY,
  medication_id bigint REFERENCES medications(id),
  user_id uuid NOT NULL REFERENCES users(id),
  log_date date NOT NULL,
  status text,
  condition text,
  message text,
  family_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal text NOT NULL,
  status text NOT NULL,
  max_iterations int,
  max_wall_clock_ms int,
  ended_reason text,
  trigger text NOT NULL,
  owner_user_id uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

CREATE TABLE turns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES runs(id),
  turn int NOT NULL,
  plan_json jsonb,
  result_json jsonb,
  observe_json jsonb,
  verify_status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(run_id, turn)
);
```

## RLS 초안

```sql
-- 헬퍼: 내 family_id
-- create function current_family_id() ...

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY daily_logs_family_select ON daily_logs
  FOR SELECT USING (
    family_id = (SELECT family_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY daily_logs_family_insert ON daily_logs
  FOR INSERT WITH CHECK (
    family_id = (SELECT family_id FROM users WHERE id = auth.uid())
    AND user_id = auth.uid()  -- 본인 로그만 생성 (가디언 대리입력은 후순위)
  );

-- users: 같은 family 조회, 본인 row update
-- medications: 같은 family / 본인 소유
-- runs: owner_user_id = auth.uid() (또는 family 읽기 전용 — 구현 시 DECISIONS 확정)
```

## Verifier SQL (Postgres)

```sql
-- :weekday_mon0 = extract(ISODOW from :date_kst)::int % 7
--   (월=0 … 일=6; ISODOW 월=1…일=7 → %7 로 맞춤, 일=7→0)

SELECT COUNT(*) AS pending_meds
FROM medications m
WHERE m.user_id = :user_id
  AND (
    m.days_mask = 'daily'
    OR :weekday_mon0::text = ANY (string_to_array(m.days_mask, ','))
  )
  AND NOT EXISTS (
    SELECT 1 FROM daily_logs d
    WHERE d.medication_id = m.id
      AND d.user_id = :user_id
      AND d.log_date = :date_kst
      AND d.status = 'TAKEN'
  );

SELECT COUNT(*) AS condition_count
FROM daily_logs d
WHERE d.user_id = :user_id
  AND d.log_date = :date_kst
  AND d.condition IN ('GOOD', 'NORMAL', 'BAD');
```

`pending_meds = 0 AND condition_count >= 1` → `success`.

## 가족 테스트 · 네트워킹

```text
supabase start
EXPO_PUBLIC_SUPABASE_URL:
  iOS Simulator     -> http://127.0.0.1:54421
  Android Emulator  -> http://10.0.2.2:54421
  실기기            -> http://<LAN_IP>:54421

A care_recipient: join via code/QR (nickname already set) -> TAKEN
B guardian: OAuth -> Realtime feed sees event
```

## 푸시 (로컬)

```text
daily_logs INSERT -> webhook -> Edge -> FCM (`users.push_token`)
```

SQLite 전환 가이드는 참고만: `ai-engineering-base/tracks/_meta/sqlite-to-local-supabase.md` (본 프로젝트는 DDL 직행).
