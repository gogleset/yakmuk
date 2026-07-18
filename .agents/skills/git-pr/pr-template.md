# Pull request body template

`pr-body.md`에 아래 골격을 채운다. 맨 위에 제안 제목을 HTML 주석으로 넣는다.

```markdown
<!-- title: feat(mobile): <한 줄 제목> -->

## Summary
- <이 PR이 하는 일 1>
- <이 PR이 하는 일 2>

## Changes
- **mobile**: <없으면 이 줄 삭제>
- **supabase**: <없으면 삭제>
- **docs/loop**: <없으면 삭제>

## Test plan
- [ ] <수동/로컬 검증>
- [ ] <해당 시> `supabase db reset` 후 RPC/에러 문구 확인
- [ ] <해당 시> Expo에서 해당 화면·플로우 한 바퀴

## Notes
- N/A
```

## 규칙

- Summary = why + outcome (파일명 나열 금지)
- Changes = 영역별 한 줄
- Test plan = 실제로 돌릴 체크만
- migration 있으면 LIMITS/ERRORS 동기화 언급
- 시크릿·로컬 URL·개인정보 금지
