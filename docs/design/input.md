# Design — 입력 (Funnel & Sheet)

← [README](README.md)

## 9. 입력 — Funnel & Sheet

### FunnelShell (온보딩·초대)

- Welcome / Join / InviteCreate — 한 질문 한 스텝
- 큰 질문 타이틀 · 하단 CTA · 약한 progress bar (숫자 라벨 `2/4` 금지)
- 뒤로 = chevron 아이콘만. 작성 중 닫기 = confirm
- 퍼널 본문 Caption·필드 라벨 금지 — 타이틀·토글·placeholder로 충분
- 콕이 = 입구·완료만 (중간 스텝 금지)
- 단일 필드(닉네임만 등)는 퍼널 강제 금지 → BottomSheet
- **full page** (PageSheet로 FunnelShell 쓰지 않음)

### BottomSheet (약 — `MedicationSheet`)

- **하나의** `MedicationSheet` · `mode`: `create` | `edit` | `view`
- 약 등록/수정/상세 = **BottomSheet** (풀페이지 퍼널 강제 금지)
- `create`: 이름 검색은 **검색 버튼**으로만. 확정 후 **메타·용량·색** → **다음** → **스케줄**
- 공공 검색 선택 시 `item_seq` + 메타 프리필(수정 가능). 자세히보기 overlay +「이 약 선택」
- sticky footer: 메타 = **초기화** · **다음** / 스케줄 = **이전** · **등록**. 이름「변경」은 나머지 필드 유지
- `edit`: 전체 섹션 펼침(prefill). footer = 초기화 · 저장. `item_seq` 재검색 없음
- `view`: 같은 폼 **readOnly**. footer = 닫기 · **수정**(같은 시트 `mode=edit`로 전환, 라우트 push 금지). dirty confirm 없음
- 등록·수정 성공 = 시트 dismiss만
- 앞단계 변경 → 뒤 섹션 collapse + draft 리셋은 **초기화**에만 (이름 변경은 유지)
- Caption·필드 라벨 금지 — placeholder/토글만. 시트 안 컨트롤 fill = `surfaceSoft` / `brandSoft`
- 체크 리스트: 행 탭 = `view` · 체크 버튼(큰) = 복용 토글 · 아이콘 = `dose_unit` 형태 + 구분색 tint (`MedFormIcon`)
- 상세: [docs/brand/funnels.md](../brand/funnels.md) P3·P4
