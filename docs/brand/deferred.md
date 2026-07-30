# 보류 · 후속 백로그

← [README](README.md)

브랜드 플랜 0–8 **닫힘** 이후에도 안 한 것.  
착수 시 README에 **새 번호 단계**를 추가하고 [goals.md](goals.md) 게이트 루프로 돌린다. 이 문서만 보고 몰래 넣지 말 것.

잠긴 결정: [decisions.md](decisions.md) (#1 `happy`, #8 soft 틸)

---

## 상태 (2026-07-30)

| 항목 | 지금 | 다음 |
|------|------|------|
| F8 예약컷 UI | `pill`/`cheer`/`lantern`/`heart` PNG + require 맵만 | 훅 정하면 beat로 연결 ([flows.md](flows.md) F8) |
| `happy` UI | 에셋만 (#1) | 강화 beat 확정 후 (개별 체크 금지 유지) |
| 퍼널 P6 | 홈 컨디션 인라인 | FunnelShell 승격 ([funnels.md](funnels.md) P6) |
| 정식 콕이 컷 | placeholder PNG | 동일 파일명 overwrite → 재빌드만 |
| soft 틸 hex | **확정** `brand #4C8478` 등 (#8) | — |
| app.json display name | `약먹었약`/scheme 유지 (#6B 제외) | rename 범위 확장 시 별도 결정 |

---

## 권장 착수 순서 (스펙)

1. **정식 컷 overwrite** — UI 변경 없음, 체감 최대  
2. ~~sage 리샘플~~ — soft 틸 확정 (#8)  
3. **P6** — 입력 패턴이 FunnelShell과 맞을 때  
4. **F8 / happy** — beat 훅·카피 확정 후 (flows 갱신 먼저)

병렬 가능: 1∥2. 3·4는 셸·beat 규칙 재확인.

---

## 범위 밖 잔여 (선택 청소)

G6 rename 범위 밖이라 남아 있음. 필요하면 별 커밋.

- `loop/README.md`, `loop/pre/STAGE.md`, `loop/prod/STAGE.md` — `약먹었약`
- `docs/brand/gap.md` · `flows.md` 등 — **과거 갭 서술** (의도적 before)
- `supabase/migrations/*` 주석 — 히스토리 유지 권장

---

## 하지 말 것 (그대로)

- Home/MedRow 상시 콕이  
- 개별 약 체크마다 `happy`  
- stuck 배너 + `worried` 병행  
- FunnelShell = PageSheet  
- 약 추가·수정을 풀페이지 퍼널로 되돌리기 (BottomSheet progressive가 SoT — decisions #5B)  
- F8을 “자리 있으니” 임의 연결
