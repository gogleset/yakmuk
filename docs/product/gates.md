# 단계별 목표 · 게이트

← [README](README.md)

안심 루프 제품 목표.  
다음 단계로 넘어가기 전에 **검토 → (미달이면) 실행 → 재검토**.  
전부 PASS 전까지 **다음 단계 착수 금지**.

---

## 1차 출시 트랙 (로컬 알람) — 2026-09

가족 루프(아래 단계 0–3)와 **축을 섞지 말 것**.  
1차 스토어 = 본인 폰 복약 알림. 저장 = 기기 Room. 로그인/FCM 없음.

**출시 게이트 = S5.** G0.4 원격 푸시는 **2차**.

| 게이트 | PASS 조건 | 상태 (2026-09-11) |
|--------|-----------|-------------------|
| S1 | Room + 홈/알람/폼이 서버 없이 돈다. `:core:test` + `:app:assembleDebug` | **PASS** |
| S2 | Welcome/Join 없음. 온보딩 나중에/완료 → 홈. 일일 컨디션 없음 | **PASS** (에뮬 「나중에」→ 빈 홈) |
| S3 | 가족 탭 = 정적 미리보기 한 화면. 초대/피드/조인 없음. 네트워크 0 | **PASS** (에뮬 미리보기, logcat 네트워크 에러 0) |
| S4 | 설정 로컬. 기록 삭제 → 재온보딩. release APK에 supabase/firebase 없음 | **PASS** (`assembleRelease`, dex에 supabase/firebase 없음. APK는 unsigned) |
| S5 | 실기기: FSI 한 탭 TAKEN 유지 · 재부팅 알람 생존 · 비행기 모드 · 기록 삭제 | **미실행** — 가짜 PASS 아님 |

실기기 프로토콜: [local-alarm-device-test.md](local-alarm-device-test.md) (삼성 T1/T2만. T4 care-push 범위 밖).  
Play 제출(코드 밖): [play-checklist.md](play-checklist.md).

아래 단계 0–3 · G0.4는 **2차(가족 안부)** 게이트로 유지한다.

가치 SoT → [thesis.md](thesis.md)  
우선순위·근거 → [priorities.md](priorities.md)  
잠긴 결정 → [decisions.md](decisions.md)

브랜드 게이트 SoT는 [docs/brand/gates.md](../brand/gates.md) (단계 번호 **섞지 말 것**).

---

## 루프 (매 단계)

```
┌─────────────────────────────────────┐
│ 1. 목표 읽기 (이 문서 해당 단계)       │
│ 2. 현재 상태 검토 (게이트 체크)        │
│ 3. 미달 항목만 실행                   │
│ 4. 다시 검토                         │
│ 5. 전부 PASS → 다음 단계             │
│    하나라도 FAIL → 3으로             │
└─────────────────────────────────────┘
```

| 규칙 | 내용 |
|------|------|
| 한 단계씩 | N PASS 전 N+1 착수 금지 |
| 검토 먼저 | “코드 있으니 됐다”로 넘기지 말 것 — **실기기/시나리오** 게이트 포함 |
| 범위 밖 금지 | 해당 단계에 없는 위젯·다이제스트·브랜드 컷을 끌어오지 말 것 |
| 충돌 시 | [decisions.md](decisions.md) > 이 게이트 > [priorities.md](priorities.md) |
| 브랜드 | beat/퍼널 규칙은 [docs/brand/decisions.md](../brand/decisions.md) 준수 |

**현재 단계:** `0` ← G0.1·G0.2 수동 PASS 후 `1` (G0.4는 보류로 닫음). Gate 1–2 **코드는 구현됨** — 공식 승격은 Gate 0 닫힌 뒤.

에이전트: 단계 시작 시 이 문서 해당 절 + README + 관련 상세만 연다.

### 단계 0 진행 (2026-08-06)

플레이북: [gate0-trust-playbook.md](gate0-trust-playbook.md) · FSI/care-push: [samsung-fsi-care-push-test.md](samsung-fsi-care-push-test.md)

| 게이트 | 상태 | 메모 |
|--------|------|------|
| G0.1 | **partial** | 코드·DB OK · 플레이북 고정 · **2클라 UI 수동** ([playbook](gate0-trust-playbook.md)) |
| G0.2 | **partial** | stuck→worried soft 경로 OK · 플레이북 고정 · **실기기 수동** |
| G0.3 | **PASS** | 삼성 T1/T2 (2026-08-06) — fp `clk4` · 실약 시각 FSI→체크 |
| G0.4 | **보류** | 에뮬 T4 PASS (2026-09-08) · **실기기 미완**. decisions #8 · 가짜 PASS 아님 |

가짜 PASS 없음. G0.1·G0.2 PASS + G0.4 보류(또는 PASS) 후 단계 `1`.

### 단계 1–2 코드 (2026-08-06) — 공식 PASS는 Gate 0 닫힌 뒤

| 게이트 | 코드 | 메모 |
|--------|------|------|
| G1.1 | **구현** | 보호자 고정/교체 알림 (`care-glance`) · OS 홈 위젯 아님 · iOS는 id 교체(고정 불가) |
| G1.2 | **구현** | `memberStatusLabel` · 분수/점수 금지 |
| G1.3 | **구현** | stale 30분 · decisions #10 |
| G2.1 | **구현** | 채널=**인앱** 잠금 (decisions #11) |
| G2.2 | **구현** | 대략 문장 + 특이일만 |
| G2.3 | **구현** | 설정 옵트 · `week_start` dismiss |

---

## 0. 신뢰 — 안심 루프가 안 깨짐

**목표:** 보호자가 “오늘 전화 안 해도 된다”를 **실기기에서** 믿을 수 있다.  
새 UI보다 **이미 있는** 체크·피드·stuck·알람·(prod) 푸시 경로의 신뢰.

| 게이트 | PASS 조건 |
|--------|-----------|
| G0.1 | 2클라(또는 2시뮬): 피보호자 TAKEN → 보호자 피드/상태 갱신 재현. [CHECKLIST](../../loop/pre/CHECKLIST.md) 해당 항 체크 |
| G0.2 | stuck escalate → `family_alerts` → 보호자 가족 탭에서 soft 안부(worried 톤) 확인. 빨간 잔소리 배너와 병행 없음 |
| G0.3 | 약 알람: 스케줄 시각에 뜨고, 알림/랜딩에서 **한 탭**으로 복용 체크까지 이어짐 (대상 OS 최소 1종 실기기) |
| G0.4 | prod 경로: 보호자 **원격 푸시**(먹음 또는 stuck 중 제품이 고른 이벤트)가 앱 백그라운드에서도 도착 — 미준비면 범위·가드를 [decisions](decisions.md)에 명시하고 이 게이트는 **보류 표기**만 (가짜 PASS 금지) |

→ PASS 후 단계 1

---

## 1. Glance — 앱 안 열어도 한눈

**목표:** 보호자가 홈/잠금에서 `누구 · 오늘 상태` 한 줄을 본다.

| 게이트 | PASS 조건 |
|--------|-----------|
| G1.1 | 위젯 또는 동등 glance 표면 1개 이상 (OS 제약 문서화) |
| G1.2 | 카피·톤: 분수·CCTV·점수 금지. 안부 라벨 수준 ([surface](../design/surface.md) §8) |
| G1.3 | 데이터 stale 정책 명시 (예: 최대 N분 / 다음 체크 시 갱신) |

→ PASS 후 단계 2

---

## 2. 주간 안부 — 돈 낸 감정 보상

**목표:** 주 1회 보호자에게 “이번 주 괜찮았어요”급 요약이 온다.

| 게이트 | PASS 조건 |
|--------|-----------|
| G2.1 | 주간 다이제스트 채널 확정 (푸시 / 인앱 카드 중 decisions에 잠금) |
| G2.2 | 내용: 복약 대략 + 특이 날(놓침·BAD)만. 통계 대시보드 아님 |
| G2.3 | 수신 옵트·가족 단위 중복 스팸 없음 |

→ PASS 후 단계 3

---

## 3. Soft 확장 · 유료 경계 정리

**목표:** 오후 soft 넛지·유료 경계가 thesis와 맞고, 브랜드 deferred와 충돌 없음.

| 게이트 | PASS 조건 |
|--------|-----------|
| G3.1 | F8 `cheer` 등 soft 미복용 넛지 훅·카피 확정 후 연결 (flows 갱신 먼저). 감시 톤 금지 |
| G3.2 | 무료 vs ~1200 경계가 [thesis.md](thesis.md)와 코드/스토어 메타에 모순 없음 |
| G3.3 | AI 상담·통계 대시보드·개별 체크 happy를 유료 미끼로 넣지 않음 ([decisions](decisions.md)) |

→ PASS 후 **이 플랜 닫힘** (후속은 priorities에 `later`로만)

---

## 전체 성공 정의

단계 0–2 PASS = **안심 구독으로 설득 가능한 최소 제품**.  
단계 3 = 확장·가격 정리.  
브랜드 컷·퍼널 P6 등은 [docs/brand/deferred.md](../brand/deferred.md) — **이 플랜 성공 조건에 넣지 않음**.
