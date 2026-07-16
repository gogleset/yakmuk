# Stage — prod

- boundary: deploy
- store: hosted-rdb
- track: loop-engineering
- domain: yakmuk (약먹었약)
- promoted_from: pre
- mvp: skipped (pre에서 시작)

## 상속 (pre)

Expo RN · 7축 · run=하루 · Auth(guardian OAuth / care_recipient 코드·QR, nickname은 보호자 설정) · RLS · Realtime · Edge 푸시  
어댑터 포트 동일 → **구현만 hosted Supabase**.

## 허용

EAS · staging/prod · OAuth 프로덕션 키 · Universal Links(QR) · 관측 · bound 하드캡 · stuck 알림 · 롤백 · CI · 스토어 심사

## 금지

`supabase start` / SQLite를 런타임 기본값으로 · bound 없는 무한 루프 · 시크릿 레포 커밋
