---
name: git-pr
description: >-
  현재 브랜치 변경을 보고 PR 본문 마크다운 파일을 생성한다.
  Use when the user invokes @git-pr or asks for a PR markdown with the git-pr skill.
disable-model-invocation: true
---

# git-pr

`@git-pr` 호출 = **PR 본문 `.md` 파일만 생성**. `gh pr create` / push / 커밋하지 않는다.

## 1. Inspect (병렬)

```bash
git status
git branch -vv
git log --oneline main..HEAD 2>/dev/null || git log --oneline master..HEAD
git diff main...HEAD 2>/dev/null || git diff master...HEAD
git log --oneline -15
```

기본 브랜치를 못 찾으면 `git merge-base` / remote HEAD로 추정.

## 2. Write md

템플릿: [pr-template.md](pr-template.md)

기본 경로: 레포 루트 `pr-body.md`  
사용자가 경로를 주면 그 경로 사용.

- 템플릿 섹션을 채운다 (빈 섹션은 `N/A` 또는 해당 Changes 줄 삭제)
- **덮어쓰기** OK (기존 `pr-body.md` 있으면 갱신)
- 파일을 git에 add/commit 하지 않는다

## 3. Report

작성 경로 + 제안 PR 제목 한 줄만 보고.

예:

```
wrote: pr-body.md
title: feat(mobile): 설정 가족 관리와 초대 패널
```
