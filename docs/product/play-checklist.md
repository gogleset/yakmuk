# Play 제출 체크리스트 (1차 · 로컬 알람)

코드 밖. 빈 칸은 제출 전에 채운다.  
앱 정체: **복약 알림**. 가족 안부는 리스팅·스크린샷에 쓰지 않는다.

출시 코드 게이트: [gates.md](gates.md) **S5** (실기기). S5 미실행인 채 스토어 올리지 말 것.

---

## 콘솔 · 패키지

| 항목 | 값 |
|------|-----|
| 패키지 | `com.jinlabs.yakok` |
| 지원 메일 | `support@yakmuk.app` |
| 테스트 트랙 | 클로즈드 · **12명 × 14일** (달력. 코드와 무관) |
| 테스터 | |

---

## Data safety

| 항목 | 기입 |
|------|------|
| Health 수집 | **미수집** (약·체크는 기기에만. 개발자 서버로 안 감) |
| Health 선언 | Play Health 정책에 맞게 **앱 카테고리/선언** (복약 알림) |
| 계정 | 없음 → 계정 삭제 웹 URL **해당 없음** |
| 위치/연락처 | 없음 |

---

## 권한 목적 (심사 문구)

| 권한 | 목적 |
|------|------|
| Exact alarm | **약 시각에 알림** |
| Full-screen intent | **잠금화면에서 약 알람** (한 탭 체크) |
| Notifications | 약 알람 |
| Boot | 재부팅 후 알람 복구 |
| Internet | 개인정보처리방침 페이지만 (약 검색 키는 넣지 않음) |

---

## 개인정보처리방침

| 항목 | |
|------|--|
| URL | `android-app/local.properties` → `PRIVACY_POLICY_URL=` (HTTPS) |
| 내용 | 건강 정보는 **이 기기에만**. 클라우드 백업 없음. 폰 바꾸면 사라짐 |
| 가드 | URL이 비면 설정 행은 두되 **스토어에 올리지 않음** (`BuildConfig.PRIVACY_POLICY_URL`) |

---

## 스토어 자산

| 항목 | 규칙 |
|------|------|
| 제목/짧은 설명 | 복약 알림. “가족 안부” 판매 금지 |
| 스크린샷 | **온보딩 · 홈 · 알람만**. 가족 미리보기 올리면 미완성으로 보임 |
| 기능 그래픽 | 약 알람 |

---

## 빌드 가드

제출 전:

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home
./gradlew -p android-app :core:test :app:assembleRelease
```

- release APK에 `supabase` / `firebase` 클래스 없음
- Play 업로드용 **서명 키스토어** 필요 (`assembleRelease`는 현재 unsigned)
- `DATA_GO_KR_SERVICE_KEY` 비움 (검색 UI 숨김)
- `PRIVACY_POLICY_URL` 채움

---

## 올리지 말 것

- 클라우드 백업·가족 실시간 안부 약속
- 가족 탭 스크린샷
- Health 데이터를 “수집함”으로 표시
- S5 실기기 미실행 APK를 production에 승격
