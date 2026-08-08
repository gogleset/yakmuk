# 로딩 스켈레톤 — 기록 축

← [README](README.md) · 가족 축: [skeleton-family.md](skeleton-family.md)

**로딩 ≠ empty.** empty·실패는 `Fallback`. 초기 `isLoading`만 Skeleton.

공통 bone: `shared/ui` `Skeleton`.

---

## 범위

| depth | 화면 | 경로 | 스켈레톤 | 비고 |
|-------|------|------|----------|------|
| 1 | 월 캘린더 | `/(tabs)/home` | **생략** | 셸 고정 · 마크만 지연 |
| 1 | 캘린더 아래 | 〃 | `TodayPanelSkeleton` | `medsQuery.isLoading` 시 empty 대신 |
| 1 | 과거일 패널 | 〃 | `PastDayPanelSkeleton` | 선택일 `isFetching` 시 |
| 2 | 약 추가 | `/add-medication` | **불필요** | 시트 즉시 |
| 2 | 약 상세/수정 | `/view-medication` · `/edit-medication` | `MedicationSheetSkeleton` | ActivityIndicator 교체 |
| 2 | 복약 알람 | `/medication-alarm` | `AlarmHeroSkeleton` + MedRow bone | |

`family-member`에서 진입하는 edit/add도 이 문서 시트 스켈레톤 재사용.

## 규칙

- pull-to-refresh: RefreshControl만
- 약 0개 **확정** 후: empty `Fallback` 유지
- 캘린더 도트 soft 스켈레톤: 기본 생략 (후속)
