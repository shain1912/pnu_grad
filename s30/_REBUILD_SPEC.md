# s30 재구축 스펙 (grill-with-docs 확정본 · 2026-06)

> 이 문서는 `_BUILD_KIT.md`를 **보완/일부 오버라이드**한다. 두 문서를 함께 따른다.
> 빌드키트와 충돌 시 **이 스펙이 우선**.

## A. 인터뷰로 확정된 요건 (6개 지시)
1. **콘텐츠 출처 = `C:\Users\user\pnu_ai_archive`** (부산대 AI 거점대학 제안서 19페이지 + 데이터/이미지 전사). 권위 소스. **날조 금지**(빌드키트 §0.1). 제안 성격 섹션(핵심사업/사업소개/로드맵)은 아카이브 기반. 성과/파트너십은 빌드키트 "검증된 팩트" 사용.
2. **작업 대상 = `/s30/` 페이지만.** `arise.html`(포털)·학·석사 페이지(admission/eligibility/scholarship)는 **절대 손대지 않음**.
3. **AURA 마스터플랜(`/s30/aura/` 몰입형 앱) = 내용만 수정, 디자인 동결.** 구조/CSS/레이아웃 변경 금지, 텍스트·수치만 아카이브(`부산대_AX_AURA.md`)와 일치하도록 정정.
4. **디자인 = 빌드키트 준수**(near-zero text·인포그래픽/차트/SVG/큰 숫자 중심) + **그라데이션 전면 금지(오버라이드)** → 평면 부산대 팔레트만. `main.css`는 **먼저 평면화**(아래 D) 후 페이지 빌드.
5. **앵커 스크롤 메뉴 전부 → 개별 페이지로 분리**(아래 B 인벤토리).
6. **이미지** = 아카이브 도식/데이터 인포그래픽 + `/s30/assets/img/` 실제 사진 카탈로그(빌드키트 §2). 생성 사진 지양.

## B. 페이지 인벤토리 (분리 후)
| 경로 | 메뉴 | 작업 | 콘텐츠 출처(아카이브/팩트) |
|---|---|---|---|
| `/s30/index.html` | 홈 | 재디자인 | index.md(HERO·추진체계) + 핵심사업/성과/파트너 미리보기 |
| `/s30/about/index.html` | 사업개요·비전 | 재디자인 | index.md(개요·비전), 부산대_AX_AURA(KPI 요약) |
| `/s30/about/governance/index.html` | 거버넌스 | 재디자인 | 생애주기AI이원통합거버넌스·AI융합교육원 이미지, 부산대_AI거버넌스 pdf, 장영실연구원 |
| `/s30/aura/` (몰입형) | A.U.R.A 마스터플랜 | **내용만**·디자인 동결 | 부산대_AX_AURA.md |
| `/s30/roadmap/index.html` | 3개년 로드맵 | 재디자인 | 부산대_AX_AURA(로드맵), index(단계) |
| `/s30/programs/education/index.html` | AI 교육혁신 | 재디자인(신규) | part2.md, 종합분석_개설강좌, 학기별_개설강좌수, AX융합학부_융합전공, AX교과이수구조·AX-PBL 이미지 |
| `/s30/programs/research/index.html` | AI 연구강화 | 재디자인(신규) | part1.md, grad.md(대학원육성), 장영실연구원, 생애주기AI파이프라인 |
| `/s30/programs/industry/index.html` | 산학협력 | 재디자인(신규) | part3.md(지역AX생태계), 지역AI인재네트워크(구축/실행/체계) 이미지+pdf |
| `/s30/programs/infra/index.html` | AI 인프라 | 재디자인(신규) | part1(인프라), pnu_axis_idc·국방안심존 이미지, 생애주기AI부산대자산, 부트캠프_몰입형 |
| `/s30/achievements/robocup/index.html` | RoboCup 2025 | 재디자인(신규) | 빌드키트 검증된 팩트 + robocup.jpg |
| `/s30/achievements/quantum/index.html` | 양자AI 47억 | 재디자인(신규) | 빌드키트 팩트 + quantum.jpg |
| `/s30/achievements/papers/index.html` | 논문·특허 | 재디자인(신규) | 빌드키트 팩트 |
| `/s30/achievements/transfer/index.html` | 기술이전·창업 | 재디자인(신규) | 빌드키트 팩트 |
| `/s30/partners/google/index.html` | Google for Education | 재디자인(신규) | 빌드키트 팩트 + google-edu.jpg |
| `/s30/partners/industry/index.html` | 산학 협약(35+) | 재디자인(신규) | index 추진체계(삼성·LG·한화·BNK), handshake.jpg |
| `/s30/partners/global/index.html` | 글로벌 협력 | 재디자인(신규) | index(Stanford·ETRI·재료연) |
| `/s30/partners/govt/index.html` | 정부·공공기관 | 재디자인(신규) | index(부산시·중기부·교육청) |
| `/s30/news/index.html` | 알림마당 | 재디자인 | meeting_index·actions(필터 리스트 유지) |

> 분리된 메뉴의 **상위 nav 링크**(예: `/s30/programs/`)는 첫 서브페이지로 리다이렉트하거나 4개 카드 허브로. 드롭다운 하위 링크는 각 개별 페이지(`/s30/programs/education/` 등)로 변경한다(앵커 `#education` → 페이지 경로).

## C. 공통 nav 변경 (분리 반영)
빌드키트 §3.2 드롭다운의 `#anchor` 링크를 **개별 페이지 경로**로 교체:
- 핵심사업: `/s30/programs/education/`·`/research/`·`/industry/`·`/infra/`
- 성과: `/s30/achievements/robocup/`·`/quantum/`·`/papers/`·`/transfer/`
- 파트너십: `/s30/partners/google/`·`/industry/`·`/global/`·`/govt/`
- 사업소개: `/s30/about/`(개요)·`/s30/aura/`(AURA)·`/s30/about/governance/`·`/s30/roadmap/`
모든 페이지가 **동일한 갱신 nav/footer**를 복붙(자기 메뉴 `active`).

## D. 그라데이션 평면화 규칙 (#3)
- `linear-gradient(...)`·`radial-gradient(...)` → **단색**으로 치환. 기준:
  - 진한 파랑 배경 그라데 → `--pnu-blue-dark #143F90` 또는 `--pnu-navy #0F1F45`
  - 밝은 배경 그라데 → `--blue-tint #EFF6FF` 또는 흰색 `#fff`
  - 파랑→그린 강조 그라데(`.grad`) → 단색 `--pnu-blue #005BAA`
  - 사진 onerror 폴백 그라데 → 단색 `#0d3b6e`
- 텍스트 그라데(`-webkit-background-clip:text`)는 단색 `--pnu-blue-dark`로.
- `main.css` 1회 평면화(서버 충돌 방지 위해 빌드 전 단독 수행). 이후 페이지에 새 그라데이션 추가 금지.

## E. 팔레트(평면) — 빌드키트 §4 그대로, 그라데만 제거
`--pnu-blue #005BAA · --pnu-blue-dark #143F90 · --pnu-blue-sub #0075C9 · --pnu-navy #0F1F45 · --pnu-green #00A651 · --ink #0F172A · --blue-tint #EFF6FF · --blue-light #DBEAFE`. 폰트 Noto Sans KR/Inter/Source Serif 4. Font Awesome 6.5.
