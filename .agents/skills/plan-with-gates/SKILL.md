---
name: plan-with-gates
description: >-
  DEPRECATED as skill — use rule `.agents/rules/plan-with-gates.mdc` (alwaysApply).
  Template still at `.agents/rules/plan-with-gates-TEMPLATE.md`.
  @plan-with-gates redirects here for discoverability.
---

# plan-with-gates → rule로 승격됨

이 스킬은 **규칙으로 승격**했다. 에이전트는 스킬 대신 아래를 따른다.

- 규칙: [`.agents/rules/plan-with-gates.mdc`](../../rules/plan-with-gates.mdc) (`alwaysApply: true`)
- 템플릿: [`.agents/rules/plan-with-gates-TEMPLATE.md`](../../rules/plan-with-gates-TEMPLATE.md)

CreatePlan / Plan mode / 다단계 플랜 요청 시 **rule을 읽고** Part A→B · S-step · 회귀 게이트를 적용한다.
