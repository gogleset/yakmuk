# Reference — yakmuk loop prod

스키마·verifier SQL·RLS 초안·Auth 흐름은 pre와 동일.  
→ [../pre/reference/README.md](../pre/reference/README.md)

여기서는 **운영·배포**만.

## 전환

```text
Adapter(LocalSupabase) -> Adapter(HostedSupabase)
EXPO_PUBLIC_SUPABASE_URL -> project URL
OAuth redirect / Universal Link -> prod domains
Edge webhook -> hosted project
```

## Auth · QR (prod)

```text
Guardian: OAuth(prod) -> family -> add slot(nickname) -> invite_code + QR
CareRecipient: open link | type code -> session on pre-named slot (no nickname UI)
RLS: family_id (unchanged)
```

## 운영 시퀀스

```text
In-app / Webhook / Schedule -> start|resume run (idempotent)
HostedRDB: runs/turns + daily_logs
Verifier -> metrics / alerts
Stuck -> notify channel
daily_logs INSERT -> Edge -> Expo Push (deduped)
EAS -> TestFlight / Play internal / stores
```

## 런북

1. **폭주**: bound 히트율 알람 → 설정 확인 → run abort
2. **stuck 폭풍**: escalate 큐 → 스케줄/goal 원인 → 핫픽스
3. **초대 남용**: rate limit·코드 재발급 · 이상 family 점검
4. **OAuth 장애**: 프로바이더 상태·redirect·번들 ID
5. **롤백**: 이전 EAS 빌드 + 마이그레이션 down 또는 forward-fix

## 관측 최소셋

- runs by status (`success` / `failed_bound` / `stuck_*` / `failed_verify`)
- p95 turns per run · bound hit rate
- 푸시 성공/실패 (Edge)
- 일일 복약 completion rate (= 루프 goal)
- OAuth 성공률 · 초대 조인 성공률
