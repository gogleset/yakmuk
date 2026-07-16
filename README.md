# yakmuk — 약먹었약

가족 건강 안부와 실시간 복약 현황을 잔소리 없이 챙기는 모바일 서비스.

현재 stage: **pre** · store: **local-supabase** · app: [`mobile/`](mobile/)

## 빠른 시작

1. Docker Desktop 실행  
2. `supabase start` → anon key를 `mobile/.env`에  
3. `cd mobile && pnpm install && pnpm start`  

상세: [mobile/README.md](mobile/README.md)

## 문서

| 문서 | 용도 |
|------|------|
| [TRACK.md](TRACK.md) | 트랙·스테이지 |
| [loop/pre/](loop/pre/) | CONTRACT · CHECKLIST |
| [docs/prd/SUMMARY.md](docs/prd/SUMMARY.md) | PRD |

## Stage

- ~~mvp~~ 스킵
- **pre**: RN + local Supabase · 보호자 OAuth/개발로그인 · 피보호자 코드/QR(닉네임 보호자 설정)
- **prod**: hosted · EAS · 심사
