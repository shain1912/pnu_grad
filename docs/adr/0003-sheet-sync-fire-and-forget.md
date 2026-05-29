# ADR 0003 — 시트 동기화는 fire-and-forget + 수동 재동기화

- 상태: Accepted
- 날짜: 2026-05-29

## 컨텍스트

응답 제출 시 Google Sheets에 미러링하는 시점/방식 선택. 트래픽이 미미(1주 수백 건)하지만:

- 응답 path에 시트 API 호출(200~800ms)을 await하면 신청 UX 느려짐
- Sheets API 일시 장애가 신청 자체를 막으면 안 됨
- 누락이 발생해도 손쉬운 복구 수단 필요

## 결정

**SQLite INSERT 커밋 직후 `mirrorToSheet().catch(log)` 비동기 호출. 응답엔 영향 없음.**

- 시트 append 성공 시 `responses.sheet_synced_at` 컬럼 업데이트
- 실패 시 응답은 그대로 성공(201) 반환. 시트엔 누락된 채로 남음
- admin dashboard에 `sheet_synced_at IS NULL` 건수 배너 + **"재동기화" 버튼** (`POST /api/admin/sync`)
- 재동기화 로직: 미동기 응답만 일괄 append. 성공한 것만 컬럼 업데이트

## 결과

긍정:
- 응답 latency 영향 0
- Sheets API 장애가 신청자에게 안 보임
- admin이 dashboard에서 누락 발견하고 한 번에 복구 가능

부정:
- 일시적으로 SQLite와 Sheets의 응답 수가 다를 수 있음
- 완벽한 idempotency 없음 — append 성공 후 sheet_synced_at update가 실패하면 재동기화 시 중복 1행 발생 가능
- 트래픽이 작아 admin이 시트에서 직접 정리해도 부담 없으나, 트래픽이 커지면 문제

## 검토한 대안

- **await + retry**: 응답 latency 200~800ms 증가, 실패 누적 시 응답 자체 실패. 기각.
- **백그라운드 큐 + 워커**: 가장 robust지만 sync_queue 테이블 + 워커 프로세스 추가. 트래픽 대비 과잉. 기각.
- **5분 cron sync**: 학사가 시트를 매일 봄 → 5분 지연 무관이지만, fire-and-forget도 99% 케이스에서 즉시 동기화됨. cron은 fallback으로 admin 수동 트리거가 같은 역할.

향후 트래픽이 늘거나 idempotency가 더 중요해지면 백그라운드 큐로 전환 가능 (이 ADR을 supersede).
