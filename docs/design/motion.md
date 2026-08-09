# Design — Motion

← [README](README.md)

구현 토큰: [`mobile/src/shared/constants/motion.ts`](../../mobile/src/shared/constants/motion.ts) (`MOTION`).  
런타임 Gate·`motion` prop·StyleRegistry는 **후속 foundation** — 이 절이 API·원칙 SoT.

## 10.1 톤 · 금지 (유지)

- 존재감·계층용 **짧은** fade / sheet present / **섹션 reveal fade** 정도
- **bounce·과한 spring·장식 파티클 금지** — 레지스트리에도 등록하지 않음
- Success 스파클 = 이미지 bake-in만
- 콕이 등장 = 짧은 fade. 캐릭터 bounce 금지
- 모드(라이트/다크)와 무관하게 **동일한 타이밍 커브** (ease-out cubic · timing only)
- **순차 등장(stagger):** copy(멘션) → media(컷) → action(CTA).  
  `FadeInView step={0|1|2}`. 딜레이 = `step * MOTION.stagger.stepMs` (기본 55ms). 매직넘버 금지. `step`는 스타일과 **직교**(등장 순서만).
- 약 등록: 검색 결과 fade · 자세히보기 present · 메타/스케줄 섹션 reveal · 색 스와치 press Surface

## 10.2 획일화 원칙

| # | 원칙 |
|---|------|
| 1 | **손맛이 같다** — 어디서 눌러도/나타나도 같은 duration 키·easing·scale/enterY |
| 2 | **설정 방법이 같다** — Button · FadeInView · Sheet · Fab · ChoiceCard 등 모션 Surface 전부 `motion` prop 계약 동일 |
| 3 | **카탈로그는 얇다** — kind당 **기본 스타일 1개**가 브랜드. 변형은 예외적으로만 |
| 4 | **끄기도 한 방식** — 인스턴스 `motion={false}` · 전역 설정/저전력/OS 동작 줄이기 |

획일화 ≠ 버튼만. **모션 Surface 전원이 같은 API·같은 토큰**을 쓴다.

```tsx
<AnyMotionSurface />                  // kind default
<AnyMotionSurface motion={false} />   // 이 자리만 off
<AnyMotionSurface motion="…" />       // 같은 kind 이름만 (변형은 드묾)
```

## 10.3 Gate (전역)

```text
motionActive = animationsEnabledUser && !lowPowerMode && !osReduceMotion
```

| 입력 | 설명 |
|------|------|
| `animationsEnabledUser` | 설정 스위치 「애니메이션」(기본 ON). AsyncStorage |
| `lowPowerMode` | iOS Low Power · Android Power Saver (`expo-battery`, foundation). 미지원 기기는 false → 모션 유지 |
| `osReduceMotion` | OS「동작 줄이기」— 설정 row 없음, **조용히** 반영 |

전역 OFF면 인스턴스 `motion` prop 무시 → 전부 `none`(즉시 최종 상태).  
`MOTION.toastMs`는 토스트 **체류** 시간 — Gate로 0 만들지 않음.

## 10.4 StyleRegistry · kind

**kind** = 엔진·시점이 다른 가족. 교차 사용 금지(타입으로 차단).

| kind | 언제 | 러너 |
|------|------|------|
| `press` | press in/out | Reanimated scale 등 |
| `enter` | 마운트/등장 | Reanimated opacity + translateY |
| `sheet` | present/dismiss | RN Animated translate + backdrop |
| `loop` | 대기 루프 | Reanimated opacity pulse 등 |
| `none` | 즉시 최종 상태 | no-op |

**얇은 기본 세트 (획일 SoT)** — duration 값은 `MOTION.duration` 키만 참조:

| 이름 | kind | 파라미터 감각 |
|------|------|----------------|
| `none` | none | — |
| `press` | press | scale = `MOTION.press.scale`(0.97) · duration `instant` |
| `enterFade` | enter | enterY = `MOTION.offset.enterY`(10) · duration `normal` |
| `sheetDefault` | sheet | present `normal` · dismiss backdrop `fast` |
| `skeletonPulse` | loop | duration `normal` |

변형(`enterFadeFast` 등)은 **필요 증명 후에만** 레지스트리 추가. 기본 호출부·default 표에는 올리지 않음.  
(기존 `FadeInView duration="fast"`는 foundation에서 `motion` 변형으로 수렴·짧은 호환 가능.)

## 10.5 resolveMotionStyle

```text
if !motionActive || motionProp === false → none
else name = motionProp ?? componentDefault
if name.kind !== allowedKind → componentDefault (+ __DEV__ warn)
else name
```

## 10.6 Surfaces — default · 허용 kind

| 컴포넌트 | default | kind |
|----------|---------|------|
| Button · PressableScale · Fab · ChoiceCard · SettingsRow(터치) | `press` | press |
| FadeInView (+ FunnelShell 자식) | `enterFade` | enter |
| BottomSheet | `sheetDefault` | sheet |
| Skeleton | `skeletonPulse` | loop |
| MarqueeTitle | loop 단일 스타일(또는 사실상 none에 가까운 1개) | loop |
| FamilyActivityFeedStack | shared resolve·토큰 (widget raw ms 금지) | enter |

**비모션 (prop 없음):** Typography · Icon · Input · Badge · 순수 Card · MedFormIcon 등.

타입:

```ts
motion?: false | MotionsOfKind<'press'>   // Button 등
motion?: false | MotionsOfKind<'enter'>     // FadeInView
```

## 10.7 신규 shared/ui 체크리스트 (리뷰 게이트)

1. 움직임 있나? → Surface로 등록  
2. kind 고르기  
3. `motion?: false | MotionsOfKind<K>`  
4. `COMPONENT_MOTION_DEFAULTS`에 default = 그 kind 기본 스타일  
5. kind 러너만 호출 — 로컬 duration 숫자·커스텀 withTiming ms 금지  

## 10.8 키 · 카피 (예약) · FSD

| 항목 | 값 |
|------|-----|
| AsyncStorage | `yakmuk.motion.animations_enabled` (`'1'`/`'0'`, 기본 ON · careGlance parse 同형) |
| Copy (foundation) | `COPY.settings.animations` · `animationsHint` (저전력 시 자동 off 안내, 짧게) |
| FSD | registry·resolve·pref = `shared` · Provider = `providers` · `motion` prop = `shared/ui` (+ 필요 시 widget이 shared 계약) |

## 10.9 범위 밖 · 후속 foundation 순서

**범위 밖:** kind당 스타일 쇼핑몰 · bounce/spring · 서버 sync pref · 비Surface에 `motion` 강제 · Sheet Reanimated 재작성.

**Foundation 착수 순서**

1. `MOTION_STYLES` + `resolveMotionStyle` + 단위 테스트 (`mobile/src/__tests__/`)  
2. `MotionProvider` + pref (reduceMotion만으로도 Gate 가능)  
3. 러너 press·enter → Button / PressableScale / FadeInView  
4. Sheet · Skeleton · Feed · Marquee  
5. 설정 스위치  
6. `expo-battery` 저전력 리스너 (미지원=false 가드)
