# Design — Brand flows · Home

← [README](README.md)

## 5. Brand flows

구현 디테일 → [docs/brand/flows.md](../brand/flows.md)

| ID  | Beat       | Variant                  | 트리거                                                    |
| --- | ---------- | ------------------------ | --------------------------------------------------------- |
| F1  | 첫 만남    | welcome                  | Welcome 진입                                              |
| F2  | 기록 없음  | thinking                 | 기록 탭 empty — `Fallback` (콕이 + 설명 + round CTA) |
| F3  | (폐기)     | —                        | 개별 체크 — 쓰지 않음. 성공은 F6                          |
| F4  | 연속       | streak                   | 연속 all-done ≥3일 (KST) — **캘린더 영역**                |
| F5  | 가족       | family                   | 가족 empty / 초대                                         |
| F6  | 오늘 완료  | done                     | taken==total — 오늘 체크 배너 `done` + 시간대 리스트 유지 |
| F7  | stuck 안부 | worried                  | 보호자 pending/stuck                                      |
| F8  | 예약       | pill/cheer/lantern/heart | 미연결                                                    |

목업 SoT: [docs/brand/mocks/home-empty.png](../brand/mocks/home-empty.png) · [home-today-progress.png](../brand/mocks/home-today-progress.png) · [home-today-done.png](../brand/mocks/home-today-done.png) · [home-today-none.png](../brand/mocks/home-today-none.png)

## 5.1 Home (기록 탭)

탭 루트. **헤더 크롬 없음** (뒤로·설정 기어·날짜 타이틀 바 금지).  
**역할 대칭:** `family_leader` · `guardian` · `care_recipient` 모두 같은 `HomePage` (역할 분기 금지).

| 상태                    | 구성                                                                 | 비고                            |
| ----------------------- | -------------------------------------------------------------------- | ------------------------------- |
| 약 0개                  | `MonthHeader` + 캘린더 + 범례 + **세로** empty 스택 + pill CTA       | FAB 없음. CTA「첫 약 등록하기」 |
| 약 있음 · 오늘 선택     | 같은 캘린더 셸 + **스크롤 아래** 인사 배너·시간대·컨디션             | 별도 화면 아님. F6 배너. 개별 체크만 |
| 등록 있음·오늘 스케줄 0 | 캘린더 + empty 가로 카드 + **컨디션**                                | days_mask로 오늘 제외된 경우    |
| 과거일 선택             | 캘린더 + PastDay                                                     | streak(F4)는 캘린더 영역. FAB   |

- 상태 도트(약 있는 날 / 다 먹었어요 / 일부만 / 안 먹었어요) = **안부 이력**. compliance 히트맵·알람 빨강 금지 (`destructive`는 점 색만, 배너 아님)
- 시간대 = `scheduledTime` 클라 버킷 (새벽/아침/점심/오후/취침 전). **용량 optional** (`dose_amount` + `dose_unit` — 정/캡슐/ml 등). 이미지 없음 · 구분용 `color` 키 · 리스트 아이콘은 `dose_unit`→형태(미설정=알약)
- 컨디션 입력 = 오늘 체크 **스크롤 아래** secondary. 선택 UI = **콕이 원형 컷**(좋음 `happy` · 보통 `thinking` · 아픔 `worried`)
- 컨디션 **남긴 뒤** = 상단 인사 배너와 **가로 슬라이드**(스와이프 · `LIMITS.todayBannerAutoAdvanceMs` 자동). 하단 readonly 카드 금지
- 콕이: empty=`thinking` · 진행 배너=`cheer` · 완료=`done` · **컨디션 선택**=happy/thinking/worried. 본문·행 상시 장식 금지
- 일괄「다 먹었어요!」CTA **없음** — 개별 체크만
