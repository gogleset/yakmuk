# PRD 요약 — 약먹었약

원본: `~/Downloads/prd_yakmeogeotyak_mvp.pdf`, `prd_yakmeogeotyak_mvp_v1.1.pdf`

## 한 줄

멀리 사는 가족이 **원터치 복용 체크**와 **한 줄 컨디션**으로 안부를 실시간 공유.

## Stage

- mvp(SQLite) **스킵** → 첫 구현 **pre** (Expo RN + `supabase start`)

## Auth (FR-01, PRD 대비 강화)

| 역할 | 방식 |
|------|------|
| 보호자 (자녀) | **OAuth** → 가족 생성 → **피보호자 추가 시 초기 nickname** → 코드·QR |
| 피보호자 (부모님) | **6자리 코드 또는 QR만** (닉네임·OAuth 입력 없음) |

## P0 → Stage

| ID | 기능 | pre | prod |
|----|------|-----|------|
| FR-01 | 가입·초대 | OAuth + 코드/QR + RLS | 탈퇴·약관 |
| FR-02 | 스케줄 | CRUD | — |
| FR-03 | 홈 체크·컨디션 | UI + 루프 + Optimistic | — |
| FR-04 | 피드 | Realtime | — |
| FR-05 | 푸시 | 로컬 알림 + Edge | 운영 |

## 가족 테스트

2 시뮬 → URL은 iOS `127.0.0.1` / Android `10.0.2.2`.  
피보호자 TAKEN → 보호자 Realtime.

## 3주

| 주 | 내용 | Stage |
|----|------|-------|
| 1 | Expo·FSD·Supabase·OAuth/QR·RLS | pre |
| 2 | Optimistic·Realtime·Edge 푸시 | pre |
| 3 | KST·EAS·스토어 | prod |

## 스키마

`users.role` · `care_invites` (nickname+code, 보호자 사전 설정) · `medications` · `daily_logs`
