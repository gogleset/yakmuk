# 약 목적 태그 (purpose) — later 스펙

← [README](README.md) · 잠긴 결정: [decisions.md](decisions.md) **#9**

Gate 0(신뢰) **전부 PASS 전 구현 금지**.  
Gate 1 glance 필수 아님. [priorities.md](priorities.md) **3순위 later**.

상태: **스펙만** (스키마·UI·마이그레이션 없음). 착수 시 별도 S-step 플랜.

---

## Why

- **앱:** 약이 늘면 색·이름만으로 “무슨 쪽 약인지”가 안 보임. 일상어 한 칸이면 본인·보호자 구분에 충분.
- **운영:** `medications.purpose`를 두면 SQL로 “혈압 쪽이 많다” 정도 집계 가능.
- **축:** 안심 루프(먹었/안 먹었)를 대체하지 않음. 기능 많은 약 앱·통계판이 아님.

## Non-goals (하지 말 것)

| 금지 | 이유 |
|------|------|
| 인앱 통계 대시보드·배지·필터 리포트 | [decisions #6](decisions.md) |
| AI 약·질환 상담 · 진단/치료 클레임 | 동일 · 심사·카피 리스크 |
| ATC / 질환 진단 코드 / 다중 자유 태그 | 의료 앱처럼 보임 · 잘못 분류 |
| 등록 **필수** 입력 (블로킹) | 체크 루프 마찰 |
| Gate 0 중 스키마·UI 착수 | [decisions #3](decisions.md) · #9 |
| 위젯 문구에 purpose 강제 · 주간요약을 통계판화 | glance/G2.2 축 훼손 |
| v1에서 `item_seq`/효능 **자동 추정** | v2 후보만 |

---

## 모델

- 컬럼 제안: `medications.purpose` — `text null`
- **단일 선택** (한 슬롯 = 한 purpose)
- 미선택(`null`) 또는 `unknown` 허용 → 등록 막지 않음
- check constraint: null 또는 아래 enum key만

### Enum (v1)

| key | 한글 라벨 | 한 줄 |
|-----|-----------|--------|
| `bp` | 혈압 | 혈압약 쪽 |
| `diabetes` | 당뇨 | 혈당·당뇨약 쪽 |
| `heart` | 심장 | 심장·순환 쪽 |
| `gi` | 위장 | 위·장 쪽 |
| `pain` | 진통·해열 | 통증·열 쪽 |
| `other` | 영양·기타 | 비타민·그 외 |
| `unknown` | 잘 모르겠음 | 고르기 싫거나 애매할 때 |

카피 톤: **일상어** (“혈압약 쪽”). “치료/진단/처방군” 금지.

---

## UX (착수 시)

1. **등록/수정** — `MedicationSheet` meta step (색·용량 옆) 칩 한 줄. 선택 안 해도 다음 단계 가능.
2. **스케줄 replace** — sibling soft-delete 후 재insert 시 동일 `purpose` 복제 (이름·메타와 동일 규칙).
3. **홈/가족 glance** — 후속 최소: 칩 또는 섹션 그룹만. 분수·CCTV·점수 UI 금지.
4. **알람·care-push·stuck** — purpose 미사용 (복약 체크 경로 불변).

---

## 데이터 · 집계

- soft-delete(`deleted_at`) 행: **운영 집계 기본 = active만** (`deleted_at is null`). 히스토리 분석은 별도 명시 시에만.
- 인사이트: SQL만 (예: distinct `user_id` × `purpose`). 앱 UI에 노출 금지.
- 건강 민감: purpose는 대략 분류. 로그·외부 공유·마케팅 세그먼트에 함부로 쓰지 말 것. PII와 함께 raw dump 금지.

### 착수 시 스키마 스케치 (참고 — 지금 적용 금지)

```sql
-- Gate 0 PASS 후 새 마이그레이션만. in-place 수정 금지.
alter table public.medications
  add column purpose text null
  check (
    purpose is null
    or purpose in ('bp','diabetes','heart','gi','pain','other','unknown')
  );
```

---

## 착수 조건

1. [gates.md](gates.md) **Gate 0** 전부 PASS (G0.4 보류 표기만인 경우 decisions에 명시된 범위 준수)
2. 이 문서 + [decisions #9](decisions.md) 유지
3. 구현은 **별도** plan-with-gates S-step (마이그레이션 → entity/mapper → Sheet → 테스트 → 홈 칩 optional)

## v2 후보 (잠금 아님)

- `item_seq`/효능 텍스트로 purpose **제안**(확정은 유저)
- 칩 라벨 A/B · enum 값 추가(마이그레이션 + 앱 상수 동기)

## Out of scope (이 스펙)

- 코드·마이그레이션·테스트
- ATC·다중 태그·자동 확정 분류
- 인앱 통계·필터 대시보드
