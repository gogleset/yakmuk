# 로딩 스켈레톤 — 가족 축

← [README](README.md) · 기록 축: [skeleton-home.md](skeleton-home.md)

**로딩 ≠ empty.** empty·실패는 `Fallback`. 초기 `isLoading`만 Skeleton.

공통 bone: `shared/ui` `Skeleton` (`bg-surface-soft` · MOTION pulse).

---

## 범위

| depth | 화면 | 경로 | 스켈레톤 | 비고 |
|-------|------|------|----------|------|
| 1 | 케어 알림 | `/(tabs)/family` | `CareAlertSkeleton` | `min-h-[148]` |
| 1 | 주간 안부 | 〃 | `WeeklyDigestSkeleton` | viewer·opt ON·미dismiss만 |
| 1 | 멤버 그리드 | 〃 | `MemberGridSkeleton` | 2×2 bone |
| 1 | 피드 프리뷰 | 〃 | `FeedPreviewSkeleton` | 행 2~3 |
| 2 | 최근 소식 | `/family-feed` | `FeedListSkeleton` | 섹션+행 ×3~5 |
| 2 | 멤버 상세 | `/family-member/[id]` | `MedManageListSkeleton` | 캘린더 아래 |
| 2 | 가족 관리 | `/family-manage` | `MemberListRowSkeleton` · `InviteListSkeleton` | spinner 교체 |
| 2 | 초대 생성 | `/invite-create` | **불필요** | 로컬 퍼널 |

탭 헤더(날짜): 불필요.  
멤버→약 add/edit 시트: [skeleton-home.md](skeleton-home.md) `MedicationSheetSkeleton` 재사용.

## 규칙

- pull-to-refresh: RefreshControl만 · 본문을 스켈레톤으로 바꾸지 않음
- 확정 empty / 에러: 기존 `Fallback` / `FamilyCareAlertEmpty`
- 주간: 옵트 OFF·dismiss·비보호자 → 자리 없음 → 스켈레톤 없음
