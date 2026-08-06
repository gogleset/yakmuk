# Gate 0 신뢰 플레이북 (G0.1 · G0.2)

게이트: [gates.md](gates.md) · G0.3/G0.4는 [samsung-fsi-care-push-test.md](samsung-fsi-care-push-test.md)

**전제:** 동일 `family_id` 보호자 + 피보호자 · 로컬 Supabase · 개발 빌드 2대(또는 2시뮬)

---

## G0.1 — TAKEN → 보호자 피드

| # | 할 일 | Pass |
|---|--------|------|
| 1 | 보호자: 가족 탭 연 채 대기 (Realtime 구독) | — |
| 2 | 피보호자: 오늘 약 **복용 체크**(TAKEN) | DB `daily_logs` TAKEN |
| 3 | 보호자: 새로고침 없이 피드/멤버 상태 갱신 | `다 먹음` 또는 진행 라벨·피드 한 줄 |

| 결과 | |
|------|--|
| 상태 | 수동 확인 |
| CHECKLIST | [loop/pre/CHECKLIST.md](../../loop/pre/CHECKLIST.md) 「2 시뮬: TAKEN→피드」 |

---

## G0.2 — stuck → soft 안부

| # | 할 일 | Pass |
|---|--------|------|
| 1 | 피보호자: 스케줄 약 미복용 상태로 stuck escalate 유도 (루프 해시 3회 또는 테스트 트리거) | `family_alerts` row |
| 2 | 보호자: 가족 탭 케어 알림 카드 | worried / soft(warning) 톤 |
| 3 | 빨간 잔소리 배너와 **병행 없음** | tone destructive 미사용 |

| 결과 | |
|------|--|
| 상태 | 수동 확인 |
| UI | `FamilyCareAlertCard` · `TONE_OUTLINE.warning` |

---

## 판정

| 게이트 | 문서 기준 | 비고 |
|--------|-----------|------|
| G0.1 | 위 표 Pass | 코드·Realtime 구독 있음 |
| G0.2 | 위 표 Pass | stuck→alert 경로 있음 |
| G0.3 | [samsung T2](samsung-fsi-care-push-test.md) | **PASS** (2026-08-06) |
| G0.4 | [samsung T4](samsung-fsi-care-push-test.md) | **보류** — decisions #8 |
