# yakmuk — 약콕

가족 건강 안부와 실시간 복약 현황을 잔소리 없이 챙기는 모바일 서비스.

현재 stage: **pre** · store: **local-supabase** · app: [`android-app/`](android-app/) (Kotlin Compose)  
RN [`mobile/`](mobile/) = **freeze 스펙** (기능 추가·삭제 금지).

## 빠른 시작

1. Docker Desktop 실행  
2. `supabase start`  
3. Android:

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home
./gradlew -p android-app :app:assembleDebug
```

에뮬: URL `http://10.0.2.2:54421` (debug 기본). 실기기: LAN IP로 재빌드.  
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
- **pre**: Kotlin Android + local Supabase · 보호자 OAuth/개발로그인 · 피보호자 코드/QR(닉네임 보호자 설정)
- **prod**: hosted · Play · 심사 (iOS 나중에)
