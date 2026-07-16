# CONTRACT — yakmuk loop pre (Expo RN + 로컬 Supabase)

**시작 stage.** mvp(SQLite-only)는 스킵.  
스택: Expo RN + `supabase start`. 7축을 여기서 처음 증명한다.

베이스: `ai-engineering-base/tracks/loop-engineering/pre/CONTRACT.md`  
(캠프 `mvp→pre` promote · sqlite 전환 체크 = **N/A**)

## 1. goal

**run = `(user_id, date_kst)` 하루.** 탭 한 번 = turn/act (새 run 아님).

- 성공 A: 당일 `days_mask` 해당 `medications` 전부 `TAKEN`
- 성공 B: 당일 컨디션(`GOOD`\|`NORMAL`\|`BAD`) ≥ 1
- `message` 선택 · `SKIPPED` → success 아님 (`continue`)

## 2. cycle

| 단계 | 도메인 |
|------|--------|
| perceive | 오늘 스케줄 + 기존 로그 |
| reason | 미복용 / 컨디션 미제출 |
| act | TAKEN · 롤백 · SKIPPED · 컨디션 |
| observe | 로그 · Realtime 피드 |

## 3. bound

`max_iterations` 및/또는 당일 KST wall-clock → `failed_bound`. 수치: DECISIONS.

## 4. verify

```text
verify_day(user_id, date_kst) -> success | continue | failed_verify
```

루프 밖 단독 실행. SQL: [reference](./reference/README.md).

## 5. stuck

미복용 observe 해시 N회 → abort/escalate. 이벤트 DB 조회 가능.

## 6. trace

`runs` / `turns` → 로컬 Supabase(Postgres). 쿼리 가능.

## 7. trigger

인앱 버튼 · **HTTP/웹훅 ≥1** · (선택) 로컬 알림 스케줄.

## Auth · 가족 (FR-01)

| 역할 | 가입/진입 |
|------|-----------|
| **보호자 (`guardian`)** | OAuth → 가족 생성 → **피보호자 추가(초기 nickname 설정)** → 해당 슬롯 코드·QR 표시 |
| **피보호자 (`care_recipient`)** | 6자리 코드 **또는** QR만 → 세션 연결 (닉네임·OAuth 입력 없음) |

- 초기 nickname은 **보호자가 초대 발급 시** 설정 (예: 엄마, 아빠)
- QR = 코드와 동일 (`yakmuk://join?code=…`) · 슬롯에 이미 nickname 바인딩
- RLS: 동일 `family_id` · 1 family / user
- 다중 가족 그룹 금지

## 클라이언트 · 어댑터

Expo RN + FSD/Atomic.  
포트: `open_run` / `append_turn` / `finish_run` + repository → 로컬 Supabase.  
prod에서 hosted로 교체.

## 제품 (pre)

- FR-02~05: 스케줄 · 홈 체크 · Realtime · 로컬알림+Edge 푸시
- 가족 테스트: 시뮬 2대, URL은 DECISIONS(시뮬 localhost 규칙)

## 범위 밖

공공 API · OCR · 다중 가족 · EAS/스토어 · 클라우드 prod

## 금지

퍼블릭 배포를 완료 조건 · prod 시크릿 커밋 · SQLite 기본 런타임
