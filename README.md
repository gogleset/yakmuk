# yakmuk — 약먹었약

가족 건강 안부와 실시간 복약 현황을 잔소리 없이 챙기는 모바일 서비스.

현재 stage: **pre** · store: **local-supabase** · client: **Expo RN**  
(mvp SQLite 단계는 **스킵**)

## 시작점

| 문서 | 용도 |
|------|------|
| [TRACK.md](TRACK.md) | 트랙·스테이지 |
| [loop/README.md](loop/README.md) | 7축 한눈에 |
| [loop/pre/](loop/pre/) | CONTRACT · CHECKLIST · DECISIONS |
| [docs/prd/SUMMARY.md](docs/prd/SUMMARY.md) | PRD · FR 매핑 |

## Stage

- ~~mvp~~ 스킵 (로컬 SQLite로는 가족 연동 테스트 불가)
- **pre**: RN + local Supabase · 보호자 OAuth · 피보호자 코드/QR(닉네임은 보호자 설정) · Realtime · 2시뮬
- **prod**: hosted · EAS · OAuth/QR 프로덕션 · 하드캡 · 심사 ([loop/prod/](loop/prod/))
