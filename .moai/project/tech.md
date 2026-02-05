# AEC 컬러링북 - 기술 문서

---

## 메타데이터

| 항목 | 값 |
|------|-----|
| 프로젝트명 | 오늘의 컬러링 (Today's Coloring) |
| 문서 유형 | 기술 스택 문서 |
| 최종 업데이트 | 2026-02-05 |
| 버전 | 3.0.0 |
| 아키텍처 | React + TypeScript SPA |

---

## 1. 기술 스택 개요

### 1.1 아키텍처 요약

```
┌─────────────────────────────────────────────────────────────────────┐
│                        사용자 브라우저                                │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      React SPA                               │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐  │   │
│  │  │   React   │  │ TypeScript│  │   Vite    │  │   CSS    │  │   │
│  │  │   18.3    │  │    5.9    │  │    7.3    │  │  Modules │  │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                            │                                        │
│                            ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      SVG 엔진                                │   │
│  │  - DOM 조작 (path 요소)                                      │   │
│  │  - 이벤트 위임 (클릭 핸들링)                                  │   │
│  │  - fill 속성 변경 (색칠)                                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                            │                                        │
│                            ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Canvas API                                │   │
│  │  - SVG → Canvas 렌더링                                       │   │
│  │  - PNG 이미지 생성 (toDataURL)                               │   │
│  │  - 달력/배경화면 합성                                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Supabase                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Storage                                   │   │
│  │  - images/svg/      (색칠용 SVG 파일)                        │   │
│  │  - images/gallery/  (인트로 갤러리 이미지)                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Cloudflare Workers                                 │
│  - Vite 빌드 결과물 정적 서빙                                        │
│  - 글로벌 CDN 배포                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 기술 스택 요약표

| 레이어 | 기술 | 버전 | 용도 |
|--------|------|------|------|
| 프레임워크 | React | 18.3.1 | UI 컴포넌트, 상태 관리 |
| 언어 | TypeScript | 5.9.3 | 타입 안전성, 개발 생산성 |
| 빌드 도구 | Vite | 7.3.1 | 빠른 개발 서버, 번들링 |
| 스타일 | CSS Modules | - | 스코프된 컴포넌트 스타일 |
| 백엔드 | Supabase | 2.94.1 | Storage API, 이미지 관리 |
| 그래픽 | SVG 1.1 | - | 벡터 이미지, 색칠 영역 |
| 이미지 처리 | Canvas API | HTML5 | PNG 생성, 합성 |
| 색상 분석 | HSL 변환 | - | 색상 심리 분석 |
| 날씨 API | Open-Meteo | v1 | 실시간 날씨 조회 |
| 광고 | Google AdSense | - | 배너/전면 광고 수익화 |
| 폰트 | Pretendard | CDN | 한글 웹폰트 |
| 배포 | Cloudflare Workers | - | 정적 호스팅, CDN |

---

## 2. 프론트엔드 기술 상세

### 2.1 React

#### 핵심 기능 사용

| 기능 | 용도 | 코드 위치 |
|------|------|-----------|
| useState | 로컬 상태 관리 | App.tsx, 각 컴포넌트 |
| useEffect | 사이드 이펙트 처리 | 이미지 로드, URL 파라미터 |
| useCallback | 메모이제이션된 콜백 | 이벤트 핸들러 |
| useRef | DOM 참조 | SVG 요소 참조 |
| Custom Hooks | 재사용 로직 | useColoring, useImages |

#### 컴포넌트 구조

```
App.tsx (메인)
├── IntroPage.tsx (인트로)
├── ColoringCanvas.tsx (캔버스)
├── Palette.tsx (팔레트)
├── Controls.tsx (컨트롤)
├── ResultPage.tsx (결과)
└── AdminPage.tsx (관리자)
```

### 2.2 TypeScript

#### 주요 타입 정의

```typescript
// 앱 페이지 상태
type AppPhase = 'intro' | 'coloring' | 'result' | 'admin';

// 이미지 타입 (Supabase)
type ImageType = 'svg' | 'gallery';

// 이미지 정보
interface ImageInfo {
  file: string;
  name: string;
}

// 색상 정보
interface ColorInfo {
  hex: string;
  name: string;
}

// 히스토리 항목
interface HistoryItem {
  element: SVGPathElement;
  previousColor: string;
}
```

### 2.3 CSS Modules

#### 스타일 패턴

| 기술 | 용도 | 적용 대상 |
|------|------|-----------|
| CSS Variables | 디자인 토큰 | :root, TDS 변수 |
| Flexbox | 기본 레이아웃 | 세로 모드 배치 |
| CSS Grid | PC 레이아웃 | 1024px+ 가로 배치 |
| Media Queries | 반응형 | orientation, min-width |
| clamp() | 반응형 크기 | 폰트, 간격 |

#### TDS 디자인 시스템

```css
:root {
  /* 기본 색상 */
  --tds-primary: #3182F6;
  --tds-primary-dark: #1B64DA;
  --tds-background: #F4F6F8;
  --tds-card: #FFFFFF;

  /* 텍스트 색상 */
  --tds-text-primary: #191F28;
  --tds-text-secondary: #8B95A1;
  --tds-text-tertiary: #B0B8C1;

  /* 시멘틱 색상 */
  --tds-success: #00C896;
  --tds-error: #F04452;
  --tds-warning: #FF9500;
  --tds-info: #3182F6;

  /* 반응형 크기 */
  --spacing-xs: min(6px, 1.5vmin);
  --spacing-sm: min(8px, 2vmin);
  --font-sm: clamp(11px, 3vmin, 16px);
}
```

#### 페이지 전환 애니메이션

모든 페이지 전환에 부드러운 애니메이션 효과를 적용합니다.

| 속성 | 값 | 설명 |
|------|-----|------|
| 애니메이션 이름 | fadeSlideIn | 페이드 인 + 슬라이드 업 효과 |
| 지속 시간 | 0.3s | 자연스러운 전환 속도 |
| 타이밍 함수 | ease-out | 부드러운 감속 효과 |
| CSS 클래스 | .page-transition | 페이지 컴포넌트에 적용 |

```css
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-transition {
  animation: fadeSlideIn 0.3s ease-out forwards;
}
```

적용 대상:
- 인트로 페이지 (IntroPage)
- 색칠 페이지 (ColoringCanvas)
- 결과 페이지 (ResultPage)

---

## 3. 백엔드 기술 상세

### 3.1 Supabase Storage

#### 설정 정보

| 항목 | 값 |
|------|-----|
| 프로젝트 URL | https://veectttvbapuzhultfmc.supabase.co |
| 버킷 이름 | images |
| 인증 방식 | Anonymous Key (공개 읽기) |

#### Storage 구조

```
images/ (버킷)
├── svg/                     # 색칠용 SVG 파일
│   ├── {timestamp}_{name}.svg
│   └── ...
└── gallery/                 # 갤러리 이미지
    ├── {timestamp}_{name}.jpg
    └── ...
```

#### API 사용

```typescript
// 이미지 업로드
const { data, error } = await supabase.storage
  .from('images')
  .upload(fileName, file, { cacheControl: '3600', upsert: false });

// 이미지 목록 조회
const { data, error } = await supabase.storage
  .from('images')
  .list(folder, { sortBy: { column: 'created_at', order: 'desc' } });

// 이미지 삭제
const { error } = await supabase.storage
  .from('images')
  .remove([path]);

// 퍼블릭 URL 생성
const { data } = supabase.storage
  .from('images')
  .getPublicUrl(path);
```

### 3.2 localStorage 활용

| 키 | 용도 | 데이터 형식 |
|-----|------|-------------|
| aec-disabled-images | 비활성화된 이미지 경로 | JSON 배열 |

```typescript
// 비활성화 목록 저장
localStorage.setItem('aec-disabled-images', JSON.stringify(paths));

// 비활성화 목록 조회
const disabled = JSON.parse(localStorage.getItem('aec-disabled-images') || '[]');
```

---

## 3.3 색상 심리 분석 엔진

SVG에서 사용된 색상을 분석하여 심리학적 해석을 제공합니다.

### 분석 알고리즘

| 단계 | 처리 내용 |
|------|-----------|
| 1. 색상 추출 | SVG 요소의 fill/stroke 속성에서 색상 수집 |
| 2. HSL 변환 | Hex 색상을 HSL(Hue, Saturation, Lightness)로 변환 |
| 3. 온도 분류 | Hue 값으로 따뜻한/차가운/무채색 분류 |
| 4. 통계 계산 | 온도별 비율, 평균 밝기, 다양성 지수 계산 |
| 5. 메시지 선택 | 분석 결과에 맞는 심리 메시지 랜덤 선택 |

### 색상 온도 분류 기준

```
따뜻한 색 (Warm): Hue 0-60도, 300-360도
  - 빨강, 주황, 노랑, 분홍 계열
  - 에너지, 열정, 활력을 상징

차가운 색 (Cool): Hue 120-270도
  - 초록, 청록, 파랑, 보라 계열
  - 평온, 사색, 안정을 상징

무채색 (Neutral): 채도 < 10% 또는 밝기 극단
  - 흰색, 회색, 검정 계열
  - 균형, 객관성, 미니멀리즘을 상징
```

### 심리 메시지 카테고리

| 카테고리 | 조건 | 메시지 예시 |
|----------|------|-------------|
| warmBright | 따뜻한 색 + 밝은 톤 | "오늘 당신은 에너지가 넘치고 열정적인 상태입니다!" |
| warmDark | 따뜻한 색 + 어두운 톤 | "깊이 있는 따뜻함이 느껴집니다." |
| coolBright | 차가운 색 + 밝은 톤 | "맑고 청량한 에너지가 느껴집니다!" |
| coolDark | 차가운 색 + 어두운 톤 | "깊이 있는 사색의 시간이 필요할 수 있어요." |
| neutral | 무채색 우세 | "차분하고 균형 잡힌 마음 상태입니다." |
| mixed | 혼합 색상 | "다채로운 색상 선택은 풍부한 감성을 보여줍니다!" |
| diverse | 8개 이상 색상 사용 | "컬러풀한 선택! 당신의 상상력이 빛나는 하루예요." |

---

## 3.4 Open-Meteo 날씨 API

그림일기 기능에서 실시간 서울 날씨를 가져오기 위해 Open-Meteo API를 사용합니다.

### API 정보

| 항목 | 값 |
|------|-----|
| 엔드포인트 | https://api.open-meteo.com/v1/forecast |
| 인증 방식 | 불필요 (무료 API) |
| 서울 좌표 | 위도 37.5665, 경도 126.9780 |
| 타임존 | Asia/Seoul |

### API 요청 예시

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=37.5665
  &longitude=126.9780
  &current=weather_code
  &timezone=Asia/Seoul
```

### WMO 날씨 코드 매핑

```
맑음 (sunny):
  - 0: Clear sky

흐림 (cloudy):
  - 1-3: Mainly clear, partly cloudy, overcast
  - 45, 48: Fog

비 (rainy):
  - 51-67: Drizzle, Rain
  - 80-82: Rain showers
  - 95-99: Thunderstorm

눈 (snowy):
  - 71-77: Snow
  - 85-86: Snow showers
```

### 에러 처리

- API 호출 실패 시 기본값 'sunny' 반환
- 콘솔에 에러 로그 출력
- 사용자에게는 정상 동작으로 표시

---

## 3.5 그림일기 렌더링 엔진

A4 비율 원고지 스타일 그림일기 생성 기술 상세

### 레이아웃 사양

| 항목 | 값 | 설명 |
|------|-----|------|
| 캔버스 크기 | 1080 x 1527px | A4 비율 (1:1.414) |
| 헤더 영역 | 6% (약 92px) | 날짜 + 날씨 |
| 이미지 영역 | 50% (약 764px) | 색칠 이미지 |
| 메시지 영역 | 44% (약 671px) | 원고지 격자 |
| 패딩 | 20px | 전체 여백 |
| 테두리 두께 | 2px | 격자와 동일 |

### 원고지 격자 시스템

| 항목 | 값 |
|------|-----|
| 열 수 | 14칸 |
| 행 수 | 7줄 |
| 최대 글자 수 | 98자 (14 x 7) |
| 격자 색상 | #CCCCCC (내부), #333333 (외곽) |

### 날씨 표시 알고리즘

```
1. Open-Meteo API로 현재 날씨 코드 조회
2. WMO 코드를 WeatherType으로 변환
3. 4개 날씨 아이콘 (☀️☁️🌧️❄️) 순차 배치
4. 현재 날씨: globalAlpha = 1.0 (컬러)
5. 다른 날씨: globalAlpha = 0.3 (회색 효과)
6. 알파값 복원 후 다음 렌더링
```

### 폰트 설정

| 영역 | 폰트 | 크기 (scale 기준) |
|------|------|-------------------|
| 날짜 헤더 | Pretendard 500 | cellSize * 0.5 |
| 날씨 이모지 | sans-serif | cellSize * 0.6 |
| 메시지 본문 | Pretendard 500 | cellSize * 0.6 |
| 첫 이모지 | sans-serif | cellSize * 0.7 |

---

## 3.6 Google AdSense 광고 시스템

어린이 대상 앱에서 수익화를 위한 Google AdSense 통합 기술 상세

### AdSense 설정 정보

| 항목 | 값 |
|------|-----|
| Publisher ID | ca-pub-9204948456666925 |
| ads.txt 위치 | /public/ads.txt |
| 스크립트 로드 | index.html `<head>` 태그 |
| 테스트 모드 | adConfig.ts에서 설정 |

### 광고 컴포넌트 구조

```
src/components/ads/
├── BannerAd.tsx           # 배너 광고 컴포넌트
├── BannerAd.module.css    # 배너 광고 스타일
├── InterstitialAd.tsx     # 전면 광고 컴포넌트
└── InterstitialAd.module.css  # 전면 광고 스타일
```

### 배너 광고 (BannerAd)

| 속성 | 값 | 설명 |
|------|-----|------|
| 위치 | ResultPage 하단 | 결과 페이지에만 표시 |
| 모바일 크기 | 320 x 100 | 모바일 디바이스용 |
| 데스크톱 크기 | 728 x 90 | PC/태블릿용 |
| 포맷 | auto | data-full-width-responsive |

### 전면 광고 (InterstitialAd)

| 속성 | 값 | 설명 |
|------|-----|------|
| 트리거 | 저장 버튼, 새로 시작 버튼 | 사용자 액션 기반 |
| 카운트다운 | 5초 | 닫기 버튼 활성화까지 대기 |
| 크기 | 300 x 250 | 중간 직사각형 포맷 |
| 배경 | 반투명 오버레이 | rgba 기반 모달 |

### 광고 빈도 제한 (useAds 훅)

| 설정 | 값 | 설명 |
|------|-----|------|
| maxPerSession | 3 | 세션당 최대 전면 광고 횟수 |
| cooldownSeconds | 60 | 광고 간 최소 대기 시간 |
| 저장소 | sessionStorage | 세션 종료 시 초기화 |
| 키 | aec_ad_session | 세션 데이터 키 |

### useAds 훅 인터페이스

```typescript
interface UseAdsReturn {
  isEnabled: boolean;              // 광고 활성화 여부
  isTestMode: boolean;             // 테스트 모드 여부
  canShowInterstitial: () => boolean;  // 전면 광고 표시 가능 여부
  recordInterstitialShown: () => void; // 전면 광고 표시 기록
  getRemainingCooldown: () => number;  // 남은 쿨다운 시간 (초)
  interstitialCount: number;       // 현재 세션 전면 광고 횟수
  resetSession: () => void;        // 세션 초기화 (테스트용)
}
```

### 광고 설정 (adConfig.ts)

```typescript
const AD_CONFIG = {
  enabled: true,                   // 광고 기능 활성화
  testMode: false,                 // 테스트 모드 (개발용)
  publisherId: 'ca-pub-XXXXXXXXXX',
  slots: {
    banner: 'XXXXXXXXXX',          // 배너 슬롯 ID
    interstitial: 'XXXXXXXXXX'     // 전면 광고 슬롯 ID
  },
  interstitial: {
    maxPerSession: 3,
    cooldownSeconds: 60,
    countdownSeconds: 5
  },
  banner: {
    mobile: { width: 320, height: 100 },
    desktop: { width: 728, height: 90 }
  }
};
```

### COPPA 준수 사항

- 어린이 대상 콘텐츠로 맞춤형 광고 비활성화
- 테스트 모드에서 추적 스크립트 미로드
- 개인정보처리방침 페이지 제공
- 쿠키 사용 안내 포함

---

## 4. 빌드 및 번들링

### 4.1 Vite 설정

#### vite.config.ts (기본)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

#### 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 배포
npm run deploy
```

### 4.2 의존성

#### package.json

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.94.1",
    "@vitejs/plugin-react": "^5.1.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@resvg/resvg-js": "^2.6.2",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "archiver": "^7.0.1",
    "sharp": "^0.34.5",
    "typescript": "^5.9.3",
    "vite": "^7.3.1"
  }
}
```

---

## 5. 배포 설정

### 5.1 Cloudflare Workers

#### wrangler.jsonc 설정

```jsonc
{
  "name": "aec-coloring",
  "compatibility_date": "2026-02-01",
  "assets": {
    "directory": "./dist"
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
dist/
├── index.html
├── assets/
│   ├── index-{hash}.js
│   └── index-{hash}.css
└── vite.svg
```

### 5.2 Vercel CORS 설정 (선택)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

---

## 6. 브라우저 호환성

### 6.1 지원 브라우저

| 브라우저 | 최소 버전 | 주요 기능 |
|----------|-----------|-----------|
| Chrome | 90+ | 모든 기능 지원 |
| Firefox | 88+ | 모든 기능 지원 |
| Edge | 90+ | 모든 기능 지원 |
| Safari | 14+ | 모든 기능 지원 |
| iOS Safari | 14+ | 터치 이벤트 최적화 |
| Chrome Android | 90+ | 모든 기능 지원 |

### 6.2 필수 API 지원

| API | 용도 | 지원 현황 |
|-----|------|-----------|
| Fetch API | Supabase 통신, SVG 로드 | 모든 모던 브라우저 |
| SVG DOM | path 조작 | 모든 모던 브라우저 |
| Canvas 2D | PNG 생성 | 모든 모던 브라우저 |
| Blob API | 파일 생성 | 모든 모던 브라우저 |
| localStorage | 설정 저장 | 모든 모던 브라우저 |
| CSS Grid | PC 레이아웃 | 모든 모던 브라우저 |
| CSS clamp() | 반응형 크기 | Chrome 79+, Safari 13.1+ |

---

## 7. 성능 최적화

### 7.1 현재 최적화 상태

| 항목 | 상태 | 비고 |
|------|------|------|
| 번들링 | Vite | Tree-shaking, 코드 분할 |
| 압축 | CDN 자동 | gzip/brotli |
| 캐싱 | CDN + Supabase | 에지 캐시 |
| 이미지 | SVG + Supabase CDN | 벡터 무손실 |
| 폰트 | font-display: swap | 깜빡임 방지 |
| 스타일 | CSS Modules | 스코프 격리 |

### 7.2 React 최적화

| 기법 | 용도 | 적용 위치 |
|------|------|-----------|
| useCallback | 콜백 메모이제이션 | 이벤트 핸들러 |
| useMemo | 계산값 메모이제이션 | (필요시) |
| React.memo | 컴포넌트 메모이제이션 | (필요시) |
| Lazy Loading | 코드 분할 | (필요시) |

### 7.3 성능 지표 목표

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| FCP (First Contentful Paint) | < 1.5s | Lighthouse |
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| TTI (Time to Interactive) | < 3s | Lighthouse |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| 번들 크기 | < 200KB (gzipped) | Vite 빌드 |

---

## 8. 보안 고려사항

### 8.1 현재 보안 상태

| 항목 | 상태 | 설명 |
|------|------|------|
| XSS | 안전 | React 자동 이스케이프 |
| CSRF | 해당 없음 | 인증 없는 공개 서비스 |
| 인증 | 관리자만 | 비밀번호 보호 (a1234) |
| Supabase | Anonymous | 공개 읽기, 업로드/삭제 제한 |

### 8.2 Supabase 보안

```
Storage 정책:
- 읽기: 공개 (anon 키)
- 쓰기: 관리자 페이지 통해서만
- 삭제: 관리자 페이지 통해서만
```

### 8.3 관리자 페이지 보안

- 비밀번호 보호 (클라이언트 측)
- URL 파라미터 숨김 (?admin=true → 제거)
- 세션 기반 인증 (새로고침 시 재인증)

---

## 9. 개발 도구

### 9.1 권장 IDE

- Visual Studio Code
- WebStorm
- Cursor

### 9.2 VS Code 확장

| 확장 | 용도 |
|------|------|
| ESLint | 코드 린팅 |
| Prettier | 코드 포맷팅 |
| TypeScript Vue Plugin (Volar) | TypeScript 지원 |
| CSS Modules | CSS Module 자동완성 |
| SVG Preview | SVG 미리보기 |

### 9.3 디버깅 도구

| 도구 | 용도 |
|------|------|
| React DevTools | 컴포넌트 트리, 상태 검사 |
| Chrome DevTools | DOM, Network, Performance |
| Supabase Dashboard | Storage 관리, 로그 확인 |
| Vite Dev Server | HMR, 빠른 새로고침 |

---

## 10. 향후 기술 로드맵

### 10.1 단기 (1-3개월)

- PWA (Progressive Web App) 지원
- Service Worker 오프라인 캐싱
- 이미지 프리로딩 최적화

### 10.2 중기 (3-6개월)

- Zustand 상태 관리 도입
- React Query 캐싱 최적화
- E2E 테스트 (Playwright)

### 10.3 장기 (6개월 이상)

- 사용자 인증 (Supabase Auth)
- 서버리스 함수 (Edge Functions)
- AI 색상 추천 (ML 모델)

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-02-01 | manager-docs | 초기 기술 문서 작성 |
| 2.0.0 | 2026-02-05 | manager-project | React + TypeScript + Vite + Supabase 아키텍처 문서화 |
| 2.1.0 | 2026-02-05 | manager-docs | 색상 심리 분석 엔진 기술 문서화 |
| 2.2.0 | 2026-02-05 | manager-docs | 페이지 전환 애니메이션 (fadeSlideIn) 기술 문서화 |
| 2.3.0 | 2026-02-05 | manager-docs | Open-Meteo API, 그림일기 렌더링 엔진 기술 문서화 |
| 3.0.0 | 2026-02-05 | manager-docs | Google AdSense 광고 시스템 기술 문서화 (배너/전면/빈도 제한/COPPA) |
