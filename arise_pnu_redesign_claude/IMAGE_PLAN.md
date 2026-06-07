# 이미지 플랜 — ARISE PNU 사이트

> 사진 자산이 없어 현재는 **차트·다이어그램·분위기(CSS/SVG)** 로 비주얼을 채운다.
> 아래 이미지를 구해 `assets/img/`(→ `public/img/`로 복사)에 **지정 파일명**으로 넣으면,
> 각 슬롯이 자동으로 사진으로 교체된다(없으면 CSS 폴백 유지).
>
> ⚠️ **저작권**: "무료=마음대로"가 아니다. 아래 안전 출처 위주로, 출처/라이선스 표기.

## 안전한 출처 (우선순위)
1. **Wikimedia Commons** (CC BY-SA, 출처표기 시 상업적 사용 가능) — 부산대 캠퍼스 사진
   - 카테고리: https://commons.wikimedia.org/wiki/Category:Pusan_National_University
   - 예: `File:Pusan National Univ 2010.JPG`, `File:Pusan National Univ Yangsan Campus 2010.JPG`
2. **부산대 공식 무료 콘텐츠** (대학 제공 PPT/이미지 템플릿) — https://his.pusan.ac.kr (콘텐츠 무료 이용 안내)
3. **부산대 공식 채널** (보도자료/홍보 이미지 — 사용 시 대학 허가 권장): pusan.ac.kr, 공식 페이스북
4. **Unsplash / Pexels** (CC0류) — "Pusan National University", "Busan university campus", "AI lab", "robotics", "data center GPU" 등 키워드 (캠퍼스 특정 사진은 없을 수 있어 분위기용)

## 페이지별 필요 이미지 (파일명 = `public/img/<name>`)
| 위치 | 파일명 | 내용 | 비율 | 출처 권장 |
|------|--------|------|------|-----------|
| 홈 Hero | `hero-poster.jpg` | hero.mp4 포스터(첫 프레임) 또는 캠퍼스 전경 | 16:9 | Wikimedia 캠퍼스 / 영상 캡처 |
| 홈 / 전반 배경 | `campus-aerial.jpg` | 부산캠퍼스 전경(장전) | 16:9 | Wikimedia |
| 대학원육성 인트로 | `grad-lecture.jpg` | 강의실/대학원 연구 현장 | 4:3 | Unsplash(university lecture) |
| 구심점 학사조직 | `aicollege.jpg` | IT관/신축 건물 | 3:2 | Wikimedia / PNU |
| 구심점 인프라 | `datacenter.jpg` | GPU/데이터센터 | 16:9 | Unsplash(gpu data center) |
| A.U.R.A 성과 | `award.jpg` | 시상/연구 장면(또는 생략) | 4:3 | PNU 보도(허가) |
| 서비스 | `smartglass.jpg` | 스마트글라스/AI 디바이스 | 1:1 | Unsplash(smart glasses) |
| 공통 워터마크 | (로고 사용 — 이미 `public/pnu/`) | PNU 심볼 | — | 보유 |

## 표기 규칙
- Wikimedia 사용 시 푸터에 `이미지: ⓒ <저자>, CC BY-SA, Wikimedia Commons` 표기.
- 특정 캠퍼스 사진이 없으면 분위기 이미지(데이터센터/연구실) + 차트/다이어그램으로 대체.

## 현재 상태
- 사진 없이도 밋밋하지 않도록 **차트(라인/막대/도넛/게이지) + 다이어그램(A.U.R.A 4단·ADP+X·생태계·존맵·타임라인) + 분위기(그라데이션·그리드·그레인·고스트 숫자) + 아이콘 + 카운트업**으로 구성.
- 위 파일을 넣어주면 해당 슬롯이 사진 우선으로 표시되도록 연결 예정.
