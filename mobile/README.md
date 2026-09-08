# yakmuk pre — RN freeze 스펙

**현재 앱은 [`android-app/`](../android-app/) (Kotlin Compose).**  
이 폴더는 패리티 스펙만. **기능 추가·삭제 금지** (freeze 2026-09-08).

## 전제

1. **Docker Desktop 실행**
2. Node 24 LTS (`.nvmrc`) + pnpm (`packageManager` 필드)

## Supabase

```bash
cd /Users/jinchoi/yakmuk
supabase start
supabase status   # API URL / anon key 확인
```

anon key를 `mobile/.env`에:

```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54421
EXPO_PUBLIC_SUPABASE_ANON_KEY=<status의 anon key>
```

Android 에뮬: URL을 `http://10.0.2.2:54421`

포트는 BE(기본 `5432x`)와 동시 기동용으로 `5442x` ([`supabase/config.toml`](../supabase/config.toml)).

마이그레이션은 `supabase start` / `db reset` 시 적용.

```bash
supabase db reset   # 스키마 재적용
supabase functions serve loop-trigger   # HTTP trigger (선택)
```

## 앱

```bash
cd mobile
pnpm install
pnpm start
```

### Docker (yakmuk 컨테이너)

Supabase(BE)는 `supabase start`로 두고, Expo Metro만 컨테이너로 올릴 때:

```bash
# repo root — mobile/.env 필요 (EXPO_PUBLIC_SUPABASE_*)
docker compose up --build yakmuk
```

- Metro: `http://localhost:8081`
- 클라이언트(시뮬/브라우저)의 Supabase URL은 그대로 `127.0.0.1:54421` (번들은 호스트에서 실행)
- 웹: 컨테이너 셸에서 `pnpm exec expo start --web --host lan` 또는 compose `command` 오버라이드

```bash
docker compose run --rm --service-ports yakmuk pnpm exec expo start --web --host lan
```

### 시나리오 (가족 2클라)

1. **시뮬 A (보호자):** Welcome → Google 네이티브(또는 개발용 이메일) → 가족 탭에서 피보호자 닉네임 넣고 코드/QR 발급  
2. **시뮬 B (피보호자):** Welcome → 초대코드로 참여 → 홈에서 약 추가·체크·컨디션  
3. **시뮬 A:** 피드 탭에서 Realtime 갱신 확인  

#### 가족장 Google / Apple (네이티브)

키는 **나중에** 넣어도 됨. 자리만 준비되어 있음.

1. Google Cloud: **Web** + **Android**(`com.jinlabs.yakok` + **앱 debug SHA-1**) Client ID · Web Secret  
   - SHA-1은 `~/.android/debug.keystore`가 아니라 **`mobile/android/app/debug.keystore`** 기준:
     ```bash
     keytool -list -v -keystore mobile/android/app/debug.keystore \
       -alias androiddebugkey -storepass android -keypass android
     ```
     (현재: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`)  
2. `supabase/.env` (`.env.example` 참고):
   ```
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=<web>,<android>
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=<web secret>
   ```
3. [`supabase/config.toml`](../supabase/config.toml) `[auth.external.google]` → `enabled = true`  
4. `mobile/.env`: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<web client id만>`  
5. `supabase stop && supabase start` · 네이티브 모듈 반영을 위해 `pnpm android` / `pnpm ios` 재빌드  
6. Apple(iOS): Bundle ID `com.yakmuk.app` + Sign in with Apple · `SUPABASE_AUTH_EXTERNAL_APPLE_*` · `[auth.external.apple] enabled = true`  
7. Android에서는 Apple 버튼이 숨겨짐 (네이티브 Apple 없음)

미설정 시 Welcome의 **개발용 이메일 로그인**(`__DEV__`) 사용.

### Edge 푸시 · 로컬 알림

- **약 알림:** 폰 로컬만 (`expo-notifications` / Android Notifee). 서버가 보내지 않음. 앱 시작·복귀 시 서버 스케줄과 reconcile. 로그: `[yakmuk:notif]`
- **안심 푸시:** 복용(`taken`)·stuck → Edge `care-push` → FCM HTTP v1 → 동가족 `users.push_token`.
  - 클라이언트: Android **`google-services.json`** (패키지 `com.jinlabs.yakok`). RN은 `app.json` → `android.googleServicesFile`.
  - 서버: `FIREBASE_SERVICE_ACCOUNT` (Firebase 서비스 계정 JSON, `google-services.json`과 별개). 없으면 Edge skip.
  - 미설정 시 `[yakmuk:push] skip` / `{ sent: 0, message: 'fcm not configured' }`.
- **공지:** Edge `announce-push` (service_role / secret) — 같은 FCM 경로. care와 분리.

```bash
supabase db reset   # 스키마 재적용
supabase functions serve care-push     # 안심 푸시
supabase functions serve announce-push # 공지 stub (선택)
# care-push: Authorization Bearer <user JWT>
# { "kind": "taken"|"stuck_escalate", "family_id", "actor_user_id", "title", "body" }
```

개발 빌드(Android): `eas build --profile development --platform android` 후 `EXPO_PUBLIC_EAS_PROJECT_ID` 설정.

pre에서 Realtime 가족 연동 우선. hosted `functions deploy`는 DB push와 별도.

## 스타일

NativeWind (Tailwind for RN). `className` 사용. 테마 색은 `tailwind.config.js`의 `brand` / `canvas`.

- run = 하루 (`user_id` + KST date)
- 체크/컨디션 = turn + `verify_day`
- HTTP: `POST /functions/v1/loop-trigger` `{ "user_id": "..." }`
