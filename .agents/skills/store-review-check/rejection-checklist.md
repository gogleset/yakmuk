# Store rejection checklist

흔한 리젝 버킷. 각 행: **ID · 무엇을 볼지 · 약콕 힌트**.  
상태: `pass` | `fail` | `risk` | `n/a`. 근거 파일 없으면 추측하지 말 것.

공식: [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) · [Play Policy Center](https://play.google.com/about/developer-content-policy/) · [User Data](https://support.google.com/googleplay/android-developer/answer/10144311) · [Account deletion](https://support.google.com/googleplay/android-developer/answer/13327111) · [Health apps](https://support.google.com/googleplay/android-developer/answer/12261419) · [Health declaration](https://support.google.com/googleplay/android-developer/answer/14738291)

날짜에 묶인 SDK/API 레벨은 “제출 시점 Apple/Google 현재 요구”로 확인.

---

## C — Common (Both)

| ID | Item | Scan | Yakmuk |
|----|------|------|--------|
| C1 | Completeness — crashes, placeholders, broken links, blocked login | `준비 중` / TODO UI / stub / `Coming soon`; dead flows in pages; Review demo path | Apple **2.1** · Play broken functionality |
| C2 | Privacy policy — live URL in store + in-app | `SUPPORT.privacyUrl`, settings legal rows, stub Alert vs real URL | `privacyUrl: null` → **fail** (Apple **5.1.1** · Play User Data) |
| C3 | Collection vs disclosure mismatch | SDKs (analytics/crash/push), permissions vs App Privacy / Data safety answers | Nutrition label / Data safety must match binary |
| C4 | Account deletion — in-app | Settings 탈퇴, `withdraw_my_account` / delete RPC; not freeze-only | In-app exists → check real delete (Apple **5.1.1(v)**) |
| C5 | Account deletion — data actually deleted | RPC/migrations: soft-delete only? retained fields disclosed? | Freeze ≠ delete |
| C6 | Permissions — purpose / least privilege | `infoPlist` usage strings, Android permissions, notif/camera/contacts | Notif: `medication-notifications` purpose + channel |
| C7 | Metadata accuracy | Listing copy vs real screens; screenshots vs UI | Apple **2.3** (store listing — note if not in repo) |
| C8 | Minimum functionality / thin app | WebView-only shell, clone/spam patterns | Apple **4.2/4.3** · Play **4.3** |
| C9 | Support URL | `SUPPORT.email` / support URL alive | Apple **1.5** |

---

## I — iOS

| ID | Item | Scan | Note |
|----|------|------|------|
| I1 | Login services (4.8) | Google/Facebook etc. as primary → equivalent privacy-preserving login (Apple Sign In qualifies) | Welcome: Google + Apple copy — verify both wired |
| I2 | Privacy Manifest / Required Reason APIs | PrivacyInfo / third-party SDKs reasons | ATT if tracking |
| I3 | Medical / health claims (1.4.1) | Copy claiming diagnose/treat/measure accuracy; doctor reminder | Medication check ≠ clinical advice |
| I4 | Drug dosage calculator (1.4.2) | Dose calculators / prescribing logic | Must be N/A for yakmuk unless added |
| I5 | HealthKit (2.5.1 / 5.1.3) | HealthKit usage, UI disclosure, no ads from health data | Unused → `n/a` |
| I6 | Review credentials (2.1) | Login-gated; Review Notes / demo account plan | Document path for reviewers (no secrets in report) |
| I7 | UGC (1.2) | User content, report/block/filter | Family feed = limited UGC? check report tooling |

---

## A — Android

| ID | Item | Scan | Note |
|----|------|------|------|
| A1 | Data safety accuracy | Same as C3 + crash/analytics IDs declared | Form ↔ traffic |
| A2 | Health apps declaration | Play Console App content form | Medication / health features → declare |
| A3 | Health Content policy | Misleading medical features; unused sensitive perms; privacy in-app | Disclaimer if health-related |
| A4 | Account deletion web URL | Public HTTPS page; request without app install; not login-walled homepage | In-app alone **insufficient** |
| A5 | Closed testing (new personal accounts) | Process: 12 testers / 14 consecutive days before production | Ops checklist, not code |
| A6 | Target API level | `compileSdk` / Expo target vs current Play requirement | Confirm at submit time |

---

## Y — Yakmuk overlay (가족 복약·안부)

| ID | Item | Scan |
|----|------|------|
| Y1 | Play web deletion URL + deletion scope disclosure | Beyond Settings 탈퇴; public URL + what is deleted/retained |
| Y2 | Legal stubs | `SUPPORT.privacyUrl` / `termsUrl` null → `openLegalStub`; live HTTPS pages required for submit |
| Y3 | Health-sharing copy | No diagnose/treat claims; optional medical disclaimer; guardian ↔ recipient visibility/consent |
| Y4 | Notification permissions | Purpose string / Android channel; ask in context of medication reminders |
| Y5 | OAuth 4.8 | Google primary → Apple (or equivalent) actually implemented, not copy-only |
| Y6 | Prod loop notes | [loop/prod/CONTRACT.md](../../../loop/prod/CONTRACT.md) · DECISIONS: 탈퇴·약관·심사 items vs code |

---

## Severity guide

| Level | When |
|-------|------|
| Critical | Submit blocker (null privacy URL, no account delete where required, Play missing web delete, clear 1.4 medical overclaim) |
| High | Likely reject (4.8 missing, permission without purpose, Data safety mismatch, stub legal) |
| Medium | Process/metadata (Review Notes, closed testing, screenshot accuracy, target API verify) |
