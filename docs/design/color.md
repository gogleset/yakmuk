# Design — Color system

← [README](README.md)

## 6. Color system

토큰명은 모드 불변. 값만 light / dark 맵.  
**light = 목업 soft 틸** ([decisions.md](../brand/decisions.md) #8). `theme.ts` / NativeWind와 동기.

### 6.1 Core tokens

| Token         | Light     | Dark      | 용도                                            |
| ------------- | --------- | --------- | ----------------------------------------------- |
| `brand`       | `#4D8679` | `#3DBFA8` | CTA, 탭 active, 선택일·아이콘 강조              |
| `brandSoft`   | `#E4F1ED` | `#1A3D36` | taken row, secondary 버튼, soft fill            |
| `todaySoft`   | `#C5E8D9` | `#1A3D36` | 캘린더 「오늘」 배경 — brandSoft보다 시인성 높은 연녹 |
| `canvas`      | `#FFFFFF` | `#0E1413` | 스크린 배경, 시스템 크롬                        |
| `surface`     | `#FFFFFF` | `#1A2421` | 인풋·시트·탭 bar                                |
| `surfaceSoft` | `#F0F5F3` | `#15201D` | 카드·empty 박스 — brandSoft보다 훨씬 연한 fill  |
| `ink`         | `#F5FFFC` | `#0A1F1A` | `brand` 위 텍스트/아이콘                        |
| `text`        | `#1F2A27` | `#E8F0ED` | 본문·제목(브랜드 영역 밖)·empty 타이틀          |
| `muted`       | `#7A8783` | `#8A9A94` | 캡션, placeholder, 탭 inactive                  |
| `line`        | `#D5DED9` | `#2A3531` | (레거시) — **보더로 쓰지 말 것**. 계층은 fill로 |
| `disabled`    | `#B8C4BF` | `#3D4A45` | 비활성                                          |

### 6.2 Semantic

| Token           | Light     | Dark      | 용도                                              |
| --------------- | --------- | --------- | ------------------------------------------------- |
| `success`       | `#4D8679` | `#3DBFA8` | 완료 CTA 등 — brand와 동일 축                         |
| `sky`           | `#3B9AD9` | `#2F8BC7` | 캘린더 「다 먹었어요」 도트 — 시인성 sky                 |
| `warning`       | `#C49A3C` | `#D4A84B` | 주의 텍스트/아이콘 · 범례 “일부만”                |
| `warningBorder` | `#E8D48A` | `#5C4A1A` | 케어·주의 톤 thin outline (1px) — `TONE_OUTLINE.warning` |
| `warningBg`     | `#FFF8E1` | `#2A2410` | Badge 등 소형 chip fill · 카드/배너 기본엔 쓰지 않음 |
| `destructive`   | `#C46B5A` | `#E07A7A` | 삭제·위험 · stuck outline · 범례 “안 먹었어요”     |

### 6.3 Mode rules

- 다크에서 `brand`는 **더 어둡게가 아니라 더 밝게** — CTA 대비 확보
- 계층은 기본적으로 **`canvas` → `surfaceSoft` → `brandSoft` 단계** (`surface`는 인풋·시트·탭)
- **같은 fill끼리** (예: `canvas` 위 `canvas` 카드) 구분해야 하면 border 대신 **아주 옅은 soft shadow** (`LAYOUT.shadow.sameFill`) — 드롭다운/체크리스트급. 네온·다층 글로우 금지
- 시스템 크롬(status / nav bar) = 해당 모드의 `canvas`
- 순수 `#000` 배경, 형광 민트, 네온 글로우 금지
- 목표 런타임: `userInterfaceStyle: "automatic"` (현행 light-only는 legacy)

### 6.4 Why soft teal

간호·약·안심의 식물성 신뢰. 병원 블루·진한 쿨 틸(`#0F6B5C`) 금지.  
목업 soft 틸(`#4D8679`) + 흰 canvas — 채도↓·명도↑.  
헤어 브라운·윙 페일블루 = **illustration-only**, 토큰 추가 금지.  
hex SoT: 이 문서 §6.1 ↔ `theme.ts` (`COLORS` · `TONE_OUTLINE`) / `tailwind.config.js`.
