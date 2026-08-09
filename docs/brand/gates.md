# 단계별 목표 · 게이트

← [README](README.md)

각 **작업 단계(0–8)** 에 달성할 목표가 있다.  
다음 단계로 넘어가기 전에 **검토 → (미달이면) 실행 → 재검토** 루프를 돌린다.  
목표가 모두 통과할 때까지 **다음 단계 착수 금지**.

체크리스트(무엇을 할지) → [impl.md](impl.md)  
잠긴 결정 → [decisions.md](decisions.md)

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
| 한 단계씩 | 단계 N이 PASS 되기 전에 N+1 착수 금지. README 의존도상 4∥5 가능해도 **번호 순** 따름 |
| 검토 먼저 | “다 한 것 같다”로 넘어가지 말 것. 게이트를 항목별로 확인 |
| 범위 밖 금지 | 해당 단계 목표에 없는 작업(예: 단계 2에서 sage hex) 하지 말 것 |
| 충돌 시 | [decisions.md](decisions.md) > gates 게이트 문구 > README 끝 조건 · 상세 문서 |
| 기록 | 단계 PASS 시 [impl.md](impl.md) 해당 행 `done`. 아래 **현재 단계**도 갱신 |

**현재 단계:** `닫힘` ← 루프 돌릴 때마다 여기만 고친다.

에이전트: 단계 시작 시 이 문서의 해당 절 + README 해당 번호 + 관련 상세 문서만 연다.

---

## 0. 착수 전 (읽기만)

**목표:** 구현 없이, 왜·무엇을·어떤 ID로 할지 합의가 머릿속에 있다.

| 게이트 | PASS 조건 |
|--------|-----------|
| G0.1 | README ID 용어(작업 단계 / F / 퍼널 P / 1차·2차) 구분 가능 |
| G0.2 | [gap.md](gap.md) 갭·placeholder 파일명·색 방향(#8B 틸 유지) 파악 |
| G0.3 | 손댈 축만 열람: beat → [flows.md](flows.md) / 입력 → [funnels.md](funnels.md) |
| G0.4 | 이 단계에서 코드·에셋·design.md **변경 0건** |

→ PASS 후 단계 1

---

## 1. 디자인 소스 갱신

**목표:** `docs/design/`가 약콕·세이지 방향·Character·Brand flows·Funnel의 **단일 진실(SoT)** 이다.

| 게이트 | PASS 조건 |
|--------|-----------|
| G1.1 | [design-edits.md](design-edits.md) 반영 완료 (약콕, sage 방향, Character, Brand flows, Funnel) |
| G1.2 | design.md 제목·서두가 `약콕` (식별자 `yakmuk` 유지). 구식 “약먹었약” 브랜드 서술과 충돌 없음 |
| G1.3 | theme hex는 **방향만** — 앱 `theme.ts` 미변경 (#8B). 색 확정은 보류 해제 후 후속(단계 8 ≠ 색 작업) |

→ PASS 후 단계 2 · impl `design-md-rewrite` = done

---

## 2. 에셋 슬롯

**목표:** 콕이 컷이 필요한 자리에 **빈 슬롯이 없다**. require 맵이 동작한다. 색은 아직 틸.

| 게이트 | PASS 조건 |
|--------|-----------|
| G2.1 | `mobile/assets/koki/{slot}.png` placeholder 존재 ([gap.md](gap.md) 인벤토리) |
| G2.2 | `KokiIllustration`(또는 동등) variant → require 맵 동작 |
| G2.3 | icon/splash placeholder 연결 (깨진 참조 없음) |
| G2.4 | **sage theme hex 미적용** (#8B) — 틸 유지 |

→ PASS 후 단계 3 · impl `asset-pipeline` = done

---

## 3. 입력 퍼널 뼈대

**목표:** 어떤 퍼널이든 붙일 수 있는 **FunnelShell** 이 full page로 재사용 가능하다.

| 게이트 | PASS 조건 |
|--------|-----------|
| G3.1 | FunnelShell: back / progress / 질문 타이틀 / 하단 CTA |
| G3.2 | FunnelShell = **온보딩·초대 full page**. 약 CRUD = BottomSheet (#5B) |
| G3.3 | `stepIndex` + draft 패턴으로 최소 1개 스모크(또는 스토리/데모) 가능 |
| G3.4 | 아직 P1–P3 전체 마이그레이션 필수는 아님 — **셸만** 완성 |

→ PASS 후 단계 4 · impl `funnel-shell` = done

---

## 4. 퍼널 1차 (P1·P2·P3)

**목표:** 필드 몰린 온보딩·약 추가가 **한 질문 한 스텝** 이다. 콕이는 입구·완료만.

| 게이트 | PASS 조건 |
|--------|-----------|
| G4.1 | **P1** 가족 만들기 — 한 스텝 한 질문, 제출은 마지막 |
| G4.2 | **P2** Join — 동일 |
| G4.3 | **P3** 약 추가 — BottomSheet progressive, same/perWeekday 분기, sticky 저장 |
| G4.4 | 중간 스텝에 콕이 없음. 시작·완료만. F8 예약컷(`pill` 등) **미사용** |
| G4.5 | 완료 컷에 `happy` **미연결** (#1·파생 — 에셋만). P1 완료는 beat 생략 또는 `family` 등 1차 허용 variant |
| G4.6 | FunnelShell 재사용 (화면마다 셸 복붙 금지) |

순서: P1 → P2 → P3. 한 퍼널씩 게이트 확인해도 됨. **단계 PASS = P1+P2+P3 전부.**  
(funnels.md P1 `happy(선택)` 문구는 이 게이트에 양보 — decisions 우선.)

→ PASS 후 단계 5 · impl `funnel-wave1` = done

---

## 5. 브랜드 beat 1차 (F1·F2·F6)

**목표:** 매일 경로에서 Lucide-only hero/empty가 사라지고, **성공은 F6만**.

| 게이트 | PASS 조건 |
|--------|-----------|
| G5.1 | **F1** Welcome — `welcome` 컷 히어로 + 콕이 1인칭 인사 + 안부 서브 + 하단 CTA (#7C). *전역 rename은 §6* |
| G5.2 | **F2** Empty — `thinking` + 기존 COPY (시트 문장 이식 금지) |
| G5.3 | **F6** all-done — 리스트 유지 + 위 `done` 컷 (#2B) |
| G5.4 | 개별 약 체크마다 happy/성공 컷 **없음** (#1) |
| G5.5 | F1·F2·F6 해당 화면 Lucide-only hero/empty **없음** (전 앱 Lucide 치환 금지 — impl) |

→ PASS 후 단계 6 · impl `beat-wave1` = done

---

## 6. 이름 통일

**목표:** 제품 표기 `약콕`으로 통일. 식별자 `yakmuk`·app.json display name은 유지.

| 게이트 | PASS 조건 |
|--------|-----------|
| G6.1 | UI 카피에서 `약먹었약` 0건 |
| G6.2 | AGENTS / TRACK / design / PRD 범위에서 `약먹었약` 0건 (#6B) |
| G6.3 | `app.json` display name·스플래시 문구 **미변경** (이번 제외) |
| G6.4 | 코드 식별자 `yakmuk` 유지 |

→ PASS 후 단계 7 · impl `rename-copy` = done

---

## 7. 2차 확장

**목표:** 대칭 퍼널·가족 beat·streak·worried가 최소 구현으로 돈다.

| 게이트 | PASS 조건 |
|--------|-----------|
| G7.1 | **P4** 약 수정 BottomSheet(prefill) · **P5** 초대 생성 퍼널 |
| G7.2 | beat **F5** family · **F7** worried (빨간 배너 **대체**, 병행 금지 #4A) |
| G7.3 | beat **F4** streak — N=3, 연속≥3일일 때만 노출. 스케줄 0일=연속 유지 (#3) |
| G7.4 | [impl.md](impl.md) `funnel-wave2` **그리고** `beat-wave2` 둘 다 `done` |

단계 안에서는 퍼널∥beat 병렬 OK. **단계 PASS = G7.1–G7.4 전부.**  
→ PASS 후 단계 8 · 해당 impl = done

---

## 8. 보류 (게이트 = “건드리지 않음” 확인)

**목표:** 보류 항목을 1·2차에 끌어오지 않는다. 정식 컷·색은 올 때 overwrite.

| 게이트 | PASS 조건 |
|--------|-----------|
| G8.1 | F8 컷(`pill`/`cheer`/`lantern`/`heart`) — 파일만 또는 skip, **UI 미연결** |
| G8.2 | 퍼널 **P6** 미승격 (홈 인라인 유지 가능) |
| G8.3 | 정식 콕이 일러스트 오기 전 placeholder 유지 (오면 동일 파일명 overwrite) |
| G8.4 | sage 색 리샘플 **미실시** until 별도 착수 (#8B) |
| G8.5 | `happy` UI 미연결 (에셋만, #1) |

이 단계는 “할 일 목록”이 아니라 **플랜 닫기 전 보류 준수** 게이트.  
단계 7 PASS 직후 한 번 검토하고, `deferred` = done + **현재 단계**를 `닫힘`으로.  
보류·후속 목록 SoT: [deferred.md](deferred.md).  
색/정식 컷/P6/`happy` UI를 착수할 때는 README에 **새 번호 단계**를 추가한 뒤 같은 루프.

---

## 단계 ↔ impl ID

| 단계 | impl ID | 목표 한줄 |
|------|---------|-----------|
| 1 | `design-md-rewrite` | design.md SoT |
| 2 | `asset-pipeline` | 슬롯·맵, 틸 유지 |
| 3 | `funnel-shell` | FunnelShell full page |
| 4 | `funnel-wave1` | P1·P2·P3 |
| 5 | `beat-wave1` | F1·F2·F6 |
| 6 | `rename-copy` | 약콕 표기 |
| 7 | `funnel-wave2` / `beat-wave2` | P4·P5 + F5·F7·F4 |
| 8 | `deferred` | 보류 준수 |

---

## 전체 성공 정의 (플랜)

README 한줄과 동일:

> 지금 앱 = 틸·아이콘·기능 안부 UI + 한 화면에 필드 몰아넣기.  
> **달성** = 세이지 방향 문서 + 콕이 beat(1·2차) + 토스형 입력 퍼널(1·2차).  
> 색 확정·정식 컷·P6·F8 UI는 보류.

단계 0–7 PASS + 단계 8 보류 준수 = 이 브랜드 플랜 **닫힘**.
