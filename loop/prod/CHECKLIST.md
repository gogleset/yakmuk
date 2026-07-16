# CHECKLIST — yakmuk loop prod

## 승격

- [ ] [pre CHECKLIST](../pre/CHECKLIST.md) 충족 (RN·Auth 코드/QR·Realtime·가족 2클라)
- [ ] promote-template **pre→prod** (`ai-engineering-base/tracks/_meta/promote-template.md`)
- [ ] staging 존재 · prod와 분리
- [ ] 시크릿이 env/시크릿 매니저에만 있음

## 축·운영

- [ ] bound 하드캡 런타임 강제
- [ ] stuck escalate → 실알림 채널
- [ ] verify 실패 집계
- [ ] trigger 감사·멱등 (run resume/abort)
- [ ] trace 보관·PII 정책 적용
- [ ] staging에서 success / failed_bound / stuck / HTTP trigger 각 ≥1

## Auth · 딥링크

- [ ] Google/Apple OAuth 프로덕션 동작
- [ ] Universal Link(또는 App Link) QR 조인
- [ ] guardian: 피보호자 슬롯(nickname) + 코드/QR 프로덕션
- [ ] 피보호자: 코드/QR만 조인 + rate limit
- [ ] RLS가 hosted에서도 family_id 스코프 유지

## 출시

- [ ] KST/타임존 보정 검증
- [ ] EAS dogfood (TestFlight/내부)
- [ ] 탈퇴·이용약관 링크
- [ ] Edge Push 운영 경로 확인
- [ ] 헬스체크 / 기본 관측
- [ ] 롤백 런북 (reference)
- [ ] CI 마이그레이션·테스트 게이트
- [ ] 로컬-only/`supabase start`가 기본 경로 아님
