# Design — Character (콕이)

← [README](README.md)

## 4. Character — 콕이

- 이름: 콕이 · 역할: 간호요정 · 약콕의 얼굴
- 스타일: soft 3D clay, 투명 PNG, 드롭섀도 최소화
- 라이브러리: Expr(happy/thinking/cheer/worried) + Action(pill/clipboard/heart/lantern)
  - UI slots(welcome/thinking/happy/done/family/streak)
- 배치 화이트리스트: Welcome, Empty, Success, Done, Family, Streak(조건부), Stuck(worried), **컨디션 선택**(happy/thinking/worried)
- Stuck: Worried 컷으로 안부 표현 (시트 UI열 외 — 제품 규칙)
- Placeholder: `mobile/assets/koki/{slot}.png` — 정식 컷은 동일 파일명 overwrite
- 금지: 탭 아이콘 대체, MedRow 장식, 런타임 파티클, 설명 문단

인벤토리 상세 → [docs/brand/gap.md](../brand/gap.md)
