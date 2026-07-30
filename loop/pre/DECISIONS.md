# DECISIONS — yakmuk loop pre

| 결정 | 선택 | 근거 |
|------|------|------|
| 시작 stage | **pre** (mvp 스킵) | 가족 연동 테스트에 공유 DB 필수 |
| promote mvp→pre | **N/A** | 의도적 스킵 · 캠프 promote-template 해당 구간 생략 |
| 클라이언트 | Expo RN | PRD |
| 스토어 | local `supabase start` | 멀티 클라 공유 |
| 아키텍처 | FSD + Atomic `shared/ui` | PRD |
| 상태관리 | TanStack Query | Optimistic + Realtime |
| **Auth 가족장** | **OAuth** (Google · Apple, Supabase Auth) | 가족 생성·관리 계정 |
| **Auth 보호자·피보호자** | **초대코드 6자리 + QR** (anon) · 닉네임 선택 | Low Friction · 호칭은 리더가 사전 지정 |
| 역할 | `users.role` = `family_leader` \| `guardian` \| `care_recipient` | 3역할 |
| 가족·초대 | 가족장 OAuth → 가족 생성 → **호칭(`invited_as`)+target_role 슬롯** → 코드·QR | 리더만 초대 |
| 조인 세션 | 코드/QR + 선택 닉네임 → claim | 비우면 invited_as |
| QR 페이로드 | deep link `yakmuk://join?code=XXXXXX` (또는 Universal Link) | 스캔 = 코드 입력과 동일 |
| bound | `max_iterations=10` + 당일 KST 윈도우 | — |
| stuck | 미복용 해시 3회 → escalate | — |
| verifier | 순수 함수 + SQL (reference) | — |
| escalate | 로그 + `family_alerts` (가족 탭 배너) | — |
| trigger | 인앱 버튼 + HTTP webhook | — |
| 로컬 알림 | expo-notifications | FR-05 |
| 원격 푸시 | **stub** (Realtime로 가족 연동 먼저) · Edge→Expo Push는 후속 | FR-05 부분 |
| HTTP trigger | `supabase/functions/loop-trigger` | pre CONTRACT || RLS | 동일 `family_id`만 · runs는 owner | Two-tier |
| 컨디션 | goal 필수 · message 선택 | FR-03 |
| days_mask | `daily` \| `0..6` CSV (월=0) | — |
| 체크 롤백 / SKIPPED | 롤백 허용 · SKIPPED≠success | PRD |
| 타임존 | KST | — |
| 가족 테스트 | 시뮬 2대 → 동일 local Supabase | — |
| **시뮬 DB URL** | iOS Sim: `http://127.0.0.1:54421` · Android Emulator: `http://10.0.2.2:54421` · 실기기: LAN IP · BE(54321)와 포트 분리 | localhost 함정 |
| run 경계 | **run = 유저·날짜(KST) 하루 goal** · 탭=turn | 매 탭마다 새 run 금지 |
| **앱 IA** | **홈 / 가족 / 설정** 3탭 | 홈=내 약+캘린더, 가족=상태·피드·초대 |
| **내 약** | **전 역할** medications CRUD + TAKEN/컨디션 | 보호자도 본인 복약 |

## FR (P0)

| ID | pre | prod |
|----|-----|------|
| FR-01 | 가족장 OAuth · family_invites+코드/QR · 보호자/피보호자 조인 · 기기복구코드 | 탈퇴·약관 |
| FR-02 | 스케줄 CRUD | — |
| FR-03 | 홈 체크·컨디션·Optimistic | — |
| FR-04 | Realtime 피드 | — |
| FR-05 | 로컬 알림 + Edge 푸시 | 운영·멱등 |

## 다음

- prod: hosted Supabase, EAS, OAuth 프로덕션 키, bound 하드캡, 스토어
