# 병합 & 수정 계획 — 메뉴 2번(Google 협력) + 메뉴 1번 Hero 영상

게이트웨이(`/`)의 3개 메뉴 중:
- **1번** A.U.R.A 마스터플랜 → `/bymonolog`(다크 사이트). **Hero 영상 교체** 예정.
- **2번** Google 협력 → 현재 비활성("준비중") `<div>`. **다른 사람이 React로 제작** → 병합 예정.
- **3번** 학·석사 연계과정 → 정적 `/admission-v3-dark.html`. (변경 없음)

---

## 0. 현재 구조 (확인된 사실)

- SPA 단일 앱: `frontend/src/App.jsx`의 react-router `<Routes>`로 모든 경로 처리.
  - `/` = `pages/Gateway.jsx`, `/bymonolog/*` = `variants/bymonolog/*`, `/dataroom/*`, `/admin/*`, `/login`.
- 빌드: Vite + React + **Tailwind v4** + alias `@` → `src`. 산출물 `frontend/dist`.
- 운영: Express(`backend/src/server.js`)가 prod에서 `dist`를 정적 서빙 + SPA fallback.
  - **선례**: 별도 빌드 사이트를 `s30/dist` → `/s30` 경로로 정적 서빙하는 코드가 이미 있음(스택이 다른 사이트를 격리 서빙하는 패턴).
- 폐쇄망/교내망 대응: 폰트·GSAP·Plotly를 **전부 로컬 번들**(외부 CDN 금지). 신규 코드도 이 규칙을 따라야 함.
- 게이트웨이 2번 현재 마크업: `pages/Gateway.jsx`의 `<div className="gateway-btn google">` + `<span className="tag">준비중</span>`.

---

## 1. 메뉴 2번(Google 협력) 병합

협업자 코드의 **기술 스택**에 따라 두 경로로 갈린다. 먼저 이걸 확정해야 함(§3 질문).

### 경로 A — 같은 스택(Vite + React + Tailwind v4) → **앱 내부 통합 (권장)**

같은 SPA 안의 라우트로 흡수. URL 예: `/google` (또는 `/partnership`).

1. **코드 배치**: 협업자 컴포넌트를 `src/pages/google/` 또는 `src/variants/google/`로 복사(변형 사이트는 `variants/` 컨벤션).
2. **라우트 추가** (`App.jsx`):
   ```jsx
   import GooglePage from './variants/google/page.jsx';
   ...
   <Route path="/google" element={<GooglePage />} />
   ```
3. **게이트웨이 2번 활성화** (`pages/Gateway.jsx`): 비활성 `<div>` → `<Link>`, "준비중" 태그 제거.
   ```jsx
   <li>
     <Link className="gateway-btn google" to="/google">
       <span className="num">02</span>
       <strong>Google 협력</strong>
       <span className="desc">Google과 함께하는 AI 교육·연구 협력</span>
       <span className="btn-arrow"><span className="arrow-icon"></span></span>
     </Link>
   </li>
   ```
4. **import 경로/alias 정리**: 협업자가 다른 alias나 상대경로를 썼다면 `@/...`로 통일.
5. **의존성 병합**: 협업자 `package.json`의 deps를 우리 `frontend/package.json`에 합치고 `npm install`. **버전 충돌**(특히 react, react-router, tailwind, gsap) 확인 — 우리 버전 기준으로 맞추는 걸 우선.
6. **스타일 충돌 격리**: Tailwind v4 전역 토큰/클래스가 겹칠 수 있음. 협업자가 별도 CSS를 쓰면 페이지 루트에 네임스페이스 클래스(예: `.google-variant`)로 스코프.
7. **에셋**: 이미지/영상/폰트는 `public/`로 옮기고 절대경로(`/...`)로 참조. **외부 CDN 폰트·스크립트 금지**(폐쇄망 규칙) — 있으면 로컬 번들로 치환(기존 `public/fonts`, `public/vendor` 방식 그대로).

### 경로 B — 다른 스택(Next.js / CRA / 다른 Tailwind 등) → **격리 정적 서빙**

포팅 비용이 크면 `/s30` 선례처럼 **별도 빌드 결과물을 한 경로에 정적 서빙**.

1. 협업자 앱을 그쪽 방식대로 정적 빌드(`out/` 또는 `dist/`)하게 함. **base path를 `/google`로** 설정 요청(상대경로 깨짐 방지).
2. 결과물을 repo의 `google/dist/`(예시)로 배치.
3. `server.js`에 s30과 동일 패턴 추가:
   ```js
   const googleDist = resolve(__dirname, '..', '..', 'google', 'dist');
   if (existsSync(googleDist)) app.use('/google', express.static(googleDist, { extensions: ['html'] }));
   ```
   그리고 SPA fallback의 예외 목록에 `/google` 추가(현재 `/s30`,`/api`,`/auth`,`/health`처럼).
4. 게이트웨이 2번은 `<a href="/google">`(SPA `Link` 아님, 외부 정적이므로).
5. 단점: 디자인/폰트/헤더가 메인과 따로 놂 → 시각적 일관성은 떨어짐. 폐쇄망 CDN 규칙은 동일하게 적용.

> **권장**: 같은 스택이면 경로 A(통합), 다르면 일단 경로 B로 빠르게 붙이고 추후 포팅 검토.

### 2번 병합 체크리스트
- [ ] 협업자 코드 수령 방식 확정(브랜치/zip/별도 repo)
- [ ] 스택 확인 → 경로 A/B 결정
- [ ] 라우트/링크 연결 + "준비중" 제거
- [ ] 의존성 병합 & 버전 충돌 해소
- [ ] 외부 CDN(폰트/JS) → 로컬 번들 치환 (폐쇄망)
- [ ] 에셋 `public/`로 이동, 절대경로화
- [ ] `npm run build` 통과 + `/google` 동작 확인 + 게이트웨이 왕복 확인
- [ ] 모바일/반응형 + 다른 메뉴와 시각 톤 점검

---

## 2. 메뉴 1번 Hero 영상 교체

대상: `/bymonolog`의 `Hero.jsx` 배경 영상. 정의는 `src/lib/content.js:566` → `heroVideo = "/video/hero.mp4"`.
레이아웃: 풀스크린 배경(`.hero-video { object-fit: cover }`) 위에 **어두운 scrim + 텍스트 오버레이**. 즉 영상은 은은한 시네마틱 배경 역할.

### 교체 방법 (둘 중 하나)
- **A. 파일명 그대로 교체(가장 간단)**: 받은 영상을 `public/video/hero.mp4`로 덮어쓰기. 코드 변경 0.
- **B. 새 파일 추가 후 경로 변경**: `public/video/hero-2026.mp4` 추가 → `content.js`의 `heroVideo` 값만 변경. (버전 관리/롤백 용이)

### 영상 제공자에게 요청할 스펙
- 컨테이너/코덱: **MP4 (H.264 + AAC 또는 무음)** — 브라우저 호환 최우선. (선택: WebM/VP9 추가 제공 시 화질/용량 ↑)
- 화면비/해상도: **16:9 가로, 1920×1080**(또는 2560×1440). `cover`라 크롭되니 **중요 요소는 중앙 안전영역**에.
- 길이: **8~20초 끊김 없는 루프**(시작=끝 매끄럽게).
- 오디오: **불필요**(항상 muted 재생). 넣더라도 무관.
- 용량 목표: **5~10MB 이하 권장**(현재 임시본 47MB는 과함 → 초기 로딩·교내망 부담). 비트레이트로 조절.
- 톤: scrim이 덮이므로 **너무 밝거나 텍스트 위치(중앙/하단 워드마크)와 충돌하는 강한 모션은 지양**.
- (선택) **포스터 이미지 1장**(첫 프레임 jpg) — 로딩 중 표시용.

### 우리 쪽 수정(영상 받은 뒤)
1. 파일 배치(A 또는 B).
2. (권장) **포스터 추가**: `Hero.jsx`의 `<video>`에 `poster="/video/hero-poster.jpg"` 추가 → 첫 프레임 깜빡임 제거.
3. (권장) **용량 최적화**: 10MB 초과면 `ffmpeg`로 재인코딩
   `ffmpeg -i in.mp4 -an -vf "scale=1920:-2" -c:v libx264 -crf 24 -preset slow -movflags +faststart public/video/hero.mp4`
   (`-an` 무음, `+faststart` 스트리밍 시작 빠르게)
4. `npm run build` 후 `/bymonolog`에서 재생/루프/스크럽 애니메이션 확인.

### 1번 영상 체크리스트
- [ ] 영상 수령 + 스펙 충족 확인(코덱/길이/용량)
- [ ] `public/video/`에 배치(파일명 결정)
- [ ] 필요 시 ffmpeg 최적화 + 포스터 생성
- [ ] `Hero.jsx`에 poster 속성 추가
- [ ] 빌드 후 데스크톱/모바일 재생 확인

---

## 3. 확정에 필요한 정보 (협업자/제공자에게)

1. **2번 코드 전달 방식**: 같은 git repo 브랜치? 별도 repo? zip?
2. **2번 스택**: Vite+React+Tailwind v4(우리와 동일)인지, 아니면 Next/CRA/기타? (→ 경로 A vs B 결정)
3. **2번 URL 경로**: `/google` vs `/partnership` vs 기타 희망?
4. **2번 외부 의존**: 폰트/아이콘/스크립트를 CDN에서 불러오는지(폐쇄망 치환 대상 파악).
5. **1번 Hero 영상**: 코덱/해상도/길이/용량과 포스터 이미지 제공 가능 여부.

> 위 1~3이 정해지면 2번 병합 실제 작업(라우트·링크·의존성)을 바로 진행하고,
> 5의 영상이 도착하면 1번 교체는 드롭인 + 최적화로 마무리.
