# TRACK — yakmuk (약콕)

- track: loop-engineering
- stage: **pre** · **로컬 알람 1차**
- store: **device-room** (1차. 호스트/로컬 Supabase·FCM은 2차)
- app: **Kotlin Compose Android** (`android-app/`)
- spec: RN [`mobile/`](mobile/) **freeze** (2026-09-08) — 기능 추가·삭제 금지
- family: **정적 미리보기 한 화면** (초대/피드/조인 없음)
- base_ref: `ai-engineering-base/tracks/loop-engineering/pre`

## Notes

- **지금(1차):** 본인 폰 복약 알람. 저장 = 기기 Room. 로그인·서버 없음.
- 가족 안부는 리스팅/스크린샷에 쓰지 않음. 탭은 미리보기 포스터만.
- 출시 게이트 = **S5 실기기 FSI** — [gates.md](docs/product/gates.md) · [local-alarm-device-test.md](docs/product/local-alarm-device-test.md)
- G0.4 원격 푸시·DayLoop/stuck/care-push = **2차**. 가짜 PASS 아님.
- Play 제출(코드 밖): [play-checklist.md](docs/product/play-checklist.md)
- RN은 패리티 스펙만. 새 기능은 `android-app/`만.

### 1차 S-step 게이트 (2026-09-11)

| Step | 명령 / 확인 | 결과 |
|------|-------------|------|
| S1 | `./gradlew -p android-app :core:test :app:assembleDebug` | **PASS** |
| S2 | S1 재실행. 에뮬: 온보딩 「나중에」→ 빈 홈+FAB | **PASS** |
| S3 | 에뮬 가족 탭 미리보기. invite/join/feed 없음. logcat 네트워크 에러 0 | **PASS** |
| S4 | `:app:assembleRelease` + APK에 supabase/firebase 클래스 없음 | **PASS** (unsigned release) |
| S5 | 실기기 FSI 한 탭 + 재부팅 + 비행기 모드 | **미실행** — 가짜 PASS 아님 |
| S6 | TRACK / gates / Play 체크리스트 | 이 문서 |

- 기획 요약: [docs/prd/SUMMARY.md](docs/prd/SUMMARY.md)
- 진입: [AGENTS.md](AGENTS.md) · 앱: [`android-app/`](android-app/) · 스펙: [`mobile/`](mobile/) · 2차 DB: [`supabase/`](supabase/)
