# DECISIONS — yakmuk loop pre

| 결정 | 선택 | 근거 |
|------|------|------|
| 시작 stage | **pre** (mvp 스킵) | 가족 연동 테스트에 공유 DB 필수 |
| promote mvp→pre | **N/A** | 의도적 스킵 · 캠프 promote-template 해당 구간 생략 |
| 클라이언트 | Expo RN | PRD |
| 스토어 | local `supabase start` | 멀티 클라 공유 |
| 아키텍처 | FSD + Atomic `shared/ui` | PRD |
| 상태관리 | TanStack Query | Optimistic + Realtime |
| **Auth 보호자** | **OAuth** (Google · Apple, Supabase Auth) | 자녀/보호자 — 계정 회수·보안 |
| **Auth 피보호자** | **초대코드 6자리 + QR** (OAuth·닉네임 입력 없음) | Low Friction |
| 역할 | `users.role` = `guardian` \| `care_recipient` | 페르소나 B / A |
| 가족·초대 | guardian OAuth → 가족 생성 → **피보호자 슬롯 추가 시 초기 nickname 설정** → 그 슬롯용 코드·QR 발급 | 보호자가 호칭 지정 (엄마/아빠) |
| 피보호자 세션 | 코드/QR 검증만 → 사전 생성된 슬롯에 세션 연결 (비OAuth) | nickname은 guardian이 이미 넣음 |
| QR 페이로드 | deep link `yakmuk://join?code=XXXXXX` (또는 Universal Link) | 스캔 = 코드 입력과 동일 |
| bound | `max_iterations=10` + 당일 KST 윈도우 | — |
| stuck | 미복용 해시 3회 → escalate | — |
| verifier | 순수 함수 + SQL (reference) | — |
| escalate | 로그 + 개발 콘솔 | — |
| trigger | 인앱 버튼 + HTTP webhook | — |
| 로컬 알림 | expo-notifications | FR-05 |
| 원격 푸시 | DB webhook → Edge → Expo Push | FR-05 |
| RLS | 동일 `family_id`만 · runs는 owner | Two-tier |
| 컨디션 | goal 필수 · message 선택 | FR-03 |
| days_mask | `daily` \| `0..6` CSV (월=0) | — |
| 체크 롤백 / SKIPPED | 롤백 허용 · SKIPPED≠success | PRD |
| 타임존 | KST | — |
| 가족 테스트 | 시뮬 2대 → 동일 local Supabase | — |
| **시뮬 DB URL** | iOS Sim: `http://127.0.0.1:54321` · Android Emulator: `http://10.0.2.2:54321` · 실기기: LAN IP | localhost 함정 |
| run 경계 | **run = 유저·날짜(KST) 하루 goal** · 탭=turn | 매 탭마다 새 run 금지 |

## FR (P0)

| ID | pre | prod |
|----|-----|------|
| FR-01 | guardian OAuth · 슬롯(nickname)+코드/QR · 피보호자 조인 | 탈퇴·약관 |
| FR-02 | 스케줄 CRUD | — |
| FR-03 | 홈 체크·컨디션·Optimistic | — |
| FR-04 | Realtime 피드 | — |
| FR-05 | 로컬 알림 + Edge 푸시 | 운영·멱등 |

## 다음

- prod: hosted Supabase, EAS, OAuth 프로덕션 키, bound 하드캡, 스토어
