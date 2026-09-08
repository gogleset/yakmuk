# Kotlin Android 마이그레이션 체크리스트

SoT: RN [`mobile/`](../../mobile/) **freeze** (기능 추가·삭제 금지) · 서버 [`supabase/`](../../supabase/) 유지.  
대상: [`android-app/`](../../android-app/). **`mobile/android`에 넣지 않음.**  
아이폰: 나중에. Apple 로그인 안 함.  
`mobile/` 삭제는 범위 밖.

사용: step 끝날 때 해당 절만 체크. 게이트 실패면 다음 step 금지.

상태 기준: 2026-09-08 · S1–S8 freeze. G0.4 실기기 보류.

---

## 플랜 대비 보강 (재스캔)

| 빠졌던 것 | 왜 | 넣을 step |
|-----------|-----|-----------|
| DataStore 로컬 설정 6종 | 시작탭 · 애니 · glance · 주간 · pending alarm | S1 키 · S5–S6 값 |
| 세션 암호화 | RN은 AsyncStorage 평문 | S1–S2 |
| `force_sign_out_at` Realtime | 초대 재발급 → 강제 로그아웃 | S2+S4 |
| Realtime 3채널 | feed / roster / auth | S2·S4 |
| `day_complete` · Optimistic 체크 | 피드·체감 | S3 |
| 약 검색 · 색/용량 · `notification_enabled` | 시트·알람 제외 | S3·S5 |
| 초대 Share · QR 생성 · 재발급 | 스캔 UI는 원래 없음. 멤버 칸 ⋯ 재발급은 S4 패리티(2026-09-08) | S4 |
| 콕이 에셋 | UI 실사용 | S1 |
| KST / LIMITS / RPC 에러키 | `:core` | S1 |
| BootReceiver | RN은 권한만 있음 | S5 신규 |
| SKIPPED UI | RN에도 없음 → 만들지 말 것 | 범위 밖 |

---

## S1 — 골격

- [x] `android-app/` Gradle (AGP · Kotlin · Compose BOM · Hilt · supabase-kt)
- [x] 모듈 `:app` · `:core`
- [x] `.gitignore`: `.gradle/` · `build/` · `local.properties` · `*.keystore` · `google-services.json`
- [x] 테마 `COLORS` · `TONE_OUTLINE` → Compose (light only)
- [x] radius 토큰 (`Radius`)
- [x] KST + 테스트
- [x] LIMITS 포팅
- [x] copy(탭) + `BACKEND_ERROR_MESSAGES` + `formatUserFacingError`
- [x] 콕이 png · adaptive icon
- [x] 앱 라벨 약콕 · splash · status/nav bar 흰 + dark icons
- [x] 로컬 Supabase `http://10.0.2.2:54421` · debug cleartext
- [x] Encrypted 세션 스토리지 자리
- [x] DataStore 키 자리
- [x] 빈 3탭 셸 (기록 / 가족 / 설정)
- [x] R8 keep 규칙 (minify off)
- [x] 게이트: `./gradlew :app:assembleDebug :core:test` — **PASS** (`:core:test` 23 / 0 fail · `app-debug.apk`)

---

## S2 — Auth · 세션

- [x] Google ID 토큰 → `signInWithIdToken` (Credential Manager · `GOOGLE_WEB_CLIENT_ID` 없으면 버튼 disabled)
- [x] Apple 버튼 없음
- [x] debug 이메일 로그인 (`guardian@yakmuk.local`)
- [x] 가족 생성 퍼널
- [x] Welcome 분기 (선택 → 로그인 → 가족명/닉네임)
- [x] 초대 6자 peek + claim
- [x] 딥링크 `yakok://join?code=`
- [x] QR 생성만 → **S4** (초대 화면)
- [x] 세션 게이트 (가족 없으면 Welcome · 있으면 탭)
- [x] stale anon 정리
- [x] `force_sign_out_at` 구독 (`users` UPDATE Realtime + 프로필 refresh)
- [x] 게이트: `./gradlew :core:test :app:assembleDebug` — **PASS** (`:core:test` 33 / 0 fail · `app-debug.apk`)

---

## S3 — 기록 · 루프

- [x] 약 CRUD + soft delete · 스케줄 · 검색 · 색/용량 (검색은 `DATA_GO_KR_SERVICE_KEY` 있을 때)
- [x] TAKEN · Optimistic (번복 불가, RN과 동일) · 컨디션 · 캘린더 · 스트릭
- [x] SKIPPED 화면 안 만듦
- [x] `day_complete` · day loop · stuck 3회 (`family_alerts` upsert, care-push는 S7)
- [x] `loop-trigger` curl — 함수 SoT 유지. 로컬 edge runtime 정지(503)라 HTTP는 수동 `supabase functions serve loop-trigger` 후 확인
- [x] 게이트: `./gradlew :core:test :app:assembleDebug` — **PASS** (`:core:test` 66 / 0 fail · `app-debug.apk`)

---

## S4 — 가족

- [x] 역할 권한 (초대=리더 / 대리약=리더·보호자→피보호자 / glance=리더·보호자 가드만, UI는 S6)
- [x] 피드 Realtime · alerts ack · 자리표 · 재발급 · QR 생성 · 공유
- [x] 자리표 멤버 칸 ⋯ 메뉴: **초대장 새로 주기**(연결됨 포함 → 강제 로그아웃+재입장) · 내보내기. 대기 칸은 새로 주기·삭제(다시 오는 길은 삭제 불가). 재발급 후 초대 화면으로 이동 — RN `FamilySeatGrid` 패리티 (2026-09-08)
- [x] Realtime 3채널 (auth `force-sign-out` S2 + feed `daily_logs`/`family_alerts` + roster `family_invites`/`users`)
- [x] 게이트: `./gradlew :core:test :app:assembleDebug` — **PASS** (`:core:test` 87 / 0 fail · `app-debug.apk`). 2폰 수동 G0.1은 나중에

---

## S5 — 알람

- [x] AlarmClock → Receiver → FSI (BAL 금지)
- [x] BootReceiver 신규
- [x] fingerprint · reconcile · 한 탭 체크
- [x] 게이트: instrumented — **PASS** (`:core:test` 104 / 0 fail · `app-debug.apk` · `:app:connectedDebugAndroidTest` 2 / 0 fail · Pixel_7_API_34)

---

## S6 — glance · 주간 · 설정

- [x] ongoing glance · 인앱 주간 · 설정/탈퇴/옵트
- [x] 게이트: digest 테스트 — **PASS** (`:core:test` 116 / 0 fail · `app-debug.apk`)

---

## S7 — FCM

- [x] `users.push_token` — `expo_push_token` rename (2026-09-08). `fcm_token` 새 칼럼 아님
- [x] care-push FCM HTTP v1 · 앱 `users.push_token` 등록 · invoke 실패해도 TAKEN/stuck DB 유지 (2026-09-08)
- [ ] G0.4 실기기 수신 — **가짜 PASS 금지**. `FIREBASE_SERVICE_ACCOUNT` + 2폰 T4 확인 전 보류
- 게이트: `:core:test` 120 / 0 fail · `assembleDebug` — **코드 PASS** (2026-09-08). G0.4 실수신은 보류

---

## S8 — 문서 · freeze

- [x] DECISIONS/TRACK · RN freeze · 전체 회귀 — **PASS** (2026-09-08)
  - 앱 SoT = `android-app/` · `mobile/` freeze (기능 추가·삭제 금지)
  - 게이트: `:core:test` **120 / 0 fail** · `assembleDebug` PASS
  - G0.4 실기기·G0.1·G0.2 수동은 올리지 않음 (보류/partial 유지)

---

## 범위 밖

iOS · Apple · QR 스캔 · 복구코드 UI · 홈 위젯 · 주간 푸시 · SKIPPED 버튼 · purpose 태그 · RN 삭제
