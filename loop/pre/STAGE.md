# Stage — pre

- boundary: client-db
- store: local-supabase
- track: loop-engineering
- domain: yakmuk (약먹었약)
- promoted_from: none (mvp 단계 **의도적 스킵**)

## 왜 mvp를 건너뛰나

SQLite 단독으로는 가족(멀티 클라이언트) 연동 테스트가 거의 불가.  
약먹었약은 공유 DB가 핵심이므로 **첫 구현 stage = pre**.

## 허용

`supabase start`, Expo RN ↔ 로컬 Postgres, OAuth(보호자), 피보호자 슬롯(nickname 보호자 설정)+코드/QR, 마이그레이션·시드, RLS, HTTP trigger, Edge(로컬), Realtime, 시뮬 2대 가족 시나리오

## 금지

퍼블릭 배포를 완료 조건으로, prod 시크릿, 클라우드 prod를 pre 완료 조건으로
