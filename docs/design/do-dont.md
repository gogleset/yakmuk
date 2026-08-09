# Design — Do / Don’t

← [README](README.md)

## Do

- 첫 화면: 브랜드 + 안부 한 일 + 짧은 CTA
- 세이지 워시에 톤을 맡기기 (현행 hex는 틸 — 리샘플 후)
- 브랜드 순간은 콕이 컷으로 (F1–F7)
- 정식 컷 교체 시 `assets/koki` 파일명 유지
- 라이트/다크 모두에서 “따뜻한 신뢰”가 같은지 검증
- 설명 없이 직관 — 힌트는 placeholder / empty state
- 아이콘 네비는 텍스트 라벨 없이
- 약 CRUD는 BottomSheet progressive

## Don’t

- 병원 순수 블루 / 퍼플 그라데이션
- 웜크림 + 테라코타 AI 클리셰
- 다크 네온·글로우·순검 배경
- 필 클러스터, 통계 스트립, 배지 과다로 불안 UI
- “다 먹음” 캘린더 도트는 `sky` — CTA success와 구분. 네온 블루 금지
- **border** — focus·**Tone outline**(케어 BAD/stuck) 외에는 쓰지 않음. 계층용 카드/divider 윤곽 금지
- **설명 문구 남발** — 라벨·레이아웃으로 충분한데 Caption/Body로 풀어쓰기
- **아이콘 + 중복 라벨** — `← 뒤로`, `× 닫기` 등 아이콘 옆 보조 텍스트
- 홈 본문·MedRow에 콕이 상시 (empty 카드·오늘 배너·streak 슬롯만 허용)
- Worried를 공포/알람 UI로 (안부만)
- 시트 긴 설명 카피 이식
- **약 등록/수정을 풀페이지 퍼널로 강제**
- FunnelShell을 PageSheet로 만들기
