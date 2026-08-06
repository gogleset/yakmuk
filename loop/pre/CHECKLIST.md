# CHECKLIST — yakmuk loop pre

## 문서

- [x] mvp 스킵 · promote mvp→pre = N/A
- [x] 7축 + run=하루 경계
- [x] Auth: guardian OAuth · 피보호자 코드/QR(닉네임은 보호자 사전 설정)
- [x] 가족 테스트·시뮬 URL · verifier SQL · RLS 초안 (reference)
- [x] FR P0 = pre
- [x] IA: 홈 / 가족 / 설정 · 전 역할 내 약 · 캘린더

## 인프라

- [x] `supabase init` + 마이그레이션 SQL (`supabase/migrations/…`)
- [x] `supabase start` (Docker Desktop 필요) + anon key → `mobile/.env`
- [ ] OAuth 프로바이더 로컬 설정 (Google/Apple) — 개발용 이메일 로그인으로 대체 가능
- [x] 로컬 env 예시 (`mobile/.env.example`)
- [x] 퍼블릭 배포를 완료 조건으로 쓰지 않음
- [x] `family_alerts` 마이그레이션 적용 (`supabase db reset` 또는 migration up)

## 축

- [x] 루프 포트 + `verify_day` + `stepDayLoop` 코드 (`mobile/src/loop/`)
- [x] HTTP trigger 함수 (`supabase/functions/loop-trigger`)
- [ ] `supabase start` 후 성공 run / bound / stuck 시나리오 실기기 검증
- [ ] HTTP trigger 1회 curl 재현

## 제품 · 가족

- [x] Expo RN + FSD 골격 (`mobile/app`, `mobile/src`)
- [x] guardian 개발로그인 + 가족/슬롯(nickname)+코드/QR
- [x] care_recipient: 코드/QR만 조인
- [x] 복약·컨디션 + TanStack Optimistic 경로 (전 역할)
- [x] Realtime 피드 (가족 탭)
- [x] 가족 탭: 오늘 상태 · 알림 ack · 초대 FAB
- [x] 홈: 내 약 CRUD · 컨디션 · 월 캘린더
- [x] 설정: 프로필 · 알림 권한 · 로그아웃
- [x] 피드 humanize (닉네임·약명)
- [x] 로컬 알림 (`expo-notifications`)
- [x] BAD / stuck escalate → `family_alerts`
- [ ] **2 시뮬: 피보호자 TAKEN → 보호자 피드** (Docker 기동 후) — 코드·DB OK, UI E2E 수동
- [x] Edge 푸시 stub (DECISIONS) · **care-push** (taken/stuck) 추가 — **삼성/실기기 2클라 수신·LAN URL은 수동** (G0.4)
