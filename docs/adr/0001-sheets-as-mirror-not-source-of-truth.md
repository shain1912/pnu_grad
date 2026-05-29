# ADR 0001 — Google Sheets는 미러, SQLite가 SoT

- 상태: Accepted
- 날짜: 2026-05-29

## 컨텍스트

학사사무실이 신청 결과를 친숙한 UI에서 보고 싶다는 요구. 첫 안은 "DB 안 쓰고 시트만 쓰기" 였으나, 검토 결과:

- 신청 트래픽 미미 (1주에 수백 건) → SQLite는 절대 부담이 안 됨
- 시트만 쓰면 **1인 1응답 무결성**과 **도메인 게이트** 보장이 약해짐 (시트엔 UNIQUE 제약 없음, race 가능)
- 시트만 쓰면 모든 PII가 Google Cloud에 저장됨 — 학교 정보보호 정책에 따라 문제 가능

## 결정

**SQLite를 SoT로 유지. Google Sheets는 일방향 미러(read-only 거울).**

- 응답이 SQLite에 INSERT된 직후 Sheets API로 시트에 1행 append
- Sheets는 SoT가 아니므로 망가지면 SQLite에서 언제든 재생성 가능
- 1인 1응답, 도메인 게이트, 응답 무결성은 모두 SQLite에서 강제

## 결과

긍정:
- 학사사무실은 익숙한 시트에서 결과 확인 가능
- 운영 부담은 SQLite 백업(파일 1개 복사) 수준에 머무름
- 시트 API 장애가 신청 자체를 중단시키지 않음

부정:
- 시트와 SQLite 사이 일시적 불일치 발생 가능 (미러 누락 시)
- PII 일부가 Google Cloud에 들어감 — 학사 정보보호 정책 사용자 확인 필요

## 검토한 대안

- **Sheets SoT, DB 제거** — 운영 단순화는 매력이나 무결성·PII 위험 큼. 기각.
- **이중 저장(dual write, 양방향)** — 동기화 충돌 시 어느 쪽이 우선인지 정해야 함. 복잡도 대비 이득 없음.
- **DB SoT, 시트 export 버튼 수동** — 자동 미러 없이 admin이 매번 export. UX 떨어짐. (단, PII 정책 위배 시 fallback으로 채택 가능)
