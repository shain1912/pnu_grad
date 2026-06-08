// 로컬 번들 폰트 — 폐쇄망(air-gapped) 배포용. CDN(@import url) 대신 npm 패키지의
// woff2 를 Vite 가 번들한다. 원본 globals.css 의 Google Fonts/Pretendard CDN 대체.
//
// @theme 의 --font-* 패밀리 이름과 일치해야 적용된다(아래 family 이름 기준):
//   Pretendard Variable / Newsreader Variable / Archivo Variable /
//   JetBrains Mono Variable / Plus Jakarta Sans Variable / Space Grotesk Variable /
//   Black Han Sans / Nanum Myeongjo

// sans — Pretendard (가변)
import "pretendard/dist/web/variable/pretendardvariable.css";

// 라틴/디스플레이 (가변 — 한 번 import 로 모든 weight 커버)
import "@fontsource-variable/newsreader/index.css"; // serif (84곳)
import "@fontsource-variable/archivo/index.css"; // display (12곳)
import "@fontsource-variable/jetbrains-mono/index.css"; // mono (35곳)
import "@fontsource-variable/plus-jakarta-sans/index.css"; // jakarta (5곳)
import "@fontsource-variable/space-grotesk/index.css"; // grotesk (1곳)

// 한글 디스플레이/명조 (정적 weight)
import "@fontsource/black-han-sans/400.css"; // heavy (47곳)
import "@fontsource/nanum-myeongjo/400.css"; // myeongjo / serif fallback
import "@fontsource/nanum-myeongjo/700.css";
import "@fontsource/nanum-myeongjo/800.css";
