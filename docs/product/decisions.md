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

- **구현:** Edge `care-push` · mutation 성공 후 user JWT invoke · 토큰=`users.push_token` (구 `expo_push_token`, 2026-09-08 rename. 값은 Android FCM). Edge는 **FCM HTTP v1** (`FIREBASE_SERVICE_ACCOUNT`). Expo `exp.host` 아님.
- **이벤트:** `taken` + `stuck_escalate` · 행위자 제외 동가족
- **가드:** 토큰 없으면 skip · 서비스 계정 없으면 skip · 푸시 실패해도 체크/stuck DB는 유지
- **후속:** DB webhook 트리거 · 다중 기기 토큰
- G0.4 **실기기 수신** 확인 전 가짜 PASS 금지
- **G0.4 보류:** 에뮬 T4 PASS (2026-09-08, Pixel 7+8 · `sent: 1`). **실기기 미완.** 칼럼 `push_token` 고정. 플레이북 [samsung-fsi-care-push-test.md](samsung-fsi-care-push-test.md) T4.

## #10 Glance 표면 (Gate 1)

- **표면:** OS 홈 위젯 아님. 보호자 **고정/교체 알림** 한 줄 (`이름 · memberStatusLabel`)
- **Android:** Kotlin `CareGlanceNotifier` ongoing (`care-glance`, LOW). RN 스펙은 Notifee 동일 채널
- **iOS:** 동일 notificationId로 내용 교체 (OS상 진짜 고정 불가 → 동등 표면)
- **Stale:** 최대 30분 또는 TAKEN/stuck/포그라운드 시 갱신
- **멤버 여러 명:** 알림 1개 — 안부(`hasUnackedAlert`) 우선, 없으면 첫 피보호자

## #11 주간 안부 채널 (Gate 2)

- **채널:** **인앱만** (가족 탭 카드). 주간 푸시 다이제스트는 후속
- **내용:** 복약 대략 문장 + 특이일(놓침·BAD)만. 통계 대시보드 금지
- **스팸:** `week_start`(KST) 기준 주당 1노출 · dismiss 후 같은 주 재노출 없음 · 설정 옵트

## #12 1차 출시 = 로컬 알람 (2026-09)

- 사용자 = **본인 폰만**. 저장 = 기기 Room. release에 Supabase / FCM / OAuth **없음**
- 가족 탭 = 정적 미리보기 **한 화면**. 스토어 스크린샷·리스팅에 가족 안부 금지
- 출시 게이트 = [gates.md](gates.md) **S5 실기기 FSI**. G0.4 원격 푸시·stuck/care-push = **2차**
- 계정 없음 → 웹 탈퇴 URL 없음. 설정 「모든 기록 삭제」
- 개인정보처리방침 URL = `BuildConfig.PRIVACY_POLICY_URL` (빈 값으로 스토어 올리지 않음)
- 폰 바꾸면 기록 사라짐. 1차 UI에서 클라우드 백업 약속 금지

## #9 약 목적 태그 (purpose)

- **1차 로컬 알람:** 온보딩에서 optional 단일 선택 (등록 필수 아님). 라벨 SoT [med-purpose-tags.md](med-purpose-tags.md)
- 가족 루프 트랙의 “Gate 0 전 구현 금지”는 **#12가 대체**. 인앱 통계 대시보드·배지는 여전히 금지 (#6)
- ATC/다중 자유 태그 금지
