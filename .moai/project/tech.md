# AEC 컬러링북 - 기술 문서

---

## 메타데이터

| 항목 | 값 |
|------|-----|
| 프로젝트명 | AEC 컬러링북 |
| 문서 유형 | 기술 스택 문서 |
| 최종 업데이트 | 2026-02-01 |

---

## 1. 기술 스택 개요

### 1.1 아키텍처 요약

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자 브라우저                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    index.html                        │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────┐   │   │
│  │  │   HTML5   │  │   CSS3    │  │   JavaScript  │   │   │
│  │  │ (구조)    │  │ (스타일)  │  │   (ES6+)     │   │   │
│  │  └───────────┘  └───────────┘  └───────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                               │
│                            ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     SVG 엔진                         │   │
│  │  - DOM 조작 (path 요소)                              │   │
│  │  - 이벤트 위임 (클릭 핸들링)                          │   │
│  │  - fill 속성 변경 (색칠)                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                               │
│                            ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Canvas API                        │   │
│  │  - SVG → Canvas 렌더링                               │   │
│  │  - PNG 이미지 생성 (toDataURL)                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Cloudflare Workers                         │
│  - 정적 파일 서빙 (index.html, _AEC/*.svg)                  │
│  - 글로벌 CDN 배포                                          │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 기술 스택 요약표

| 레이어 | 기술 | 버전/사양 | 용도 |
|--------|------|-----------|------|
| 마크업 | HTML5 | - | 문서 구조, 시맨틱 태그 |
| 스타일 | CSS3 | - | 레이아웃, 애니메이션 |
| 로직 | JavaScript | ES6+ | 애플리케이션 로직 |
| 그래픽 | SVG | 1.1 | 벡터 이미지, 색칠 영역 |
| 이미지 처리 | Canvas API | HTML5 | PNG 생성, 이미지 변환 |
| 폰트 | Pretendard | CDN | 한글 웹폰트 |
| 배포 | Cloudflare Workers | - | 정적 호스팅, CDN |

---

## 2. 프론트엔드 기술 상세

### 2.1 HTML5

#### 사용 기능

| 기능 | 용도 | 코드 위치 |
|------|------|-----------|
| 시맨틱 태그 | 문서 구조화 | header, main, section |
| data-* 속성 | 색상 데이터 저장 | data-color, data-name |
| 메타 태그 | 뷰포트 설정 | viewport |

#### 문서 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>색칠 공부 - SVG Coloring Book</title>
</head>
<body>
    <header class="header">...</header>
    <main class="main-container">
        <div class="svg-container">...</div>
        <section class="palette-section">...</section>
        <div class="controls">...</div>
    </main>
</body>
</html>
```

### 2.2 CSS3

#### 핵심 기술

| 기술 | 용도 | 적용 대상 |
|------|------|-----------|
| Flexbox | 레이아웃 | body, main-container, controls |
| CSS Gradients | 배경 효과 | body, svg-container, save-btn |
| Box Shadow | 깊이감 표현 | polaroid-frame, color-btn |
| Transitions | 호버 애니메이션 | color-btn, control-btn |
| @font-face | 웹폰트 정의 | Pretendard (9개 웨이트) |
| Media Queries | 반응형 디자인 | 600px 브레이크포인트 |

#### 주요 스타일 패턴

**그라데이션 배경**
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**폴라로이드 프레임 효과**
```css
.polaroid-frame {
    background: #ffffff;
    box-shadow:
        0 4px 6px rgba(0, 0, 0, 0.1),
        0 15px 40px rgba(0, 0, 0, 0.25),
        inset 0 0 0 1px rgba(0, 0, 0, 0.05);
}
```

**반응형 브레이크포인트**
```css
@media (max-width: 600px) {
    .header h1 { font-size: 1.2rem; }
    .color-btn { width: 28px; height: 28px; }
    .control-btn { padding: 6px 12px; font-size: 0.8rem; }
}
```

### 2.3 JavaScript (ES6+)

#### 사용 기능

| ES6+ 기능 | 용도 | 예시 |
|-----------|------|------|
| const/let | 변수 선언 | `const COLORS = [...]` |
| Arrow Functions | 콜백 함수 | `(color) => selectColor(...)` |
| Template Literals | 문자열 조합 | `'_AEC/' + filename` |
| Array Methods | 배열 처리 | `forEach`, `find`, `push`, `pop` |
| Destructuring | 객체 분해 | `{ hex, name }` |
| Spread Operator | 배열/객체 복사 | (사용 가능) |

#### 상태 관리 패턴

```javascript
const state = {
    selectedColor: COLORS[0].hex,    // 현재 선택 색상
    originalSvgContent: null,        // 원본 SVG (초기화용)
    currentImageIndex: 0,            // 현재 이미지 인덱스
    history: [],                     // 뒤로가기 히스토리
    maxHistory: 50                   // 최대 히스토리 개수
};
```

#### 이벤트 위임 패턴

클릭 이벤트를 개별 path에 등록하지 않고, SVG 요소에서 위임 처리:

```javascript
svg.onclick = function(e) {
    const target = e.target;
    if (target.tagName.toLowerCase() !== 'path') return;
    if (isBlackColor(target.getAttribute('fill'))) return;
    // 색칠 처리
};
```

#### 히스토리 스택 패턴

```javascript
// 색칠 시 히스토리 저장
state.history.push({
    element: target,
    previousColor: previousFill
});

// 뒤로가기 시 복원
const lastAction = state.history.pop();
lastAction.element.setAttribute('fill', lastAction.previousColor);
```

---

## 3. 그래픽 기술 상세

### 3.1 SVG (Scalable Vector Graphics)

#### SVG 구조

```xml
<svg viewBox="0 0 1773 1773" xmlns="http://www.w3.org/2000/svg">
    <!-- 검정색 라인 (색칠 불가) -->
    <path fill="#000000" d="M..."/>
    <path fill="black" d="M..."/>

    <!-- 색칠 가능 영역 -->
    <path fill="#FFFFFF" d="M..."/>
    <path d="M..."/>  <!-- fill 없음 = 흰색 -->
</svg>
```

#### SVG 처리 로직

| 단계 | 동작 | 코드 |
|------|------|------|
| 로드 | fetch API로 SVG 파일 가져오기 | `fetch('_AEC/' + filename)` |
| 삽입 | innerHTML로 DOM에 삽입 | `svgContainer.innerHTML = svgText` |
| 설정 | preserveAspectRatio 설정 | `'xMidYMid meet'` |
| 이벤트 | 클릭 핸들러 등록 | `svg.onclick = function(e) {...}` |

#### 검정색 판별 알고리즘

```javascript
function isBlackColor(color) {
    if (!color) return false;
    const c = color.toLowerCase().trim();

    // 명시적 검정색
    if (c === 'black' || c === '#000000' || c === '#000') return true;

    // RGB 형식 검사
    const rgbMatch = c.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (rgbMatch) {
        const brightness = (parseInt(rgbMatch[1]) +
                           parseInt(rgbMatch[2]) +
                           parseInt(rgbMatch[3])) / 3;
        return brightness < 50;  // 밝기 50 미만 = 검정 취급
    }
    return false;
}
```

### 3.2 Canvas API

#### PNG 저장 프로세스

```
SVG → Blob → ObjectURL → Image → Canvas → DataURL → Download
```

#### 상세 구현

```javascript
function saveSvg() {
    const svg = svgContainer.querySelector('svg');

    // 1. SVG를 문자열로 직렬화
    const svgData = new XMLSerializer().serializeToString(svg);

    // 2. Blob 생성
    const svgBlob = new Blob([svgData], {
        type: 'image/svg+xml;charset=utf-8'
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    // 3. Image 객체로 로드
    const img = new Image();
    img.onload = function() {
        // 4. Canvas에 그리기
        const canvas = document.createElement('canvas');
        canvas.width = svg.viewBox.baseVal.width || 1773;
        canvas.height = svg.viewBox.baseVal.height || 1773;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // 5. PNG DataURL 생성 및 다운로드
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = 'coloring_' + imageName + '_' + Date.now() + '.png';
        downloadLink.click();

        URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
}
```

---

## 4. 외부 리소스

### 4.1 Pretendard 폰트

| 항목 | 값 |
|------|-----|
| 폰트명 | Pretendard |
| 제공처 | jsDelivr CDN |
| 웨이트 | 100, 200, 300, 400, 500, 600, 700, 800, 900 |
| 포맷 | woff2 |
| 로딩 | font-display: swap |

#### CDN URL 패턴

```
https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-{Weight}.woff2
```

#### 폴백 폰트

```css
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
```

---

## 5. 배포 설정

### 5.1 Cloudflare Workers

#### wrangler.jsonc 설정

```jsonc
{
  "name": "aec-coloring",           // Workers 이름
  "compatibility_date": "2026-02-01", // API 호환성 날짜
  "assets": {
    "directory": "./"               // 정적 에셋 루트 디렉토리
  }
}
```

#### 배포 명령어

```bash
# Wrangler CLI 설치 (최초 1회)
npm install -g wrangler

# Cloudflare 로그인
wrangler login

# 배포
wrangler deploy

# 로컬 개발 서버
wrangler dev
```

#### 배포 파일 목록

```
배포 대상:
├── index.html        # 메인 페이지
├── _AEC/
│   ├── 25__01 1 (1).svg
│   ├── 25__02 1 (1).svg
│   └── 25__02-1 1.svg
└── (기타 정적 파일)
```

### 5.2 로컬 개발

#### 간단한 HTTP 서버

```bash
# Python (Python 3)
python -m http.server 8000

# Node.js (http-server 패키지)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

#### 브라우저 접속

```
http://localhost:8000
```

---

## 6. 브라우저 호환성

### 6.1 지원 브라우저

| 브라우저 | 최소 버전 | 주요 기능 |
|----------|-----------|-----------|
| Chrome | 90+ | 모든 기능 지원 |
| Firefox | 88+ | 모든 기능 지원 |
| Edge | 90+ | 모든 기능 지원 |
| Safari | 14+ | 부분 지원 (PNG 저장 주의) |

### 6.2 필수 API 지원

| API | 용도 | 지원 현황 |
|-----|------|-----------|
| Fetch API | SVG 파일 로드 | 모든 모던 브라우저 |
| SVG DOM | path 조작 | 모든 모던 브라우저 |
| Canvas 2D | PNG 생성 | 모든 모던 브라우저 |
| Blob API | 파일 생성 | 모든 모던 브라우저 |
| URL.createObjectURL | 다운로드 | 모든 모던 브라우저 |

### 6.3 폴리필 불필요

ES6+ 기능 사용 범위가 모든 타겟 브라우저에서 지원되므로 폴리필이 필요하지 않습니다.

---

## 7. 성능 최적화

### 7.1 현재 최적화 상태

| 항목 | 상태 | 비고 |
|------|------|------|
| 번들링 | 불필요 | 단일 HTML 파일 |
| 압축 | CDN 자동 | Cloudflare gzip/brotli |
| 캐싱 | CDN 자동 | Cloudflare 에지 캐시 |
| 이미지 최적화 | SVG 사용 | 벡터 = 무손실 확대 |
| 폰트 로딩 | swap | 깜빡임 방지 |

### 7.2 추가 최적화 옵션

| 최적화 | 방법 | 효과 |
|--------|------|------|
| CSS 인라인 | 이미 적용됨 | HTTP 요청 감소 |
| JS 인라인 | 이미 적용됨 | HTTP 요청 감소 |
| SVG 압축 | svgo 도구 | 파일 크기 20-40% 감소 |
| 폰트 서브셋 | 사용 글자만 포함 | 로딩 시간 감소 |

### 7.3 성능 지표 목표

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| FCP (First Contentful Paint) | < 1.5s | Lighthouse |
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| TTI (Time to Interactive) | < 3s | Lighthouse |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |

---

## 8. 보안 고려사항

### 8.1 현재 보안 상태

| 항목 | 상태 | 설명 |
|------|------|------|
| XSS | 안전 | 사용자 입력 없음 |
| CSRF | 해당 없음 | 서버 통신 없음 |
| 인증 | 해당 없음 | 인증 기능 없음 |
| 데이터 저장 | 로컬만 | 서버 저장 없음 |

### 8.2 CORS 설정

SVG 파일이 동일 출처(Same-Origin)에서 제공되므로 CORS 이슈 없음.

### 8.3 Content Security Policy (선택)

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    style-src 'self' 'unsafe-inline';
    script-src 'self' 'unsafe-inline';
    font-src 'self' https://cdn.jsdelivr.net;
    img-src 'self' blob: data:;
">
```

---

## 9. 개발 도구

### 9.1 권장 IDE

- Visual Studio Code
- WebStorm
- Sublime Text

### 9.2 VS Code 확장

| 확장 | 용도 |
|------|------|
| Live Server | 로컬 개발 서버 |
| SVG Preview | SVG 미리보기 |
| HTML CSS Support | 자동 완성 |
| Prettier | 코드 포맷팅 |

### 9.3 디버깅 도구

| 도구 | 용도 |
|------|------|
| Chrome DevTools | DOM 검사, 콘솔 로깅 |
| Performance 탭 | 성능 분석 |
| Network 탭 | 네트워크 요청 분석 |
| Lighthouse | 성능/접근성 감사 |

---

## 10. 향후 기술 로드맵

### 10.1 단기 (1-3개월)

- TypeScript 마이그레이션 검토
- PWA (Progressive Web App) 지원
- Service Worker 캐싱

### 10.2 중기 (3-6개월)

- React/Vue 프레임워크 도입 검토
- 컴포넌트 기반 아키텍처
- 상태 관리 라이브러리 (Zustand/Pinia)

### 10.3 장기 (6개월 이상)

- 백엔드 API 연동 (작품 저장/공유)
- 실시간 협업 기능
- AI 기반 색상 추천

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-02-01 | manager-docs | 초기 기술 문서 작성 |
