# 잠긴 결정 (제품 목표)

← [README](README.md)

안심 루프·유료 감각에 대한 **잠근 결정**.  
브랜드 beat/색/퍼널은 [docs/brand/decisions.md](../brand/decisions.md).

---

## #1 가치 = 안심 구독

월 ~1200 설득 문장은 **기능 목록이 아니라** “전화 안 해도 된다”.  
SoT: [thesis.md](thesis.md).

## #2 결제 주체 = 보호자

피보호자 마찰(알람·감시감)을 줄이는 것이 구독 유지의 전제.  
감시·점수·분수 UI로 보호자만 편하게 만들지 말 것.

## #3 신뢰 먼저, 예쁨 나중

gates §0(Realtime·stuck·알람·원격 푸시) PASS 전에  
위젯·다이제스트·브랜드 컷·퍼널 폴리시를 **유료 필수**로 올리지 말 것.

## #4 Soft escalate만

미복용 안부는 worried / soft 넛지.  
stuck 배너 + 빨간 경고 **병행 금지** (brand #4A와 동일 정신).

## #5 성공 피드백은 하루 단위

개별 약 체크마다 캐릭터/폭죽 없음 (brand #1).  
유료 미끼로 F3(개별 성공) 부활 금지.

## #6 유료에 넣지 말 것

- AI 약·질환 상담  
- 통계 대시보드 · 배지 스트립  
- “광고 제거”만 premium  
- 처방전 OCR 등 “있어 보이는” 부기능 (안심 루프보다 앞세우지 말 것)

## #7 브랜드 deferred ≠ 이 플랜

[docs/brand/deferred.md](../brand/deferred.md)는 브랜드 플랜 잔여.  
착수 시 brand README에 단계 추가 + [brand/gates.md](../brand/gates.md) 루프.  
**이 폴더 gates와 단계 번호를 섞지 말 것.**

## #8 원격 푸시 (care-push)

- **구현:** Edge `care-push` · mutation 성공 후 user JWT invoke · 토큰=`users.expo_push_token`
- **이벤트:** `taken` + `stuck_escalate` · 행위자 제외 동가족
- **가드:** EAS `projectId` 없으면 토큰 등록 skip · 푸시 실패해도 체크/stuck DB는 유지
- **후속:** DB webhook 트리거 · 다중 기기 토큰
- G0.4 **실기기 수신** 확인 전 가짜 PASS 금지
- **G0.4 보류 (2026-08-06):** 로컬 Edge→`exp.host` DNS 실패 · Android FCM/`google-services` 미정합으로 토큰 자동 등록·수신 E2E 미완. **가짜 PASS 아님.** 착수 조건: FCM 자격+재빌드 + Edge 아웃바운드 DNS 정상 후 [samsung-fsi-care-push-test.md](samsung-fsi-care-push-test.md) T4

## #10 Glance 표면 (Gate 1)

- **표면:** OS 홈 위젯 아님. 보호자 **고정/교체 알림** 한 줄 (`이름 · memberStatusLabel`)
- **Android:** Notifee `ongoing` · 채널 `care-glance` · importance LOW
- **iOS:** 동일 notificationId로 내용 교체 (OS상 진짜 고정 불가 → 동등 표면)
- **Stale:** 최대 30분 또는 TAKEN/stuck/포그라운드 시 갱신
- **멤버 여러 명:** 알림 1개 — 안부(`hasUnackedAlert`) 우선, 없으면 첫 피보호자

## #11 주간 안부 채널 (Gate 2)

- **채널:** **인앱만** (가족 탭 카드). 주간 푸시 다이제스트는 후속
- **내용:** 복약 대략 문장 + 특이일(놓침·BAD)만. 통계 대시보드 금지
- **스팸:** `week_start`(KST) 기준 주당 1노출 · dismiss 후 같은 주 재노출 없음 · 설정 옵트

## #9 약 목적 태그 (purpose)

- **Gate 0 전부 PASS 전 구현 금지** (스키마·UI 포함). Gate 1 필수 아님 · 3순위 later
- **단일** `purpose` 선택 · 등록 필수 아님 · ATC/다중 자유 태그 금지
- 인앱 통계 대시보드·배지로 쓰지 말 것 (#6)
- SoT: [med-purpose-tags.md](med-purpose-tags.md)
