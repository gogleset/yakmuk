# design.md 수정안

← [README](README.md) · 대상 파일 [docs/design.md](../design.md)

실행 시 **이 문서 그대로** `design.md`에 반영한다.

---

## 제목·서두

- `# Design — 약먹었약 (yakmuk)` → `# Design — 약콕 (yakmuk)`
- 부제 추가: `브랜드 얼굴: 콕이(간호요정).`

## §1 Product feeling

- 한 줄 유지: *잔소리 없는 가족 건강 안부 체크.*
- 보강: `약콕의 얼굴은 콕이 — 감시가 아니라 안부로 복약·기록을 챙긴다.`

## §2 Persona

- 1차 함의: `신뢰·청량` → `신뢰·따뜻한 세이지 케어`
- 콕이 페르소나는 §Character에서 대변

## §3 Principles

| # | 현재 | 수정 |
|---|------|------|
| 1 | 틸의 안정감 | **세이지의 안정감** |
| 2 | 민트 워시·쿨 캔버스 | **세이지 워시·소프트 캔버스** (크림/테라코타 금지 유지) |
| 5 | 틸·청량 | **세이지·안부** |
| 신규 7 | — | **캐릭터는 슬롯에서만** — Welcome/Empty/Success/Done/Family/Streak/Stuck. MedRow·탭·본문 장식 금지 |
| 신규 8 | — | **다필드 입력 = 한 질문 한 스텝 퍼널** (토스형). 상세는 `docs/brand/funnels.md` |

## design.md에 넣을 때 권장 목차 순서

반영 후 섹션 순서 (번호는 design.md 안에서 재매김):

1. Product feeling  
2. Persona  
3. Principles  
4. **Character — 콕이** (신설)  
5. **Brand flows** F1–F8 표 (신설)  
6. Color (Why sage)  
7. Typography  
8. Surface & Copy  
9. **Funnel — 입력** (신설)  
10. Motion · Do/Don’t · Migration  

아래는 *내용* 수정안. 위 목차 순으로 붙일 것.

## §4 Color

- §4.4 `Why teal` → **`Why sage`**
- 본문: 간호·약·안심의 식물성 신뢰. 병원 블루 금지 유지.

| Token | 방향 |
|-------|------|
| `brand` | 쿨 `#0F6B5C` → **웜 mid-sage** (채도↓·황녹+) |
| `brandSoft` | pale sage fill |
| `canvas` | 쿨 민트 → **뉴트럴 오프화이트/페일민트** |
| `success` | brand와 동일 축 |

- 헤어 브라운·윙 페일블루 = **illustration-only**, 토큰 추가 금지  
- hex는 실행 시 eyedrop 확정 후 `theme.ts` / `tailwind` 동기

## §5 Typography

- 변경 최소. Brand hero 존재감 = 콕이 이미지
- 추가: `캐릭터 옆 카피는 Caption/짧은 Body 한 줄 초과 금지`

## §6.2 Copy

| 허용 | 규칙 |
|------|------|
| Empty / Success / Done 옆 | **기존 COPY 한 줄** + 콕이 컷 |
| Welcome | 브랜드명 + 안부 Body + **콕이 초단문** ([decisions.md](../brand/decisions.md) #7B) |
| Don’t | 시트 마케팅 문장 그대로 이식 |

## §7 Motion

- 유지: fade only, bounce/파티클 금지
- 추가: Success 스파클 = 이미지 bake-in만
- 추가: 콕이 등장 = 짧은 fade. 캐릭터 bounce 금지

## §8 Do / Don’t

**Do**

- `틸·민트 워시` → `세이지 워시`
- `브랜드 순간은 콕이 컷으로` (F1–F7)
- `정식 컷 교체 시 assets/koki 파일명 유지`

**Don’t 추가**

- 홈 본문·MedRow에 콕이 상시
- Worried를 공포/알람 UI로 (안부만)
- 시트 긴 설명 카피 이식

---

## 신설 § Character — 콕이

권장 위치: §3 다음 (또는 §6 다음).

```markdown
## Character — 콕이

- 이름: 콕이 · 역할: 간호요정 · 약콕의 얼굴
- 스타일: soft 3D clay, 투명 PNG, 드롭섀도 최소화
- 라이브러리: Expr(happy/thinking/cheer/worried) + Action(pill/clipboard/heart/lantern)
  + UI slots(welcome/thinking/happy/done/family/streak)
- 배치 화이트리스트: Welcome, Empty, Success, Done, Family, Streak(조건부), Stuck(worried)
- Stuck: Worried 컷으로 안부 표현 (시트 UI열 외 — 제품 규칙)
- Placeholder: mobile/assets/koki/{slot}.png — 정식 컷은 동일 파일명 overwrite
- 금지: 탭 아이콘 대체, MedRow 장식, 런타임 파티클, 설명 문단
```

인벤토리 상세 → [gap.md](gap.md)

---

## 신설 § Funnel — 입력

권장 위치: Surface/Copy 근처 (§6 뒤).

```markdown
## Funnel — 입력

- 필드 2개 이상 = FunnelShell로 한 질문 한 스텝
- 큰 질문 타이틀 · 하단 CTA(`다음`/`완료`) · 약한 progress
- 뒤로 = 이전 스텝. 작성 중 닫기 = confirm
- 콕이 = 퍼널 입구·완료만 (중간 스텝 금지)
- 단일 필드(닉네임만 등)는 퍼널 강제 금지
- 상세 스텝표: docs/brand/funnels.md
```

---

## 신설 § Brand flows

Character 바로 아래. 구현 디테일은 [flows.md](flows.md).

| ID | Beat | Variant | 트리거 |
|----|------|---------|--------|
| F1 | 첫 만남 | welcome | Welcome 진입 |
| F2 | 기록 없음 | thinking | RichEmptyState |
| F3 | (폐기) | — | 개별 체크 — 쓰지 않음. 성공은 F6 |
| F4 | 연속 | streak | 연속 all-done ≥3일 (KST) |
| F5 | 가족 | family | 가족 empty / 초대 |
| F6 | 오늘 완료 | done | taken==total — **유일한 성공 beat** |
| F7 | stuck 안부 | worried | 보호자 pending/stuck |
| F8 | 예약 | pill/cheer/lantern/heart | 미연결 |

---

## §9 Migration note

- Done에 추가: `브랜드명 약콕 · Character 섹션 · sage 토큰 방향`
- light hex 변경 시 `theme.ts` / `tailwind` 동기

## 일괄 치환 (문서·UI) — [decisions.md](decisions.md) #6B

- 범위: UI 카피 + AGENTS / TRACK / design / PRD  
- **제외:** `app.json` display name · 스플래시 스토어 문구 (나중)  
- 기술 식별자 `yakmuk` 유지

## 색 — [decisions.md](decisions.md) #8B

- design.md에 Why sage **방향·서사**는 적어도 됨  
- **light hex / theme.ts 변경은 이번 구현에서 하지 않음** (틸 유지). 리샘플은 후속
