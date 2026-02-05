# AEC 컬러링북 - 프로젝트 구조

---

## 메타데이터

| 항목 | 값 |
|------|-----|
| 프로젝트명 | 오늘의 컬러링 (Today's Coloring) |
| 문서 유형 | 프로젝트 구조 문서 |
| 최종 업데이트 | 2026-02-05 |
| 버전 | 3.0.0 |
| 아키텍처 | React + TypeScript SPA |

---

## 1. 디렉토리 구조 개요

```
AEC_BG/
├── src/                          # 소스 코드 디렉토리
│   ├── App.tsx                   # 메인 애플리케이션 컴포넌트
│   ├── App.css                   # 전역 스타일 (TDS 디자인 시스템)
│   ├── main.tsx                  # React 엔트리 포인트
│   │
│   ├── components/               # React 컴포넌트
│   │   ├── IntroPage.tsx         # 인트로 페이지 (갤러리, 포춘 메시지)
│   │   ├── IntroPage.module.css  # 인트로 페이지 스타일
│   │   ├── ColoringCanvas.tsx    # 색칠 캔버스 컴포넌트
│   │   ├── ColoringCanvas.module.css
│   │   ├── Palette.tsx           # 색상 팔레트 컴포넌트
│   │   ├── Palette.module.css
│   │   ├── Controls.tsx          # 컨트롤 버튼 (Undo/Redo/Reset/Complete)
│   │   ├── Controls.module.css
│   │   ├── ResultPage.tsx        # 결과 페이지 (저장 옵션, 배너 광고)
│   │   ├── ResultPage.module.css
│   │   ├── AdminPage.tsx         # 관리자 페이지 (비밀번호 보호)
│   │   ├── AdminPage.module.css
│   │   ├── PrivacyPage.tsx       # 개인정보처리방침 페이지
│   │   ├── PrivacyPage.module.css # 개인정보처리방침 스타일
│   │   ├── LoadingIcon.tsx       # 로딩 아이콘 컴포넌트 (보류)
│   │   ├── LoadingIcon.module.css # 로딩 아이콘 스타일 (보류)
│   │   │
│   │   └── ads/                  # 광고 컴포넌트
│   │       ├── BannerAd.tsx      # 배너 광고 컴포넌트
│   │       ├── BannerAd.module.css # 배너 광고 스타일
│   │       ├── InterstitialAd.tsx # 전면 광고 컴포넌트
│   │       └── InterstitialAd.module.css # 전면 광고 스타일
│   │
│   ├── config/                   # 설정 파일
│   │   └── adConfig.ts           # Google AdSense 광고 설정
│   │
│   ├── hooks/                    # 커스텀 React 훅
│   │   ├── useColoring.ts        # 색칠 상태 관리 (히스토리, Undo/Redo)
│   │   ├── useImages.ts          # Supabase 이미지 목록 관리
│   │   ├── useDeviceResolution.ts# 디바이스 해상도 감지
│   │   └── useAds.ts             # 광고 상태 관리 (빈도 제한, 쿨다운)
│   │
│   ├── lib/                      # 외부 서비스 연동
│   │   └── supabase.ts           # Supabase 클라이언트 및 Storage API
│   │
│   ├── utils/                    # 유틸리티 함수
│   │   ├── saveImage.ts          # 이미지/달력/배경화면/그림일기 저장 함수
│   │   ├── colorAnalysis.ts      # 색상 심리 분석 유틸리티
│   │   └── weather.ts            # 날씨 API 유틸리티 (Open-Meteo)
│   │
│   ├── constants/                # 상수 정의
│   │   ├── colors.ts             # 65+ 색상 팔레트 정의
│   │   └── fortunes.ts           # 포춘 메시지 목록
│   │
│   └── types/                    # TypeScript 타입 정의
│       └── index.ts              # ImageInfo, ColorInfo, HistoryItem 등
│
├── public/                       # 정적 에셋
│   ├── vite.svg                  # 기본 Vite 아이콘
│   └── ads.txt                   # Google AdSense 인증 파일
│
├── dist/                         # 빌드 출력 디렉토리
│
├── _AEC/                         # 로컬 SVG 에셋 (레거시)
├── gallery/                      # 로컬 갤러리 이미지 (레거시)
│
├── package.json                  # 프로젝트 메타데이터 및 의존성
├── vite.config.ts                # Vite 빌드 설정
├── tsconfig.json                 # TypeScript 설정
├── wrangler.jsonc                # Cloudflare Workers 배포 설정
│
├── .moai/                        # MoAI-ADK 설정 및 문서
│   ├── config/                   # 설정 파일
│   ├── project/                  # 프로젝트 문서
│   └── specs/                    # SPEC 문서
│
└── .claude/                      # Claude Code 설정
    ├── agents/                   # 에이전트 정의
    ├── skills/                   # 스킬 정의
    └── rules/                    # 규칙 정의
```

---

## 2. 핵심 컴포넌트 상세

### 2.1 App.tsx (메인 애플리케이션)

앱의 최상위 컴포넌트로, 페이지 라우팅과 전역 상태를 관리합니다.

#### 주요 기능

| 기능 | 설명 |
|------|------|
| 페이지 상태 관리 | intro, coloring, result, admin 4가지 페이지 상태 |
| 이미지 로드 | useImages 훅으로 Supabase 이미지 목록 로드 |
| 색칠 상태 | useColoring 훅으로 색칠 상태 및 히스토리 관리 |
| 저장 핸들러 | 이미지/달력/배경화면 저장 함수 제공 |
| 관리자 접근 | URL 파라미터 또는 버튼으로 관리 페이지 표시 |

#### 페이지 흐름

```
AppPhase: 'intro' | 'coloring' | 'result' | 'admin'

intro → coloring (handleStart)
coloring → result (handleComplete)
result → intro (handleRestart)
admin → 오버레이 표시 (showAdmin)
```

### 2.2 components/ 디렉토리

#### IntroPage.tsx
- 갤러리 이미지 랜덤 표시 (Supabase gallery 폴더)
- 포춘 메시지 랜덤 표시
- 화면 터치로 색칠 페이지 진입
- 설정 버튼으로 관리자 페이지 접근
- 비활성화된 이미지 필터링 (localStorage)

#### ColoringCanvas.tsx
- SVG 이미지 로드 및 표시
- path 클릭 이벤트 처리
- 검정색 라인 색칠 방지
- SVG ref 전달 (저장용)

#### Palette.tsx
- 65+ 색상 그리드 표시
- 선택된 색상 하이라이트
- 색상 선택 콜백 처리
- CSS Grid 기반 반응형 레이아웃

#### Controls.tsx
- Undo/Redo 버튼 (활성화 상태 표시)
- Reset 버튼 (초기화)
- Complete 버튼 (완성)
- 반응형 버튼 레이아웃

#### ResultPage.tsx
- 완성된 SVG 미리보기
- 색상 심리 분석 메시지 표시
- 이미지 저장 버튼
- 달력 저장 버튼
- 배경화면 저장 버튼
- 새로 시작 버튼

#### AdminPage.tsx
- 비밀번호 인증 화면 (a1234)
- SVG/갤러리 탭 전환
- 이미지 업로드 기능
- 이미지 삭제 기능
- 이미지 활성화/비활성화 토글
- localStorage 기반 상태 저장

#### PrivacyPage.tsx
- 개인정보처리방침 전체 페이지
- 뒤로 가기 버튼으로 인트로 복귀
- 스크롤 가능한 긴 문서 형식
- COPPA 준수 내용 포함
- Google AdSense 쿠키 안내

#### ads/BannerAd.tsx
- 결과 페이지 하단 배너 광고
- 테스트 모드 플레이스홀더 지원
- data-full-width-responsive 자동 크기 조절
- AdSense 스크립트 동적 로드

#### ads/InterstitialAd.tsx
- 전면 광고 모달 컴포넌트
- 5초 카운트다운 후 닫기 활성화
- 반투명 오버레이 배경
- 테스트 모드 플레이스홀더 지원
- aria-modal 접근성 지원

### 2.3 config/ 디렉토리

#### adConfig.ts

광고 설정 파일로 AdSense 연동 정보를 관리합니다.

```typescript
const AD_CONFIG = {
  enabled: boolean;           // 광고 활성화 여부
  testMode: boolean;          // 테스트 모드 (플레이스홀더 표시)
  publisherId: string;        // AdSense Publisher ID
  slots: {
    banner: string;           // 배너 광고 슬롯 ID
    interstitial: string;     // 전면 광고 슬롯 ID
  };
  interstitial: {
    maxPerSession: number;    // 세션당 최대 횟수 (3)
    cooldownSeconds: number;  // 광고 간 쿨다운 (60초)
    countdownSeconds: number; // 닫기까지 카운트다운 (5초)
  };
  banner: {
    mobile: { width, height };    // 모바일 배너 크기
    desktop: { width, height };   // 데스크톱 배너 크기
  };
};
```

### 2.4 hooks/ 디렉토리

#### useColoring.ts

색칠 관련 상태 및 로직을 관리하는 커스텀 훅입니다.

```typescript
interface UseColoringReturn {
  selectedColor: ColorInfo;      // 현재 선택된 색상
  setSelectedColor: (color: ColorInfo) => void;
  history: HistoryItem[];        // Undo 히스토리
  fillPath: (target: SVGPathElement, previousFill: string) => void;
  undo: () => void;              // 뒤로가기
  redo: () => void;              // 앞으로가기
  clearHistory: () => void;      // 히스토리 초기화
  isBlackColor: (color: string | null) => boolean;
  canUndo: boolean;
  canRedo: boolean;
  setSvgContainer: (container: HTMLDivElement | null) => void;
}
```

#### useImages.ts

Supabase Storage에서 이미지 목록을 로드하는 훅입니다.

```typescript
interface UseImagesReturn {
  images: ImageInfo[];           // 이미지 목록
  isLoading: boolean;            // 로딩 상태
  error: string | null;          // 에러 메시지
}
```

- Supabase 'svg' 폴더에서 이미지 로드
- localStorage 비활성화 이미지 필터링
- 타임스탬프 접두사 제거

#### useDeviceResolution.ts

디바이스 해상도를 감지하는 훅입니다.

```typescript
interface DeviceResolution {
  width: number;                 // 화면 너비
  height: number;                // 화면 높이
  dpr: number;                   // 디바이스 픽셀 비율
}
```

#### useAds.ts

광고 빈도 제한 및 상태를 관리하는 훅입니다.

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

- sessionStorage 기반 세션 추적
- 세션당 최대 3회 전면 광고
- 60초 쿨다운 적용
- adConfig.ts 설정 연동

### 2.5 lib/supabase.ts

Supabase 클라이언트 및 Storage API 래퍼입니다.

#### 주요 함수

| 함수 | 설명 |
|------|------|
| `uploadImage(file, type)` | 이미지 업로드 (svg 또는 gallery) |
| `listImages(type)` | 이미지 목록 조회 |
| `deleteImage(path)` | 이미지 삭제 |
| `getImageUrl(path)` | 퍼블릭 URL 생성 |

#### Storage 구조

```
images/ (버킷)
├── svg/                          # 색칠용 SVG 파일
│   ├── 1234567890_image1.svg
│   └── 1234567891_image2.svg
└── gallery/                      # 인트로 갤러리 이미지
    ├── 1234567890_photo1.jpg
    └── 1234567891_photo2.png
```

### 2.6 utils/saveImage.ts

이미지 저장 유틸리티 함수들입니다.

| 함수 | 설명 |
|------|------|
| `saveAsImage()` | SVG를 PNG로 변환하여 저장 |
| `saveAsCalendar()` | 이미지 55% + 달력 45% 합성 저장 |
| `saveAsDailyCalendar()` | 이미지 55% + 일력 45% 합성 저장 |
| `saveAsWallpaper()` | 디바이스 해상도 기준 배경화면 저장 |
| `saveAsDiary()` | A4 비율 원고지 스타일 그림일기 저장 |

#### saveAsDiary() 상세

그림일기 저장 함수의 레이아웃 구성:

```
┌─────────────────────────────────────┐
│ 날짜 헤더 (6%): 2026년2월5일수 ☀️☁️🌧️❄️ │
├─────────────────────────────────────┤
│                                     │
│         색칠 이미지 (50%)            │
│                                     │
├─────────────────────────────────────┤
│ ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐    │
│ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │    │
│ ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤    │
│ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │    │
│ ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤    │
│ │  메시지 영역 (44%): 14x7 격자     │    │
│ ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤    │
│ │  최대 98자 (사용자 입력 텍스트)    │    │
│ └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘    │
└─────────────────────────────────────┘
```

- A4 용지 비율: 1080 x 1527px (1:1.414)
- 날씨 표시: 현재 날씨만 컬러, 나머지는 30% 투명도
- Open-Meteo API 연동으로 실시간 서울 날씨 조회

### 2.7 utils/weather.ts

날씨 정보 유틸리티 (Open-Meteo API 연동)

| 함수/상수 | 설명 |
|-----------|------|
| `getSeoulWeather()` | 서울 현재 날씨 조회 (비동기) |
| `getWeatherEmoji()` | 날씨 타입에 맞는 이모지 반환 |
| `ALL_WEATHER_TYPES` | 날씨 타입 목록: sunny, cloudy, rainy, snowy |

```typescript
// 날씨 정보 인터페이스
interface WeatherInfo {
  type: WeatherType;        // 'sunny' | 'cloudy' | 'rainy' | 'snowy'
  code: number;             // WMO 날씨 코드
  description: string;      // 한글 설명 (맑음, 흐림, 비, 눈)
}
```

- API: Open-Meteo (무료, API 키 불필요)
- 좌표: 서울 (37.5665, 126.9780)
- 에러 시 기본값: sunny (맑음)

### 2.8 utils/colorAnalysis.ts

색상 심리 분석 유틸리티 함수들입니다.

| 함수 | 설명 |
|------|------|
| `extractColorsFromSvg()` | SVG에서 사용된 색상 추출 |
| `analyzeColors()` | 색상 배열을 분석하여 심리 결과 반환 |
| `getBrightnessLabel()` | 밝기 레이블 반환 (한국어) |
| `getTemperatureLabel()` | 온도 레이블 반환 (한국어) |

```typescript
interface ColorAnalysisResult {
  dominantCategory: 'warm' | 'cool' | 'neutral' | 'mixed';
  brightness: 'bright' | 'dark' | 'balanced';
  variety: 'monotone' | 'moderate' | 'diverse';
  message: string;            // 심리 해석 메시지
  emoji: string;              // 관련 이모지
  stats: {
    warmPercent: number;      // 따뜻한 색 비율
    coolPercent: number;      // 차가운 색 비율
    neutralPercent: number;   // 무채색 비율
    totalColors: number;      // 사용된 색상 수
  };
}
```

---

## 3. 타입 시스템

### 3.1 types/index.ts

```typescript
// 이미지 정보 타입
interface ImageInfo {
  file: string;                   // 파일 URL 또는 경로
  name: string;                   // 표시 이름
}

// 색상 정보 타입
interface ColorInfo {
  hex: string;                    // 헥스 색상 코드
  name: string;                   // 한글 색상 이름
}

// 히스토리 항목 타입
interface HistoryItem {
  element: SVGPathElement;        // 색칠된 SVG path 요소
  previousColor: string;          // 이전 색상
}

// 앱 상태 타입
interface AppState {
  selectedColor: ColorInfo;
  currentImageIndex: number;
  history: HistoryItem[];
  isLoading: boolean;
  images: ImageInfo[];
}

// 디바이스 해상도 타입
interface DeviceResolution {
  width: number;
  height: number;
  dpr: number;
}
```

---

## 4. 스타일 시스템

### 4.1 TDS (Toss Design System) 색상 변수

```css
:root {
  --tds-primary: #3182F6;
  --tds-primary-dark: #1B64DA;
  --tds-background: #F4F6F8;
  --tds-card: #FFFFFF;
  --tds-text-primary: #191F28;
  --tds-text-secondary: #8B95A1;
  --tds-text-tertiary: #B0B8C1;
  --tds-border: #E5E8EB;
  --tds-success: #00C896;
  --tds-error: #F04452;
  --tds-warning: #FF9500;
  --tds-info: #3182F6;
}
```

### 4.2 반응형 레이아웃

| 브레이크포인트 | 레이아웃 |
|----------------|----------|
| 기본 (세로) | 세로 배열: 캔버스 → 팔레트 → 컨트롤 |
| orientation: landscape | 가로 배열: 캔버스 + 오른쪽 패널 |
| min-width: 1024px (PC) | CSS Grid: 캔버스(좌) + 팔레트/컨트롤(우) |
| min-width: 1440px | 오른쪽 패널 360px 확장 |

### 4.3 CSS Module 구조

각 컴포넌트는 CSS Module 파일을 가지며, 스코프된 스타일을 적용합니다.

```
ComponentName.tsx
ComponentName.module.css
```

---

## 5. 데이터 흐름

### 5.1 이미지 로드 흐름

```
1. App.tsx 마운트
   ↓
2. useImages() 훅 호출
   ↓
3. Supabase listImages('svg') 호출
   ↓
4. localStorage에서 비활성화 목록 로드
   ↓
5. 활성화된 이미지만 필터링
   ↓
6. images 상태 업데이트
   ↓
7. ColoringCanvas에 랜덤 이미지 전달
```

### 5.2 색칠 흐름

```
1. 사용자가 path 클릭
   ↓
2. ColoringCanvas onClick 이벤트
   ↓
3. isBlackColor() 검사
   ↓
4. fillPath() 호출 (useColoring 훅)
   ↓
5. 히스토리 스택에 이전 색상 저장
   ↓
6. path.setAttribute('fill', selectedColor.hex)
```

### 5.3 저장 흐름

```
1. 저장 버튼 클릭
   ↓
2. saveAsImage/Calendar/Wallpaper 호출
   ↓
3. SVGSerializer로 SVG 문자열 변환
   ↓
4. Blob → ObjectURL → Image 로드
   ↓
5. Canvas에 그리기 (달력: drawCalendar 추가)
   ↓
6. canvas.toDataURL('image/png')
   ↓
7. 다운로드 링크 생성 및 클릭
```

---

## 6. 네이밍 규칙

### 6.1 파일 네이밍

| 유형 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | IntroPage.tsx |
| CSS Module | PascalCase.module.css | IntroPage.module.css |
| 훅 | camelCase (use 접두사) | useColoring.ts |
| 유틸리티 | camelCase | saveImage.ts |
| 상수 | camelCase | colors.ts |
| 타입 | camelCase (index.ts) | types/index.ts |

### 6.2 TypeScript 네이밍

| 유형 | 규칙 | 예시 |
|------|------|------|
| 인터페이스 | PascalCase | ImageInfo, ColorInfo |
| 타입 | PascalCase | AppPhase, ImageType |
| 함수 | camelCase | saveAsImage, fillPath |
| 상수 | UPPER_SNAKE_CASE | COLORS, ADMIN_PASSWORD |
| 변수 | camelCase | selectedColor, isLoading |

---

## 7. 확장 가이드

### 7.1 새 컴포넌트 추가

1. `src/components/` 디렉토리에 컴포넌트 파일 생성
2. 같은 이름의 CSS Module 파일 생성
3. 필요시 `types/index.ts`에 타입 추가
4. App.tsx 또는 부모 컴포넌트에서 import

### 7.2 새 색상 추가

`src/constants/colors.ts` 파일 수정:

```typescript
export const COLORS: ColorInfo[] = [
  // ... 기존 색상들 ...
  { hex: '#새색상코드', name: '색상이름' },
];
```

### 7.3 Supabase 이미지 추가

1. 관리자 페이지 접근 (?admin=true)
2. 비밀번호 입력 (a1234)
3. SVG 또는 갤러리 탭 선택
4. 파일 업로드 버튼 클릭
5. 필요시 활성화/비활성화 토글

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-02-01 | manager-docs | 초기 구조 문서 작성 |
| 2.0.0 | 2026-02-05 | manager-project | React 아키텍처 전환, 컴포넌트/훅/유틸 구조 문서화, Supabase 통합 |
| 2.1.0 | 2026-02-05 | manager-docs | 색상 심리 분석 유틸리티 (colorAnalysis.ts) 문서화 |
| 2.2.0 | 2026-02-05 | manager-docs | 페이지 전환 애니메이션 추가, LoadingIcon 컴포넌트 (보류) 문서화 |
| 2.3.0 | 2026-02-05 | manager-docs | 그림일기 저장 (saveAsDiary), 날씨 유틸리티 (weather.ts) 문서화 |
| 3.0.0 | 2026-02-05 | manager-docs | 광고 시스템 추가 (ads/, config/, useAds.ts, PrivacyPage.tsx, ads.txt) |
