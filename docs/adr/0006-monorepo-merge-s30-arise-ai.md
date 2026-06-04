# ADR 0006 — arise-ai(s30) + pnug 단일 모노레포 통합, s30는 /s30/ 경로

- 상태: Accepted
- 날짜: 2026-06-01

## 컨텍스트

두 사이트가 별도 리포·별도 배포로 운영되어 왔다(5173 포트 충돌 등 분산 문제):

- **arise-ai (= `C:\Users\user\pnu\s30`)** — `package.json` name `arise-pnu`, 타이틀 "부산대학교 AI 거점대학육성사업단 — ARISE PNU | arise-ai.pusan.ac.kr". **Vite 정적 멀티페이지(MPA, React 아님, 백엔드 없음)**: 풀 랜딩(hero.mp4) + about(A.U.R.A 2.0 마스터플랜, `#aura`) + partners(Google for Education, `#google`) + programs/roadmap/news/achievements. 자산은 루트 절대경로(`/assets/`, `/src/`)·내부 nav는 `/`(자기 홈) 가정. 현재 `pnu.kodekorea.kr/s30/`에 배포.
- **pnug (`C:\Users\user\pnu-grad`)** — 학·석사 연계과정 사전신청 시스템(`pnug.kodekorea.kr`). Vite+React(admin) + 정적 admission-v1/v2/v3·arise.html·eligibility.html(public/) + Express(SQLite + Google Sheets 미러) + Caddy. ADR 0001~0005.
- 직전 작업으로 만든 `arise.html`(단순 3카드 게이트웨이)이 상위 진입으로 결정됨([[Q1]]).

목표: 하나의 코드베이스·하나의 배포로 arise-ai(상위 랜딩) · s30(소개/파트너/프로그램) · pnug(연계과정 신청)을 운영.

## 결정

**단일 모노레포 + 단일 Express 배포. s30는 `/s30/` 경로에서 자체 빌드로 서빙한다.**

리포 레이아웃:
```
pnu-grad/                 # 모노레포 루트
├── CONTEXT-MAP.md        # 멀티 컨텍스트 맵(신규)
├── docs/adr/             # 0001~0006 (시스템 전역)
├── backend/              # Express — 전부 서빙(/ + /s30/ + /api + /auth)
├── frontend/             # pnug: Vite+React + public(arise.html·admission-v*·eligibility·logos·media)
└── s30/                  # pnu\s30 이동: Vite MPA, base:'/s30/'
```

URL 맵(단일 도메인):
- `/` → `arise.html` (3카드 게이트웨이)
- `/s30/*` → s30 풀 사이트(랜딩·about/#aura·partners/#google·programs·roadmap·news·achievements)
- `/admission-v1·v2·v3.html`, `/eligibility.html` → pnug 정적
- `/admin`, `/login` → React, `/api`, `/auth` → 백엔드

서빙: prod Express가 `frontend/dist`를 `/`에, `s30/dist`를 `/s30/`에 `express.static` 마운트. 빌드는 2스텝(s30 빌드 + frontend 빌드)을 npm script로 묶음. s30는 `vite.config`에 `base:'/s30/'` 설정.

크로스링크 내부화: `arise.html`의 1·2번 카드를 `http://pnu.kodekorea.kr/s30/...` → 내부 `/s30/about/#aura`, `/s30/partners/#google`로, 3번 카드는 `pnug` 신청(내부 경로 또는 도메인)으로. s30 내부 nav(`/` 홈)·절대경로를 `/s30/` 기준으로 조정.

도메인: 단일 Caddy. **당장은 기존 인프라(pnug.kodekorea.kr)로 전부 서빙**, `arise-ai.pusan.ac.kr`는 공식 계정(월요일) 확보 후 같은 서버에 연결(+ OAuth redirect/consent 재구성). 한 서버에 두 도메인 연결 가능하므로 "단일 배포"와 충돌 없음.

## 결과

긍정:
- 1 리포·1 백엔드·1 Caddy → **5173 포트 충돌 등 운영 분산 해소**, 단일 `start-prod`.
- PNU 로고·자산·브랜드 공유, arise↔s30↔pnug 크로스링크가 내부 경로로 단순화.
- s30가 기존 `/s30/` 경로 유지 → 절대경로/배포 URL 변동 최소.

부정:
- 빌드 2스텝(s30 + frontend). npm script로 묶지만 단일 Vite는 아님.
- s30 내부 nav(`/`)·절대경로를 `/s30/` 기준으로 손봐야 함(base + 일부 href 수정).
- 정적 마케팅(s30)과 동적 앱(pnug)이 한 백엔드에 결합 — 관심사 분리는 약화(단 서빙만 공유, 코드 격리는 폴더로 유지).

## 검토한 대안

- **단일 Vite(MPA+React) 완전 통합** — 빌드 1개지만 s30 루트 절대경로·내부 nav와 arise(`/` 차지)의 전면 재배선 필요. 작업·리스크 과다. 기각.
- **s30를 정적 `public/s30/`로 흡수** — 단순하나 s30 수정 시마다 재빌드·재복사로 소스 이원화. 기각.
- **멀티 도메인 유지(빌드만 통합)** — "하나의 배포" 취지와 어긋남. 기각.

→ 멀티 컨텍스트(arise 게이트웨이 / s30 마케팅 / pnug 신청)이므로 `CONTEXT-MAP.md` 도입(통합 실행 후 실제 폴더 기준 작성).
