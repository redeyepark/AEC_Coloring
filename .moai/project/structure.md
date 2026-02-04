# AEC 컬러링북 - 프로젝트 구조

---

## 메타데이터

| 항목 | 값 |
|------|-----|
| 프로젝트명 | AEC 컬러링북 |
| 문서 유형 | 프로젝트 구조 문서 |
| 버전 | 7.0.0 |
| 최종 업데이트 | 2026-02-05 |
| 아키텍처 | React 18 + TypeScript + Vite + TDS |
| 배포 플랫폼 | Apps-in-Toss (토스 미니앱) |

---

## 1. 디렉토리 구조 개요

```
JWY_BG/
├── index.html                    # HTML 엔트리 (React 마운트 포인트)
├── index-vanilla.html            # 원본 바닐라 JS 버전 백업
├── package.json                  # npm 의존성 및 스크립트
├── package-lock.json             # 의존성 잠금 파일
├── vite.config.ts                # Vite 빌드 설정
├── tsconfig.json                 # TypeScript 설정
├── tsconfig.node.json            # Node.js용 TypeScript 설정
├── wrangler.jsonc                # Cloudflare Workers 배포 설정
├── README.md                     # 프로젝트 소개 문서
├── CLAUDE.md                     # MoAI 실행 지침서
├── .gitignore                    # Git 무시 파일 목록
├── .mcp.json                     # MCP 서버 설정
│
├── src/                          # React 소스 코드
│   ├── main.tsx                  # React 엔트리 포인트
│   ├── App.tsx                   # 메인 앱 컴포넌트
│   ├── App.css                   # 전역 스타일
│   ├── vite-env.d.ts             # Vite 타입 선언
│   │
│   ├── components/               # React 컴포넌트
│   │   ├── IntroPage.tsx             # 인트로 페이지 (갤러리 이미지, 포춘쿠키)
│   │   ├── IntroPage.module.css      # 인트로 스타일
│   │   ├── ColoringCanvas.tsx        # SVG 렌더링 및 클릭 핸들링
│   │   ├── ColoringCanvas.module.css # 캔버스 스타일 (CSS Modules)
│   │   ├── Palette.tsx               # 색상 팔레트 컴포넌트
│   │   ├── Palette.module.css        # 팔레트 스타일
│   │   ├── Controls.tsx              # 컨트롤 버튼 컴포넌트
│   │   ├── Controls.module.css       # 컨트롤 스타일
│   │   ├── ResultPage.tsx            # 결과 페이지 (미리보기, 저장 옵션)
│   │   └── ResultPage.module.css     # 결과 페이지 스타일
│   │
│   ├── hooks/                    # 커스텀 React 훅
│   │   ├── useColoring.ts            # 색칠 상태 및 히스토리 관리
│   │   ├── useImages.ts              # 이미지 로딩 및 관리
│   │   └── useDeviceResolution.ts    # 화면 크기 감지
│   │
│   ├── utils/                    # 유틸리티 함수
│   │   └── saveImage.ts              # 달력/배경화면 이미지 저장
│   │
│   ├── types/                    # TypeScript 타입 정의
│   │   └── index.ts                  # 공유 타입 정의
│   │
│   └── constants/                # 상수 정의
│       ├── colors.ts                 # 64색 팔레트 상수
│       └── fortunes.ts               # 포춘쿠키 메시지 (50개)
│
├── _AEC/                         # SVG 이미지 에셋 디렉토리
│   ├── images.json               # 이미지 매니페스트
│   └── *.svg                     # SVG 라인아트 이미지
│
├── gallery/                      # 인트로 페이지 갤러리 이미지
│   └── *.png, *.jpg, *.jpeg      # 예시 이미지 8개
│
├── dist/                         # 프로덕션 빌드 출력 (gitignore)
│
├── .moai/                        # MoAI-ADK 설정 및 문서
│   ├── config/                   # 설정 파일
│   ├── project/                  # 프로젝트 문서
│   ├── specs/                    # SPEC 문서
│   ├── memory/                   # 컨텍스트 메모리
│   ├── reports/                  # 분석 리포트
│   ├── cache/                    # 캐시 데이터
│   ├── llm-configs/              # LLM 설정
│   └── announcements/            # 공지사항 (다국어)
│
├── .claude/                      # Claude Code 설정
│   ├── agents/                   # 에이전트 정의
│   ├── commands/                 # 슬래시 커맨드
│   ├── skills/                   # 스킬 정의
│   ├── hooks/                    # 훅 스크립트
│   ├── rules/                    # 규칙 정의
│   └── output-styles/            # 출력 스타일
│
└── node_modules/                 # npm 패키지 (gitignore)
```

---

## 2. 핵심 파일 상세

### 2.1 React 엔트리 파일

#### index.html

React 앱의 HTML 엔트리 포인트입니다. 최소한의 마크업만 포함하고, React가 마운트됩니다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>색칠 공부 - SVG Coloring Book</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

#### src/main.tsx

React 애플리케이션의 진입점입니다.

| 역할 | 설명 |
|------|------|
| React 초기화 | createRoot로 React 18+ 렌더링 |
| 앱 마운트 | App 컴포넌트를 #root에 마운트 |
| StrictMode | 개발 시 추가 검사 활성화 |

#### src/App.tsx

메인 애플리케이션 컴포넌트입니다.

| 섹션 | 역할 |
|------|------|
| 상태 관리 | useColoring, useImages 훅 사용 |
| 레이아웃 | 헤더, 캔버스, 팔레트, 컨트롤 구성 |
| 이벤트 | 색상 선택, 저장 등 이벤트 핸들링 |

### 2.2 React 컴포넌트

#### src/components/IntroPage.tsx

인트로 화면을 담당하는 컴포넌트입니다.

| 기능 | 설명 |
|------|------|
| 갤러리 이미지 | 8개 이미지 중 랜덤 표시 |
| 포춘쿠키 메시지 | 50개 메시지 중 랜덤 선택 |
| 시작 안내 | "화면을 터치하여 시작" 표시 |
| 클릭 핸들링 | 화면 터치/클릭 시 색칠 화면 전환 |

#### src/components/ResultPage.tsx

결과 화면을 담당하는 컴포넌트입니다.

| 기능 | 설명 |
|------|------|
| SVG 미리보기 | 완성된 색칠 결과 표시 |
| 이미지 저장 | TDS Button - 원본 이미지 PNG 저장 |
| 달력 저장 | TDS Button - 달력 형식으로 저장 |
| 배경화면 저장 | TDS Button - 배경화면 형식으로 저장 |
| 저장 상태 표시 | 저장 완료 시 버튼 비활성화 |
| 토스트 메시지 | 저장 결과 피드백 |
| 새로 시작하기 | 인트로 화면으로 돌아가기 |

#### src/components/ColoringCanvas.tsx

SVG 렌더링과 클릭 색칠을 담당하는 메인 컴포넌트입니다.

| 기능 | 설명 |
|------|------|
| SVG 렌더링 | dangerouslySetInnerHTML로 SVG 삽입 |
| 클릭 핸들링 | 이벤트 위임으로 path 클릭 감지 |
| 색칠 처리 | 선택된 색상으로 fill 속성 변경 |
| 검정색 보호 | 라인(검정색)은 색칠 불가 |

#### src/components/Palette.tsx

60색 색상 팔레트 UI 컴포넌트입니다.

| 기능 | 설명 |
|------|------|
| 색상 그리드 | 11개 계열 배치 (피부색, 머터리얼 포함) |
| 선택 표시 | 현재 선택 색상 하이라이트 |
| 클릭 이벤트 | 색상 선택 시 부모에 전달 |

#### src/components/Controls.tsx

뒤로가기, 초기화, 저장 버튼 컴포넌트입니다.

| 버튼 | 기능 |
|------|------|
| 뒤로가기 | 마지막 색칠 작업 취소 |
| 처음으로 | 모든 색칠 초기화 |
| 달력저장 | 달력 이미지로 다운로드 |
| 배경화면 | 배경화면으로 다운로드 |

### 2.3 커스텀 훅

#### src/hooks/useColoring.ts

색칠 상태와 히스토리를 관리하는 커스텀 훅입니다.

| 상태/함수 | 설명 |
|-----------|------|
| selectedColor | 현재 선택된 색상 |
| history | 히스토리 스택 (최대 50개) |
| redoStack | Redo 스택 |
| setSelectedColor | 색상 선택 함수 |
| fillPath | path 색칠 및 히스토리 추가 |
| undo | 마지막 작업 취소 |
| redo | 취소한 작업 복원 |
| clearHistory | 전체 히스토리 초기화 |
| isBlackColor | 검정색 판별 함수 |
| canUndo | Undo 가능 여부 |
| canRedo | Redo 가능 여부 |
| setSvgContainer | SVG 컨테이너 설정 |
| setOnSvgSync | SVG 동기화 콜백 설정 |

#### src/hooks/useImages.ts

이미지 로딩과 전환을 관리하는 훅입니다.

| 상태/함수 | 설명 |
|-----------|------|
| images | images.json에서 로드한 이미지 목록 |
| currentImage | 현재 표시 중인 이미지 |
| svgContent | 로드된 SVG 문자열 |
| isLoading | 로딩 상태 |
| loadRandomImage | 랜덤 이미지 로드 |
| loadImage | 특정 이미지 로드 |

#### src/hooks/useDeviceResolution.ts

화면 크기와 해상도를 감지하는 훅입니다.

| 상태 | 설명 |
|------|------|
| width | 뷰포트 너비 |
| height | 뷰포트 높이 |
| isMobile | 모바일 여부 (600px 기준) |
| devicePixelRatio | 디바이스 픽셀 비율 |

### 2.4 유틸리티

#### src/utils/saveImage.ts

이미지 저장 기능을 제공하는 유틸리티입니다.

| 함수 | 설명 |
|------|------|
| saveAsImage | 색칠한 이미지 원본 PNG 저장 |
| saveAsCalendar | 달력 이미지 생성 및 다운로드 |
| saveAsDailyCalendar | 일력 이미지 생성 및 다운로드 |
| saveAsWallpaper | 배경화면 이미지 생성 및 다운로드 |
| isTossEnvironment | 토스 환경 체크 |
| saveImage | Toss/브라우저 환경별 이미지 저장 |

### 2.5 타입 정의

#### src/types/index.ts

공유 TypeScript 타입을 정의합니다.

```typescript
// 주요 타입 정의
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
```

### 2.6 상수 정의

#### src/constants/colors.ts

64색 팔레트 상수를 정의합니다.

| 계열 | 색상 수 |
|------|---------|
| 빨강 | 5색 |
| 주황 | 5색 |
| 노랑 | 6색 |
| 초록 | 5색 |
| 시안 | 4색 |
| 파랑 | 5색 |
| 보라 | 5색 |
| 핑크 | 5색 |
| 갈색 | 7색 |
| 피부색 | 4색 |
| 머터리얼 | 8색 |
| 무채색 | 5색 |

#### src/constants/fortunes.ts

포춘쿠키 메시지 상수를 정의합니다.

| 카테고리 | 메시지 수 | 설명 |
|----------|-----------|------|
| 일상 응원 | 10개 | 일상에서의 응원 메시지 |
| 동기부여 | 10개 | 동기부여 메시지 |
| 위로와 힐링 | 10개 | 위로와 힐링 메시지 |
| 행운과 축복 | 10개 | 행운과 축복 메시지 |
| 자기 사랑 | 10개 | 자기 사랑 메시지 |

주요 함수:
- `getRandomFortune(previousIndex)`: 중복 방지 랜덤 메시지 선택

### 2.7 _AEC/ 디렉토리

SVG 라인아트 이미지 에셋을 저장하는 디렉토리입니다.

#### images.json (NEW)

이미지 매니페스트 파일로, 동적 이미지 목록을 제공합니다.

```json
{
    "images": [
        { "file": "Bane.svg", "name": "베인" },
        { "file": "Batman.svg", "name": "배트맨" },
        ...
    ]
}
```

#### SVG 구조 특성

- 형식: SVG (Scalable Vector Graphics)
- 구성: path 요소로 이루어진 벡터 이미지
- 라인: 검정색 (#000000) path로 경계 구분
- 영역: fill 속성이 없거나 흰색인 path가 색칠 가능 영역
- viewBox: 가변 (이미지마다 다름)

### 2.8 gallery/ 디렉토리

인트로 페이지에 표시되는 예시 갤러리 이미지를 저장하는 디렉토리입니다.

#### 이미지 목록

| 파일명 | 형식 | 용도 |
|--------|------|------|
| 20260202_02.png | PNG | 갤러리 예시 이미지 |
| 20260202_03.jpg | JPG | 갤러리 예시 이미지 |
| 20260202_04.jpeg | JPEG | 갤러리 예시 이미지 |
| 20260202_06.jpeg | JPEG | 갤러리 예시 이미지 |
| 20260204_01.png | PNG | 갤러리 예시 이미지 |
| 20260204_02.jpg | JPG | 갤러리 예시 이미지 |
| 20260204_03.jpeg | JPEG | 갤러리 예시 이미지 |
| 20260204_04.jpeg | JPEG | 갤러리 예시 이미지 |

총 8개의 이미지 중 인트로 페이지에서 랜덤으로 1개가 표시됩니다.

### 2.8 설정 파일

#### package.json

npm 패키지 설정 및 의존성을 정의합니다.

| 섹션 | 내용 |
|------|------|
| dependencies | React 18.3.1, @toss/tds-mobile, @apps-in-toss/web-framework, @emotion/react |
| devDependencies | TypeScript, Vite, @types/react@18, @types/react-dom@18 |
| scripts | dev, build, preview, lint |

#### vite.config.ts

Vite 빌드 도구 설정입니다.

| 설정 | 값 |
|------|-----|
| plugins | react() |
| server.port | 8080 |
| build.outDir | dist |

#### tsconfig.json

TypeScript 컴파일러 설정입니다.

| 설정 | 값 |
|------|-----|
| target | ES2020 |
| lib | ES2020, DOM |
| module | ESNext |
| jsx | react-jsx |
| strict | true |
| paths | @/* -> src/* |

#### wrangler.jsonc

Cloudflare Workers 배포를 위한 설정 파일입니다.

```jsonc
{
  "name": "aec-coloring",
  "compatibility_date": "2026-02-01",
  "assets": {
    "directory": "./dist"  // Vite 빌드 출력
  }
}
```

---

## 3. MoAI 설정 디렉토리

### 3.1 .moai/config/

프로젝트 설정 파일을 저장합니다.

| 파일 | 역할 |
|------|------|
| config.yaml | 메인 설정 파일 |
| sections/language.yaml | 언어 설정 (한국어) |
| sections/user.yaml | 사용자 정보 |
| sections/quality.yaml | 품질 게이트 설정 |
| sections/project.yaml | 프로젝트 메타데이터 |
| sections/workflow.yaml | 워크플로우 설정 |
| sections/git-strategy.yaml | Git 전략 설정 |
| multilingual-triggers.yaml | 다국어 트리거 설정 |
| statusline-config.yaml | 상태줄 설정 |

### 3.2 .moai/specs/

SPEC 문서를 저장합니다.

```
specs/
└── SPEC-COLOR-001/
    ├── spec.md          # 요구사항 명세서
    ├── plan.md          # 구현 계획서
    └── acceptance.md    # 인수 기준
```

### 3.3 .moai/project/

프로젝트 문서를 저장합니다.

```
project/
├── product.md    # 제품 문서
├── structure.md  # 구조 문서 (본 문서)
└── tech.md       # 기술 문서
```

---

## 4. Claude Code 설정 디렉토리

### 4.1 .claude/agents/

MoAI 에이전트 정의 파일을 저장합니다.

| 파일 | 에이전트 | 역할 |
|------|----------|------|
| expert-frontend.md | expert-frontend | 프론트엔드 구현 |
| expert-backend.md | expert-backend | 백엔드 개발 |
| manager-docs.md | manager-docs | 문서화 관리 |
| manager-spec.md | manager-spec | SPEC 작성 |
| manager-ddd.md | manager-ddd | DDD 구현 |
| ... | ... | ... |

### 4.2 .claude/skills/

스킬 정의 파일을 저장합니다.

| 디렉토리 | 스킬 | 역할 |
|----------|------|------|
| moai/ | MoAI 코어 | 워크플로우 정의 |
| moai-docs-generation/ | 문서 생성 | 문서화 패턴 |
| moai-library-nextra/ | Nextra | 문서 사이트 |
| moai-library-mermaid/ | Mermaid | 다이어그램 |
| ... | ... | ... |

### 4.3 .claude/hooks/

이벤트 훅 스크립트를 저장합니다.

| 파일 | 이벤트 | 역할 |
|------|--------|------|
| session_start__*.py | SessionStart | 세션 시작 시 실행 |
| session_end__*.py | SessionEnd | 세션 종료 시 실행 |
| pre_tool__*.py | PreToolUse | 도구 실행 전 |
| post_tool__*.py | PostToolUse | 도구 실행 후 |

---

## 5. 파일 의존성 관계

### 5.1 런타임 의존성

```
src/main.tsx
├── src/App.tsx
│   ├── src/components/IntroPage.tsx
│   │   ├── [CSS Module] IntroPage.module.css
│   │   └── src/constants/fortunes.ts
│   ├── src/components/ColoringCanvas.tsx
│   │   └── [CSS Module] ColoringCanvas.module.css
│   ├── src/components/Palette.tsx
│   │   └── [CSS Module] Palette.module.css
│   ├── src/components/Controls.tsx
│   │   └── [CSS Module] Controls.module.css
│   ├── src/components/ResultPage.tsx
│   │   ├── [CSS Module] ResultPage.module.css
│   │   └── [npm] @toss/tds-mobile (Button)
│   ├── src/hooks/useColoring.ts
│   ├── src/hooks/useImages.ts
│   │   └── [Fetch] _AEC/images.json
│   │       └── [Fetch] _AEC/*.svg
│   ├── src/hooks/useDeviceResolution.ts
│   ├── src/utils/saveImage.ts
│   │   └── [npm] @apps-in-toss/web-framework (saveBase64Data)
│   ├── src/constants/colors.ts
│   ├── src/constants/fortunes.ts
│   └── src/types/index.ts
├── [Static] gallery/*.png, *.jpg, *.jpeg
├── [CDN] @toss/tds-mobile
└── [CDN] @apps-in-toss/web-framework
```

### 5.2 빌드 의존성

```
vite.config.ts
├── package.json (dependencies)
├── tsconfig.json (TypeScript)
└── src/**/* (소스 파일)
    └── dist/ (빌드 출력)
```

### 5.3 배포 의존성

```
wrangler.jsonc
└── dist/               # Vite 빌드 출력
    ├── index.html
    ├── assets/         # JS, CSS 번들
    └── _AEC/           # SVG 이미지
```

### 5.4 개발 의존성

```
CLAUDE.md
├── .moai/config/       # MoAI 설정
├── .moai/specs/        # SPEC 문서
└── .claude/            # Claude Code 설정
    ├── agents/         # 에이전트
    ├── skills/         # 스킬
    └── rules/          # 규칙
```

---

## 6. 네이밍 규칙

### 6.1 파일 네이밍

| 유형 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 | PascalCase | ColoringCanvas.tsx |
| CSS Modules | PascalCase.module.css | ColoringCanvas.module.css |
| 훅 | camelCase, use 접두사 | useColoring.ts |
| 유틸리티 | camelCase | saveImage.ts |
| 타입 | camelCase 또는 index | types/index.ts |
| 상수 | camelCase | colors.ts |
| 설정 | 소문자, 점/하이픈 | vite.config.ts |

### 6.2 디렉토리 네이밍

| 유형 | 규칙 | 예시 |
|------|------|------|
| 소스 | 소문자 | src, components, hooks |
| 설정 | 점 접두사 | .moai, .claude |
| 에셋 | 밑줄 접두사 | _AEC |
| 빌드 출력 | 소문자 | dist, node_modules |

### 6.3 TypeScript 네이밍

| 유형 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | ColoringCanvas |
| 인터페이스 | PascalCase | ImageInfo |
| 타입 | PascalCase | ColorState |
| 함수 | camelCase | fillPath() |
| 상수 | UPPER_SNAKE 또는 camelCase | COLORS, colors |
| 훅 | camelCase, use 접두사 | useColoring |

---

## 7. 확장 가이드

### 7.1 새 컴포넌트 추가

1. `src/components/` 디렉토리에 컴포넌트 파일 생성
2. 동일 위치에 CSS Module 파일 생성 (선택)
3. 타입이 필요한 경우 `src/types/index.ts`에 추가
4. App.tsx에서 import 및 사용

```
src/components/
├── NewComponent.tsx          # 컴포넌트 파일
└── NewComponent.module.css   # 스타일 (선택)
```

### 7.2 새 훅 추가

1. `src/hooks/` 디렉토리에 훅 파일 생성
2. use 접두사 사용
3. 필요한 타입은 `src/types/index.ts`에 정의

```typescript
// src/hooks/useNewFeature.ts
export function useNewFeature() {
    // 훅 로직
    return { /* 반환값 */ };
}
```

### 7.3 새 이미지 추가

1. SVG 파일을 `_AEC/` 디렉토리에 추가
2. `_AEC/images.json` 매니페스트에 항목 추가:

```json
{
    "images": [
        ...기존 이미지,
        { "file": "NewImage.svg", "name": "새 이미지" }
    ]
}
```

### 7.4 SVG 요구사항

새 SVG 이미지 추가 시 준수 사항:
- path 요소로 구성
- 라인: fill="#000000" 또는 fill="black"
- 색칠 영역: fill 없음 또는 fill="#FFFFFF"
- viewBox 속성 필수
- 고유 ID 또는 클래스 권장 (히스토리 추적용)

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-02-01 | manager-docs | 초기 구조 문서 작성 |
| 3.0.0 | 2026-02-02 | manager-docs | React 마이그레이션 반영: 컴포넌트 기반 구조, src/ 디렉토리, hooks, utils, types, constants 추가, images.json 매니페스트 |
| 4.0.0 | 2026-02-02 | manager-docs | 반응형 UI 반영: CSS clamp() 변수, 40% 패널 레이아웃, 고해상도 디바이스 최적화 |
| 5.0.0 | 2026-02-02 | manager-docs | 색상 팔레트 60색 확장: 피부색 4색, 머터리얼 8색, 갈색 2색, 크림, 차콜 추가, 검정색 판별 기준 변경 |
| 6.0.0 | 2026-02-02 | manager-docs | Apps-in-Toss 출시 준비: React 18.3.1 다운그레이드, TDS Button 적용, @emotion/react 추가, 64색 팔레트 |
| 7.0.0 | 2026-02-05 | manager-docs | 3단계 플로우 구조: IntroPage.tsx, ResultPage.tsx 추가, fortunes.ts 추가 (포춘쿠키 50개), gallery/ 디렉토리 추가 (예시 이미지 8개), useColoring.ts에 redo/canRedo 추가, saveImage.ts에 saveAsImage 함수 추가 |
