# Loop — 약먹었약

Goal → trigger → (perceive → reason → act → observe) × N → verify / bound / stuck.

**시작 = pre** (mvp 스킵). 공유 로컬 Supabase로 가족 2클라 테스트.

## 7축 × 도메인

| 축 | 약먹었약 |
|----|----------|
| goal | 당일 `TAKEN` 전부 + 컨디션 1회 |
| cycle | 스케줄 → 체크/롤백/컨디션 → Realtime 피드 |
| bound | iter≤10 + KST 일일 윈도우 |
| verify | `verify_day(user_id, date_kst)` |
| stuck | 미복용 해시 3회 → escalate |
| trace | Postgres `runs`/`turns` |
| trigger | 인앱 버튼 + HTTP |

Auth: guardian=OAuth · care_recipient=코드/QR (nickname=보호자 사전 설정)

## Stages

| Stage | 상태 |
|-------|------|
| mvp | **스킵** |
| [pre](./pre/) | **현재** — RN + local Supabase · OAuth/QR |
| [prod](./prod/) | 다음 — hosted · EAS · 하드캡 · 심사 (pre 상속) |
