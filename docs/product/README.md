# 약콕 · 제품 목표 (안심 루프)

월 ~1200원급 **안심 구독** 관점의 제품 목표·우선순위.  
브랜드 플랜(`docs/brand/`, 0–8 **닫힘**)과 **별축** — 예쁨·beat가 아니라 **전화 안 해도 되는 신뢰**.

## 문서 지도

| 파일 | 내용 |
|------|------|
| [thesis.md](thesis.md) | 가치 한 줄 · 누가 왜 내나 · 무료/유료 경계 |
| [gates.md](gates.md) | 단계별 **목표·게이트** · 검토→실행 루프 |
| [priorities.md](priorities.md) | 보완 우선순위 표 · 근거(코드/체크리스트) |
| [decisions.md](decisions.md) | 잠긴 결정 · 하지 말 것 |

> 파일명 `gates.md` = 단계 게이트 SoT.  
> 브랜드도 같은 이름(`[docs/brand/gates.md](../brand/gates.md)`) — **폴더로 축 구분** (`product` vs `brand`).

## 다른 문서와의 관계

| 문서 | 역할 |
|------|------|
| [docs/brand/](../brand/) | 콕이 beat·퍼널·디자인 SoT (닫힘 후 → [deferred](../brand/deferred.md)) |
| [docs/prd/SUMMARY.md](../prd/SUMMARY.md) | MVP 범위·탭·P0 |
| [loop/pre/CHECKLIST.md](../../loop/pre/CHECKLIST.md) | 루프·Realtime·stuck 실검증 |
| [docs/flows/](../flows/) | 화면 플로우 브리프 (구현 스냅샷) |

**충돌 시:** `docs/product/decisions.md` > gates 게이트 > priorities 서술.  
브랜드 beat 규칙(`happy` 개별 금지 등)은 **brand decisions가 우선** — 이 폴더는 그걸 깨지 않는다.

## 한줄 결론

유료로 버티는 조건 = **새 탭이 아니라**  
`푸시·알람·stuck이 실기기에서 안 깨짐` → `한눈(glance)` → `주간 안부 요약`.

## 작업 순서

에이전트/사람이 이 폴더를 보고 착수할 때 **[gates.md](gates.md) 번호만** 따른다.  
매 단계: 목표 읽기 → 게이트 검토 → FAIL만 실행 → PASS 후 다음.

요약 우선순위만 보려면 [priorities.md](priorities.md).
