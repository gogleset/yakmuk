# 보완 우선순위

← [README](README.md)

[thesis.md](thesis.md) 기준으로 **무엇을 먼저 보완할지**.  
게이트·착수 순서 SoT는 [goals.md](goals.md).

상태 기준일: **2026-08-02** · stage: pre

---

## 1순위 — 신뢰 (goals §0)

| 항목 | 지금 | 갭 | 근거 |
|------|------|-----|------|
| TAKEN → 보호자 피드 | Realtime 구독 코드 있음 | 2시뮬 E2E 미체크 | [family-tab-flow-brief](../flows/family-tab-flow-brief.md) · CHECKLIST |
| stuck → 가족 알림 | `family_alerts` · worried 카드 | 실기기 stuck 시나리오 미완 | loop CONTRACT · FamilyCareAlert |
| 약 알람 → 체크 | 로컬 알림 + `MedicationAlarmPage` | OS별 실기기 “제시간·한 탭” 검증 | medication-notifications |
| 보호자 원격 푸시 | Expo token 저장·Edge는 prod stub | 백그라운드 안심 푸시 미운영 | FR-05 prod · flow brief `prod-only` |

**한 줄:** 기능 추가 금지. **이미 있는 루프를 믿게 만들기.**

---

## 2순위 — 체감 (goals §1–2)

| 항목 | 왜 | 비고 |
|------|-----|------|
| 홈 위젯 / 잠금 한 줄 | 앱 안 열어도 안심 → 구독 유지 | glance |
| 주 1회 안부 다이제스트 | 보호자 “돈 낸 보상” | 통계판 아님 |
| (연계) 알림 슬롯 on/off | 설정은 권한만 있음 | settings brief `missing` — 1순위 후 |

---

## 3순위 — later (goals §3 · brand deferred)

| 항목 | 어디에 있나 | 비고 |
|------|-------------|------|
| F8 `cheer` / `lantern` / `heart` | brand deferred | beat 훅 확정 후 |
| streak 컷 · 정식 콕이 overwrite | brand deferred | retention 보조, 결제 동기 아님 |
| 퍼널 P6 FunnelShell 승격 | brand deferred | 입력 UX |
| AI · 병원 연동 · 대시보드 | — | **하지 말 것** ([decisions](decisions.md)) |

---

## 권장 스프린트 슬라이스

```
S0  2클라 TAKEN→피드 + stuck→alert 실재현
S0  알람→체크 실기기 1종
S0' Edge/원격 푸시 (prod 준비되면) — 가드 유지하며
S1  glance 1표면
S2  주간 요약
S3  soft cheer · 유료 경계 문서↔스토어
```

플랜 작성 시 `.agents/rules/plan-with-gates` + 이 폴더 선독.
