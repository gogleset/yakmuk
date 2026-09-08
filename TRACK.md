# TRACK — yakmuk (약콕)

- track: loop-engineering
- stage: **pre**
- store: local-supabase
- app: **Kotlin Compose Android** (`android-app/`)
- spec: RN [`mobile/`](mobile/) **freeze** (2026-09-08) — 기능 추가·삭제 금지
- base_ref: `ai-engineering-base/tracks/loop-engineering/pre`
- mvp: **skipped** — 가족 멀티클라 테스트에 SQLite-only 부적합

## Notes

- 제품: 가족 건강 안부 · 실시간 복약 ("약콕")
- **지금:** `android-app/` + `supabase start` + 루프 7축. RN은 패리티 스펙만.
- Auth: **보호자 OAuth** · **피보호자 코드/QR** (초기 nickname은 보호자가 설정)
- **다음(prod):** hosted Supabase + Play · OAuth/딥링크 프로덕션 + bound 하드캡 · [loop/prod/](loop/prod/)
- **제품 목표(안심 루프):** [docs/product/](docs/product/) — 현재 단계 `0` 신뢰(Realtime·stuck·알람·원격 푸시)
- 원격 푸시 토큰 칼럼: `users.push_token` (구 `expo_push_token`). Edge 발송 = FCM HTTP v1
- Kotlin 이전: S1–S8 freeze — [docs/migration/kotlin-android-checklist.md](docs/migration/kotlin-android-checklist.md)
- G0.4: 에뮬 T4 PASS (2026-09-08) · **실기기 보류** (가짜 PASS 아님)
- 기획: `~/Downloads/prd_yakmeogeotyak_mvp.pdf`, `prd_yakmeogeotyak_mvp_v1.1.pdf`
- 요약: [docs/prd/SUMMARY.md](docs/prd/SUMMARY.md)
- 진입: [loop/pre/](loop/pre/) · 앱: [`android-app/`](android-app/) · 스펙: [`mobile/`](mobile/) · DB: [`supabase/`](supabase/)
