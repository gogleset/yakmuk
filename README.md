# yakmuk — 약콕

가족 건강 안부와 실시간 복약 현황을 잔소리 없이 챙기는 모바일 서비스.

현재 stage: **pre · 로컬 알람 1차** · store: **device-room** · app: [`android-app/`](android-app/) (Kotlin Compose)  
RN [`mobile/`](mobile/) = **freeze 스펙** (기능 추가·삭제 금지).

## 빠른 시작

1차(본인 폰 알람)는 서버 없음. Room만.

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home
./gradlew -p android-app :core:test :app:assembleDebug
```

Play 체크리스트: [docs/product/play-checklist.md](docs/product/play-checklist.md)  
실기기 S5: [docs/product/local-alarm-device-test.md](docs/product/local-alarm-device-test.md)  
RN 스펙 참고만: [mobile/README.md](mobile/README.md)

## 문서

| 문서 | 용도 |
|------|------|
| [AGENTS.md](AGENTS.md) | 에이전트·아키텍처 진입점 |
| [TRACK.md](TRACK.md) | 트랙·스테이지 |
| [docs/migration/kotlin-android-checklist.md](docs/migration/kotlin-android-checklist.md) | Kotlin 이전 S1–S8 |
| [loop/pre/](loop/pre/) | CONTRACT · CHECKLIST |
| [docs/prd/SUMMARY.md](docs/prd/SUMMARY.md) | PRD |
| [docs/product/](docs/product/) | 제품 목표 · 안심 구독 우선순위 |
| [docs/brand/](docs/brand/) | 콕이 브랜드 플랜 (닫힘 → deferred) |
| [docs/design/](docs/design/README.md) | 시각·톤 (틸 · 라이트/다크) |

## Stage

- ~~mvp~~ 스킵
- **pre / 로컬 알람 1차**: 기기 Room · 온보딩 · FSI 약 알람 · 가족 탭 미리보기
- **2차**: hosted Supabase · 로그인 · 가족 안부 · 원격 푸시
- **prod**: Play · 심사 (iOS 나중에)
