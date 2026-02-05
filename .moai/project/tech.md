# AEC 컬러링북 - 기술 문서

---

## 메타데이터

| 항목 | 값 |
|------|-----|
| 프로젝트명 | AEC 컬러링북 |
| 문서 유형 | 기술 스택 문서 |
| 버전 | 8.0.0 |
| 최종 업데이트 | 2026-02-05 |

---

## 1. 기술 스택 개요

### 1.1 아키텍처 요약

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           사용자 브라우저                                │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     React 18 Application                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │  │
│  │  │    Vite     │  │ TypeScript  │  │    CSS Modules + TDS    │   │  │
│  │  │  (빌드툴)   │  │ (타입 안전) │  │   (스코프드 스타일링)   │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘   │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │                    Component Layer                           │ │  │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │ │  │
│  │  │  │    App.tsx   │ │ColoringCanvas│ │ Palette │ Controls│   │ │  │
│  │  │  └─────────────┘ └─────────────┘ └─────────────────────┘   │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  │                                │                                  │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │                     Hooks Layer                              │ │  │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌───────────────────────┐ │ │  │
│  │  │  │ useColoring │ │  useImages  │ │ useDeviceResolution   │ │ │  │
│  │  │  └─────────────┘ └─────────────┘ └───────────────────────┘ │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  │                                │                                  │  │
│  │                                ▼                                  │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │                      SVG Engine                              │ │  │
│  │  │  - dangerouslySetInnerHTML (SVG 삽입)                       │ │  │
│  │  │  - 이벤트 위임 (path 클릭 핸들링)                            │ │  │
│  │  │  - fill 속성 동적 변경                                       │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  │                                │                                  │  │
│  │                                ▼                                  │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │                     Canvas API                               │ │  │
│  │  │  - SVG → Canvas 렌더링 (달력/배경화면 저장)                  │ │  │
│  │  │  - PNG 이미지 생성 (toDataURL)                               │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Cloudflare Workers                               │
│  - 정적 파일 서빙 (dist/*, _AEC/*.svg)                                  │
│  - 글로벌 CDN 배포                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 기술 스택 요약표

| 레이어 | 기술 | 버전 | 용도 |
|--------|------|------|------|
| UI 프레임워크 | React | 18.3.1 | 컴포넌트 기반 UI (토스 SDK 호환) |
| 언어 | TypeScript | 5.9.3 | 타입 안전성, 개발 생산성 |
| 빌드 도구 | Vite | 7.3.1 | 빠른 개발 서버, 번들링 |
| 스타일링 | CSS Modules | - | 스코프드 스타일링 |
| 디자인 시스템 | @toss/tds-mobile | 2.2.1 | Toss Design System (Button 컴포넌트) |
| 프레임워크 | @apps-in-toss/web-framework | 1.9.1 | Apps-in-Toss 웹 프레임워크 |
| 스타일링 엔진 | @emotion/react | 11.14.0 | TDS 런타임 스타일링 |
| 그래픽 | SVG | 1.1 | 벡터 이미지, 색칠 영역 |
| 이미지 처리 | Canvas API | HTML5 | PNG 생성, 이미지 변환 |
| 폰트 | Pretendard | CDN | 한글 웹폰트 |
| 배포 | Cloudflare Workers | - | 정적 호스팅, CDN |

---

## 2. 프론트엔드 기술 상세

### 2.1 React 18

#### 핵심 특징

| 특징 | 설명 |
|------|------|
| Concurrent Mode | 렌더링 우선순위 관리로 부드러운 UX |
| Automatic Batching | 여러 상태 업데이트를 한 번에 처리 |
| Suspense 개선 | 데이터 로딩 상태 관리 |
| Transitions | startTransition으로 긴급하지 않은 업데이트 관리 |

#### 다운그레이드 이유

React 19에서 18로 다운그레이드한 이유:
- @toss/tds-mobile은 React 16~18만 지원 (peer dependency)
- @apps-in-toss/web-framework도 React 18 기준으로 동작
- Apps-in-Toss 미니앱 배포를 위한 SDK 호환성 확보

#### 사용 훅

| 훅 | 용도 | 사용처 |
|----|------|--------|
| useState | 상태 관리 | 색상 선택, 히스토리 |
| useEffect | 부수 효과 | SVG 로드, 이벤트 리스너 |
| useCallback | 함수 메모이제이션 | 이벤트 핸들러 |
| useMemo | 값 메모이제이션 | 계산된 값 캐싱 |
| useRef | DOM 참조 | SVG 컨테이너 접근 |

### 2.2 TypeScript 5.9

#### 사용 기능

| 기능 | 용도 | 예시 |
|------|------|------|
| 인터페이스 | 데이터 타입 정의 | ImageInfo, ColorInfo |
| 제네릭 | 재사용 가능한 타입 | Map<string, string> |
| 타입 가드 | 런타임 타입 체크 | isColorable() |
| 유니온 타입 | 복합 타입 | string \| null |
| 타입 추론 | 자동 타입 결정 | const, let 변수 |

#### 주요 타입 정의

```typescript
// src/types/index.ts

export interface ImageInfo {
    file: string;
    name: string;
}

export interface ColorInfo {
    hex: string;
    name: string;
}

export interface HistoryItem {
    pathId: string;
    previousColor: string | null;
}

export type ColorState = Map<string, string>;

export interface UseColoringReturn {
    selectedColor: string;
    colorState: ColorState;
    history: HistoryItem[];
    setColor: (color: string) => void;
    fillPath: (pathId: string, color: string) => void;
    undo: () => void;
    reset: () => void;
    canUndo: boolean;
}
```

### 2.3 Vite 7.3

#### 설정

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 8080,
        open: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
});
```

#### 주요 특징

| 특징 | 설명 |
|------|------|
| ESM 기반 | 네이티브 ES 모듈로 빠른 HMR |
| esbuild | 초고속 트랜스파일링 |
| Rollup | 프로덕션 번들링 최적화 |
| CSS 분할 | 컴포넌트별 CSS 자동 분리 |

### 2.4 CSS Modules

#### 스타일링 패턴

CSS Modules를 사용하여 컴포넌트별 스코프드 스타일을 적용합니다.

#### 반응형 CSS 변수 (clamp() 기반)

고해상도 화면을 위한 동적 크기 조절 변수:

```css
/* App.css - 반응형 크기 변수 */
:root {
  --base-unit: clamp(6px, 1.5vw, 12px);
  --font-xs: clamp(14px, 3.5vw, 20px);
  --font-sm: clamp(16px, 4vw, 24px);
  --font-md: clamp(18px, 4.5vw, 28px);
  --font-lg: clamp(20px, 5vw, 32px);
  --spacing-xs: clamp(6px, 1.5vw, 12px);
  --spacing-sm: clamp(10px, 2.5vw, 18px);
  --spacing-md: clamp(14px, 3.5vw, 24px);
  --spacing-lg: clamp(18px, 4.5vw, 32px);
  --btn-size: clamp(44px, 11vw, 72px);
  --icon-size: clamp(24px, 6vw, 40px);
}
```

#### 40% 패널 레이아웃

```css
/* 세로 모드: 높이 40%, 가로 모드: 너비 40% */
.right-panel {
  height: 40vh;
  max-height: 40%;
}

@media (orientation: landscape) {
  .right-panel {
    width: 40%;
    max-width: 40vw;
    height: 100%;
  }
}
```

#### 컴포넌트 스타일 예시

```css
/* ColoringCanvas.module.css */
.container {
    display: flex;
    justify-content: center;
    padding: 20px;
}

.svgWrapper {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.polaroidFrame {
    padding: 20px 20px 60px;
}
```

```typescript
// ColoringCanvas.tsx
import styles from './ColoringCanvas.module.css';

export function ColoringCanvas() {
    return (
        <div className={styles.container}>
            <div className={styles.svgWrapper}>
                {/* SVG 내용 */}
            </div>
        </div>
    );
}
```

### 2.5 TDS (Toss Design System)

#### 사용 컴포넌트

| 컴포넌트 | 용도 | 적용 상태 |
|----------|------|----------|
| Button | 컨트롤 버튼 (저장, 뒤로가기, 리셋, 달력) | ✅ 적용 완료 |
| Text | 타이포그래피 | 계획 중 |
| Stack | 레이아웃 | 계획 중 |
| Spacing | 간격 관리 | 계획 중 |

#### TDS Button 적용 예시

```typescript
// Controls.tsx - TDS Button 사용
import { Button } from '@toss/tds-mobile';

<Button color="primary" variant="fill" size="medium" display="block" onClick={onUndo}>
  ↩️ 뒤로
</Button>
<Button color="light" variant="weak" size="medium" display="block" onClick={onReset}>
  🔄 리셋
</Button>
<Button color="dark" variant="fill" size="medium" display="block" onClick={onSaveCalendar}>
  📅 달력
</Button>
```

#### TDS Button Props

| Prop | 타입 | 설명 |
|------|------|------|
| color | 'primary' \| 'danger' \| 'light' \| 'dark' | 버튼 색상 |
| variant | 'fill' \| 'weak' | 버튼 스타일 |
| size | 'small' \| 'medium' \| 'large' \| 'xlarge' | 버튼 크기 |
| display | 'inline' \| 'block' \| 'full' | 표시 방식 |
| disabled | boolean | 비활성화 상태 |

---

## 3. 상태 관리 아키텍처

### 3.1 커스텀 훅 기반 상태 관리

외부 상태 관리 라이브러리 없이 React 훅으로 상태를 관리합니다.

```
┌─────────────────────────────────────────────────────────────────────┐
│                              App.tsx                                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    앱 플로우 상태 관리                         │    │
│  │  - isStarted: boolean     (인트로 → 색칠 전환)                │    │
│  │  - isCompleted: boolean   (색칠 → 결과 전환)                  │    │
│  │  - currentImage: ImageInfo | null                            │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐                           │
│  │  useColoring()  │  │   useImages()   │                           │
│  │  - selectedColor│  │  - images[]     │                           │
│  │  - history[]    │  │  - isLoading    │                           │
│  │  - redoStack[]  │  │  - error        │                           │
│  │  - undo()       │  │                 │                           │
│  │  - redo()       │  │                 │                           │
│  │  - canUndo      │  │                 │                           │
│  │  - canRedo      │  │                 │                           │
│  └────────┬────────┘  └────────┬────────┘                           │
│           │                    │                                     │
│           ▼                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                Props로 자식 컴포넌트에 전달                    │    │
│  │  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │    │
│  │  │ IntroPage │ │ Canvas   │ │ Palette  │ │ ResultPage│       │    │
│  │  └───────────┘ └──────────┘ └──────────┘ └──────────┘       │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 앱 플로우 상태 관리

App.tsx에서 3단계 플로우를 관리합니다.

| 상태 | 타입 | 설명 |
|------|------|------|
| isStarted | boolean | 인트로 완료 여부 (false: 인트로, true: 색칠/결과) |
| isCompleted | boolean | 색칠 완료 여부 (true: 결과 페이지 표시) |
| currentImage | ImageInfo \| null | 현재 선택된 이미지 |

| 핸들러 | 설명 |
|--------|------|
| handleStart | 인트로에서 시작 버튼 클릭 시 호출 |
| handleComplete | 색칠 완료 버튼 클릭 시 호출 |
| handleRestart | 새로 시작하기 버튼 클릭 시 호출 |
| handleReset | 현재 이미지 색칠 초기화 |

### 3.3 useColoring 훅 상세

색칠 상태, 히스토리, Redo 스택을 관리하는 커스텀 훅입니다.

#### 상태 및 Ref

| 상태/Ref | 타입 | 설명 |
|----------|------|------|
| selectedColor | ColorInfo | 현재 선택된 색상 객체 |
| history | PathHistoryItem[] | Undo 히스토리 스택 (최대 50개) |
| redoStack | PathHistoryItem[] | Redo 스택 |
| historyRef | Ref | 최신 히스토리 접근용 Ref |
| redoStackRef | Ref | 최신 Redo 스택 접근용 Ref |
| svgContainerRef | Ref | SVG 컨테이너 DOM 참조 |
| onSvgSyncRef | Ref | SVG 동기화 콜백 참조 |

#### 주요 함수

| 함수 | 설명 |
|------|------|
| fillPath(element) | path 요소에 색상 적용, 히스토리 저장, Redo 스택 초기화 |
| undo() | 마지막 작업 취소, Redo 스택에 추가, SVG 동기화 |
| redo() | 취소한 작업 복원, 히스토리에 다시 추가, SVG 동기화 |
| clearHistory() | 히스토리와 Redo 스택 모두 초기화 |
| isBlackColor(color) | 검정색 여부 판별 (#000000, black, rgb(0,0,0)) |
| setSvgContainer(container) | SVG 컨테이너 DOM 설정 |
| setOnSvgSync(callback) | SVG 동기화 콜백 설정 |

#### 반환 값

```typescript
return {
    selectedColor,      // 현재 선택된 색상
    setSelectedColor,   // 색상 선택 함수
    history,            // 히스토리 배열
    fillPath,           // 색칠 함수
    undo,               // 실행 취소
    redo,               // 다시 실행
    clearHistory,       // 히스토리 초기화
    isBlackColor,       // 검정색 판별
    canUndo,            // history.length > 0
    canRedo,            // redoStack.length > 0
    setSvgContainer,    // SVG 컨테이너 설정
    setOnSvgSync        // 동기화 콜백 설정
};
```

---

## 4. 그래픽 기술 상세

### 4.1 SVG 처리

#### React에서의 SVG 렌더링

```typescript
// ColoringCanvas.tsx
export function ColoringCanvas({
    svgContent,
    colorState,
    selectedColor,
    onFillPath,
}: ColoringCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // SVG 클릭 핸들러
    const handleClick = useCallback((e: React.MouseEvent) => {
        const target = e.target as SVGElement;
        if (target.tagName.toLowerCase() !== 'path') return;

        const pathId = target.id || target.getAttribute('data-id');
        if (!pathId) return;

        const fill = target.getAttribute('fill');
        if (isBlackColor(fill)) return;

        onFillPath(pathId, selectedColor);
    }, [selectedColor, onFillPath]);

    // colorState 변경 시 SVG 업데이트
    useEffect(() => {
        if (!containerRef.current) return;

        const svg = containerRef.current.querySelector('svg');
        if (!svg) return;

        colorState.forEach((color, pathId) => {
            const path = svg.querySelector(`#${pathId}, [data-id="${pathId}"]`);
            if (path) {
                path.setAttribute('fill', color);
            }
        });
    }, [colorState]);

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
}
```

#### 검정색 판별 함수

검정색 판별 기준이 v5.0.0에서 변경되었습니다.

**변경 전 (v4.0.0 이전)**:
- 밝기(brightness) < 50 기준으로 판별
- 어두운 색상(#121212, #212121, #5D4037 등)도 색칠 불가로 처리됨

**변경 후 (v5.0.0)**:
- 정확히 순수 검정색(#000000, black, rgb(0,0,0))만 색칠 불가
- 어두운 색상(차콜, 다크브라운 등)도 색칠 가능

```typescript
// src/utils/colorUtils.ts
export function isBlackColor(color: string | null): boolean {
    if (!color) return false;
    const c = color.toLowerCase().trim();

    // 순수 검정색만 색칠 불가 (라인아트 보존)
    if (c === 'black' || c === '#000000' || c === '#000') return true;

    // RGB 형식 검사 - 정확히 rgb(0, 0, 0)만 검정색으로 판별
    const rgbMatch = c.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        return r === 0 && g === 0 && b === 0;
    }
    return false;
}
```

### 4.2 Canvas API - 이미지 저장

```typescript
// src/utils/saveImage.ts

export async function saveAsCalendar(
    svgElement: SVGElement,
    imageName: string
): Promise<void> {
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = 2340;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d')!;

    // 배경 흰색
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // SVG를 이미지로 변환
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = await loadImage(svgUrl);

    // 상단 55%에 이미지 그리기
    const imageHeight = height * 0.55;
    const scale = Math.min(width / img.width, imageHeight / img.height);
    const imgWidth = img.width * scale;
    const imgHeight = img.height * scale;
    const imgX = (width - imgWidth) / 2;
    const imgY = (imageHeight - imgHeight) / 2;

    ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);

    // 하단 45%에 달력 그리기
    drawCalendar(ctx, width, imageHeight, height - imageHeight);

    // 다운로드
    downloadCanvas(canvas, `calendar_${imageName}_${getYearMonth()}.png`);

    URL.revokeObjectURL(svgUrl);
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
```

---

## 5. 외부 리소스

### 5.1 npm 패키지

| 패키지 | 버전 | 용도 |
|--------|------|------|
| react | 18.3.1 | UI 프레임워크 (토스 SDK 호환) |
| react-dom | 18.3.1 | DOM 렌더링 |
| @toss/tds-mobile | 2.2.1 | Toss 디자인 시스템 |
| @apps-in-toss/web-framework | 1.9.1 | Apps-in-Toss 웹 프레임워크 |
| @emotion/react | 11.14.0 | TDS 런타임 스타일링 |
| typescript | 5.9.3 | 타입 체커 |
| vite | 7.3.1 | 빌드 도구 |
| @vitejs/plugin-react | 5.1.2 | Vite React 플러그인 |

### 5.2 Pretendard 폰트

| 항목 | 값 |
|------|-----|
| 폰트명 | Pretendard |
| 제공처 | jsDelivr CDN |
| 웨이트 | 100, 200, 300, 400, 500, 600, 700, 800, 900 |
| 포맷 | woff2 |
| 로딩 | font-display: swap |

---

## 6. 개발 환경

### 6.1 개발 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (localhost:8080)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 타입 체크
npm run type-check

# 린트
npm run lint
```

### 6.2 package.json scripts

```json
{
  "scripts": {
    "dev": "vite --port 8080",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

### 6.3 VS Code 확장

| 확장 | 용도 |
|------|------|
| TypeScript Vue Plugin (Volar) | TypeScript 지원 |
| ESLint | 코드 린팅 |
| Prettier | 코드 포맷팅 |
| CSS Modules | CSS 모듈 자동완성 |
| SVG Preview | SVG 미리보기 |

---

## 7. 배포 설정

### 7.1 Cloudflare Workers

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

# 빌드 후 배포
npm run build && wrangler deploy

# 로컬 개발 서버 (Wrangler)
wrangler dev
```

#### 배포 파일 목록

```
dist/
├── index.html              # 메인 페이지
├── assets/
│   ├── index-[hash].js     # JS 번들
│   └── index-[hash].css    # CSS 번들
└── _AEC/
    ├── images.json         # 이미지 매니페스트
    └── *.svg               # SVG 이미지
```

---

## 8. 브라우저 호환성

### 8.1 지원 브라우저

| 브라우저 | 최소 버전 | 주요 기능 |
|----------|-----------|-----------|
| Chrome | 90+ | 모든 기능 지원 |
| Firefox | 88+ | 모든 기능 지원 |
| Edge | 90+ | 모든 기능 지원 |
| Safari | 15+ | 부분 지원 (PNG 저장 주의) |

### 8.2 필수 기능 지원

| 기능 | 용도 | 지원 현황 |
|------|------|-----------|
| ES2020+ | TypeScript 타겟 | 모든 모던 브라우저 |
| CSS Modules | 스코프드 스타일 | 빌드 타임 처리 |
| Fetch API | 데이터 로드 | 모든 모던 브라우저 |
| SVG DOM | path 조작 | 모든 모던 브라우저 |
| Canvas 2D | PNG 생성 | 모든 모던 브라우저 |

---

## 9. 성능 최적화

### 9.1 빌드 최적화

| 항목 | 상태 | 비고 |
|------|------|------|
| Tree Shaking | 자동 | Vite/Rollup 내장 |
| Code Splitting | 자동 | 동적 import 지원 |
| 압축 | Brotli/gzip | Cloudflare CDN |
| 캐싱 | 자동 | 해시 기반 파일명 |

### 9.2 React 최적화

| 기법 | 적용 | 효과 |
|------|------|------|
| useCallback | 이벤트 핸들러 | 불필요한 리렌더링 방지 |
| useMemo | 계산된 값 | 비용 높은 연산 캐싱 |
| React.memo | 컴포넌트 | Props 변경 시만 리렌더링 |
| key 속성 | 리스트 | 효율적인 DOM 업데이트 |

### 9.3 성능 지표 목표

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| FCP (First Contentful Paint) | < 1.5s | Lighthouse |
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| TTI (Time to Interactive) | < 3s | Lighthouse |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |

---

## 10. 보안 고려사항

### 10.1 현재 보안 상태

| 항목 | 상태 | 설명 |
|------|------|------|
| XSS | 주의 필요 | dangerouslySetInnerHTML 사용 |
| CSRF | 해당 없음 | 서버 통신 없음 |
| 인증 | 해당 없음 | 인증 기능 없음 |
| 데이터 저장 | 로컬만 | 서버 저장 없음 |

### 10.2 XSS 방지

SVG 파일은 신뢰할 수 있는 소스(_AEC/ 디렉토리)에서만 로드합니다.

```typescript
// 안전한 SVG 로드
const loadSvg = async (filename: string) => {
    // 경로 검증
    if (!filename.endsWith('.svg')) {
        throw new Error('Invalid file type');
    }

    const response = await fetch(`/_AEC/${filename}`);
    if (!response.ok) {
        throw new Error('Failed to load SVG');
    }

    return response.text();
};
```

### 10.3 Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    style-src 'self' 'unsafe-inline';
    script-src 'self';
    font-src 'self' https://cdn.jsdelivr.net;
    img-src 'self' blob: data:;
">
```

---

## 11. 마이그레이션 가이드

### 11.1 Vanilla JS에서 React로

| 이전 (Vanilla JS) | 현재 (React) |
|-------------------|--------------|
| 단일 index.html | 컴포넌트 기반 src/ |
| 전역 state 객체 | useState 훅 |
| DOM 직접 조작 | Virtual DOM |
| 인라인 CSS | CSS Modules |
| 수동 이벤트 바인딩 | React 이벤트 시스템 |
| 없음 | TypeScript 타입 안전 |

### 11.2 백업 파일

원본 바닐라 JS 버전은 `index-vanilla.html`로 보존되어 있습니다.

---

## 12. Apps-in-Toss 빌드 및 배포

### 12.1 공식 빌드 방식

Apps-in-Toss 앱은 `granite build` 명령어를 사용하여 `.ait` 파일을 생성해야 합니다.

#### granite.config.ts 설정

```typescript
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'dailycoloring',
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  brand: {
    displayName: '오늘의 컬러링',
    primaryColor: '#3182F6',
    icon: 'https://static.toss.im/icons/png/4x/icon-toss-logo.png',
  },
});
```

#### 빌드 명령어

```bash
# 공식 빌드 명령어 (권장)
npx granite build

# 결과: dailycoloring.ait 파일 생성
```

### 12.2 빌드 이슈 해결 가이드

#### 이슈 1: "기존 버전과 동일" 오류

**증상**: ait 파일 업로드 시 버전 중복 오류 발생

**원인**: `.granite/app.json`에 이전 버전 정보가 캐시되어 있음

**해결 방법**:
```bash
# 1. 캐시된 app.json 삭제
rm -f .granite/app.json

# 2. 다시 빌드
npx granite build
```

#### 이슈 2: "유효하지 않은 deploymentId" 오류

**증상**: 수동 생성한 UUID가 서버에서 거부됨

**원인**:
- 수동 `create-ait.mjs` 스크립트 사용 시 UUID v4 형식 생성
- 서버는 UUID v7 형식 (시간 기반)을 요구

**해결 방법**:
- 수동 스크립트 대신 공식 `granite build` 사용
- `granite build`는 올바른 UUID v7 형식의 deploymentId를 자동 생성

#### 이슈 3: CSS 모듈 빌드 오류 (rsbuild)

**증상**: `granite build` 실행 시 CSS 모듈 처리 오류
```
Module build failed: Failed to convert JavaScript value `Undefined` into rust type `String`
```

**원인**: `granite.config.ts`의 `commands.build`가 `rsbuild build`로 설정되어 있으나 프로젝트는 Vite 사용

**해결 방법**:
```typescript
// granite.config.ts
commands: {
  dev: 'vite',        // rsbuild dev → vite
  build: 'vite build', // rsbuild build → vite build
}
```

### 12.3 빌드 체크리스트

빌드 전 확인 사항:

| 항목 | 확인 내용 | 명령어/파일 |
|------|----------|-------------|
| granite.config.ts | appName이 콘솔과 동일한지 확인 | `granite.config.ts` |
| commands.build | 실제 사용 번들러와 일치하는지 확인 | Vite: `vite build` |
| brand 설정 | icon, displayName 설정 완료 | `granite.config.ts` |
| .granite/app.json | 버전 오류 시 삭제 후 재빌드 | `.granite/app.json` |

### 12.4 배포 프로세스

```bash
# 1. 빌드
npx granite build

# 2. 생성된 파일 확인
ls -la dailycoloring.ait

# 3. 앱 출시 메뉴에서 업로드
# - deploymentId는 업로드 시 서버에서 자동 발급
# - version은 granite build 시 자동 관리
```

### 12.5 참고 문서

- [웹뷰 개발 가이드](https://developers-apps-in-toss.toss.im/tutorials/webview.html)
- [앱 번들 파일 생성](https://developers-apps-in-toss.toss.im/development/test/toss.html)

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-02-01 | manager-docs | 초기 기술 문서 작성 |
| 3.0.0 | 2026-02-02 | manager-docs | React 마이그레이션: React 19 + TypeScript + Vite 아키텍처, CSS Modules, TDS 디자인 시스템, 컴포넌트/훅 기반 구조 |
| 4.0.0 | 2026-02-02 | manager-docs | 반응형 UI: CSS clamp() 기반 동적 크기 변수, 40% 패널 레이아웃, 고해상도 디바이스 최적화 |
| 5.0.0 | 2026-02-02 | manager-docs | 색상 팔레트 60색 확장, isBlackColor 함수 로직 변경 (brightness 기준 -> 순수 검정색만 판별), selectedColorRef 추가로 클로저 캡처 버그 수정 |
| 6.0.0 | 2026-02-02 | manager-docs | Apps-in-Toss 출시 준비: React 19→18.3.1 다운그레이드, TDS Button 컴포넌트 적용, @emotion/react 추가, 64색 팔레트 확장 |
| 7.0.0 | 2026-02-05 | manager-docs | 3단계 플로우 아키텍처: isStarted/isCompleted 상태 관리, useColoring 훅 redo 기능 추가 (redoStack, canRedo), saveAsImage 함수 추가, SVG 동기화 콜백 패턴 추가 |
| 8.0.0 | 2026-02-05 | manager-docs | Apps-in-Toss 빌드 가이드 추가: granite build 공식 방식, 버전/deploymentId 오류 해결, CSS 모듈 빌드 이슈 해결 |
