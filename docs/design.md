# Design — 약콕 (yakmuk)

시각·톤의 기준 소스. 구현 토큰은 이 문서를 따른다.  
브랜드 얼굴: 콕이(간호요정).  
(런타임 light-only는 legacy — [Migration](#11-migration-note) 참고)

## 1. Product feeling

멀리 있는 가족의 **건강 안부**를, 잔소리 없이 챙긴다.  
복약 체크·컨디션은 감시가 아니라 **안심을 나누는 한 손짓**.

한 줄: _잔소리 없는 가족 건강 안부 체크._

약콕의 얼굴은 콕이 — 감시가 아니라 안부로 복약·기록을 챙긴다.

## 2. Persona

| 우선 | 누구                           | 디자인 함의                                           |
| ---- | ------------------------------ | ----------------------------------------------------- |
| 1차  | **가족장** — 주로 20–40대 여성 | 신뢰·따뜻한 세이지 케어. 병원 앱·대시보드 느낌 금지   |
| 2차  | 보호자 · 피보호자              | 큰 터치, 짧은 카피, 한 화면 한 일. 시니어도 읽을 대비 |

콕이 페르소나는 [Character](#4-character--콕이)에서 대변.

## 3. Principles

1. **신뢰** — 의료 블루의 차가움이 아니라, 세이지의 안정감으로 “맡겨도 된다”를 전달
2. **청량** — 무겁지 않은 세이지 워시·소프트 캔버스. 밤(다크)에도 같은 숨결 (크림/테라코타 금지)
3. **Low friction** — CTA 하나, 단계 최소. 배지·필·통계 스트립으로 불안을 만들지 않음
4. **감시 ≠ 케어** — 상태 UI는 안부·안심. 경고 빨강·알람 과다를 기본으로 쓰지 않음
5. **라이트·다크 동일 톤** — 모드가 바뀌어도 브랜드 성격(세이지·안부)은 유지. 다크 = 네온/순검이 아님
6. **직관 > 설명** — 설명 문구를 최대한 줄인다. UI·라벨·아이콘만으로 읽혀야 한다
7. **캐릭터는 슬롯에서만** — Welcome / Empty / Success / Done / Family / Streak / Stuck. MedRow·탭·본문 장식 금지
8. **다필드 입력 = 한 질문 한 스텝 퍼널** (토스형). 상세는 `docs/brand/funnels.md`

## 4. Character — 콕이

- 이름: 콕이 · 역할: 간호요정 · 약콕의 얼굴
- 스타일: soft 3D clay, 투명 PNG, 드롭섀도 최소화
- 라이브러리: Expr(happy/thinking/cheer/worried) + Action(pill/clipboard/heart/lantern)
  - UI slots(welcome/thinking/happy/done/family/streak)
- 배치 화이트리스트: Welcome, Empty, Success, Done, Family, Streak(조건부), Stuck(worried)
- Stuck: Worried 컷으로 안부 표현 (시트 UI열 외 — 제품 규칙)
- Placeholder: `mobile/assets/koki/{slot}.png` — 정식 컷은 동일 파일명 overwrite
- 금지: 탭 아이콘 대체, MedRow 장식, 런타임 파티클, 설명 문단

인벤토리 상세 → [docs/brand/gap.md](brand/gap.md)

## 5. Brand flows

구현 디테일 → [docs/brand/flows.md](brand/flows.md)

| ID  | Beat       | Variant                  | 트리거                                                    |
| --- | ---------- | ------------------------ | --------------------------------------------------------- |
| F1  | 첫 만남    | welcome                  | Welcome 진입                                              |
| F2  | 기록 없음  | thinking                 | 기록 탭 empty — 가로 카드 (`RichEmptyState` layout=card)  |
| F3  | (폐기)     | —                        | 개별 체크 — 쓰지 않음. 성공은 F6                          |
| F4  | 연속       | streak                   | 연속 all-done ≥3일 (KST) — **캘린더 영역**                |
| F5  | 가족       | family                   | 가족 empty / 초대                                         |
| F6  | 오늘 완료  | done                     | taken==total — 오늘 체크 배너 `done` + 시간대 리스트 유지 |
| F7  | stuck 안부 | worried                  | 보호자 pending/stuck                                      |
| F8  | 예약       | pill/cheer/lantern/heart | 미연결                                                    |

목업 SoT: [docs/brand/mocks/home-empty.png](brand/mocks/home-empty.png) · [home-today-check.png](brand/mocks/home-today-check.png)

## 5.1 Home (기록 탭)

탭 루트. **헤더 크롬 없음** (뒤로·설정 기어·날짜 타이틀 바 금지).  
**역할 대칭:** `family_leader` · `guardian` · `care_recipient` 모두 같은 `HomePage` (역할 분기 금지).

| 상태                    | 구성                                                          | 비고                            |
| ----------------------- | ------------------------------------------------------------- | ------------------------------- |
| 약 0개                  | `MonthHeader` + 캘린더 + 범례 + 가로 empty 카드               | FAB 없음. CTA「첫 약 등록하기」 |
| 약 있음 · 오늘 선택     | 같은 캘린더 셸 + **스크롤 아래** 인사 배너·시간대·「다 먹었어요!」 | 별도 화면 아님. F6 배너         |
| 등록 있음·오늘 스케줄 0 | 캘린더 + 체크 셸(배너) + 오늘 없음 카피                       | days_mask로 오늘 제외된 경우    |
| 과거일 선택             | 캘린더 + PastDay                                              | streak(F4)는 캘린더 영역. FAB   |

- 상태 도트(약 있는 날 / 다 먹었어요 / 일부만 / 안 먹었어요) = **안부 이력**. compliance 히트맵·알람 빨강 금지 (`destructive`는 점 색만, 배너 아님)
- 시간대 = `scheduledTime` 클라 버킷 (아침/점심/저녁/취침 전). dosage 필드 없음
- 컨디션 입력 = 오늘 체크 **스크롤 아래** secondary
- 콕이: empty=`thinking` · 진행 배너=`cheer` · 완료=`done`. 본문·행 상시 장식 금지

## 6. Color system

토큰명은 모드 불변. 값만 light / dark 맵.  
**현행 light hex는 틸 유지** ([decisions.md](brand/decisions.md) #8B). sage 리샘플은 후속.

### 6.1 Core tokens

| Token         | Light     | Dark      | 용도                                            |
| ------------- | --------- | --------- | ----------------------------------------------- |
| `brand`       | `#0F6B5C` | `#3DBFA8` | CTA, 탭 active, 타이틀·아이콘 강조              |
| `brandSoft`   | `#D8F0EA` | `#1A3D36` | taken row, secondary 버튼, soft fill            |
| `canvas`      | `#FFFFFF` | `#0E1413` | 스크린 배경, 시스템 크롬                        |
| `surface`     | `#FFFFFF` | `#1A2421` | 인풋·시트·탭 bar                                |
| `surfaceSoft` | `#F3F7F5` | `#15201D` | 카드·empty 박스 — brandSoft보다 훨씬 연한 fill  |
| `ink`         | `#F5FFFC` | `#0A1F1A` | `brand` 위 텍스트/아이콘                        |
| `text`        | `#1A2E29` | `#E8F0ED` | 본문·제목(브랜드 영역 밖)                       |
| `muted`       | `#6B7A76` | `#8A9A94` | 캡션, placeholder, 탭 inactive                  |
| `line`        | `#D5DED9` | `#2A3531` | (레거시) — **보더로 쓰지 말 것**. 계층은 fill로 |
| `disabled`    | `#B8C4BF` | `#3D4A45` | 비활성                                          |

### 6.2 Semantic

| Token           | Light     | Dark      | 용도                                              |
| --------------- | --------- | --------- | ------------------------------------------------- |
| `success`       | `#0F6B5C` | `#3DBFA8` | 완료·“다 먹음” — brand와 동일 축 (이질 블루 금지) |
| `warning`       | `#A67C00` | `#D4A84B` | 주의 텍스트/아이콘                                |
| `warningBorder` | `#E8D48A` | `#5C4A1A` | (레거시) — 보더 금지. 경고는 `warningBg` fill     |
| `warningBg`     | `#FFF8E1` | `#2A2410` | 경고 배너 배경                                    |
| `destructive`   | `#8B2E2E` | `#E07A7A` | 삭제·위험                                         |

### 6.3 Mode rules

- 다크에서 `brand`는 **더 어둡게가 아니라 더 밝게** — CTA 대비 확보
- 계층은 그림자·글로우가 아니라 **`canvas` → `surfaceSoft` → `brandSoft` 단계** (`surface`는 인풋·시트·탭)
- 시스템 크롬(status / nav bar) = 해당 모드의 `canvas`
- 순수 `#000` 배경, 형광 민트, 네온 글로우 금지
- 목표 런타임: `userInterfaceStyle: "automatic"` (현행 light-only는 legacy)

### 6.4 Why sage

간호·약·안심의 식물성 신뢰. 병원 블루 금지 유지.  
목표 방향: `brand` 쿨 틸 → 웜 mid-sage (채도↓·황녹+), `canvas` → 뉴트럴 오프화이트/페일민트.  
헤어 브라운·윙 페일블루 = **illustration-only**, 토큰 추가 금지.  
hex/`theme.ts` 확정은 sage 리샘플 착수 시.

## 7. Typography

커스텀 폰트 없음 — **시스템 기본**. 모드는 색만 교체, weight/size 동일.  
Brand hero 존재감 = 콕이 이미지. 캐릭터 옆 카피는 Caption/짧은 Body **한 줄 초과 금지**.

| 역할                 | 스타일                 | 색                                  |
| -------------------- | ---------------------- | ----------------------------------- |
| Brand hero (Welcome) | `text-4xl` · bold      | `brand`                             |
| Page title           | `text-2xl` · bold      | `brand` (또는 `text`)               |
| Section / card title | `text-base` · bold     | `brand` / `text`                    |
| Button               | `text-base` · semibold | `ink` on brand · `brand` on outline |
| Body                 | leading 여유 · regular | `text` → muted 계층은 `muted`       |
| Caption              | `text-xs`              | `muted`                             |
| Invite code          | wide tracking          | `text`                              |

## 8. Surface & radius

| 요소                       | 규칙                                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Screen                     | `bg-canvas`, safe area                                                                                                 |
| Card / empty 박스          | `bg-surface-soft` (brandSoft보다 연함). 인풋·시트 = `bg-surface`                                                       |
| Radius                     | sm 8 · md 10 · lg 12 (`rounded-xl` ≈ 12)                                                                               |
| Button                     | `rounded-xl` — default(`brand`) / outline(`surface`만, **border 없음**) / secondary(`brandSoft`) / ghost / destructive |
| Taken row                  | `brandSoft` fill                                                                                                       |
| FAB                        | `brand` circle, `ink` 아이콘                                                                                           |
| Tabs                       | **label + icon** — `기록 \| 가족 \| 설정`, bar = `surface`, active = `brand`                                           |
| Home empty CTA / 일괄 체크 | `rounded-full` pill CTA 허용                                                                                           |

### 8.1 Border

**기본 금지.** 계층·구분·버튼 outline·카드 윤곽·리스트 divider에 border를 쓰지 않는다.  
구분은 `canvas` → `surfaceSoft` → `brandSoft` **fill**로만.

| 허용           | 규칙                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| **Focus only** | 키보드/포커스 가능 컨트롤(Input 등)이 **focused일 때만** `brand` 보더. unfocused = border 없음(투명) |

`border-line`, `borderWidth`로 상시 윤곽을 그리는 UI는 전부 fill로 교체.

### 8.2 Copy (설명 문구)

**최대한 제거.** 화면·컨트롤은 레이아웃·라벨·아이콘만으로 직관적이어야 한다.

| Do                                                        | Don’t                                 |
| --------------------------------------------------------- | ------------------------------------- |
| 짧은 액션 라벨 (`초대`, `저장`, `복용`)                   | 부연 설명 문단·헬퍼 텍스트 남발       |
| 필요하면 **placeholder** / empty state 한 줄              | 필드 위·아래 중복 설명                |
| 한 화면 한 일 — 타이틀만으로 충분하면 본문 카피 생략      | “이렇게 하세요” 튜토리얼 톤 상시 노출 |
| Empty / Success / Done 옆 — **기존 COPY 한 줄** + 콕이 컷 | 시트 마케팅 문장 그대로 이식          |
| Welcome — 브랜드명 + 안부 Body + **콕이 초단문**          | —                                     |

힌트가 꼭 필요하면 Caption/Body가 아니라 **placeholder·empty state** 쪽에 둔다.

## 9. Funnel — 입력

- 필드 2개 이상 = FunnelShell로 한 질문 한 스텝
- 큰 질문 타이틀 · 하단 CTA(`다음`/`완료`) · 약한 progress
- 뒤로 = 이전 스텝. 작성 중 닫기 = confirm
- 콕이 = 퍼널 입구·완료만 (중간 스텝 금지)
- 단일 필드(닉네임만 등)는 퍼널 강제 금지
- 전부 **full page** (PageSheet 아님)
- 상세 스텝표: [docs/brand/funnels.md](brand/funnels.md)

## 10. Motion

- 존재감·계층용 **짧은** fade / sheet present 정도
- bounce·과한 spring·장식 파티클 금지
- Success 스파클 = 이미지 bake-in만
- 콕이 등장 = 짧은 fade. 캐릭터 bounce 금지
- 모드와 무관하게 동일한 타이밍 커브

## 11. Do / Don’t

**Do**

- 첫 화면: 브랜드 + 안부 한 일 + 짧은 CTA
- 세이지 워시에 톤을 맡기기 (현행 hex는 틸 — 리샘플 후)
- 브랜드 순간은 콕이 컷으로 (F1–F7)
- 정식 컷 교체 시 `assets/koki` 파일명 유지
- 라이트/다크 모두에서 “따뜻한 신뢰”가 같은지 검증
- 설명 없이 직관 — 힌트는 placeholder / empty state

**Don’t**

- 병원 순수 블루 / 퍼플 그라데이션
- 웜크림 + 테라코타 AI 클리셰
- 다크 네온·글로우·순검 배경
- 필 클러스터, 통계 스트립, 배지 과다로 불안 UI
- “다 먹음” 등 success를 이질 블루로 분리
- **border** — focus 상태가 아니면 쓰지 않음 (카드·버튼·divider·토글 윤곽 포함)
- **설명 문구 남발** — 라벨·레이아웃으로 충분한데 Caption/Body로 풀어쓰기
- 홈 본문·MedRow에 콕이 상시 (empty 카드·오늘 배너·streak 슬롯만 허용)
- Worried를 공포/알람 UI로 (안부만)
- 시트 긴 설명 카피 이식

## 12. Migration note

| 상태   | 내용                                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------- |
| Done   | light 토큰 맵 — `theme.ts` / `tailwind` = 현행 (`brand #0F6B5C` 등). 브랜드명 약콕 · Character · sage 토큰 **방향**       |
| Legacy | `userInterfaceStyle: "light"` only — dark 맵·시스템 크롬 automatic 미적용                                                 |
| Next   | 1) dark 토큰 맵 2) 시스템 크롬 3) `userInterfaceStyle: "automatic"` QA 4) sage hex 리샘플 시 `theme.ts` / `tailwind` 동기 |

**새 UI·카피 톤은 이 문서를 따른다.** light-only 런타임·틸 hex는 마이그레이션 잔여.
