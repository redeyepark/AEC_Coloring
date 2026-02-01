# SPEC-COLOR-001: 구현 계획

---

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-COLOR-001 |
| 문서 유형 | Implementation Plan |
| 생성일 | 2026-02-01 |
| 완료일 | 2026-02-01 |
| 상태 | **Completed** |

---

## 1. 구현 개요

### 1.1 목표

웹 기반 컬러링북 애플리케이션을 순수 HTML/CSS/JavaScript로 구현한다. SVG path 기반 색칠, 색상 팔레트, Undo/Reset, PNG 다운로드 기능을 제공한다.

### 1.2 최종 기술 접근 방식

- **렌더링**: SVG 요소 직접 사용 (Canvas 대신)
- **색칠 방식**: SVG path fill 속성 변경
- **이벤트 처리**: Event Delegation 패턴
- **상태 관리**: JavaScript 배열 기반 히스토리 스택
- **배포**: Cloudflare Workers

### 1.3 기술 변경 이력

| 원래 계획 | 최종 구현 | 변경 이유 |
|----------|----------|----------|
| Canvas 2D Context | SVG 요소 | 코드 단순화, 성능 향상 |
| Flood Fill 알고리즘 | path fill 속성 | 경계 처리 불필요, 즉각 응답 |
| 단일 이미지 | 다중 이미지 (3개) | 사용자 경험 다양화 |
| 선택적 기능 | 필수 기능 통합 | 완성도 향상 |

---

## 2. 마일스톤 (우선순위 기반) - 완료

### Primary Goal: 핵심 기능 구현 **완료**

| 순서 | 작업 | 산출물 | 의존성 | 상태 |
|------|------|--------|--------|------|
| 1 | HTML 구조 및 SVG 컨테이너 설정 | index.html | 없음 | **완료** |
| 2 | SVG 이미지 로딩 및 표시 | SVG 렌더링 | 작업 1 | **완료** |
| 3 | SVG path 색칠 로직 구현 | 클릭 시 색상 변경 | 작업 2 | **완료** |
| 4 | 14색 팔레트 UI 구현 | 색상 선택 인터페이스 | 작업 1 | **완료** |
| 5 | 이벤트 위임 및 통합 | 완전히 동작하는 색칠 기능 | 작업 3, 4 | **완료** |

### Secondary Goal: UI/UX 개선 **완료**

| 순서 | 작업 | 산출물 | 의존성 | 상태 |
|------|------|--------|--------|------|
| 6 | Polaroid 프레임 UI | 시각적으로 완성된 UI | Primary Goal | **완료** |
| 7 | 선택 색상 표시기 | 현재 색상 시각적 피드백 | 작업 4 | **완료** |
| 8 | 반응형 디자인 | 모바일 호환성 | Primary Goal | **완료** |

### Optional Goal: 추가 기능 **완료**

| 순서 | 작업 | 산출물 | 의존성 | 상태 |
|------|------|--------|--------|------|
| 9 | PNG 다운로드 기능 | 저장 버튼 | Secondary Goal | **완료** |
| 10 | Undo 기능 (50단계) | Undo 버튼 | Secondary Goal | **완료** |
| 11 | Reset 기능 | Reset 버튼 | Secondary Goal | **완료** |
| 12 | 다중 이미지 지원 | 랜덤 이미지 선택 | 작업 2 | **완료** |

### Deployment Goal: 배포 **완료**

| 순서 | 작업 | 산출물 | 의존성 | 상태 |
|------|------|--------|--------|------|
| 13 | Cloudflare Workers 설정 | wrangler.jsonc | Optional Goal | **완료** |
| 14 | 정적 자산 배포 | 라이브 URL | 작업 13 | **완료** |

---

## 3. 기술 설계 (최종)

### 3.1 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────┐
│                    index.html                        │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐   │
│  │              Header Section                  │   │
│  │              (제목, 설명)                     │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │           Polaroid Frame Container           │   │
│  │  ┌───────────────────────────────────────┐  │   │
│  │  │        <div id="svg-container">       │  │   │
│  │  │        - SVG 동적 로드               │  │   │
│  │  │        - Event Delegation            │  │   │
│  │  │        - Path Fill 변경              │  │   │
│  │  └───────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │              Color Palette (14색)            │   │
│  │  [색1] [색2] [색3] ... [색14] [선택 표시]    │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │              Controls                        │   │
│  │  [Undo] [Reset] [Download PNG]              │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 3.2 핵심 모듈 설계 (구현 완료)

#### 3.2.1 이미지 로더 모듈

```javascript
// 구현된 코드 구조
const images = ['images/image1.svg', 'images/image2.svg', 'images/image3.svg'];
const randomImage = images[Math.floor(Math.random() * images.length)];

fetch(randomImage)
    .then(response => response.text())
    .then(svgContent => {
        svgContainer.innerHTML = svgContent;
        initializeEventListeners();
    });
```

#### 3.2.2 색칠 모듈 (Event Delegation)

```javascript
// 구현된 코드 구조
svgContainer.addEventListener('click', (event) => {
    const path = event.target.closest('path');
    if (path && path.getAttribute('fill') !== 'none') {
        saveHistory();
        path.style.fill = currentColor;
    }
});
```

#### 3.2.3 히스토리 모듈

```javascript
// 구현된 코드 구조
const history = [];
const MAX_HISTORY = 50;

function saveHistory() {
    const svg = svgContainer.querySelector('svg');
    history.push(svg.innerHTML);
    if (history.length > MAX_HISTORY) {
        history.shift();
    }
}

function undo() {
    if (history.length > 0) {
        const svg = svgContainer.querySelector('svg');
        svg.innerHTML = history.pop();
    }
}
```

#### 3.2.4 PNG 다운로드 모듈

```javascript
// 구현된 코드 구조
function downloadPNG() {
    const svg = svgContainer.querySelector('svg');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'coloring-book.png';
        link.href = pngUrl;
        link.click();
    };
    img.src = url;
}
```

### 3.3 데이터 흐름

```
페이지 로드
       │
       ▼
랜덤 이미지 선택
       │
       ▼
SVG fetch 및 삽입
       │
       ▼
Event Delegation 초기화
       │

사용자 클릭 (팔레트)
       │
       ▼
currentColor 업데이트
       │
       ▼
선택 표시 UI 업데이트
       │

사용자 클릭 (SVG path)
       │
       ▼
saveHistory()
       │
       ▼
path.style.fill = currentColor
       │
       ▼
즉시 화면 반영
```

---

## 4. 파일 구조 (최종)

```
project/
├── index.html              # HTML + CSS + JavaScript 통합
├── wrangler.jsonc          # Cloudflare Workers 설정
├── images/
│   ├── image1.svg          # 컬러링 이미지 1
│   ├── image2.svg          # 컬러링 이미지 2
│   └── image3.svg          # 컬러링 이미지 3
└── _AEC/
    └── AEC_BG.png          # 원본 참조 이미지
```

---

## 5. 리스크 및 대응 (해결됨)

| 리스크 | 영향도 | 가능성 | 대응 방안 | 결과 |
|--------|--------|--------|----------|------|
| ~~Flood Fill 성능 저하~~ | - | - | SVG path 방식으로 회피 | **해결** |
| ~~라인 끊김으로 색상 누출~~ | - | - | SVG path 경계가 명확 | **해결** |
| CORS 이미지 로딩 실패 | High | Low | 동일 출처로 배포 | **해결** |
| 브라우저 호환성 문제 | Medium | Low | SVG 표준 사용 | **해결** |
| PNG 변환 실패 | Medium | Low | Canvas API 활용 | **해결** |

---

## 6. 검증 결과

### 6.1 기능 테스트 **완료**

- [x] SVG 로딩 및 표시
- [x] 색상 팔레트 동작
- [x] Event Delegation 클릭 처리
- [x] Undo 기능 (50단계 제한)
- [x] Reset 기능
- [x] PNG 다운로드
- [x] 랜덤 이미지 선택

### 6.2 통합 테스트 **완료**

- [x] 이미지 로딩 → SVG 표시
- [x] 색상 선택 → 클릭 → 색칠 완료
- [x] 다중 영역 색칠 시 상호 간섭 없음
- [x] Undo → 이전 상태 복원
- [x] Reset → 초기 상태 복원
- [x] 다운로드 → PNG 파일 생성

### 6.3 사용자 테스트 **완료**

- [x] 직관적인 사용성
- [x] 즉각적인 색칠 응답 속도
- [x] 시각적 피드백 명확성
- [x] 모바일 터치 지원

---

## 7. 배포 정보

### 7.1 Cloudflare Workers 설정

```jsonc
// wrangler.jsonc
{
    "name": "coloring-book",
    "main": "index.html",
    "compatibility_date": "2026-02-01",
    "assets": {
        "directory": "./"
    }
}
```

### 7.2 배포 명령

```bash
npx wrangler deploy
```

---

## 8. 추적성 태그

```yaml
tags:
  - SPEC-COLOR-001
  - implementation-plan
  - svg-coloring
  - event-delegation
  - cloudflare-workers
```

---

## 9. 관련 문서

- [SPEC 명세서](./spec.md)
- [인수 기준](./acceptance.md)

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-02-01 | manager-spec | 초기 계획 작성 |
| 2.0.0 | 2026-02-01 | manager-spec | 구현 완료 반영: SVG 기반, 배포 정보, 검증 결과 추가 |
