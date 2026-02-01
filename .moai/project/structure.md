# AEC 컬러링북 - 프로젝트 구조

---

## 메타데이터

| 항목 | 값 |
|------|-----|
| 프로젝트명 | AEC 컬러링북 |
| 문서 유형 | 프로젝트 구조 문서 |
| 최종 업데이트 | 2026-02-01 |

---

## 1. 디렉토리 구조 개요

```
AEC_BG/
├── index.html                 # 메인 애플리케이션 (HTML + CSS + JS 통합)
├── README.md                  # 프로젝트 소개 문서
├── wrangler.jsonc             # Cloudflare Workers 배포 설정
├── CLAUDE.md                  # MoAI 실행 지침서
├── .gitignore                 # Git 무시 파일 목록
├── .mcp.json                  # MCP 서버 설정
│
├── _AEC/                      # SVG 이미지 에셋 디렉토리
│   ├── 25__01 1 (1).svg       # 그림 1 (107KB)
│   ├── 25__02 1 (1).svg       # 그림 2 (126KB)
│   └── 25__02-1 1.svg         # 그림 3 (92KB)
│
├── .moai/                     # MoAI-ADK 설정 및 문서
│   ├── config/                # 설정 파일
│   ├── project/               # 프로젝트 문서
│   ├── specs/                 # SPEC 문서
│   ├── memory/                # 컨텍스트 메모리
│   ├── reports/               # 분석 리포트
│   ├── cache/                 # 캐시 데이터
│   ├── llm-configs/           # LLM 설정
│   └── announcements/         # 공지사항 (다국어)
│
├── .claude/                   # Claude Code 설정
│   ├── agents/                # 에이전트 정의
│   ├── commands/              # 슬래시 커맨드
│   ├── skills/                # 스킬 정의
│   ├── hooks/                 # 훅 스크립트
│   ├── rules/                 # 규칙 정의
│   └── output-styles/         # 출력 스타일
│
└── .github/                   # GitHub 설정 (선택)
```

---

## 2. 핵심 파일 상세

### 2.1 index.html

메인 애플리케이션 파일로, HTML, CSS, JavaScript가 단일 파일에 통합되어 있습니다.

#### 파일 구성

| 섹션 | 라인 범위 | 역할 |
|------|-----------|------|
| DOCTYPE/HTML 헤더 | 1-6 | 문서 타입 및 메타데이터 |
| Pretendard 폰트 | 7-62 | 한글 웹폰트 정의 (9개 웨이트) |
| CSS 스타일 | 63-364 | 전역 스타일, 컴포넌트, 반응형 |
| HTML 본문 | 366-407 | UI 구조 (헤더, 캔버스, 팔레트, 버튼) |
| JavaScript | 409-811 | 애플리케이션 로직 |

#### JavaScript 모듈 구조

```
JavaScript 섹션 구조:
├── 상수 정의
│   ├── IMAGES[]        # SVG 이미지 목록 (3개)
│   └── COLORS[]        # 색상 팔레트 (14색)
│
├── 상태 관리
│   └── state{}         # selectedColor, originalSvgContent,
│                       # currentImageIndex, history[], maxHistory
│
├── DOM 요소 참조
│   ├── svgContainer    # SVG 표시 영역
│   ├── colorPalette    # 색상 팔레트 컨테이너
│   └── 버튼들          # undo, reset, save, status
│
├── 초기화 함수
│   └── init()          # 랜덤 이미지 선택, 팔레트 생성, 이벤트 설정
│
├── SVG 처리 함수
│   ├── loadSvg()       # fetch로 SVG 로드
│   ├── setupPathClickHandlers()  # 클릭 이벤트 위임
│   ├── isBlackColor()  # 검정색 라인 판별
│   └── fillPath()      # path 색칠 (사용하지 않음, 이벤트 위임으로 대체)
│
├── 사용자 인터랙션 함수
│   ├── selectColor()   # 색상 선택
│   ├── undoLastAction()# 뒤로가기
│   ├── resetSvg()      # 초기화
│   └── saveSvg()       # PNG 저장
│
└── 유틸리티 함수
    ├── getColorName()  # 색상 이름 조회
    ├── showStatus()    # 상태 메시지 표시
    └── updateUndoButton() # 버튼 상태 업데이트
```

### 2.2 _AEC/ 디렉토리

SVG 라인아트 이미지 에셋을 저장하는 디렉토리입니다.

#### 파일 상세

| 파일명 | 크기 | 내부 이름 | 설명 |
|--------|------|-----------|------|
| 25__01 1 (1).svg | 107KB | 그림 1 | 라인 드로잉 이미지 |
| 25__02 1 (1).svg | 126KB | 그림 2 | 라인 드로잉 이미지 |
| 25__02-1 1.svg | 92KB | 그림 3 | 라인 드로잉 이미지 |

#### SVG 구조 특성

- 형식: SVG (Scalable Vector Graphics)
- 구성: path 요소로 이루어진 벡터 이미지
- 라인: 검정색 (#000000) path로 경계 구분
- 영역: fill 속성이 없거나 흰색인 path가 색칠 가능 영역
- viewBox: 1773x1773 (정사각형)

### 2.3 wrangler.jsonc

Cloudflare Workers 배포를 위한 설정 파일입니다.

```jsonc
{
  "name": "aec-coloring",           // Workers 프로젝트 이름
  "compatibility_date": "2026-02-01", // 호환성 날짜
  "assets": {
    "directory": "./"               // 정적 에셋 디렉토리 (루트)
  }
}
```

#### 배포 특성

- 유형: 정적 사이트 호스팅
- 에셋: index.html, _AEC/*.svg
- 배포 명령: `npx wrangler deploy`

### 2.4 README.md

프로젝트 소개 및 사용법 문서입니다.

#### 포함 내용

- 프로젝트 소개
- 주요 기능 목록
- 사용 방법 (7단계)
- 파일 구조
- 기술 스택
- SPEC 참조 링크

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
├── product.md    # 제품 문서 (본 문서와 함께 생성)
├── structure.md  # 구조 문서 (본 문서)
└── tech.md       # 기술 문서 (본 문서와 함께 생성)
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
index.html
├── [로드] _AEC/*.svg        # SVG 이미지 파일
├── [외부] Pretendard 폰트   # CDN: cdn.jsdelivr.net
└── [생성] Canvas/PNG        # 동적 생성 (저장 시)
```

### 5.2 배포 의존성

```
wrangler.jsonc
├── index.html               # 메인 페이지
├── _AEC/                    # 에셋 디렉토리
│   └── *.svg                # SVG 이미지
└── (기타 정적 파일)
```

### 5.3 개발 의존성

```
CLAUDE.md
├── .moai/config/            # MoAI 설정
├── .moai/specs/             # SPEC 문서
└── .claude/                 # Claude Code 설정
    ├── agents/              # 에이전트
    ├── skills/              # 스킬
    └── rules/               # 규칙
```

---

## 6. 네이밍 규칙

### 6.1 파일 네이밍

| 유형 | 규칙 | 예시 |
|------|------|------|
| HTML | 소문자, 하이픈 | index.html |
| YAML | 소문자, 하이픈 | config.yaml |
| Markdown | 소문자, 하이픈 | product.md |
| JSON | 소문자, 하이픈 | .mcp.json |
| SVG | 원본 유지 | 25__01 1 (1).svg |

### 6.2 디렉토리 네이밍

| 유형 | 규칙 | 예시 |
|------|------|------|
| 설정 | 점 접두사 | .moai, .claude |
| 에셋 | 밑줄 접두사 | _AEC |
| 일반 | 소문자, 하이픈 | config, specs |

### 6.3 JavaScript 네이밍

| 유형 | 규칙 | 예시 |
|------|------|------|
| 상수 | 대문자, 밑줄 | IMAGES, COLORS |
| 변수 | camelCase | selectedColor |
| 함수 | camelCase | loadSvg() |
| DOM ID | camelCase | coloringSvg |

---

## 7. 확장 가이드

### 7.1 새 이미지 추가

1. SVG 파일을 `_AEC/` 디렉토리에 추가
2. `index.html`의 `IMAGES` 배열에 항목 추가:

```javascript
const IMAGES = [
    { file: '25__01 1 (1).svg', name: '그림 1' },
    { file: '25__02 1 (1).svg', name: '그림 2' },
    { file: '25__02-1 1.svg', name: '그림 3' },
    { file: 'new_image.svg', name: '새 그림' }  // 추가
];
```

### 7.2 새 색상 추가

`index.html`의 `COLORS` 배열에 항목 추가:

```javascript
const COLORS = [
    // ... 기존 색상들 ...
    { hex: '#새색상', name: '색상명' }  // 추가
];
```

### 7.3 SVG 요구사항

새 SVG 이미지 추가 시 준수 사항:
- path 요소로 구성
- 라인: fill="#000000" 또는 fill="black"
- 색칠 영역: fill 없음 또는 fill="#FFFFFF"
- viewBox 속성 필수

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-02-01 | manager-docs | 초기 구조 문서 작성 |
