# TRACK — yakmuk (약먹었약)

- track: loop-engineering
- stage: **pre**
- store: local-supabase
- base_ref: `ai-engineering-base/tracks/loop-engineering/pre`
- mvp: **skipped** — 가족 멀티클라 테스트에 SQLite-only 부적합

## Notes

- 제품: 가족 건강 안부 · 실시간 복약 ("약먹었약")
- **지금:** Expo RN + `supabase start` + 루프 7축
- Auth: **보호자 OAuth** · **피보호자 코드/QR** (초기 nickname은 보호자가 설정)
- **다음(prod):** hosted Supabase + EAS + OAuth/딥링크 프로덕션 + bound 하드캡 · [loop/prod/](loop/prod/)
- 기획: `~/Downloads/prd_yakmeogeotyak_mvp.pdf`, `prd_yakmeogeotyak_mvp_v1.1.pdf`
- 요약: [docs/prd/SUMMARY.md](docs/prd/SUMMARY.md)
- 진입: [loop/pre/](loop/pre/)
