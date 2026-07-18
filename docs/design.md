# Design — 약먹었약 (yakmuk)

시각·톤의 기준 소스. 구현 토큰은 이 문서를 따른다.  
(런타임 light-only는 legacy — [Migration](#9-migration-note) 참고)

## 1. Product feeling

멀리 있는 가족의 **건강 안부**를, 잔소리 없이 챙긴다.  
복약 체크·컨디션은 감시가 아니라 **안심을 나누는 한 손짓**.

한 줄: *잔소리 없는 가족 건강 안부 체크.*

## 2. Persona

| 우선 | 누구 | 디자인 함의 |
|------|------|-------------|
| 1차 | **가족장** — 주로 20–40대 여성 | 신뢰·청량·부담 없는 케어. 병원 앱·대시보드 느낌 금지 |
| 2차 | 보호자 · 피보호자 | 큰 터치, 짧은 카피, 한 화면 한 일. 시니어도 읽을 대비 |

## 3. Principles

1. **신뢰** — 의료 블루의 차가움이 아니라, 틸의 안정감으로 “맡겨도 된다”를 전달
2. **청량** — 무겁지 않은 민트 워시·쿨 캔버스. 밤(다크)에도 같은 숨결
3. **Low friction** — CTA 하나, 단계 최소. 배지·필·통계 스트립으로 불안을 만들지 않음
4. **감시 ≠ 케어** — 상태 UI는 안부·안심. 경고 빨강·알람 과다를 기본으로 쓰지 않음
5. **라이트·다크 동일 톤** — 모드가 바뀌어도 브랜드 성격(틸·청량)은 유지. 다크 = 네온/순검이 아님
6. **직관 > 설명** — 설명 문구를 최대한 줄인다. UI·라벨·아이콘만으로 읽혀야 한다

## 4. Color system

토큰명은 모드 불변. 값만 light / dark 맵.

### 4.1 Core tokens

| Token | Light | Dark | 용도 |
|-------|-------|------|------|
| `brand` | `#0F6B5C` | `#3DBFA8` | CTA, 탭 active, 타이틀·아이콘 강조 |
| `brandSoft` | `#D8F0EA` | `#1A3D36` | taken row, secondary 버튼, soft fill |
| `canvas` | `#F4F7F6` | `#0E1413` | 스크린 배경, 시스템 크롬 |
| `surface` | `#FFFFFF` | `#1A2421` | 카드·인풋·시트 패널 |
| `ink` | `#F5FFFC` | `#0A1F1A` | `brand` 위 텍스트/아이콘 |
| `text` | `#1A2E29` | `#E8F0ED` | 본문·제목(브랜드 영역 밖) |
| `muted` | `#6B7A76` | `#8A9A94` | 캡션, placeholder, 탭 inactive |
| `line` | `#D5DED9` | `#2A3531` | (레거시) — **보더로 쓰지 말 것**. 계층은 fill로 |
| `disabled` | `#B8C4BF` | `#3D4A45` | 비활성 |

### 4.2 Semantic

| Token | Light | Dark | 용도 |
|-------|-------|------|------|
| `success` | `#0F6B5C` | `#3DBFA8` | 완료·“다 먹음” — brand와 동일 축 (이질 블루 금지) |
| `warning` | `#A67C00` | `#D4A84B` | 주의 텍스트/아이콘 |
| `warningBorder` | `#E8D48A` | `#5C4A1A` | (레거시) — 보더 금지. 경고는 `warningBg` fill |
| `warningBg` | `#FFF8E1` | `#2A2410` | 경고 배너 배경 |
| `destructive` | `#8B2E2E` | `#E07A7A` | 삭제·위험 |

### 4.3 Mode rules

- 다크에서 `brand`는 **더 어둡게가 아니라 더 밝게** — CTA 대비 확보
- 계층은 그림자·글로우가 아니라 **`canvas` → `surface` → `brandSoft` 단계**
- 시스템 크롬(status / nav bar) = 해당 모드의 `canvas`
- 순수 `#000` 배경, 형광 민트, 네온 글로우 금지
- 목표 런타임: `userInterfaceStyle: "automatic"` (현행 light-only는 legacy)

### 4.4 Why teal

신뢰(블루) × 생명·청량(그린)의 교차점.  
20–40 여성 가족장에게 “병원 관리 앱”이 아니라 “가족 안부”로 읽히게 한다.

## 5. Typography

커스텀 폰트 없음 — **시스템 기본**. 모드는 색만 교체, weight/size 동일.

| 역할 | 스타일 | 색 |
|------|--------|-----|
| Brand hero (Welcome) | `text-4xl` · bold | `brand` |
| Page title | `text-2xl` · bold | `brand` (또는 `text`) |
| Section / card title | `text-base` · bold | `brand` / `text` |
| Button | `text-base` · semibold | `ink` on brand · `brand` on outline |
| Body | leading 여유 · regular | `text` → muted 계층은 `muted` |
| Caption | `text-xs` | `muted` |
| Invite code | wide tracking | `text` |

## 6. Surface & radius

| 요소 | 규칙 |
|------|------|
| Screen | `bg-canvas`, safe area |
| Card / input / sheet | `bg-surface`, 필요 시에만 사용 (장식용 카드 남발 금지) |
| Radius | sm 8 · md 10 · lg 12 (`rounded-xl` ≈ 12) |
| Button | `rounded-xl` — default(`brand`) / outline(`surface`만, **border 없음**) / secondary(`brandSoft`) / ghost / destructive |
| Taken row | `brandSoft` fill |
| FAB | `brand` circle, `ink` 아이콘 |
| Tabs | icon-first, bar = `canvas`, active = `brand` |

### 6.1 Border

**기본 금지.** 계층·구분·버튼 outline·카드 윤곽·리스트 divider에 border를 쓰지 않는다.  
구분은 `canvas` → `surface` → `brandSoft` **fill**로만.

| 허용 | 규칙 |
|------|------|
| **Focus only** | 키보드/포커스 가능 컨트롤(Input 등)이 **focused일 때만** `brand` 보더. unfocused = border 없음(투명) |

`border-line`, `borderWidth`로 상시 윤곽을 그리는 UI는 전부 fill로 교체.

### 6.2 Copy (설명 문구)

**최대한 제거.** 화면·컨트롤은 레이아웃·라벨·아이콘만으로 직관적이어야 한다.

| Do | Don’t |
|----|--------|
| 짧은 액션 라벨 (`초대`, `저장`, `복용`) | 부연 설명 문단·헬퍼 텍스트 남발 |
| 필요하면 **placeholder** / empty state 한 줄 | 필드 위·아래 중복 설명 |
| 한 화면 한 일 — 타이틀만으로 충분하면 본문 카피 생략 | “이렇게 하세요” 튜토리얼 톤 상시 노출 |

힌트가 꼭 필요하면 Caption/Body가 아니라 **placeholder·empty state** 쪽에 둔다.

## 7. Motion

- 존재감·계층용 **짧은** fade / sheet present 정도
- bounce·과한 spring·장식 파티클 금지
- 모드와 무관하게 동일한 타이밍 커브

## 8. Do / Don’t

**Do**

- 첫 화면: 브랜드 + 안부 한 일 + 짧은 CTA
- 틸·민트 워시에 톤을 맡기기
- 라이트/다크 모두에서 “청량한 신뢰”가 같은지 검증
- 설명 없이 직관 — 힌트는 placeholder / empty state

**Don’t**

- 병원 순수 블루 / 퍼플 그라데이션
- 웜크림 + 테라코타 AI 클리셰
- 다크 네온·글로우·순검 배경
- 필 클러스터, 통계 스트립, 배지 과다로 불안 UI
- “다 먹음” 등 success를 이질 블루로 분리
- **border** — focus 상태가 아니면 쓰지 않음 (카드·버튼·divider·토글 윤곽 포함)
- **설명 문구 남발** — 라벨·레이아웃으로 충분한데 Caption/Body로 풀어쓰기

## 9. Migration note

| 상태 | 내용 |
|------|------|
| Done | light 토큰 맵 — `theme.ts` / `tailwind` = 이 문서 target (`brand #0F6B5C` 등) |
| Legacy | `userInterfaceStyle: "light"` only — dark 맵·시스템 크롬 automatic 미적용 |
| Next | 1) dark 토큰 맵 2) 시스템 크롬 3) `userInterfaceStyle: "automatic"` QA |

**새 UI·카피 톤은 이 문서를 따른다.** light-only 런타임은 마이그레이션 잔여.
