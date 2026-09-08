# 보완 우선순위

← [README](README.md)

[thesis.md](thesis.md) 기준으로 **무엇을 먼저 보완할지**.  
게이트·착수 순서 SoT는 [gates.md](gates.md).

상태 기준일: **2026-08-06** · stage: pre · gates 현재 `0` (G0.1·G0.2 수동) · Gate1–2 코드 착수됨

---

## 1순위 — 신뢰 (gates §0)

| 항목 | 지금 | 갭 | 근거 |
|------|------|-----|------|
| TAKEN → 보호자 피드 | Realtime 구독 + DB TAKEN 확인 | **2클라 UI E2E 수동** | [playbook](gate0-trust-playbook.md) |
| stuck → 가족 알림 | `family_alerts` · worried · soft outline | 실기기 stuck 시나리오 | playbook G0.2 |
| 약 알람 → 체크 | 로컬 알림 + FSI | **PASS** (삼성 T2) | samsung-fsi |
| 보호자 원격 푸시 | care-push Edge FCM | **보류** (실기기 T4) | decisions #8 |

**한 줄:** 기능 추가 금지였음 → G0.3 PASS·G0.4 보류 후 glance/주간 **코드** 진행. G0.1·G0.2 수동은 플레이북.

---

## 2순위 — 체감 (gates §1–2)

| 항목 | 왜 | 비고 |
|------|-----|------|
| 보호자 고정/교체 알림 | 앱 안 열어도 안심 | **코드됨** · decisions #10 · iOS=교체형 |
| 주 1회 안부 인앱 카드 | 보호자 “돈 낸 보상” | **코드됨** · decisions #11 · 푸시 아님 |
| (연계) 알림 슬롯 on/off | 설정은 권한+glance/주간 옵트 | 약 폼 슬롯은 기존 · 설정 탭 슬롯은 later |

---

## 3순위 — later (gates §3 · brand deferred)

| 항목 | 어디에 있나 | 비고 |
|------|-------------|------|
| F8 `cheer` / `lantern` / `heart` | brand deferred | beat 훅 확정 후 |
| streak 컷 · 정식 콕이 overwrite | brand deferred | retention 보조, 결제 동기 아님 |
| 퍼널 P6 FunnelShell 승격 | brand deferred | 입력 UX |
| 약 목적 태그 (`purpose`) | [med-purpose-tags.md](med-purpose-tags.md) | Gate 0 후 · [decisions #9](decisions.md) |
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
