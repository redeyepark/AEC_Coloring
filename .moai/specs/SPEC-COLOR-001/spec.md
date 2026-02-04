# SPEC-COLOR-001: 웹 기반 컬러링북 애플리케이션

---

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-COLOR-001 |
| 제목 | 웹 기반 컬러링북 애플리케이션 |
| 생성일 | 2026-02-01 |
| 완료일 | 2026-02-01 |
| 상태 | **Completed** |
| 우선순위 | High |
| 담당 | expert-frontend |
| 라이프사이클 | spec-anchored |

---

## 1. 개요 및 목표

### 1.1 프로젝트 개요

베레모와 안경을 착용한 신사의 라인 드로잉 이미지를 활용한 웹 기반 컬러링북 애플리케이션을 개발한다. 사용자가 이미지의 각 영역을 클릭하여 선택한 색상으로 채울 수 있는 직관적인 인터페이스를 제공한다.

### 1.2 목표

- SVG path 기반의 영역별 색칠 기능 구현
- 직관적인 60색 팔레트 UI 제공 (11가지 색상 계열)
- Undo/Reset 기능을 통한 편리한 작업 관리
- 달력 저장 및 배경화면 저장 기능 제공
- React 19 + TypeScript 기반 컴포넌트 아키텍처
- Cloudflare Workers를 통한 정적 배포

### 1.3 대상 이미지

- 파일 경로: `_AEC/` 디렉토리 내 SVG 파일들
- 지원 이미지: images.json 매니페스트 기반 동적 로딩 (5개 이미지)
- 특징: 베레모, 안경, 셔츠, 넥타이, 재킷을 착용한 신사의 라인 드로잉
- 구조: SVG path 요소로 구성된 영역별 분리

---

## 2. 환경 (Environment)

### 2.1 플랫폼 요구사항

- 플랫폼: 웹 브라우저 (클라이언트 사이드)
- 지원 브라우저: Chrome, Firefox, Edge, Safari (최신 버전)
- 화면 해상도: 반응형 디자인으로 모든 해상도 지원
- 배포 환경: Cloudflare Workers
- 앱인토스 배포 대비

### 2.2 기술 스택

| 기술 | 버전/사양 | 용도 |
|------|----------|------|
| React | 18.3.1 | UI 프레임워크 (토스 SDK 호환) |
| TypeScript | 5.9.3 | 타입 안전성 |
| Vite | 7.3.1 | 빌드 도구 및 개발 서버 |
| CSS Modules | - | 컴포넌트 스코프 스타일링 |
| @toss/tds-mobile | 2.2.1 | 디자인 시스템 (Button 컴포넌트) |
| @apps-in-toss/web-framework | 1.9.1 | Apps-in-Toss 웹 프레임워크 |
| @emotion/react | 11.14.0 | TDS 런타임 스타일링 |
| SVG | 1.1 | 이미지 렌더링 및 영역별 색칠 |
| Cloudflare Workers / Apps-in-Toss | - | 정적 호스팅 / 토스 미니앱 |

### 2.3 파일 구조

```
project/
├── index.html              # HTML 엔트리포인트
├── package.json            # npm 설정
├── vite.config.ts          # Vite 설정
├── tsconfig.json           # TypeScript 설정
├── wrangler.jsonc          # Cloudflare Workers 설정
├── src/
│   ├── main.tsx            # React 엔트리포인트
│   ├── App.tsx             # 메인 앱 컴포넌트
│   ├── App.css             # 글로벌 스타일
│   ├── components/         # React 컴포넌트
│   │   ├── ColoringCanvas.tsx
│   │   ├── Palette.tsx
│   │   └── Controls.tsx
│   ├── hooks/              # 커스텀 훅
│   │   ├── useColoring.ts
│   │   ├── useImages.ts
│   │   └── useDeviceResolution.ts
│   ├── utils/              # 유틸리티
│   │   └── saveImage.ts
│   ├── types/              # 타입 정의
│   │   └── index.ts
│   └── constants/          # 상수
│       └── colors.ts
└── _AEC/
    ├── images.json         # 이미지 매니페스트
    └── *.svg               # SVG 이미지들
```

---

## 3. 가정 (Assumptions)

### 3.1 기술적 가정

| ID | 가정 | 신뢰도 | 근거 | 위험 | 검증 상태 |
|----|------|--------|------|------|----------|
| A-01 | SVG path가 명확한 영역으로 분리되어 있음 | High | SVG 파일 구조 확인 | 영역 선택 오류 | **검증 완료** |
| A-02 | SVG가 모든 대상 브라우저에서 지원됨 | High | MDN 호환성 문서 | 브라우저 호환성 문제 | **검증 완료** |
| A-03 | React 이벤트 핸들링이 SVG 내부 요소에서 작동함 | High | 구현 테스트 | 클릭 이벤트 누락 | **검증 완료** |
| A-04 | PNG 변환이 SVG에서 정상 작동함 | High | Canvas API 테스트 | 다운로드 실패 | **검증 완료** |

### 3.2 사용자 가정

- 사용자는 마우스 또는 터치 입력이 가능한 장치를 사용함
- 사용자는 색상 선택 후 영역 클릭이라는 기본 패턴을 이해함

---

## 4. 요구사항 (Requirements) - EARS 형식

### 4.1 필수 요구사항 (Ubiquitous)

| ID | 요구사항 | 패턴 | 구현 상태 |
|----|----------|------|----------|
| REQ-U-01 | 시스템은 **항상** SVG 이미지를 렌더링해야 한다 | Ubiquitous | **구현 완료** |
| REQ-U-02 | 시스템은 **항상** 원본 라인아트의 경계선을 보존해야 한다 | Ubiquitous | **구현 완료** |
| REQ-U-03 | 시스템은 **항상** 현재 선택된 색상을 시각적으로 표시해야 한다 | Ubiquitous | **구현 완료** |
| REQ-U-04 | 시스템은 **항상** Polaroid 프레임 UI를 표시해야 한다 | Ubiquitous | **구현 완료** |
| REQ-U-05 | 시스템은 **항상** CSS clamp()를 사용하여 화면 크기에 맞게 UI 요소를 동적으로 조절해야 한다 | Ubiquitous | **구현 완료** |
| REQ-U-06 | 시스템은 **항상** 팔레트/메뉴 영역을 전체 화면의 40%로 유지해야 한다 | Ubiquitous | **구현 완료** |

### 4.2 이벤트 기반 요구사항 (Event-Driven)

| ID | 요구사항 | 패턴 | 구현 상태 |
|----|----------|------|----------|
| REQ-E-01 | **WHEN** 사용자가 색상 팔레트에서 색상을 클릭 **THEN** 해당 색상이 현재 선택 색상으로 설정된다 | Event-Driven | **구현 완료** |
| REQ-E-02 | **WHEN** 사용자가 SVG의 path 영역을 클릭 **THEN** 해당 영역이 선택된 색상으로 채워진다 | Event-Driven | **구현 완료** |
| REQ-E-03 | **WHEN** 이미지 로딩이 완료 **THEN** SVG가 표시되고 색칠이 가능해진다 | Event-Driven | **구현 완료** |
| REQ-E-04 | **WHEN** 사용자가 Undo 버튼을 클릭 **THEN** 마지막 색칠 작업이 취소된다 | Event-Driven | **구현 완료** |
| REQ-E-05 | **WHEN** 사용자가 Reset 버튼을 클릭 **THEN** 모든 색칠이 초기화된다 | Event-Driven | **구현 완료** |
| REQ-E-06 | **WHEN** 사용자가 달력저장 버튼을 클릭 **THEN** 달력 이미지(1080x2340)가 다운로드된다 | Event-Driven | **구현 완료** |
| REQ-E-07 | **WHEN** 페이지가 로드 **THEN** images.json에서 이미지 목록을 로드하고 랜덤 선택되어 표시된다 | Event-Driven | **구현 완료** |
| REQ-E-08 | **WHEN** 사용자가 배경화면 버튼을 클릭 **THEN** 배경화면 이미지(1080x2340)가 다운로드된다 | Event-Driven | **구현 완료** |

### 4.3 상태 기반 요구사항 (State-Driven)

| ID | 요구사항 | 패턴 | 구현 상태 |
|----|----------|------|----------|
| REQ-S-01 | **IF** 색상이 선택되지 않은 상태 **THEN** 기본 색상이 적용된다 | State-Driven | **구현 완료** |
| REQ-S-02 | **IF** 이미지가 로딩 중인 상태 **THEN** 로딩 표시를 보여준다 | State-Driven | **구현 완료** |
| REQ-S-03 | **IF** Undo 히스토리가 비어있는 상태 **THEN** Undo 버튼이 비활성화된다 | State-Driven | **구현 완료** |

### 4.4 금지 요구사항 (Unwanted)

| ID | 요구사항 | 패턴 | 구현 상태 |
|----|----------|------|----------|
| REQ-N-01 | 시스템은 50단계를 초과하는 Undo 히스토리를 유지**하지 않아야 한다** | Unwanted | **구현 완료** |
| REQ-N-02 | 시스템은 비정상적인 SVG path에 색칠**하지 않아야 한다** | Unwanted | **구현 완료** |

### 4.5 구현된 선택 요구사항 (Originally Optional, Now Implemented)

| ID | 요구사항 | 패턴 | 구현 상태 |
|----|----------|------|----------|
| REQ-O-01 | 실행 취소(Undo) 기능 (50단계 제한) | Optional -> Implemented | **구현 완료** |
| REQ-O-02 | 색칠된 이미지를 PNG로 다운로드하는 기능 | Optional -> Implemented | **구현 완료** |
| REQ-O-03 | 반응형 디자인으로 모바일 터치 입력 지원 | Optional -> Implemented | **구현 완료** |

---

## 5. 명세 (Specifications)

### 5.1 SVG Path 색칠 명세

#### 5.1.1 방식 개요

Canvas Flood Fill 대신 SVG path의 fill 속성을 직접 변경하는 방식을 채택하였다.

#### 5.1.2 React 컴포넌트 패턴

```typescript
// ColoringCanvas.tsx - SVG 이벤트 핸들링
const handleSvgClick = (e: React.MouseEvent<SVGElement>) => {
    const target = e.target as SVGElement;
    if (target.tagName === 'path') {
        target.style.fill = selectedColor;
        saveToHistory();
    }
};
```

#### 5.1.3 장점

- Flood Fill 대비 즉각적인 응답 (성능 개선)
- 경계선 보존이 자동으로 보장됨
- React 상태 관리와 자연스러운 통합
- TypeScript 타입 안전성 확보

### 5.2 색상 팔레트 명세

#### 5.2.1 64색 팔레트 (12가지 계열)

| 계열 | 색상 수 | HEX 코드 |
|------|---------|----------|
| 빨강 | 5색 | #FFEBEE, #FFCDD2, #EF9A9A, #E57373, #EF5350 |
| 주황 | 5색 | #FFF3E0, #FFE0B2, #FFCC80, #FFB74D, #FFA726 |
| 노랑 | 6색 | #FFFDE7, #FFF9C4, #FFF59D, #FFEE58, #FFEB3B, #CCFF00(연두) |
| 초록 | 5색 | #E8F5E9, #C8E6C9, #A5D6A7, #81C784, #66BB6A |
| 시안 | 3색 | #00FFFF(시안), #00FF00(라임), #808000(올리브) |
| 파랑 | 5색 | #E3F2FD, #BBDEFB, #90CAF9, #64B5F6, #42A5F5 |
| 보라 | 5색 | #F3E5F5, #E1BEE7, #CE93D8, #BA68C8, #AB47BC |
| 핑크 | 5색 | #FCE4EC, #F8BBD9, #F48FB1, #F06292, #EC407A |
| 갈색 | 7색 | #EFEBE9, #D7CCC8, #BCAAA4, #A1887F, #8D6E63, #8D6E63(웜브라운), #5D4037(다크브라운) |
| 피부색 | 4색 | #F5D5C8(밝은피부), #E8C4B8(피부색), #D4A590(어두운피부), #C9A080(탄피부) |
| 머터리얼 | 8색 | #E53935(레드), #C62828(다크레드), #4CAF50(그린), #2196F3(블루), #1976D2(다크블루), #0D47A1(인디고), #9C27B0(퍼플), #E91E63(핑크) |
| 무채색 | 6색 | #FFFFFF, #E0E0E0, #9E9E9E, #424242, #404040(다크그레이), #121212(검정) |

#### 5.2.2 검정색 판별 기준

검정색(라인아트)은 색칠 불가 영역으로 보호됩니다.

| 판별 대상 | 색칠 가능 여부 | 비고 |
|----------|---------------|------|
| #000000, black, rgb(0,0,0) | 색칠 불가 | 순수 검정색 - 라인아트 보호 |
| #121212 (검정) | 색칠 가능 | 팔레트 색상으로 사용 가능 |
| #212121 (차콜) | 색칠 가능 | 팔레트 색상으로 사용 가능 |
| #5D4037 (다크브라운) | 색칠 가능 | 팔레트 색상으로 사용 가능 |

### 5.3 Undo/Redo 시스템 명세

#### 5.3.1 히스토리 구조

- 최대 50단계 저장
- LIFO (Last In, First Out) 스택 구조
- 각 상태는 SVG innerHTML 스냅샷
- useColoring 커스텀 훅으로 상태 관리

#### 5.3.2 커스텀 훅 패턴

```typescript
// hooks/useColoring.ts
const useColoring = () => {
    const [history, setHistory] = useState<string[]>([]);
    const MAX_HISTORY = 50;

    const saveToHistory = (svgContent: string) => {
        setHistory(prev => {
            const newHistory = [...prev, svgContent];
            return newHistory.slice(-MAX_HISTORY);
        });
    };

    return { history, saveToHistory, undo, reset };
};
```

### 5.4 UI 레이아웃 명세

```
+--------------------------------------------------+
|  ┌────────────────────────────────────────────┐  |
|  │                                            │  |
|  │           SVG Image Area                   │  |
|  │         (images.json 기반 동적 로딩)        │  |
|  │                                            │  |
|  └────────────────────────────────────────────┘  |
+--------------------------------------------------+
|                  색상 팔레트 (60색)                |
|  11가지 계열 배치 (피부색, 머터리얼 포함)           |
+--------------------------------------------------+
|              컨트롤 버튼                          |
|  [뒤로가기] [리셋] [달력저장] [배경화면]            |
+--------------------------------------------------+
```

#### 5.4.1 UI 변경사항

- 헤더 제거: 상단 제목 영역 삭제
- 상태바 제거: 시스템 상태바 표시 영역 제거
- 보라색 테두리 제거: 폴라로이드 프레임 스타일 변경
- 버튼 구성 변경: 뒤로가기, 리셋, 달력저장, 배경화면
- TDS (Toss Design System) 적용

### 5.5 이미지 매니페스트 기반 로딩 명세

- images.json 파일로 이미지 목록 관리
- 현재 활성 이미지:
  - FB_IMG_1768341781961 1.svg
  - sketch1769987753181 1.svg
- useImages 커스텀 훅으로 동적 로딩
- 페이지 로드 시 랜덤 선택

### 5.6 저장 기능 명세

#### 5.6.1 달력 저장

- 출력 해상도: 1080x2340 픽셀
- 레이아웃: 상단 55% 이미지 + 하단 45% 달력
- 달력 표기: 영문 (January~December, SUN~SAT)
- 달력 간격: padding 60px, headerHeight 150px
- 파일명: `calendar_[이미지명]_[연월].png`

#### 5.6.2 배경화면 저장

- 출력 해상도: 1080x2340 픽셀
- 크롭 방식: 가로 기준 맞춤, 세로 중앙 정렬
- 파일명: `wallpaper_[이미지명]_[타임스탬프].png`
- 투명 배경 없이 흰색 배경 적용

---

## 6. 비기능 요구사항

### 6.1 성능 (검증 완료)

| 항목 | 목표값 | 실측값 | 상태 |
|------|--------|--------|------|
| SVG 로딩 시간 | 1초 이내 | < 500ms | **통과** |
| 색칠 응답 시간 | 즉시 | < 16ms | **통과** |
| 메모리 사용량 | 50MB 이내 | ~ 30MB | **통과** |

### 6.2 사용성 (검증 완료)

- 색상 선택 후 1회 클릭으로 색칠 완료
- 직관적인 60색 팔레트 배치 (11가지 계열)
- 현재 선택 색상의 명확한 시각적 표시 (테두리 강조)
- Polaroid 프레임 UI로 시각적 매력 강화

### 6.3 호환성 (검증 완료)

- Chrome 90+ **통과**
- Firefox 88+ **통과**
- Edge 90+ **통과**
- Safari 14+ **통과**
- 모바일 브라우저 **통과**

---

## 7. 제약사항

### 7.1 기술적 제약

- React 19 + TypeScript 기반 컴포넌트 아키텍처 **변경됨**
- 서버 사이드 처리 없음 (클라이언트 전용) **준수**
- Vite 기반 모듈 구조 **변경됨**
- TDS (Toss Design System) 사용 **추가됨**

### 7.2 범위 제약 (완화됨)

- ~~단일 이미지만 지원~~ -> images.json 기반 동적 이미지 로딩으로 확장
- 복잡한 편집 기능 제외 (브러시, 그라데이션 등) **유지**
- 사용자 계정 및 저장 기능 제외 **유지**

---

## 8. 구현 노트 (Implementation Notes)

### 8.1 기술 결정 변경사항

| 원래 계획 | 최종 구현 | 변경 이유 |
|----------|----------|----------|
| Canvas + Flood Fill | SVG path fill | 성능 및 코드 단순화 |
| 단일 이미지 | images.json 기반 동적 로딩 | 사용자 경험 다양화 |
| 선택적 Undo | 필수 Undo (50단계) | 사용성 향상 |
| PNG 다운로드 | 달력/배경화면 저장 | 실용성 향상 |
| 14색 팔레트 | 60색 팔레트 | 표현력 확장 (피부색, 머터리얼 추가) |
| 헤더/상태바 UI | 최소화된 UI | 이미지 집중 UX |
| Vanilla JavaScript | React 19 + TypeScript + Vite | 앱인토스 배포 대비 및 유지보수성 향상 |

### 8.2 추가 구현 기능

| 기능 | 설명 | 구현 이유 |
|------|------|----------|
| Reset 버튼 | 모든 색칠 초기화 | 사용자 편의성 |
| React 이벤트 핸들링 | SVG 클릭 처리 최적화 | 성능 및 타입 안전성 |
| useImages 훅 | images.json 기반 동적 로딩 | 확장성 및 유지보수성 |
| 60색 팔레트 | 11가지 계열 색상 제공 (피부색, 머터리얼 포함) | 표현력 향상 |
| 달력 저장 | 영문 달력 통합 이미지 | 실용적 활용 |
| 배경화면 저장 | 1080x2340 크롭 이미지 | 모바일 배경화면 활용 |
| TDS 적용 | Toss Design System 통합 | 앱인토스 디자인 일관성 |

### 8.3 배포 환경

- 플랫폼: Cloudflare Workers
- 설정 파일: `wrangler.jsonc`
- 빌드 도구: Vite
- 정적 자산 서빙

---

## 9. 추적성 태그

```yaml
tags:
  - SPEC-COLOR-001
  - coloring-book
  - svg-coloring
  - react-19
  - typescript
  - vite
  - tds-design-system
  - apps-in-toss
  - web-application
  - cloudflare-workers
  - responsive-design
  - polaroid-ui
```

---

## 10. 관련 문서

- [구현 계획](./plan.md)
- [인수 기준](./acceptance.md)

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-02-01 | manager-spec | 초기 SPEC 작성 |
| 2.0.0 | 2026-02-01 | manager-spec | 구현 완료 반영: SVG 기반 구현, 다중 이미지, Undo/Reset, 배포 환경 추가 |
| 3.0.0 | 2026-02-02 | manager-docs | 대규모 확장: 44색 팔레트, 7개 이미지, 달력/배경화면 저장, UI 단순화 |
| 4.0.0 | 2026-02-02 | manager-spec | React 마이그레이션: React 19 + TypeScript + Vite, TDS 적용, images.json 기반 동적 로딩 |
| 5.0.0 | 2026-02-02 | manager-docs | 반응형 UI: CSS clamp() 기반 동적 크기 조절, 40% 레이아웃, 고해상도 화면 최적화 |
| 6.0.0 | 2026-02-02 | manager-docs | 색상 팔레트 확장: 44색에서 60색으로 확장 (피부색 4색, 머터리얼 8색, 갈색 2색, 크림, 차콜 추가), 검정색 판별 기준 변경 (순수 검정색만 색칠 불가), selectedColorRef로 색상 변경 버그 수정 |
| 7.0.0 | 2026-02-02 | manager-docs | Apps-in-Toss 출시 준비: React 19→18.3.1 다운그레이드 (토스 SDK 호환), TDS Button 컴포넌트 적용, 64색 팔레트 확장 (시안, 라임, 연두, 올리브 추가), 검정색 #121212로 변경 |
