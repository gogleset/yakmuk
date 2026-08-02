---
name: document-user-flows
description: >-
  yakmuk(약콕)의 현재 사용자 플로우·화면·역할별 경로·갭을 정리한 브리프 문서를 만든다.
  GPT 등 외부 모델에 사용자 플로우 이미지/다이어그램을 시킬 때 입력으로 쓴다.
  Use when the user asks for user flow doc, flow brief, UX map, 플로우 이미지 프롬프트,
  화면 흐름 문서, or @document-user-flows.
---

# Document user flows (yakmuk)

코드·PRD·체크리스트를 스캔해 **이미지 생성용 플로우 브리프**를 작성한다.  
구현 코드를 바꾸지 않는다. 출력은 마크다운 문서 하나.

## When

- GPT/이미지 툴에 넘길 사용자 플로우 설명 문서가 필요할 때
- “지금 앱에 뭐가 있고 뭐가 없는지” 플로우 관점 정리
- 역할(보호자/피보호자)별 happy path · 분기 · 갭 브리프

## Sources (필수 스캔)

순서대로 읽고, **코드 실재**를 문서 근거로 삼는다. PRD만으로 “구현됨” 쓰지 말 것.

| 소스 | 용도 |
|------|------|
| [docs/prd/SUMMARY.md](../../../docs/prd/SUMMARY.md) | 제품 한 줄·역할·탭·P0 |
| [docs/goals/](../../../docs/goals/) | 안심 루프 우선순위·갭 (푸시·stuck·glance) — 갭 §에 반영 |
| [TRACK.md](../../../TRACK.md) · [loop/pre/CHECKLIST.md](../../../loop/pre/CHECKLIST.md) | stage·완료/미완료 |
| `mobile/app/**/*.tsx` | 실제 라우트 목록 |
| `mobile/src/pages/**` | 화면 조립 |
| `mobile/src/features/**` | use-case(행동) |
| `mobile/src/widgets/**` | 블록 UI |
| [docs/design.md](../../../docs/design.md) §6 | 톤·카피 (이미지 스타일 힌트) |

선택: `loop/pre/CONTRACT.md`, `loop/pre/DECISIONS.md`, `docs/brand/`.

## Steps

1. **라우트 인벤토리** — `mobile/app` 파일 → path · page · 탭/스택 구분
2. **역할 매트릭스** — guardian / care_recipient 각각 진입·가능·불가
3. **플로우 추출** — features·pages 기준으로 1플로우 = 1목적 (가입, 초대, 복약 체크 …)
4. **상태 표기** — 각 스텝/플로우에 `implemented` | `partial` | `missing` | `prod-only`
5. **갭** — CHECKLIST 미체크 · PRD P0 대비 코드 없음 · 딥링크/푸시/탈퇴 등
6. **이미지 브리프** — 템플릿 §7을 GPT에 그대로 붙여넣을 수 있게 채움
7. **저장** — 기본 `docs/flows/user-flow-brief.md` (사용자가 경로 주면 그곳). 디렉터리 없으면 생성

## Output

템플릿을 **섹션 빠짐없이** 채운다 → [flow-brief-template.md](flow-brief-template.md)

규칙:

- 한국어. 해요체 카피는 design 톤 유지하되, 브리프 본문은 **짧고 사실** 위주
- 화면/플로우는 **존재하는 라우트·feature 이름**을 괄호로 병기 (`홈 (tabs/home · daily-medication-check)`)
- “있을 것 같음” 금지 — 코드/체크리스트에 없으면 `missing` 또는 `partial` + 근거
- 다이어그램은 **Mermaid** (`flowchart TD`)로 §4에 넣고, §7에는 이미지 생성용 **평문 지시**도 별도
- 한 문서에 플로우가 많으면 §4를 플로우 ID별로 소절 분할 (`F1`, `F2` …)

## Don’t

- 구현·리팩토링·라우트 추가
- PRD 기능을 전부 구현된 것처럼 쓰기
- 시크릿·env·실제 초대 코드 포함
- 디자인 시스템 장문 복붙 (톤은 2~3줄이면 충분)

## Related

- PRD: [docs/prd/SUMMARY.md](../../../docs/prd/SUMMARY.md)
- 제품 목표: [docs/goals/](../../../docs/goals/)
- 디자인: [docs/design.md](../../../docs/design.md)
- 진입: [AGENTS.md](../../../AGENTS.md)
