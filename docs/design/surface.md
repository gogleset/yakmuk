# Design — Surface & radius

← [README](README.md)

## 8. Surface & radius

| 요소                       | 규칙                                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Screen                     | `bg-canvas`, safe area                                                                                                 |
| Card / empty 박스          | 기본 `bg-surface-soft`. **화이트 톤**(`bg-surface` on `canvas`)이면 반드시 `LAYOUT.shadow.sameFill` (§8.3)              |
| Settings 그룹·프로필 카드  | `bg-surface` + `LAYOUT.shadow.sameFill` (흰 위 흰 → soft shadow)                                                     |
| Home calendar              | `bg-canvas` + `LAYOUT.shadow.sameFill` (스크린과 동색 → soft shadow). overflow는 안쪽만 — 바깥에 shadow               |
| Per-weekday day groups     | `bg-canvas` + `border-line`                                                                                            |
| Time-slot accordion        | `bg-canvas` + `LAYOUT.shadow.sameFill` (체크리스트형)                                                                  |
| Input / outline / 미선택 토글 | Input default = `bg-surface`(흰) · soft=`brandSoft`. **unfocused = border 없음**, focus=`brand` 보더. outline 버튼 = `surfaceSoft` |
| Sheet                      | `bg-surface` (흰). 안쪽 컨트롤은 soft/brandSoft fill                                                                   |
| Radius                     | sm 8 · md 10 · lg 12 (`rounded-xl` ≈ 12)                                                                               |
| Button                     | `shape`: default=`rounded-xl` / **round=`rounded-full` pill**. variant: default(`brand`) / outline(`surfaceSoft`) / oauth(흰+`line`) / secondary(`brandSoft`) / ghost / destructive |
| Taken row                  | `brandSoft` fill                                                                                                       |
| FAB                        | `brand` circle, `ink` 아이콘                                                                                           |
| Tabs                       | **label + icon** — `기록 \| 가족 \| 설정`, bar = `surface`, active = `brand`                                           |
| Home empty · 1차 CTA       | `Button shape="round"` pill — 「첫 약 등록하기」·컨디션 남기기·퍼널 CTA·알람 먹었어요 등 brand 단독 CTA               |

### 8.1 Border

**기본 금지.** 계층·구분·버튼 outline·카드 윤곽·리스트 divider에 border를 쓰지 않는다.  
구분은 `canvas`(`#FFFFFF`) → `surfaceSoft`(`#F0F5F3`) → `brandSoft` → `brand` **fill**로만.  
**예외:** 부모·자식 fill이 같으면 fill 단계로 구분 불가 → §8.3 soft shadow.

| 허용 | 규칙 |
|------|------|
| **Focus only** | 키보드/포커스 가능 컨트롤(Input 등)이 **focused일 때만** `brand` 보더. unfocused = border 없음(투명) |
| **Tone outline** | status/care만 — BAD·stuck·케어 알림 등. thin 1px (`TONE_OUTLINE.warning` / `.destructive`). fill(`warningBg`)로 카드·배너를 칠하지 않음 |

계층용 `border-line`·상시 카드 윤곽은 fill로. 케어 톤은 위 Tone outline만.

### 8.2 Copy (설명 문구)

**최대한 제거.** 좋은 UI/UX는 설명할 필요가 없는 디자인이다. 화면·컨트롤은 레이아웃·짧은 라벨·아이콘만으로 직관적이어야 한다.

| Do                                                        | Don’t                                 |
| --------------------------------------------------------- | ------------------------------------- |
| 짧은 액션 라벨 (`초대`, `저장`, `복용`)                   | 부연 설명 문단·헬퍼 텍스트·Caption 남발 |
| 아이콘만으로 통하는 네비(←, ×) — `accessibilityLabel` 유지 | 아이콘 옆 중복 텍스트 (`← 뒤로` 등)   |
| 필요하면 **placeholder** / empty state 한 줄              | 필드 위·아래 중복 설명                |
| 한 화면 한 일 — 타이틀만으로 충분하면 본문 카피 생략      | “이렇게 하세요” 튜토리얼 톤 상시 노출 |
| Empty / Success / Done 옆 — **기존 COPY 한 줄** + 콕이 컷 | 시트 마케팅 문장 그대로 이식          |
| Welcome — 브랜드명 + 안부 Body + **콕이 초단문**          | —                                     |

힌트가 꼭 필요하면 Caption/Body가 아니라 **placeholder·empty state** 쪽에 둔다.

### 8.3 Soft shadow (same-fill)

배경과 요소의 fill이 **같을 때만** 그림자로 떠 보이게 한다 (드롭박스·체크리스트 느낌).

**화이트 톤 필수:** light에서 `canvas`와 `surface`는 둘 다 `#FFFFFF`. 흰 스크린 위에 흰 카드·설정 그룹을 올리면 fill 단계로 구분이 안 되므로 **반드시** `LAYOUT.shadow.sameFill`을 붙인다. border로 윤곽 그리지 않음 (§8.1).

| Do | Don’t |
| -- | ----- |
| `canvas` 위 `surface` / `canvas` 위 `canvas` → `sameFill` | 흰 카드에 border만 주고 shadow 없음 |
| `LAYOUT.shadow.sameFill` 한 종류만 | 카드마다 다른 elevation / 다층·네온 글로우 |
| 바깥 래퍼에 shadow · 안쪽에 `overflow: hidden` | shadow 래퍼에 overflow hidden (그림자가 잘림) |
| opacity ≈ 0.06 · radius 4 · y=1 · elevation 1 | — |

구현: `LAYOUT.shadow.sameFill` (`layout.ts`). `surfaceSoft` 카드는 이미 fill 단계로 구분되므로 shadow 불필요(원치 않으면 생략). 요일 그룹만 레거시 `border-line`.
