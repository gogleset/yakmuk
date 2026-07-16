# yakmuk pre — 로컬 개발

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
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<status의 anon key>
```

Android 에뮬: URL을 `http://10.0.2.2:54321`

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

### 시나리오 (가족 2클라)

1. **시뮬 A (보호자):** Welcome → 개발용 로그인 → 가족 탭에서 피보호자 닉네임 넣고 코드/QR 발급  
2. **시뮬 B (피보호자):** Welcome → 초대코드로 참여 → 홈에서 약 추가·체크·컨디션  
3. **시뮬 A:** 피드 탭에서 Realtime 갱신 확인  

OAuth(Google/Apple)는 로컬 프로바이더 설정 후 버튼 사용. 미설정 시 개발용 이메일 로그인.

### Edge 푸시

pre에서 **stub**: DECISIONS에 따라 Webhook→Expo Push는 후속. Realtime 피드로 가족 연동 먼저 증명.

## 스타일

NativeWind (Tailwind for RN). `className` 사용. 테마 색은 `tailwind.config.js`의 `brand` / `canvas`.

- run = 하루 (`user_id` + KST date)
- 체크/컨디션 = turn + `verify_day`
- HTTP: `POST /functions/v1/loop-trigger` `{ "user_id": "..." }`
