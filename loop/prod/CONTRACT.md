# CONTRACT — yakmuk loop prod (배포)

pre CONTRACT의 **7축·도메인·Auth·어댑터를 유지**.  
바뀌는 것: 스토어=hosted Supabase · 배포·관측·하드캡·심사.

베이스: `ai-engineering-base/tracks/loop-engineering/prod/CONTRACT.md`  
도메인 원본: [../pre/CONTRACT.md](../pre/CONTRACT.md)

## 상속 (pre와 동일)

| 항목 | 내용 |
|------|------|
| goal | `(user_id, date_kst)` 하루 · TAKEN 전부 + 컨디션 ≥1 · SKIPPED≠success |
| cycle | perceive→reason→act→observe (탭=turn) |
| verify | `verify_day` 단독 실행 가능 |
| stuck | 미복용 해시 N회 → escalate (채널은 운영 알림) |
| Auth | guardian=OAuth · care_recipient=코드/QR만 (nickname은 보호자 사전 설정) |
| RLS | 동일 `family_id` · 1 family/user |
| 클라이언트 | Expo RN + FSD · 포트 유지, 어댑터→hosted |

## 축 × prod 추가분

| 축 | prod |
|----|------|
| goal | verifier 버전·변경 감사 |
| cycle | 인프라 타임아웃·스케일 |
| bound | **하드캡 런타임 강제** (설정만 있고 미적용 금지) |
| verify | 실패 집계·알림/대시보드 |
| stuck | escalate → 슬랙/이메일 등 **실채널** |
| trace | 보관 기간·PII(nickname·message)·운영 쿼리 |
| trigger | 인앱 + 웹훅/스케줄 · **감사·멱등** (중복 기동 정책) |

## Auth · 딥링크 (prod)

- OAuth: 프로덕션 redirect / bundle id / 스토어 앱
- QR: Universal Link (또는 App Link) → `…/join?code=` · 스킴 `yakmuk://` 폴백
- 피보호자: 코드/QR만 조인 · nickname은 guardian이 슬롯 생성 시 설정
- 피보호자 세션 Edge/RPC: rate limit·남용 방지

## 제품 운영 (PRD 3주차)

- KST 단일 소스 (스케줄·verify·bound 윈도우)
- EAS Build · TestFlight / 내부 트랙 dogfood
- 회원 탈퇴 · 이용약관 (심사)
- staging / prod 분리 · 시크릿 매니저 · CI 마이그레이션 게이트
- Edge Push 운영·멱등 (동일 이벤트 중복 푸시 억제)
- 롤백: 앱 버전 + 마이그레이션 절차

## 금지

- 로컬-only / `supabase start`만으로 prod 완료 선언
- bound 없는 무한 루프를 기본값으로
- service role을 클라이언트에 노출
