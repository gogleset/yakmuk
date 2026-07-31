---
name: store-review-check
description: >-
  Scans yakmuk mobile code and store-related config for Apple App Store and
  Google Play rejection risks (privacy, account deletion, health claims,
  permissions, completeness, metadata). Use when the user invokes
  @store-review-check or asks about 심사, App Store, Play Store submission,
  or store rejection.
---

# Store review check (yakmuk)

코드·카피·앱 설정·prod 루프 문서를 스캔해 **스토어 심사 리젝 후보**를 리포트한다.  
법률 자문이 아니다. 구현을 勝手히 고치지 않는다 (리포트만).

## When

- `@store-review-check`
- 심사 / App Store / Play 제출 / store rejection / 리젝 대비

## Steps

1. **체크리스트 로드** — [rejection-checklist.md](rejection-checklist.md)
2. **스캔** (존재하는 경로만; 없으면 `n/a` + 근거 없음)

| 소스 | 용도 |
|------|------|
| `mobile/app/**` | 라우트·진입 |
| `mobile/src/pages/**` · `features/**` · `entities/**` · `widgets/**` | 플로우·탈퇴·권한·피드 |
| `mobile/src/shared/copy/**` · `shared/config/support.ts` | 카피·legal URL |
| `mobile/app.json` · `app.config.*` · `eas.json` · `infoPlist` / Android permissions | usage string·권한·SDK |
| `loop/prod/*` · `docs/prd/*` | 심사·탈퇴·약관 메모 |

3. **매핑** — 각 체크리스트 ID → `pass` | `fail` | `risk` | `n/a` + 파일 경로
4. **심각도**
   - **Critical** — 제출 블로커 (null privacy URL, 필수 계정 삭제 부재, Play 웹 삭제 URL 없음, 명확한 의료 과대 클레임)
   - **High** — 리젝 가능성 큼 (4.8, purpose 없는 권한, Data safety 불일치, legal stub)
   - **Medium** — 프로세스/메타 (Review Notes, closed testing, 스크린샷, target API 확인)
5. **출력** — [report-template.md](report-template.md)를 **섹션 빠짐없이** 채움  
   기본 저장: `docs/store/store-review-findings.md` (디렉터리 없으면 생성). 사용자가 경로를 주면 그곳.
6. **채팅 요약** — Critical/High만 짧게; 전체는 저장 파일

## Rules

- 한국어 리포트. 근거는 **경로·심볼** (예: `SUPPORT.privacyUrl === null`)
- “있을 것 같음” 금지 — 코드/문서에 없으면 `fail`/`risk`/`n/a`
- 시크릿·실계정 비밀번호·Review 데모 비번을 파일에 쓰지 않음 (존재 여부·위치만)
- “법률상 문제없음” / “심사 통과 보장” 단정 금지
- 체크리스트 항목을 건너뛰지 않음 — Coverage 표에 전부 상태 기입

## Don’t

- 구현·리팩토링·마이그레이션
- Console 폼을 코드만으로 pass 처리 (Out of repo에 남김)
- 날짜 고정 SDK 버전을 “영구 규칙”으로 적기 → “제출 시점 공식 요구 확인”

## Related

- Checklist: [rejection-checklist.md](rejection-checklist.md)
- Template: [report-template.md](report-template.md)
- Prod: [loop/prod/CONTRACT.md](../../../loop/prod/CONTRACT.md)
- 진입: [AGENTS.md](../../../AGENTS.md)
