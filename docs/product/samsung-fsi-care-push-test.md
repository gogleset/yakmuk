# 삼성 실기기 테스트 — FSI · 실약 · care-push

게이트: [gates.md](gates.md) G0.3 / G0.4  
코드 전제: fp `clk4`, FSI denied UX (S1–S2 완료)

**2026-08-06:** T1/T2 실기기 PASS (사용자 확인) · Metro에 `clk4`·`alarmClock scheduled`·care-push invoke 확인

---

## 0. 사전

| 항목 | 체크 |
|------|------|
| 개발 빌드 · Metro · 피보호자 로그인 | [x] |
| 정확 알람 ON | [x] `exact-alarm enabled` |
| FSI ON | [x] `fsi-permission allowed` |
| `clk4` in-sync / scheduled | [x] |
| LAN Supabase | [x] `192.168.35.83:54421` |
| 배터리 절전 예외 | [x] (FSI 성공으로 간주) |

---

## DEV — 설정 「알림」 섹션

| UI | 동기화 |
|----|--------|
| Section **알림** → **기본 알림** Switch | OS 알림 권한 |
| Section **알림** → **풀페이지 알림** Switch (Android) | 시스템 FSI (`canUseFullScreenIntent`) |
| 알람·리마인더 단독 row | 제거 — 기본 ON 시 exact 꺼져 있으면 Alert |

T1: 스위치 ON/OFF ↔ 시스템 설정 왕복 후 상태 일치.

---

## T1 — Settings FSI (2depth 스위치)

| 결과 | **PASS** (구 UI) · 2depth는 재확인 |
| 일시 | 2026-08-06 |

---

## T2 — 실약 시각 FSI

Metro: med **10** · `alarmClock scheduled` · `10|daily|16:29|clk4` · TAKEN 후 care-push 호출

| 결과 | **PASS** |
| med · 시각 | 10 · 16:29 (및 임시 슬롯) |
| 일시 | 2026-08-06 |
| 게이트 | **G0.3 후보 PASS** |

---

## T3 — FSI 권한 꺼짐 UX

| 결과 | 미실행 |
| 일시 | |

---

## T4 — care-push 2클라

### 로그로 이미 보이는 것

- [x] `POST .../functions/v1/care-push` kind=`taken` (피보호자 → Edge)
- [ ] Expo 전송 성공 — Edge **503** `name resolution failed` (`exp.host` DNS/네트워크)
- [ ] 보호자 `expo_push_token` — FCM 없어 자동 등록 실패

| 결과 | **보류** |
| 막힌 지점 | 1) ~~패키지 불일치~~ → 앱 `package`를 `com.jinlabs.yakok`으로 맞춤 2) Edge→Expo DNS 3) EAS FCM V1 service account |
| 일시 | 2026-08-06 |

`app.json`에 `googleServicesFile: ./google-services.json` 연결됨. **패키지 맞는 파일로 교체 후** `npx expo run:android` 재빌드 필수.

### expo_push_token 수동 넣기

앱이 FCM 없이도 DB에만 넣으면, Edge가 그 토큰으로 Expo에 쏘는 경로를 시험할 수 있다.  
**가짜 문자열은 안 됨** — 실제 `ExponentPushToken[...]` 필요.

**1) 토큰 구하기**

- FCM/`google-services.json` 붙인 빌드에서 한 번 성공한 토큰, 또는
- 다른 Expo 프로젝트/기기에서 이미 발급된 토큰 복사, 또는
- (임시) Expo 푸시 도구에 쓸 수 있는 유효 토큰

**2) 보호자 row에 UPDATE**

```sql
-- 가족 멤버 확인
select id, nickname, role, expo_push_token
from public.users
where family_id = '74bbba22-a283-4cc8-9097-f16200818545';

-- 보호자 id로 교체
update public.users
set expo_push_token = 'ExponentPushToken[여기에붙여넣기]'
where id = '<guardian-uuid>';
```

Studio: Table Editor → `users` → 보호자 행 → `expo_push_token` 편집도 동일.

**3) 다시 TAKEN**

피보호자에서 복용 체크 → care-push가 보호자 토큰으로 `https://exp.host/--/api/v2/push/send` 호출.

지금 Edge가 `name resolution failed`면 **토큰을 넣어도 실패**한다.  
`supabase functions serve` 컨테이너/호스트에서 `exp.host` 해석·아웃바운드가 되는지 먼저 고친다.

**정석:** Android FCM 자격 증명 + `googleServicesFile` → 앱이 알아서 `updateExpoPushToken` 호출. 수동 SQL은 우회 테스트용.

---

## 판정 요약

| 테스트 | 결과 | 게이트 |
|--------|------|--------|
| T1 | **PASS** | S3 |
| T2 | **PASS** | **G0.3** |
| T3 | 미실행 | |
| T4 | 보류 | G0.4 |
