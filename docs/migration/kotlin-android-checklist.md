# Kotlin Android 마이그레이션 체크리스트

SoT: RN [`mobile/`](../../mobile/) · 서버 [`supabase/`](../../supabase/) 유지.  
대상: [`android-app/`](../../android-app/) (미생성). **`mobile/android`에 넣지 않음.**  
아이폰: 나중에. Apple 로그인 안 함.  
패리티 전 `mobile/` 삭제 금지.

사용: step 끝날 때 해당 절만 체크. 게이트 실패면 다음 step 금지.  
플랜: Kotlin Android 병행.

상태 기준: 2026-09-06 코드 재스캔.

---

## 플랜 대비 보강 (이번 재스캔)

플랜에 없거나 한 줄로만 있던 것. 체크리스트에 넣음.

| 빠졌던 것 | 왜 | 넣을 step |
|-----------|-----|-----------|
| DataStore 로컬 설정 6종 | RN AsyncStorage: 시작탭 · 애니 · glance opt/updatedAt · 주간 opt/dismiss · pending alarm | S1 키 · S5–S6 값 |
| 세션 암호화 | RN은 AsyncStorage 평문. Android는 EncryptedSharedPreferences | S1–S2 |
| `force_sign_out_at` Realtime | 초대 재발급 → 멤버 강제 로그아웃 | S2+S4 |
| Realtime 3채널 | feed=`daily_logs`+`family_alerts` · roster=`family_invites`+`users` · auth=`users.force_sign_out_at` | S2·S4 |
| `day_complete` 피드 동기화 | 오늘 약 전부 TAKEN 시 피드 마커 | S3 |
| Optimistic 체크 | RN TanStack optimistic. 체크 후 기다리면 피보호자 UX 죽음 | S3 |
| 약 검색 · 색/용량/아이콘 · `notification_enabled` | 시트·알람 제외 조건 | S3·S5 |
| 초대 Share · QR **생성** · 재발급/재진입 | 스캔 UI는 원래 없음. 표시+공유만 | S4 |
| 콕이 에셋 | brand overwrite는 later. **UI는 이미 씀** (`mobile/assets/koki/`) | S1 복사 · 화면마다 |
| 스켈레톤 | `docs/product/skeleton-*.md` · 위젯 스켈레톤 | 해당 화면 |
| KST 유틸 | `shared/lib/kst.ts` — 기기 TZ≠KST여도 날짜는 KST | S1 `:core` |
| LIMITS ↔ DB | 초대 6 · 닉 10 · 가족명 20 · 슬롯 6 · 검색 2자 | `:core` 상수 |
| RPC 에러 키 | `BACKEND_ERROR_MESSAGES` 1:1 | `:core` · 마이그레이션 시 동기 |
| BootReceiver | RN은 권한만 있고 리시버 없음. 재부팅 후 알람 공백 | **S5에서 신규** |
| cleartext | 에뮬 `10.0.2.2` · 실기기 LAN HTTP | S1 |
| 알림 채널 id | `medication-alarm` · `care-glance` · (원격) `care-taken`/`care-stuck` | S5–S7 |
| FSI 매니페스트 | `showWhenLocked` · `turnScreenOn` · Receiver에서 `startActivity` 금지 (API 34 BAL) | S5 |
| `google-services.json` · SHA-1 · gitignore | Play/FCM. 시크릿 커밋 금지 | S1·S7 |
| R8 keep | supabase-kt 직렬화 | S1 |
| `loop-trigger` HTTP | 7축 trigger. 클라 루프와 별개 | S3 후 curl 게이트 |
| SKIPPED UI | 타입만 있음. **RN에도 화면 없음 → 만들지 말 것** | 범위 밖 |
| 설정 탭 슬롯 on/off | product later | 범위 밖 |

---

## 잠근 결정

- [x] 같은 레포 · 형제 폴더 `android-app/`
- [x] Android only · iOS later
- [x] 패키지 `com.jinlabs.yakok` · 스킴 `yakmuk://`
- [x] 서버 재작성 없음 · 마이그레이션 in-place 금지
- [x] `:app` Compose + `:core` JVM (iOS 타깃 지금 없음)
- [x] 알람 = 앱 안 AlarmManager/FSI · Notifee/Expo plugin 없음
- [x] 원격 푸시 = S7 FCM. 미준비면 skip · 가짜 G0.4 금지

---

## S1 — 골격

- [ ] `android-app/` Gradle (AGP · Kotlin · Compose BOM · Hilt · supabase-kt)
- [ ] 모듈 `:app` · `:core`
- [ ] `.gitignore`: `.gradle/` · `build/` · `local.properties` · `*.keystore` · `google-services.json` (예시만 커밋)
- [ ] 테마: [`theme.ts`](../../mobile/src/shared/config/theme.ts) `COLORS` · `TONE_OUTLINE` → Compose (light only)
- [ ] 타이포·radius: [`docs/design/`](../design/README.md)
- [ ] KST: `todayKstDateString` · `weekdayMon0FromKstDate` · `msUntilKstDayEnd` — 테스트
- [ ] LIMITS 포팅 ([`limits.ts`](../../mobile/src/shared/constants/limits.ts))
- [ ] copy + `BACKEND_ERROR_MESSAGES` + `formatUserFacingError`
- [ ] 콕이 png 복사 (`mobile/assets/koki/v1/`) · 아이콘/adaptive
- [ ] 앱 라벨 약콕 · splash · status/nav bar 흰 + dark icons
- [ ] 로컬 Supabase: 에뮬 `http://10.0.2.2:54421` · cleartext 허용 · 실기기 LAN 설정(debug)
- [ ] Encrypted 세션 스토리지 자리
- [ ] DataStore 키 자리 (값은 이후 step)
- [ ] 빈 3탭 셸 (기록 / 가족 / 설정)
- [ ] R8/ProGuard supabase-kt keep (minify off여도 규칙 파일)
- [ ] 게이트: `./gradlew :app:assembleDebug :core:test`

---

## S2 — Auth · 세션

RN: [`guardian-auth`](../../mobile/src/features/guardian-auth/) · [`care-recipient-join`](../../mobile/src/features/care-recipient-join/) · [`AuthProvider`](../../mobile/src/providers/AuthProvider.tsx)

- [ ] Google ID 토큰 → `signInWithIdToken` (debug SHA-1 ↔ Cloud Console)
- [ ] Apple 버튼 **없음**
- [ ] debug 이메일 로그인 (`debug` 빌드만)
- [ ] 가족 생성 퍼널 (이름 → 닉) · `family_leader`
- [ ] Welcome 분기 (가족 만들기 / 코드 있음)
- [ ] 초대 6자 peek + claim · 닉 선택(비우면 `invited_as`) · anon
- [ ] 딥링크 `yakmuk://join?code=` intent-filter
- [ ] QR **생성**만 (카메라 스캔 없음)
- [ ] 세션 게이트: 가족 없으면 Welcome · 있으면 탭
- [ ] stale anon 세션 정리
- [ ] `force_sign_out_at` 구독 → 안내 후 signOut ([`COPY.auth.forceSignOut*`](../../mobile/src/shared/copy/copy.ts))
- [ ] 1 user 1 family (RPC가 막음 · 클라 에러 매핑)
- [ ] 게이트: S1 회귀 + 로그인/조인 단위 테스트

---

## S3 — 기록 · 루프

RN: home · medication-sheet · daily-medication-check · condition-log · `entities/medication/lib/loop`

### 약

- [ ] CRUD + soft delete
- [ ] 스케줄: daily / `days_mask` 월=0 CSV · 슬롯 ≤6 · 기본 `08:00`
- [ ] 슬롯 `notification_enabled`
- [ ] 약 검색 (min 2자)
- [ ] 색 `MED_COLORS` · 용량/단위 · 복용법 메타 ≤2000
- [ ] 추가/수정/상세 시트 (view↔edit)
- [ ] empty CTA · FAB

### 오늘 · 캘린더

- [ ] TAKEN 토글 · **롤백**
- [ ] SKIPPED 화면 **안 만듦**
- [ ] Optimistic 체크 (실패 시 롤백)
- [ ] 컨디션 GOOD/NORMAL/BAD · message 선택
- [ ] 오늘 배너 완료↔컨디션 자동 넘김 5s
- [ ] 월 캘린더 · 오늘 하이라이트 · 완료 도트
- [ ] 스트릭 ≥3일 + 콕이 streak
- [ ] 과거일 읽기 전용
- [ ] `day_complete` 피드 동기화 (스케줄 약 있을 때만)
- [ ] 스켈레톤 ([skeleton-home](../product/skeleton-home.md))

### 루프

- [ ] `run = (user_id, date_kst)` · 탭=turn
- [ ] 성공 A: 당일 스케줄 전부 TAKEN · B: 컨디션 ≥1
- [ ] SKIPPED ≠ success
- [ ] `max_iterations=10` + KST 하루 bound
- [ ] `verifyDay` 순수함수 테스트
- [ ] stuck: 미복용 해시 3회 → escalate (`family_alerts`)
- [ ] `open_run` / `append_turn` / `finish_run`
- [ ] 게이트: HTTP `loop-trigger` curl 1회 (축 7)

역할: 전 역할 본인 약 동일.

게이트: S1–2 회귀 + 루프 테스트.

---

## S4 — 가족

RN: family pages · family-invite · family-ops · subscribe-feed · subscribe-family-roster

### 역할

- [ ] 리더만 초대 생성/목록/재발급 · 강퇴 · 가족명
- [ ] 리더·보호자만 피보호자 약 대리 CRUD (`canManageMemberMeds`)
- [ ] glance/주간 옵트·카드 = 리더+보호자만
- [ ] 피보호자: 자리표 조회 · 본인 약 · 피드

### 화면

- [ ] 오늘 상태 · `memberStatusLabel` (분수/점수 금지)
- [ ] 자리표 시트 그리드 · 좌석 색 · FacePlaceholder
- [ ] 케어 알림 캐러셀 + ack · worried **outline만** (빨간 배너 병행 금지)
- [ ] 피드 프리뷰 3 · 창 7일 · 전체 피드 · 일자 읽음
- [ ] 피드 humanize (닉·약명)
- [ ] 멤버 상세 캘린더
- [ ] 초대 퍼널: 역할+호칭 → 코드/QR/Share
- [ ] 초대장 상세
- [ ] 재발급 → `force_sign_out` + claim 시 identity transfer (약·로그 유지)
- [ ] 강퇴 카피 「내보내기」
- [ ] 가족 삭제 mutation (리더 탈퇴와 연동은 S6)
- [ ] 스켈레톤 ([skeleton-family](../product/skeleton-family.md))
- [ ] 콕이: empty/thinking/family/worried

### Realtime

- [ ] `daily_logs` + `family_alerts` (family_id)
- [ ] `family_invites` + `users` (roster)
- [ ] 구독 해제 on dispose

게이트: S1–3 회귀 + mapper 테스트. **2폰 TAKEN→피드는 수동** (G0.1).

---

## S5 — 알람 (이전 이유)

RN SoT: [`AlarmReceiver.kt`](../../mobile/plugins/native/AlarmReceiver.kt) · [`AlarmFullScreenActivity.kt`](../../mobile/plugins/native/AlarmFullScreenActivity.kt) · [`fingerprint.ts`](../../mobile/src/features/medication-notifications/fingerprint.ts)

- [ ] `setAlarmClock` → `AlarmReceiver` → FSI 알림 (Receiver에서 Activity 직접 start 금지)
- [ ] FSI Activity = Compose 알람 화면 가능 (RN은 딥링크 우회). `showWhenLocked` · `turnScreenOn` · `excludeFromRecents` · `singleInstance`
- [ ] fingerprint (`clk4` 후속 태그) · 오늘 TAKEN·`notification_enabled=false` 제외
- [ ] reconcile: 포그라운드 · meds/taken 변경 · **부팅 (`BootReceiver`) — RN 갭, 여기서 신규**
- [ ] 단약/다약 한 탭 체크
- [ ] 채널 `medication-alarm` · 권한 POST_NOTIFICATIONS · exact alarm · USE_FULL_SCREEN_INTENT · WAKE_LOCK · VIBRATE · BOOT
- [ ] 설정에서 exact alarm / FSI OS 화면 유도 (1세션 1회 프롬프트)
- [ ] debug 알람/FSI 테스트 행
- [ ] 삼성 Doze/배터리 — [samsung-fsi playbook](../product/samsung-fsi-care-push-test.md) T1/T2
- [ ] Notifee **이중 스케줄 없음**
- [ ] 게이트: instrumented 스케줄→발화→체크

---

## S6 — glance · 주간 · 설정

decisions [#10](../product/decisions.md) [#11](../product/decisions.md)

### glance

- [ ] 보호자 ongoing 한 줄 (`이름 · memberStatusLabel`)
- [ ] 채널 `care-glance` · importance LOW · id 고정
- [ ] 멤버 여러 명: 알림 1개 · `hasUnackedAlert` 우선 아니면 첫 피보호자
- [ ] stale 30분 또는 TAKEN/stuck/포그라운드 갱신
- [ ] 옵트 DataStore · 피보호자 숨김

### 주간

- [ ] 인앱 카드만 (푸시 아님)
- [ ] 대략 문장 + 특이일(놓침·BAD)
- [ ] `week_start` KST 주당 1 · dismiss 후 재노출 없음 · 옵트
- [ ] digest 빌더 테스트

### 설정

- [ ] 닉네임 시트 (max 10)
- [ ] 로그아웃
- [ ] 탈퇴: 리더=가족 삭제 카피 · 그 외 본인만
- [ ] 시작 탭 기록|가족
- [ ] 애니메이션 on/off
- [ ] 약 알림 권한 스위치 → OFF면 OS 설정
- [ ] glance/주간 옵트 (뷰어 역할만)
- [ ] 문의 `support@yakmuk.app` · 광고 `ads@yakmuk.app`
- [ ] 약관/개인정보: URL null이면 「곧 공개할게요」 stub 유지
- [ ] 「가족 나가기」(탈퇴 아닌 leave) **없음** — RN과 동일

게이트: S1–5 회귀 + digest 테스트.

---

## S7 — FCM · care-push

- [ ] 새 마이그레이션 `users.fcm_token` (`expo_push_token` in-place 금지)
- [ ] 토큰 등록. `google-services`/프로젝트 없으면 **skip**
- [ ] Edge `care-push`: taken / stuck_escalate · 행위자 제외 동가족 · 채널 `care-taken` / `care-stuck`
- [ ] invoke 실패해도 TAKEN/stuck DB 유지
- [ ] `announce-push` 클라 연동 **안 함** (서버 stub 유지)
- [ ] 다중 기기 토큰 **안 함** (decisions 후속)
- [ ] G0.4 실수신 전 가짜 PASS 금지

게이트: S1–6 회귀 + 실패-격리 테스트.

---

## S8 — 문서 · freeze

- [ ] [`loop/pre/DECISIONS.md`](../../loop/pre/DECISIONS.md) 클라이언트 = Kotlin Compose Android · iOS later
- [ ] [`TRACK.md`](../../TRACK.md) · [`AGENTS.md`](../../AGENTS.md) repo map `android-app/`
- [ ] 이 체크리스트 남은 칸 검토
- [ ] `mobile/` = 스펙 · 새 기능 Kotlin만
- [ ] RN 삭제 일정은 패리티+아이폰 전략 후
- [ ] 게이트: S1–7 `./gradlew test assembleDebug`

---

## 교차 컷 (step와 무관 · 빠지면 회귀)

- [ ] 사용자 문구 `shared/copy` 동기 · 실패 Alert 안부 톤
- [ ] RPC `raise exception` 키 ↔ 앱 맵
- [ ] 시크릿 커밋 없음 (`.env` · `google-services.json` · keystore)
- [ ] FSD 폴더를 Android에 복붙하지 않음 (Gradle 모듈 + use-case)
- [ ] 통계 대시보드 · 개별 체크 폭죽 · AI 상담 안 만듦
- [ ] purpose 태그 안 만듦 (Gate 0 전 금지)

---

## 범위 밖 (체크하지 말 것)

- iOS · KMP ios 타깃 · Apple 로그인 · iOS glance id 교체
- QR 카메라 스캔
- 복구코드 관리 UI (API만 호환 · DECISIONS: 재진입=초대 재발급)
- OS 홈 위젯
- 주간 **푸시**
- 설정 탭 슬롯별 알림 on/off (later)
- SKIPPED 버튼
- brand cheer/lantern/heart · 콕이 정식 overwrite
- FunnelShell P6 승격
- EAS · RN 기능 추가
- 서버 SQLite / 다중 가족 / OCR

---

## 패리티 정의 (이전이 「됨」)

Android 실기기(가능하면 삼성)에서:

1. 가족장 Google → 가족 → 초대코드 → 피보호자 조인
2. 피보호자 TAKEN → 보호자 피드 Realtime (수동 2폰)
3. 스케줄 시각 FSI → 한 탭 체크 (G0.3)
4. stuck → worried 카드 (G0.2 수동)
5. 보호자 glance 한 줄 · 주간 인앱 카드
6. 탈퇴/내보내기/재발급 강제로그아웃

care-push 실수신은 인프라 준비 전 보류 가능. 그 외 1–6 빠지면 패리티 아님.
