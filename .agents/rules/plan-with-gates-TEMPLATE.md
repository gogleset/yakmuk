# Plan template — S-steps + regression gates

플랜 문서(`.cursor/plans/*.plan.md` 또는 CreatePlan 본문)에 아래 골격을 채운다.
`{…}` 는 치환. step 수는 작업 크기에 맞게 줄이되 **게이트 규칙·2단 구조는 유지**.

**문서 순서 (고정)**

1. **Part A — 개발 상세** (위): 실행·게이트·파일·S-step — 구현자가 이것만 보고 코딩
2. **Part B — 개발 상세 설명** (아래): Part A를 **직관·쉬운 말**로 설명 (왜/제약/범위 밖). jargon 나열·Part A 복붙 금지

```markdown
---
name: {short-name}
overview: {한 줄}. 순서 S1→Sn, 각 단계 완료 시 직전 단계 회귀 게이트 필수.
todos:
  - id: S1-{slug}
    content: "S1: {구현}"
    status: pending
  - id: S1-regress
    content: "S1 게이트: {검증} 통과 후 S2"
    status: pending
  - id: S2-{slug}
    content: "S2: {구현}"
    status: pending
  - id: S2-regress
    content: "S2 게이트: S1 회귀 + {검증} 후 S3"
    status: pending
  - id: Sn-docs
    content: "Sn: 문서 + S1→S(n-1) 전체 회귀"
    status: pending
isProject: false
---

# {제목}

# Part A — 개발 상세

## 빌드 순서 · 회귀 게이트

**규칙**

1. `Sk` 구현 완료 직후 **반드시 `S(k-1)` 회귀**를 다시 돌린다 (S1은 자기 게이트만).
2. 게이트 실패 시 `S(k+1)` 금지 — 직전 step 고치고 재통과 후 진행.
3. 각 step 구현과 함께 테스트 추가 (mobile → `mobile/src/__tests__/`, TDD).
4. step 끝날 때마다 게이트 결과(통과/실패·명령)를 짧게 남긴다.

\`\`\`mermaid
flowchart LR
  S1 --> G1["게이트 S1"]
  G1 --> S2
  S2 --> G2["회귀 S1 + 게이트 S2"]
  G2 --> Sn
  Sn --> Gn["전체 회귀"]
\`\`\`

| Step | 구현 | 완료 직후 회귀 |
|------|------|----------------|
| **S1** | {스키마/타입/SoT} | {db reset · mapper · api.test} |
| **S2** | {폼/UI} | **S1 재실행** + {…} |
| **Sn** | {문서} | **S1→S(n-1) 전체** |

## 결정 (확정)

| 항목 | 선택 |
|------|------|
| {핵심1} | {한 가지} |
| {후속 인프라} | 범위 밖 · 코드는 {skip/가드} |

## 아키텍처

\`\`\`mermaid
flowchart TB
  subgraph server [Server]
    A[SoT]
  end
  subgraph app [App]
    B[Sync/UI]
  end
  A --> B
\`\`\`

## S1 — {제목}

- 변경 파일·마이그레이션·타입·API
- **게이트:** …

## S2 — {제목}

- …
- **게이트:** S1 재실행 + …

## … Sn

## 주요 터치 파일

- {paths}

---

# Part B — 개발 상세 설명

> Part A를 **쉬운 말로** 풀어 쓴다. 직관·짧은 문장. 약어는 처음 한 번만 풀어서.
> Part A 파일/SQL 복붙 금지. “뭘 / 왜 / 주의”만.

## 왜 이 순서인가

- S1→Sn을 일상어로: 예) “먼저 DB에 알림 on/off 칸을 만들고, 그다음 약 등록 화면에 스위치를 달고…”

## 제약 · 플랫폼 · 스토어

- OS/스토어 한계를 사람이 읽게: 예) “아이폰은 앱 밖에서 전체 화면 알림을 못 띄움. 알림을 눌러야 약 화면이 열림.”

## 놓친 사항 · 리스크

| 이슈 (쉬운 말) | 어떻게 할지 |
|----------------|-------------|
| {예: 폰 두 대면 토큰이 덮어씌워짐} | {지금은 감수 / Part A에서 skip} |

## 인프라 로컬·배포 (해당 시)

- 로컬에서 어떻게 켜 보는지 · 배포는 DB랑 따로인지 — 명령은 최소만

## 범위 밖 · 후속

- “지금은 안 함” 목록 + 한 줄 이유. Part A에는 skip/가드만.
```

## 질문 가이드 (플랜 전)

**애매한 부분은 무조건 질문** — 추측·가정·TBD로 메우지 말 것. 답이 오기 전에 플랜 확정·구현 착수 금지.
**기술적인 말보다 쉽게 풀어서** 질문한다. 약어·라이브러리명·옵션 코드명은 쓰지 말고, “사용자/기기에 뭐가 달라지는지”로 바꾼 뒤 고르게 한다. 여러 개면 한꺼번에 OK (우선순위 높은 것부터).

| 나쁜 예 | 좋은 예 |
|---------|---------|
| “Option A Notifee FSI vs B banner-only?” | “앱 밖에서도 화면 전체로 띄울까? Android만 가능하고 iOS는 알림을 눌러야 약 화면이 열려. Android도 풀스크린 갈까, 둘 다 탭 후 화면만 할까?” |
| “Edge stub scope?” | “가족에게 알림 보낼 때: 기기 주소만 DB에 저장할까, 지금 당장 테스트로 서버에서 한 번 보내보는 기능까지 넣을까?” |
| “RLS / RPC idempotency?” | “같은 약을 두 번 눌러도 기록이 한 번만 남게 할까?” |
| 애매한데 플랜에 TBD/optional 남김 | 쉬운 말 질문 → 답 받은 뒤 **한 가지**로 확정 후 Part A 작성 |

## Step 쪼개기 휴리스틱

| 레이어 | 보통 step |
|--------|-----------|
| DB/RPC/마이그레이션 · entity mapper | 앞쪽 (S1) |
| 폼·카피·설정 UI | S2 |
| 동기화/엔진/로그 | S3 |
| 공통 화면·딥링크·기본 OS 경로 | S4 |
| Android/iOS 특수·네이티브 권한 | S5+ |
| Push/Edge/외부 SaaS | 뒤쪽 · 미준비면 skip |
| DECISIONS/README | 마지막 + 전체 회귀 |

## 게이트에 넣을 검증 예시

- `supabase db reset` / migration up
- `pnpm test` 해당 `__tests__` 경로
- `*.api.test.ts` (로컬 Supabase 떠 있을 때)
- 로그 접두사 스모크 (`[yakmuk:…]`)
- `supabase functions serve …` + curl
- 수동: 라우트 진입 · 권한 거부 no-op · 다른 플랫폼 경로 안 깨짐
