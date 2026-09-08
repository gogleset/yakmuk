# DECISIONS — yakmuk loop prod

pre DECISIONS를 기본으로 하고, 아래만 **prod에서 덮어씀/추가**.

| 결정 | 선택 | 근거 |
|------|------|------|
| 스토어 | **hosted Supabase** | pre 어댑터 교체 대상 |
| 환경 | staging + prod | 캠프 prod |
| bound 하드캡 | iterations + KST wall-clock **둘 다 강제** | 설정만 금지 |
| stuck 알림 | TBD → 출시 전 슬랙 또는 이메일 확정 | escalate 실채널 |
| trigger 멱등 | 동일 `run_id` resume/abort · 웹훅 idempotency-key | 중복 기동 |
| resume | `running`만 resume · 종료 상태는 새 run | pre run 경계 유지 |
| trace 보관 | 90일 후 아카이브/삭제 | PII: nickname·message |
| 배포 | Play (Kotlin `android-app/`) · iOS/EAS 나중에 | Android-first |
| 타임존 | KST | pre와 동일 |
| OAuth | Google·Apple **프로덕션** 키·리다이렉트 | pre 로컬과 분리 |
| QR/딥링크 | Universal Link 1차 · `yakok://` 폴백 | 피보호자 진입 |
| 초대 남용 방지 | 코드 rate limit · 만료(선택, 기본 무만료→DECISIONS 확정) | 피보호자 비OAuth |
| 푸시 | hosted Edge → FCM (`users.push_token`) · 실패 재시도 상한 | FR-05 운영 |
| 탈퇴 | guardian/care_recipient 각각 · 가족 orphan 정책 문서화 | 심사 |
| 시크릿 | EAS secrets / 호스트 env · 레포 금지 | — |

## FR (prod에서 추가되는 것만)

| ID | prod |
|----|------|
| FR-01 | 탈퇴·약관 · OAuth/딥링크 프로덕션 |
| FR-05 | 푸시 멱등·관측·실패 알림 |
| (공통) | EAS dogfood · 스토어 심사 · KST 운영 검증 |

pre에서 끝난 FR-02~04는 기능 동결·버그픽스만 (새 scope 없음).

## 승격 조건

[../pre/CHECKLIST.md](../pre/CHECKLIST.md) 구현 항목 충족 후 → 본 CHECKLIST.
