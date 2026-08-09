# Design — Typography

← [README](README.md)

## 7. Typography

커스텀 폰트 없음 — **시스템 기본**. 모드는 색만 교체, weight/size 동일.  
Brand hero 존재감 = 콕이 이미지. Welcome 카피는 좌상단 인사(타이틀+서브), 브랜드명 `약콕`은 Welcome에 두지 않음 (#7C).

| 역할                 | 스타일                 | 색                                  |
| -------------------- | ---------------------- | ----------------------------------- |
| Brand hero (Welcome) | 콕이 컷 + `text-3xl` 인사 · bold | `text` (타이틀) / `muted` (서브) |
| Page title           | `text-2xl` · bold      | `brand` (또는 `text`)               |
| Title Xl / Lg / Md   | `text-xl` / `lg` / `[15px]` · bold | `brand` / `text`              |
| Section / card title | `text-base` · bold     | `brand` / `text`                    |
| Label (Button=`LabelMd`, Badge=`LabelSm`) | `text-base`/`sm`/… · semibold | variant tone (`ink`/`brand`/…) |
| Label medium (`LabelMdMedium` / `LabelXsMedium`) | `text-base`/`xs` · medium | Settings 행 등 (`text` / `muted`) |
| Display (알람 시각)  | `text-6xl` · bold · tracking-tight | `text`                      |
| Body                 | leading 여유 · regular | `text` → muted 계층은 `muted`       |
| Caption              | `text-xs`              | `muted`                             |
| Invite code (`Code`) | `text-2xl` · semibold · tracking-widest | `text` (또는 `brand`)        |

코드 SoT: `mobile/src/shared/ui/primitives/Typography.tsx` (`textRoleVariants` · `textToneVariants`).  
Button=`LabelMd` · Badge=`LabelSm` · 칩 토글=`LabelMd`/`LabelSm` · invite=`Code`.  
상태 tone: `sky` / `warning` / `destructive` (캘린더 범례 등 [color §6.2](color.md#62-semantic)).  
전 레이어: role scale 일치면 Typography.  
RN `Text` raw 금지. 예외: `Animated.Text`(MarqueeTitle) · `TextInput` 글리프(TimePicker digits).  
`Muted` alias 제거 — 흐린 계층은 `Caption` / `Body`(기본 tone muted).
