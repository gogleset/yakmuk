# Commit message template

```
<type>(<scope>): <요약>

<본문 — 선택>
```

## Type

| type | 언제 |
|------|------|
| `feat` | 사용자/도메인 기능 추가·확장 |
| `fix` | 버그 수정 |
| `docs` | 문서·CONTRACT·DECISIONS·PRD만 |
| `chore` | 도구·ignore·포맷·lockfile·스크립트·agents |
| `refactor` | 동작 동일, 구조만 정리 |
| `test` | 테스트 추가·수정 |
| `style` | 포맷/린트만 (동작 무관) |

## Scope (선택)

`mobile` · `supabase` · `loop` · `scripts`

스코프 없으면 `docs: …`처럼 type만.

## 제목

- 50자 내외, 한 줄, 한국어
- **why** 중심 (“연결”, “반영”, “맞추기”, “정리”)
- 끝 마침표·이모지·대괄호 금지

## 본문

동기/트레이드오프 1–3줄. 파일 나열 금지.

## 예시

```
feat(mobile): 홈·가족·설정 화면과 Expo Router 연결
```

```
feat(supabase): 도메인 스키마·family_alerts·loop-trigger 추가
```

```
chore(mobile): Prettier 포맷 정리
```

```
docs: pre 단계 IA·스키마·체크리스트 진행 상태 반영
```

```
feat(mobile): 설정에서 가족 초대·멤버 관리

가족장이 설정 플로우에서 초대 코드를 바로 다루게 한다.
```
