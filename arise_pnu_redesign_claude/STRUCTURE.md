# ARISE PNU — 정보구조 · 사이트맵 · 콘텐츠 매핑

> **이 문서의 역할:** 무엇을 어떤 페이지에 넣을지(IA)를 정의한다. 비주얼/모션은 [`design.md`](./design.md), 시안 평가는 [`EVALUATION.md`](./EVALUATION.md) 담당.
> **자기완결 원칙:** 모든 콘텐츠는 **이 프로젝트 안의 [`src/lib/content.ts`](./src/lib/content.ts) 익스포트**를 참조한다. (외부 폴더 링크 금지 — 깨지면 다음 에이전트가 못 만든다.)
> **기준일:** 2026-06-08

---

## 0. 스코프 (고정)

### ✅ 포함 — 2축만
- **Ⅰ. 대학원 육성 (WHY)** — `twoAxis[0]`, `gradReality`, `gradPlan`
- **Ⅱ. 구심점 확립 (HOW)** — `twoAxis[1]`, `hub`, `majors`
- **⭐ A.U.R.A. (시그니처)** — `aura`, `services`, `achievements`, `roadmap`

### ❌ 제외 (원본 7탭 중 3개 — 절대 넣지 말 것)
- ~~교육과정 (part2)~~ / ~~생태계 (part3)~~ / ~~실행항목 (actions)~~

> `content.ts`에는 이미 위 3개가 없다. 새로 추가하지 말 것.

---

## 1. 사이트맵 (멀티 페이지)

> "한 페이지 스크롤을 너무 길게 만들지 말 것" → 주제별로 페이지를 나눈다. 섹션 4개 초과 시 분할.

```
ARISE PNU AI
│
├─ P1  /          홈 ········ Hero · ⭐비전체계도(요약) · 대표KPI · 2축 진입   (짧게)
│
├─ P2  /grad      대학원 육성 [WHY] ···· 현실 → 비교 → 발전계획              (3섹션)
│
├─ P3  /hub       구심점 확립 [HOW] ···· 개요 → 학사조직 → 거버넌스 → 인프라  (4섹션)
│
├─ P4  /aura      ⭐ A.U.R.A. (시그니처 단독) ·· 비전체계도 8블록 · 4축 · 성과 · 서비스 · 로드맵
│
└─ P5  /data/[slug]  데이터룸 ···· 차트·대시보드·18전공 (개별 페이지)
```

**상단 스티키바 내비(공통):** `로고 │ 대학원육성 │ 구심점확립 │ A.U.R.A.★ │ 데이터룸 │ QR`
**좌측 고정 사이드바: 사용 안 함** (구조 내비는 상단바로 대체)

> 참고: 현재 `src/app/{bymonolog,tresmares,...}`의 5개 시안은 **이 콘텐츠를 1페이지 스크롤로 푼 디자인 탐색본**이다. 위 멀티 페이지는 **최종 IA 권장안**으로, 디자인 확정(EVALUATION) 후 베이스 시안을 이 라우팅으로 분할한다.

---

## 2. 페이지별 콘텐츠 매핑 (→ content.ts)

### P1 `/` 홈
| 블록 | content.ts 익스포트 | 핵심 |
|------|--------------------|------|
| Hero | `overview` | brand · arise · `axisLine`(대학원 육성→구심점 확립) · `lead` |
| ⭐ 비전체계도(요약) | `aura.vision`·`aura.goal`·`aura.goalTargets`·`aura.pillars` | PNU Core AXIS → 표준모델 → 4목표 → 8/22/47 (요약, 전체는 →P4) |
| 대표 KPI | `metrics` | 1,000억 · 4,000명 · 18전공 · 424명 |
| 2축 진입 | `twoAxis` | [Ⅰ→/grad] [Ⅱ→/hub] |

### P2 `/grad` 대학원 육성 [WHY]
| 섹션 | content.ts | 핵심 |
|------|-----------|------|
| 2-1 현실 | `gradReality` | 70.6% vs 3.1% · 동남권 −22.4% · 4.37:7.79 |
| 2-2 비교 | `identity[3]` + (대학 비교는 데이터룸) | 거점국립대 1위 · BK21 기반 BK5 |
| 2-3 발전계획 | `gradPlan` | +1,000/+2,000 · PNU 1000 AX(월25만·연30억) · Top-Down+Bottom-Up |
| → 데이터룸 | §4 | 지역/대학/교원/학석사 |

### P3 `/hub` 구심점 확립 [HOW]
| 섹션 | content.ts | 핵심 |
|------|-----------|------|
| 3-1 개요 | `twoAxis[1]` | 조직·거버넌스·인프라 3프레임 |
| 3-3 학사조직 | `hub.org` | 2027.03 AI대학 424명 · ADP+X · 18전공 |
| 3-4 거버넌스 | `hub.governance` | 총장직속 4기구 가동 중 |
| 3-5 인프라 | `hub.infra` | "AI for All, Secure for Strategic" · GPU 303→800 · 10,067㎡ · MLSecOps |
| → 데이터룸 | `majors` | AX 18개 융합전공 |

### P4 `/aura` ⭐ A.U.R.A. (시그니처)
> 사이트에서 가장 강조. 사람 이름 외 **모든 요소 누락 없이** 표현(정책: `content.ts` 헤더 참조).

| 블록 | content.ts | 핵심 |
|------|-----------|------|
| 1. 비전체계도 4단 | `aura.vision`→`aura.goal`/`aura.goalTargets`→`aura.framework`→`aura.blocks` | 비전 → 목표(4) → 4축 → **전략·실행 8블록** |
| 2. 규모 | `aura.pillars` | 8 목표 / 22 과제 / 47 실행 |
| 3. 4대 축 | `aura.framework` | A 철학·U 융합연구·R 증강인재·A 적응형행정 |
| 4. 성과 | `achievements` | 경영대상(대학 유일)·AI-MASTER(국내 최초)·상담AI(국립대 최초)·타임라인 4건 |
| 5. 서비스 | `services` | 산지니 AI·장영실 연구원·상담 AI·스마트글라스 |
| 6. 로드맵 | `roadmap` | 2025 기반 / 2026 확산(active) / 2027 선도 |

### P5 `/data/[slug]` 데이터룸 — §4

---

## 3. 비전체계도 (시그니처) — 4단 위계
> 원천: `E:/arise2/비전체계도 (1).pdf` · content: `aura.*`

```
AI 시대의 중심축, PNU Core AXIS                  ← aura.vision
└ 국내 최초 대학 AX 표준모델 제시                 ← aura.goal
   ├ AI 인증 ├ 네트워크 10 ├ 인재 4,000 ├ 행정 70→80→90   ← aura.goalTargets
        │
   A 철학 │ U 융합연구 │ R 증강인재 │ A 적응형행정   ← aura.framework
        │
   8 블록 (축당 2) · 각 실행과제 bullet              ← aura.blocks
```
**표현 방식:** 코드 재현(반응형·강조 유리). PDF 이미지 export는 폴백.

---

## 4. 데이터룸 (개별 페이지) — 원본 인터랙티브 HTML
> 1차: 원본 링크/`iframe` 임베드 → 2차: React 재구현. 차트·대시보드라 1차 임베드 권장.

| slug | 자료 | 원본 HTML | 소속 |
|------|------|-----------|------|
| `regional` | 지역별 고등교육 비교 | `grad_s1_3_regional.html` | P2 |
| `univ-compare` | 주요대학 대학원 비교 | `grad_s2_2_comparison.html` | P2 |
| `faculty-ratio` | 교원당 대학원생 비율 | `grad_s3_2_faculty.html` | P2 |
| `uglink-dashboard` | 학석사 연계 대시보드 | `grad_s3_3_uglink_dashboard.html` | P2 |
| `uglink-guide` | 학석사 연계과정 안내 | `grad_s3_3_uglink_guide.html` | P2 |
| `ax-majors` | AX 18개 융합전공 | `AX융합학부_융합전공.html` (=`majors`) | P3 |

> 원본 호스트: `https://inetguru.github.io/pnu_ai/`

---

## 5. 배치 원칙
1. **페이지 = 1 주제** (홈/대학원육성/구심점확립/A.U.R.A./데이터룸)
2. **긴 스크롤 금지** — 섹션 4개 초과 시 분할(그래서 A.U.R.A.는 P4 단독)
3. **비전체계도 = 시그니처** — 홈 요약 + P4 전체, 어느 축에도 종속 안 함
4. **본문 ↔ 데이터룸 분리** — 서술 vs 인터랙티브
5. **콘텐츠 출처 = `content.ts` 단일 출처** — 숫자·문구 새로 지어내지 말 것
6. **사람 이름 전면 제외** — 직함/기관/제품명만 (`content.ts` 정책)

---

## 6. 다음 에이전트 체크리스트
- [ ] `/`, `/grad`, `/hub`, `/aura`, `/data/[slug]` 라우트 (App Router, `src/app/<route>/page.tsx`)
- [ ] 상단 스티키바 내비 + 현위치 표시 (좌측 사이드바 없음)
- [ ] 모든 텍스트·숫자 = `content.ts`에서만 (lorem·임의 수치 금지)
- [ ] P4에 비전체계도 4단 + 8블록 + 성과/서비스/로드맵 전부
- [ ] 교육과정·생태계·실행항목 **미포함**
- [ ] `AGENTS.md` 준수(Next 16 최신 규약 — `node_modules/next/dist/docs/` 먼저 읽기)
- [ ] 모션은 `prefers-reduced-motion` 게이트 · WCAG AA · build/lint 통과

---

## 7. 시안 2개 → 멀티 페이지 분할 지침 (작업 지시)

> **전제:** 디자인 시안 **2개를 최종 선택**한다(현재 후보: 다크 `bymonolog` · 라이트 `tresmares` — `content.ts > variants`). 각 시안의 **비주얼·모션 언어는 그대로 유지**하되, 지금의 1페이지 롱스크롤을 **§1 사이트맵(P1–P5)으로 분할**한다. 콘텐츠는 절대 새로 만들지 말고 `content.ts`만 사용.

### 7-1. 라우트 구조 (시안별 네임스페이스)
각 시안이 자기 라우트 트리를 소유한다. 공용 `globals.css`·타 시안 파일은 건드리지 않는다(design.md 격리 원칙 유지).
```
/                      → 두 시안 진입 허브 (variants 선택, 기존 page.tsx 활용)
/<variant>             → P1 홈
/<variant>/grad        → P2 대학원 육성
/<variant>/hub         → P3 구심점 확립
/<variant>/aura        → P4 A.U.R.A. ★
/<variant>/data/[slug] → P5 데이터룸
   (<variant> = bymonolog | tresmares)
```
- App Router: `src/app/<variant>/<page>/page.tsx`. 각 시안 폴더 안에 `Client.tsx` + 콜로케이트 컴포넌트 + `<variant>.css`.
- **공유:** `content.ts`, `useLenis`, 스택스크롤 훅(`useStackScroll`), 데이터룸 임베드 컴포넌트.
- **시안 고유:** 팔레트·타이포·모션·`--page-accent`(bymonolog 골드 `#C9A227` / tresmares 레드 `#E2231A`).

### 7-2. 현재 1페이지 섹션 → 페이지 재배치 맵
기존 단일 스크롤 섹션(EVALUATION 기준)을 아래로 흩는다. **한 페이지에 섹션 3~4개 상한**(롱스크롤 방지).

| 현재 섹션 | → 이동할 페이지 |
|-----------|----------------|
| Hero | P1 홈 |
| ⭐ 비전체계도(요약) · Metrics(4) · 2축 진입 | P1 홈 |
| Identity(4축) 중 대학원 관련 · gradReality · gradPlan | P2 /grad |
| hub.org(학사조직) · governance · infra · majors | P3 /hub |
| A.U.R.A 8/22/47 · 4축 프레임워크 · blocks · 서비스(4) · Achievements · Roadmap | P4 /aura |
| Funding(7) | P1 홈 보조 또는 P3 하단 (스코프 보조지표 — 비중 낮게) |
| Contact | 전 페이지 공통 Footer |

### 7-3. 시그니처 스크롤 모션 배치
각 시안은 **시그니처 스크롤 모션 1개**를 가진다(design.md). 분할 후에는 **그 모션을 P4 `/aura`에 배치**한다(A.U.R.A.가 콘텐츠 시그니처이므로 일치).
- `bymonolog`: "A.U.R.A 워드마크 핀 분할 리빌" → `/aura`에서 8/22/47 공개 순간.
- `tresmares`: "핀 좌측 내비 + SVG 성장선" → `/aura`에서 4축/로드맵 전개.
- 나머지 페이지(P1~P3)는 **가벼운 진입 모션만**(fade/stagger). 페이지마다 핀+스크럽 대형 연출을 반복하지 말 것(짧게 유지).

### 7-4. 공통 셸 (두 시안 공유 규약)
- **상단 스티키바 내비**(좌측 사이드바 없음): `로고 │ 대학원육성 │ 구심점확립 │ A.U.R.A.★ │ 데이터룸 │ QR`. 현재 라우트 하이라이트. 시안 테마 색만 갈아끼움.
- **페이지 길이 가드:** 각 라우트는 §1 해당 섹션만. 한 라우트가 기존 10섹션 전체를 다시 들고 있으면 분할 실패.
- **데이터룸:** P5는 원본 HTML `iframe` 임베드 1차(시안 셸 안에 끼움).
- **페이지 전환:** 선택. 넣으면 두 시안 동일 규칙(예: Lenis 유지 + 짧은 fade).

### 7-5. 하지 말 것
- ✗ 어느 한 페이지를 기존 풀 롱스크롤로 두기 (분할 목적 위반)
- ✗ `content.ts` 밖 텍스트·수치 생성 / 교육과정·생태계·실행항목 추가
- ✗ 시안 간 파일·CSS 교차 수정 (격리 원칙)
- ✗ 사람 이름 노출 (직함/기관/제품명만)

### 7-6. 산출물
- [ ] `bymonolog`, `tresmares` 각각 P1–P5 라우트 5종
- [ ] 두 시안 공통: 상단 스티키바 내비 · 공통 Footer(Contact) · content.ts 단일 출처
- [ ] 시그니처 모션은 각 시안 `/aura`에 1회
- [ ] 각 라우트 섹션 3~4개 상한 준수 · build/lint 통과 · `AGENTS.md` 준수
