# SPEC-COLOR-001: 구현 계획

---

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-COLOR-001 |
| 문서 유형 | Implementation Plan |
| 생성일 | 2026-02-01 |
| 상태 | Planned |

---

## 1. 구현 개요

### 1.1 목표

웹 기반 컬러링북 애플리케이션을 순수 HTML/CSS/JavaScript로 구현한다. Canvas API를 활용하여 이미지 로딩, Flood Fill 색칠, 색상 팔레트 기능을 제공한다.

### 1.2 기술 접근 방식

- **렌더링**: HTML5 Canvas 2D Context
- **색칠 알고리즘**: Queue 기반 4방향 Flood Fill
- **이벤트 처리**: Canvas 클릭 좌표 감지
- **상태 관리**: JavaScript 변수를 통한 단순 상태 관리

---

## 2. 마일스톤 (우선순위 기반)

### Primary Goal: 핵심 기능 구현

| 순서 | 작업 | 산출물 | 의존성 |
|------|------|--------|--------|
| 1 | HTML 구조 및 Canvas 설정 | index.html | 없음 |
| 2 | 이미지 로딩 및 표시 | Canvas에 이미지 렌더링 | 작업 1 |
| 3 | Flood Fill 알고리즘 구현 | floodFill() 함수 | 작업 2 |
| 4 | 색상 팔레트 UI 구현 | 색상 선택 인터페이스 | 작업 1 |
| 5 | 이벤트 연결 및 통합 | 완전히 동작하는 색칠 기능 | 작업 3, 4 |

### Secondary Goal: UI/UX 개선

| 순서 | 작업 | 산출물 | 의존성 |
|------|------|--------|--------|
| 6 | CSS 스타일링 | 시각적으로 완성된 UI | Primary Goal |
| 7 | 선택 색상 표시기 | 현재 색상 시각적 피드백 | 작업 4 |
| 8 | 로딩 상태 표시 | 로딩 인디케이터 | 작업 2 |

### Optional Goal: 추가 기능

| 순서 | 작업 | 산출물 | 의존성 |
|------|------|--------|--------|
| 9 | 이미지 다운로드 기능 | 저장 버튼 | Secondary Goal |
| 10 | 실행 취소 기능 | Undo 버튼 | Secondary Goal |
| 11 | 터치 지원 | 모바일 호환성 | Secondary Goal |

---

## 3. 기술 설계

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
│  │              Canvas Container                │   │
│  │  ┌───────────────────────────────────────┐  │   │
│  │  │        <canvas id="canvas">           │  │   │
│  │  │        - Image Rendering              │  │   │
│  │  │        - Click Event Handler          │  │   │
│  │  │        - Flood Fill Execution         │  │   │
│  │  └───────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │              Color Palette                   │   │
│  │  [색1] [색2] [색3] ... [선택 표시기]         │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │              Controls (Optional)             │   │
│  │  [다운로드] [실행취소]                        │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 3.2 핵심 모듈 설계

#### 3.2.1 이미지 로더 모듈

```javascript
// 의사 코드
const ImageLoader = {
    canvas: null,
    ctx: null,
    imageData: null,

    init(canvasId, imagePath) {
        // Canvas 초기화
        // 이미지 로드
        // Canvas에 그리기
        // ImageData 캐시
    }
}
```

#### 3.2.2 Flood Fill 모듈

```javascript
// 의사 코드
const FloodFill = {
    fill(x, y, fillColor, imageData) {
        // 타겟 색상 가져오기
        // 경계 검사
        // Queue 기반 채우기
        // ImageData 업데이트
    },

    isBlackLine(r, g, b) {
        // 밝기 계산
        // 임계값 비교
    },

    colorsMatch(c1, c2, tolerance) {
        // RGB 비교 with 허용 오차
    }
}
```

#### 3.2.3 색상 팔레트 모듈

```javascript
// 의사 코드
const ColorPalette = {
    colors: [...],
    selectedColor: null,

    init(containerId) {
        // 색상 버튼 생성
        // 이벤트 리스너 등록
    },

    selectColor(color) {
        // 선택 색상 업데이트
        // UI 표시 업데이트
    }
}
```

### 3.3 데이터 흐름

```
사용자 클릭 (팔레트)
       │
       ▼
ColorPalette.selectColor()
       │
       ▼
selectedColor 업데이트
       │

사용자 클릭 (Canvas)
       │
       ▼
Canvas.onClick(event)
       │
       ▼
좌표 계산 (x, y)
       │
       ▼
FloodFill.fill(x, y, selectedColor)
       │
       ▼
ImageData 업데이트
       │
       ▼
ctx.putImageData()
       │
       ▼
화면 갱신
```

---

## 4. 기술 상세

### 4.1 Flood Fill 알고리즘 상세

#### 4.1.1 Queue vs Recursive

| 방식 | 장점 | 단점 |
|------|------|------|
| Recursive | 코드 간결 | Stack Overflow 위험 |
| Queue | 안정적, 대용량 처리 | 메모리 사용량 증가 |

**선택**: Queue 기반 (안정성 우선)

#### 4.1.2 최적화 전략

1. **방문 체크**: Set 또는 비트마스크로 중복 방문 방지
2. **스캔라인 최적화**: 수평 연속 픽셀 일괄 처리
3. **청킹**: 대용량 영역 분할 처리 (필요시)

### 4.2 Canvas 성능 고려사항

- `getImageData()` / `putImageData()` 최소화
- 전체 ImageData를 한 번에 가져와 메모리에서 처리
- 색칠 완료 후 한 번만 `putImageData()` 호출

### 4.3 색상 비교 로직

```javascript
// 색상 비교 (허용 오차 포함)
function colorsMatch(r1, g1, b1, r2, g2, b2, tolerance = 30) {
    return Math.abs(r1 - r2) <= tolerance &&
           Math.abs(g1 - g2) <= tolerance &&
           Math.abs(b1 - b2) <= tolerance;
}

// 검은색 라인 감지
function isBlackLine(r, g, b) {
    const brightness = (r + g + b) / 3;
    return brightness < 50;
}
```

---

## 5. 파일 구조

### 5.1 최소 구조 (단일 파일)

```
project/
├── index.html          # HTML + CSS + JavaScript 통합
└── _AEC/
    └── AEC_BG.png      # 라인아트 이미지
```

### 5.2 분리 구조 (선택)

```
project/
├── index.html          # HTML 구조
├── style.css           # CSS 스타일
├── app.js              # JavaScript 로직
└── _AEC/
    └── AEC_BG.png      # 라인아트 이미지
```

---

## 6. 리스크 및 대응

| 리스크 | 영향도 | 가능성 | 대응 방안 |
|--------|--------|--------|----------|
| Flood Fill 성능 저하 | High | Medium | 스캔라인 최적화, 청킹 적용 |
| 라인 끊김으로 색상 누출 | Medium | Low | 임계값 조정, 라인 감지 강화 |
| CORS 이미지 로딩 실패 | High | Low | 동일 출처 유지, 로컬 서버 권장 |
| 브라우저 호환성 문제 | Medium | Low | Polyfill 준비, 기능 감지 |

---

## 7. 검증 전략

### 7.1 단위 테스트 영역

- [ ] Flood Fill 알고리즘 정확성
- [ ] 색상 비교 함수 허용 오차
- [ ] 경계선 감지 정확도

### 7.2 통합 테스트 영역

- [ ] 이미지 로딩 → Canvas 표시
- [ ] 색상 선택 → 클릭 → 색칠 완료
- [ ] 다중 영역 색칠 시 상호 간섭 없음

### 7.3 사용자 테스트 영역

- [ ] 직관적인 사용성
- [ ] 색칠 응답 속도
- [ ] 시각적 피드백 명확성

---

## 8. 추적성 태그

```yaml
tags:
  - SPEC-COLOR-001
  - implementation-plan
  - canvas-api
  - flood-fill-algorithm
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
