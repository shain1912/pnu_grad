# s30 페이지 재구축 — 공용 빌드 키트 (BUILD KIT)

당신은 부산대학교 **AI 거점대학육성사업단 (ARISE PNU)** 공식 사이트의 하위 페이지 1개를 제작/보강/검수하는 에이전트입니다. 이 문서는 모든 페이지가 공유하는 규칙·크롬(공통 HTML)·디자인 시스템·콘텐츠 팩트입니다. **반드시 끝까지 읽고 그대로 따르세요.**

---
## 0. 절대 규칙
1. **사실 날조 절대 금지.** 아래 "검증된 팩트"에 없는 통계·인물·날짜·수상·기관명을 새로 지어내지 마세요. 시각적 풍성함이 필요하면 기존 팩트를 재구성하거나 일반적 표현을 쓰세요. 이 사이트는 "허위 안내 정정" 이력이 있어 정확성이 매우 중요합니다.
2. **★최우선 규칙 — 글 거의 제로(near-zero text).** 이 사이트는 "그림(인포그래픽) 중심, 글 거의 없음"이 핵심 요구입니다.
   - **본문 문단(prose) 전면 금지.** 설명 단락(`.desc`, 긴 `.ph-sub`, `<p>` 문단, `.aura-desc`, `.feat-desc`, `.gov-desc`, `.nc-desc`, `.vision-desc`, `.s-sub` 긴 문장 등)을 쓰지 마세요. 완전한 문장·여러 줄 설명 금지.
   - **모든 정보는 시각 요소로 전달**: 큰 숫자/카운터, 차트(Chart.js), SVG 다이어그램·플로우·도넛·게이지, 아이콘, 배지/칩, 이미지 카드, 타임라인, 진행바, 비교표.
   - **허용 텍스트는 '인포그래픽 안의 짧은 라벨'뿐**: 제목(≤8어), 통계 숫자+라벨(≤6어), 칩/배지(1~3어), 이미지 캡션(≤10어), 차트 축/범례. 그 이상은 실패.
   - 화면에 문장(주어+서술어로 이어지는 긴 글)이 보이면 잘못된 것. 문단이 있던 자리는 → 숫자 타일/아이콘 리스트/차트/다이어그램으로 **대체**하세요.
   - `.ph-sub`는 한 줄 짧은 태그라인만(≤10어) 또는 생략. `s-title`(짧은 제목)·`s-eyebrow`(영문 라벨)는 유지하되 `s-sub` 긴 설명은 제거/축약.
3. **톤**: 홍보·임팩트·프리미엄("있어보이게"). 여백·그라데이션·SVG·Chart.js·카운터·배지·사진 오버레이 적극 사용. **성과(achievements)를 최우선 강조** — 세계 1위·수상·국내 최초 같은 임팩트를 크게.
4. **디자인 시스템 재사용.** `/src/styles/main.css`에 이미 정의된 클래스(아래 카탈로그)를 최대한 재사용. 페이지 고유 CSS가 필요하면 그 페이지 HTML의 `<head>` 안 `<style>` 블록에 작성 — **`main.css`는 절대 수정하지 마세요(여러 에이전트 동시 작업, 충돌 방지).**
5. **공통 크롬(아래 §3)을 그대로 복붙**하고, 자기 페이지 메뉴의 `.nav-link`에만 `active` 클래스를 추가.
6. 한국어 본문, `word-break:keep-all` 적용됨. 폰트: Noto Sans KR / Inter / Source Serif 4 (CDN 이미 로드).
7. 결과물은 **완결된 단일 HTML 파일**. `<!DOCTYPE html>`부터 `</html>`까지.

## 1. 경로 / 서빙
- 사이트 base: `/s30/`. 하위 페이지: `/s30/about/`, `/s30/programs/`, `/s30/achievements/`, `/s30/partners/`, `/s30/news/`, `/s30/roadmap/`.
- 파일 위치: `s30/<name>/index.html` (예: `s30/about/index.html`).
- **이미지/에셋 경로**: `/s30/assets/img/<파일>.jpg`, 로고 `/s30/assets/pnu-signature.jpg`, `/s30/assets/pnu-symbol-color.jpg`.
- CSS: `<link rel="stylesheet" href="/src/styles/main.css">` (홈과 동일하게 절대경로 그대로).
- Font Awesome 6.5 + Google Fonts CDN (아래 head 템플릿 그대로).
- **AURA 몰입형 페이지**는 이미 `/s30/aura/`에 이식됨(독립 앱). 링크만 걸면 됨.

## 2. 사용 가능한 실제 이미지 (`/s30/assets/img/`)
robocup.jpg(휴머노이드 로봇), quantum.jpg(양자), google-edu.jpg, bootcamp.jpg, marine-ai.jpg(해양), medical-ai.jpg(의료), mfg-ai.jpg(제조), mobility-ai.jpg(모빌리티), lab-research.jpg(연구실), library.jpg, library-2.jpg, campus.jpg, university.jpg, it-building.jpg, it-building-2.jpg, students.jpg, graduation.jpg, diploma.jpg, lecture-hall.jpg, coding.jpg, data-analytics.jpg, college-ai.jpg, handshake.jpg, meeting.jpg, partnership.jpg, tech-circuit.jpg, korea-architecture.jpg, korea-traditional.jpg.
- 사진은 항상 `onerror`로 그라데이션 폴백 처리(아래 §3 예시 참고).
- 동영상 히어로용: `/s30/assets/video/hero.mp4`, 포스터 `/s30/assets/img/university.jpg`.

## 3. 공통 크롬 — 그대로 복붙

### 3.1 `<head>` (title/description만 페이지에 맞게 수정)
```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{PAGE_TITLE}} — 부산대학교 AI 거점대학육성사업단 | ARISE PNU</title>
<meta name="description" content="{{PAGE_DESC}}">
<link rel="icon" type="image/jpeg" href="/s30/assets/pnu-symbol-color.jpg">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Inter:wght@300;400;500;600;700;800;900&family=Source+Serif+4:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="/src/styles/main.css">
<!-- (선택) Chart.js가 필요하면: <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script> -->
<style>
/* 페이지 고유 CSS는 여기에만. main.css는 건드리지 말 것. */
</style>
</head>
<body>
```

### 3.2 TOPBAR + HEADER (그대로. 자기 메뉴 nav-link에만 ` active` 추가)
```html
<!-- TOP BAR -->
<div class="topbar">
  <div class="container">
    <div class="left">
      <span class="live"><span class="live-dot"></span> 2026 AI 거점대학사업 운영 중</span>
      <span style="margin-left:14px">·</span>
      <span class="slogan-strip" style="margin-left:14px">Arise PNU, 같이 더 높게</span>
    </div>
    <div class="right">
      <a href="https://www.pusan.ac.kr" target="_blank"><i class="fas fa-external-link-alt" style="font-size:9px;margin-right:4px"></i>부산대학교</a>
      <a href="https://ai.pusan.ac.kr" target="_blank">AI 대학</a>
      <a href="https://airc.pusan.ac.kr" target="_blank">장영실연구원</a>
      <a href="#">로그인</a>
    </div>
  </div>
</div>
<!-- MAIN HEADER -->
<header class="main-hdr">
  <div class="container hdr-inner">
    <a href="/s30/" class="brand">
      <img src="/s30/assets/pnu-signature.jpg" alt="부산대학교 공식 시그니처" class="brand-logo">
      <div class="brand-divider"></div>
      <div>
        <div class="brand-text-ko">AI 거점대학육성사업단</div>
        <div class="brand-text-en">ARISE · arise-ai.pusan.ac.kr</div>
      </div>
    </a>
    <nav class="main-nav">
      <div class="nav-item">
        <a href="/s30/about/" class="nav-link">사업 소개 <i class="fas fa-chevron-down"></i></a>
        <div class="dropdown">
          <a href="/s30/about/#overview"><div class="d-i"><i class="fas fa-flag"></i></div>사업 개요 · 비전</a>
          <a href="/s30/about/#aura"><div class="d-i"><i class="fas fa-sitemap"></i></div>A.U.R.A 2.0 마스터플랜</a>
          <a href="/s30/about/#governance"><div class="d-i"><i class="fas fa-users-cog"></i></div>거버넌스</a>
          <a href="/s30/roadmap/"><div class="d-i"><i class="fas fa-bullseye"></i></div>3개년 로드맵</a>
        </div>
      </div>
      <div class="nav-item">
        <a href="/s30/programs/" class="nav-link">핵심 사업 <i class="fas fa-chevron-down"></i></a>
        <div class="dropdown">
          <a href="/s30/programs/#education"><div class="d-i"><i class="fas fa-graduation-cap"></i></div>AI 교육 혁신</a>
          <a href="/s30/programs/#research"><div class="d-i"><i class="fas fa-microscope"></i></div>AI 연구 강화</a>
          <a href="/s30/programs/#industry"><div class="d-i"><i class="fas fa-handshake"></i></div>산학 협력</a>
          <a href="/s30/programs/#infra"><div class="d-i"><i class="fas fa-server"></i></div>AI 인프라</a>
        </div>
      </div>
      <div class="nav-item">
        <a href="/s30/achievements/" class="nav-link">성과 <i class="fas fa-chevron-down"></i></a>
        <div class="dropdown">
          <a href="/s30/achievements/#robocup"><div class="d-i"><i class="fas fa-trophy"></i></div>RoboCup 2025 우승</a>
          <a href="/s30/achievements/#quantum"><div class="d-i"><i class="fas fa-atom"></i></div>양자AI 47억 사업</a>
          <a href="/s30/achievements/#papers"><div class="d-i"><i class="fas fa-file-alt"></i></div>논문 · 특허</a>
          <a href="/s30/achievements/#transfer"><div class="d-i"><i class="fas fa-exchange-alt"></i></div>기술이전 · 창업</a>
        </div>
      </div>
      <div class="nav-item">
        <a href="/s30/partners/" class="nav-link">파트너십 <i class="fas fa-chevron-down"></i></a>
        <div class="dropdown">
          <a href="/s30/partners/#google"><div class="d-i"><i class="fab fa-google"></i></div>Google for Education</a>
          <a href="/s30/partners/#industry"><div class="d-i"><i class="fas fa-industry"></i></div>산학 협약 (35+)</a>
          <a href="/s30/partners/#global"><div class="d-i"><i class="fas fa-globe"></i></div>글로벌 협력</a>
          <a href="/s30/partners/#govt"><div class="d-i"><i class="fas fa-landmark"></i></div>정부·공공기관</a>
        </div>
      </div>
      <div class="nav-item">
        <a href="/s30/news/" class="nav-link">알림마당 <i class="fas fa-chevron-down"></i></a>
        <div class="dropdown">
          <a href="/s30/news/?cat=notice"><div class="d-i"><i class="fas fa-bullhorn"></i></div>공지사항</a>
          <a href="/s30/news/?cat=news"><div class="d-i"><i class="fas fa-newspaper"></i></div>뉴스·보도자료</a>
          <a href="/s30/news/?cat=event"><div class="d-i"><i class="fas fa-calendar-alt"></i></div>행사·일정</a>
          <a href="/s30/news/?cat=resource"><div class="d-i"><i class="fas fa-download"></i></div>자료실</a>
        </div>
      </div>
      <a href="/s30/partners/#contact" class="nav-link nav-cta">참여 신청 →</a>
      <div class="lang-toggle">KOR | ENG</div>
    </nav>
  </div>
</header>
```

### 3.3 PAGE HERO (페이지 상단. 텍스트만 교체. 브레드크럼 current 수정)
```html
<section class="page-hero">
  <div class="container ph-inner">
    <div class="ph-left">
      <div class="ph-eyebrow">{{EN_EYEBROW}}</div>
      <h1 class="ph-title">{{제목}} <em>{{강조어}}</em></h1>
      <p class="ph-sub">{{한 줄 요약}}</p>
      <div class="breadcrumb">
        <a href="/s30/"><i class="fas fa-home"></i> 홈</a>
        <i class="fas fa-chevron-right"></i>
        <span class="current">{{메뉴명}}</span>
      </div>
    </div>
    <div class="ph-icon"><i class="fas fa-{{아이콘}}"></i></div>
  </div>
</section>
```

### 3.4 FOOTER (그대로 복붙)
```html
<footer class="site-footer">
  <div class="container">
    <div class="ft-top">
      <div>
        <div class="ft-brand-row">
          <img src="/s30/assets/pnu-signature.jpg" alt="부산대학교" class="ft-logo-img" style="filter:brightness(0) invert(1)">
        </div>
        <div class="ft-brand-name">AI 거점대학육성사업단 · ARISE PNU<small>arise-ai.pusan.ac.kr · A.U.R.A 2.0 마스터플랜</small></div>
        <div class="ft-desc" style="margin-top:16px"><em>"Arise PNU, 같이 더 높게"</em> — 동남권 AX 생태계의 중심 거점, 부산대학교 AI 거점대학육성사업단입니다.</div>
        <div class="ft-addr">📍 부산광역시 금정구 부산대학로 63번길 2 · IT관 3층 AI 거점사업단<br>📞 051-510-0000 · ✉ arise@pusan.ac.kr<br>⏰ 평일 09:00 – 18:00</div>
        <div class="ft-sns" style="margin-top:24px">
          <a href="#"><i class="fab fa-youtube"></i></a><a href="#"><i class="fab fa-x-twitter"></i></a><a href="#"><i class="fab fa-linkedin"></i></a><a href="#"><i class="fab fa-github"></i></a><a href="#"><i class="fab fa-instagram"></i></a>
        </div>
      </div>
      <div class="ft-col"><h4>사업 소개</h4>
        <a href="/s30/about/#overview">사업 개요 · 비전</a><a href="/s30/about/#aura">A.U.R.A 2.0</a><a href="/s30/about/#governance">거버넌스</a><a href="/s30/roadmap/">3개년 로드맵</a>
      </div>
      <div class="ft-col"><h4>핵심 사업</h4>
        <a href="/s30/programs/#education">AI 교육 혁신</a><a href="/s30/programs/#research">AI 연구 강화</a><a href="/s30/programs/#industry">산학 협력</a><a href="/s30/programs/#infra">AI 인프라</a>
      </div>
      <div class="ft-col"><h4>관련 사이트</h4>
        <a href="https://www.pusan.ac.kr" target="_blank">부산대학교 ↗</a><a href="https://ai.pusan.ac.kr" target="_blank">AI 대학 ↗</a><a href="https://airc.pusan.ac.kr" target="_blank">장영실연구원 ↗</a><a href="https://aiedu.pusan.ac.kr" target="_blank">AI 융합교육원 ↗</a><a href="https://uitc.pusan.ac.kr" target="_blank">AX·정보화혁신본부 ↗</a>
      </div>
    </div>
    <div class="ft-bottom">
      <div class="ft-copy">© 2026 Pusan National University ARISE-AI. All rights reserved.</div>
      <div class="ft-policy"><a href="#">개인정보처리방침</a><a href="#">이메일무단수집거부</a><a href="#">사이트맵</a><a href="#">접근성 정책</a></div>
    </div>
  </div>
</footer>
<script type="module" src="/src/scripts/main.js"></script>
</body>
</html>
```
이미지 onerror 폴백 예시: `<img src="/s30/assets/img/robocup.jpg" alt="..." onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(160deg,#0d3b6e,#005BAA)'">`

## 4. 디자인 시스템 — main.css에 이미 있는 재사용 클래스
- 컬러 변수: `--pnu-blue #005BAA`, `--pnu-blue-dark #143F90`, `--pnu-blue-sub #0075C9`, `--pnu-navy #0F1F45`, `--pnu-green #00A651`, `--gold #3B82F6`(파랑 강조), `--ink #0F172A`, `--text-b/-h/-m`, `--blue-tint #EFF6FF`, `--blue-light #DBEAFE`, `--border`, `--bg-off`, `--bg-cream`, `--bg-section`.
- 레이아웃/공통: `.container`, `.section`(80px 패딩), `.section-alt`(연회색bg), `.section-cream`, `.section-header(.row/.center)`, `.s-eyebrow`, `.s-title`(em=파랑, .grad=블루→그린 그라데), `.s-sub`, `.more-link`.
- 페이지 히어로: `.page-hero`, `.ph-inner/.ph-left/.ph-eyebrow/.ph-title/.ph-sub/.ph-icon`, `.breadcrumb`.
- 스탯 밴드(파랑): `.stats-band > .stats-grid(5열) > .stat-cell > .stat-cell-tag/-num(span)/-lbl/-note`, `.stat-cell-num.gold`.
- AURA 4기둥 카드: `.aura-grid > .aura-card(.green/.violet/.amber) > .aura-letter / .aura-tag / .aura-title(small) / .aura-desc / .aura-list>li>i(fa-check)`.
- 거버넌스: `.gov-grid(3열) > .gov-card > .gov-tag(.gold/.green) / .gov-title / .gov-desc / .gov-list>li`.
- 비전 밴드(네이비 그라데): `.vision-band > .vision-inner > .vision-eyebrow/.vision-title(em)/.vision-desc + .vision-timeline > .vt-item > .vt-year/.vt-text`.
- 개요 그리드: `.overview-grid(1.2:1) > .ov-text(p>strong) / .ov-meta > .ov-meta-cell(.k/.v) ; .ov-side > h4/.quote/cite/.ov-stat-row>.ov-stat(.n>span/.l)`.
- 다이어그램: `.diagram-wrap > .diagram-svg`(SVG), `.diagram-line`(애니 흐름). 홈의 `.hub-svg` 패턴 참고(노드 원+화살표+pulse).
- 성과 피처카드: `.feat-card(2열) > .img-wrap(img + .badge-strip>.badge(.dark)) + .feat-body > .feat-cat/.feat-title/.feat-desc/.feat-meta>.feat-meta-cell(.k/.v)/.feat-defeated>.def-chip(i fa)`.
- 성과 그리드: `.ach-grid(3열) > .ach-card(.gold/.green/.violet) > .ach-icon / .ach-tag / .ach-title / .ach-desc / .ach-num(span)/.ach-num-lbl`.
- 순위 테이블: `.rank-table > table > th/td, .rank-name/.rank-pos/.rank-delta(i)`.
- 예산 바: `.budget-flow > .bar-row(200px 1fr 100px) > .bar-label(small) / .bar-track>.bar-fill(.b1~.b7, 너비 인라인) / .bar-value`.
- 프로그램: `.programs-grid(3열+1.3fr) > .program-tile > .pt-top(.green/.violet)/.pt-icon/.pt-title/.pt-desc/.pt-tag ; .program-feature(span2) > .pf-img + .pf-content > .pf-badge/.pf-title/.pf-desc/.pf-stats>.pf-stat(.n/.l)`.
- 파트너: `.partners-section > .partners-wrap > .partners-header + .partners-grid(6열) > .partner-chip > .partner-icon(.google/.aws/.nvidia/.samsung/.lg/.stanford/.eunsung/.kims/.kt/.upstage/.lguplus/.busan/.etri/.kbiz/.hanwha/.bnk/.naver) + .partner-name>.partner-name-top/.partner-cat`.
- 로드맵(네이비): `.roadmap-section > .rm-timeline(3열) > .rm-col(.active/.future) > .rm-marker/.rm-year/.rm-phase/.rm-item>.rm-item-cat/.rm-item-text`.
- 뉴스: `.news-layout(1fr 360px)`, `.feature-news > img + .feature-news-inner > .fn-cat/.fn-title/.fn-desc/.fn-meta`, `.filter-bar>button(.active>.count)`, `.news-cards > .news-card(170px 1fr) > .nc-img(img/.nc-img-fallback) + .nc-body > .nc-head>.nc-cat(.award/.partner/.research/.event/.project/.notice)+.nc-date / .nc-title / .nc-desc`, `.pagination`, `.sidebar > .sb-box(.blue/.amber) > .sb-head>.sb-title/.sb-link + .sb-list>.sb-item>.sb-item-title/-date ; .sb-resource a>i ; .newsletter>.nl-tag/.nl-h/.nl-d/.nl-form`.
- 효과: hover translateY, `pulseScale`, `flow`(stroke-dashoffset), `blink`, `floatie`. prefers-reduced-motion 이미 처리됨.

## 5. 검증된 팩트 (이 범위 내에서만 작성)
**사업 정체성**: 부산대학교 AI 거점대학육성사업단(ARISE PNU) · arise-ai.pusan.ac.kr · 슬로건 "Arise PNU, 같이 더 높게" · 교육부 선정(2025) · 동남권 거점 · 부산대 80주년 기념사업 · 국립대 1위(3년 연속).
**리더십/거버넌스**: 최재원 총장 · 박상후 대외·전략부총장(A.U.R.A 총괄) · 총장 직속 **AX 선도위원회** · **AX·정보화혁신본부**(2025 신설, uitc.pusan.ac.kr). 관련기관: AI 대학(ai.pusan.ac.kr), 장영실 AI융합연구원(airc.pusan.ac.kr), AI 융합교육원(aiedu.pusan.ac.kr).
**A.U.R.A 2.0 (2026.02 발표, 2년 100억 투자)** — 4대 전략축:
 - **A · AI Philosophy(AI 철학)**: 윤리·철학 기반 대학문화. AI 윤리·사용 가이드라인 v1(2025), 전 구성원 AI 리터러시 의무교육, 전교필수 "AI와 디지털 사고"(3학점). 총장 인용: "AI는 단순한 기술혁신을 넘어 국가 경쟁력을 좌우하는 구조적 변화의 중심에 있습니다."
 - **U · Unified Research(융합 연구)**: 장영실 AI융합연구원 거점. 양자AI 47억·위상초전도체, 삼성중공업·은성의료재단·KIMS 협약, 글로벌 연구네트워크 10개(목표).
 - **R · Reinforced Education(증강 교육)**: AI 대학 신설(2027·424명), AI 부트캠프 75억·7트랙, Pentomino 학사구조·마이크로디그리 13트랙, AI+X 증강인재 4,000명(2027 목표).
 - **A · Adaptive Administration(지능형 행정)**: 산지니 AI(국립대 최초·2025.12), AI 통번역 안경 20개 언어·98%, Google AI Ecosystem 전면도입(2026.06), 행정 만족도 70→80→90.
 - 추진 규모 지표: **8·22·47** (전략목표·전략과제·실행과제).
**핵심 정량지표**: 국책사업 누적 **3,111억**(2023–, 8개 대형사업) · AI 교수진 **58명**(정컴24·DS5·통계7) · AI 연구그룹 **14+**(AILab·VIPLab·XRL·S3Lab) · AI 대학 2027 신입생 **424명** · QS **473위** · 연간논문 **480+편** · 목표 2030 Top 200 / 2046(100주년) Top 100.
**예산 구조(3,111억)**: 글로컬대학30 1,500억(48.2%·2023–27·교육부) / RISE 956억(30.7%·2025–29·교육부×부산시) / 반도체특성화대학 328억(10.5%·KIAT) / SW중심대학 2단계 142억(4.6%·MSIT) / AI첨단산업 부트캠프 75억(2.4%·교육부×KIAT) / AI융합대학원 2기 63억(2.0%·IITP) / 양자과학기술 원천연구 47억(1.5%·MSIT·국내최초). (SOURCE: 부산대 기획처, UPDATED 2026.05.26)
**성과(achievements) — 최우선**:
 - **RoboCup 2025 세계 챔피언십 우승** — 'TidyBoy' / 휴머노이드 'Anubis', **8/8 미션 완수**, 1,500팀 격파, 이승준 교수팀(전기공학부), 2025.08.21.
 - **양자AI 47억원 국내 최초 원천연구** — 옥종목 교수, 위상초전도체, 2025–2029(MSIT), 선정 2025.06.15.
 - **2025 한국의 경영대상 AI 혁신 부문 대상(대학 유일)** — KMAC, 2025.12.09 (근거: 장영실 AI융합연구원·산지니 AI·AI 스마트글라스·AX Philosophy).
 - **University AI-MASTER 국내 대학 최초 인증** — 한국인공지능산업협회, 2026.03.05 (시스템 신뢰성·알고리즘 윤리성·기술적 안정성 모두 적합).
 - **지도교수상담 AI 도우미** 국립대 최초 자체구축 — 2025.12.24 (생성정보 저장·학습 미사용 원칙).
 - **산지니 AI** 국립대 최초 LLM 자체구축(2025.12) / **장영실 AI융합연구원** 개원 2025.12.30 / **AI 통번역 스마트글라스** 국내 최초 도입.
 - 국제 경진대회 28+ 수상(RoboCup·Kaggle·NeurIPS 등) · 기술이전·창업 누적 12억 유치.
**파트너 35+**: Google for Education(2026.05.13 국내 대학 최초 전면도입, Reference University 지정 추진), AWS Korea, NVIDIA(Physical AI), 업스테이지, NAVER Cloud, Stanford, 삼성중공업(해양AI센터), LG전자(채용연계 스마트가전공학과 2027·정원30·등록금 전액), 은성의료재단(AX헬스케어), 한국재료연구원 KIMS(소재AI), 한화에어로(방산AI), BNK부산은행(금융AI), LG U+(에듀테크), KT, ETRI, 부산광역시(RISE), 중기부, 교육청, KMAC. (+ 외 다수)
**인프라**: IT관 신축(267억·13,161㎡, 2025 착공) · Google AI Ecosystem · 산지니 AI · 양자컴퓨팅 시범 인프라(2027).
**3개년 로드맵**: 2025 기반구축(A.U.R.A 선언·발족, AX·정보화혁신본부 신설, 산지니 AI, 장영실연구원 개원, 경영대상 대상, IT관 착공) → 2026 실행(AI-MASTER 인증, AI 부트캠프 1기, LMS AI 조교, Google 전면도입, 거점대학 본 선정 신청 7월) → 2027 확산(AI 대학 첫 신입생 424명, 행정 만족도 90, 글로벌 연구네트워크 10개, 동남권 AX 허브 완성).

## 6. AURA — 별도 페이지 금지, about에 인라인 삽입
- **별도 `/s30/aura/` 페이지를 만들지/링크하지 마세요.** A.U.R.A 2.0 마스터플랜은 **사업소개(about) 페이지 본문 안 `#aura` 섹션으로 자연스럽게 녹여** 넣습니다. (드롭다운/푸터의 "A.U.R.A 2.0" 링크는 `/s30/about/#aura`.)
- about의 `#aura` 블록은 **시네마틱 다크 풀블리드 인포그래픽 존**으로 구성(글 거의 없이):
  - 거대한 `A · U · R · A` 4기둥 비주얼(Source Serif 4 대형 레터 + 아이콘 + 키워드 칩 3~4개씩, 문장 금지).
  - **Chart.js 차트 2개**: ① 행정 만족도 라인(70→80→90), ② 4대 전략+AI 인프라 레이더(현재 vs 2027 목표). (다크 배경에 맞는 색.)
  - KPI 대형 숫자 타일: 100억(2년 AX 투자)·4,000명(2027)·8·22·47.
  - 다크 그라데/글로우/그리드 배경으로 "있어보이게". 일반 페이지 흐름 안에서 스크롤되도록(스크롤 하이재킹·스냅 금지).
- 참고용 원본 시안 데이터는 §5 팩트에 모두 있음. (이식돼 있던 정적 앱은 제거 예정이니 의존하지 말 것.)
