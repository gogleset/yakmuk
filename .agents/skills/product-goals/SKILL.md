---
name: product-goals
description: >-
  yakmuk(약콕) 제품 목표·안심 구독 우선순위 문서(docs/product/)를 읽고 따른다.
  Use when the user asks about 유료, 월 1200, 안심, 우선순위, 뭐부터, glance, 위젯,
  주간요약, stuck/푸시 신뢰, product goals, or @product-goals.
---

# Product goals (안심 루프)

구현 전에 **제품 축** SoT를 연다. 브랜드 플랜(`docs/brand/`)과 **별축**.

## When

- 유료·가격·“뭐부터 만들지”·안심/푸시/위젯/주간요약
- 제품 우선순위 플랜 (plan-with-gates와 함께)
- `@product-goals`

## Read (순서)

1. [docs/product/README.md](../../../docs/product/README.md) — 지도
2. [thesis.md](../../../docs/product/thesis.md) — 가치·무료/유료
3. [gates.md](../../../docs/product/gates.md) — **현재 단계**·게이트
4. [priorities.md](../../../docs/product/priorities.md) · [decisions.md](../../../docs/product/decisions.md)

다단계 구현 플랜이면 [.agents/rules/plan-with-gates.mdc](../../rules/plan-with-gates.mdc)도 적용.

## Rules

- product **gates 현재 단계** PASS 전 다음 단계 착수 금지
- 브랜드 deferred(컷·퍼널 P6 등)를 안심 필수에 끌어오지 말 것
- AI 상담·통계 대시보드·개별 체크 happy를 유료 미끼로 제안하지 말 것
- 원격 푸시 인프라 없으면 G0.4 가짜 PASS 금지 → 범위 밖+가드

## Don’t

- `docs/brand/gates.md` 단계 번호와 `docs/product/gates.md` 번호를 섞기
- 이 스킬만으로 코드 변경 — 플랜/게이트 통과 후 해당 스킬·규칙으로 구현
