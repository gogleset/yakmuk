# CHECKLIST — yakmuk loop pre

## 문서

- [x] mvp 스킵 · promote mvp→pre = N/A
- [x] 7축 + run=하루 경계
- [x] Auth: guardian OAuth · 피보호자 코드/QR(닉네임은 보호자 사전 설정)
- [x] 가족 테스트·시뮬 URL · verifier SQL · RLS 초안 (reference)
- [x] FR P0 = pre

## 인프라

- [ ] `supabase init` + `supabase start`
- [ ] 마이그레이션 (도메인 + runs/turns + RLS)
- [ ] OAuth 프로바이더 로컬 설정 (Google/Apple redirect)
- [ ] 로컬 env (시뮬별 URL 주의)
- [ ] 퍼블릭 배포를 완료 조건으로 쓰지 않음

## 축

- [ ] 7축이 로컬 Supabase에서 동작
- [ ] verifier 단독 실행 (reference SQL)
- [ ] 성공 run 1회 + bound/stuck 1회
- [ ] HTTP trigger ≥1
- [ ] 어댑터 너머 스토어 접근

## 제품 · 가족

- [ ] Expo RN + FSD (home·피드·auth/join)
- [ ] guardian OAuth → 가족 생성 → 피보호자 슬롯(nickname) → 코드/QR
- [ ] care_recipient: 코드/QR만으로 조인 (닉네임 UI 없음)
- [ ] 복약·컨디션 + Optimistic
- [ ] Realtime 피드
- [ ] **2 시뮬: 피보호자 TAKEN → 보호자 피드**
- [ ] Edge 푸시 또는 stub + DECISIONS
