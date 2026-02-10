# SPEC-COLOR-002: 갤러리 이미지 SVG 변환 기능

---

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-COLOR-002 |
| 제목 | 갤러리 이미지 SVG 변환 기능 (Gallery Image to SVG Conversion) |
| 생성일 | 2026-02-10 |
| 상태 | **Planned** |
| 우선순위 | High |
| 담당 | expert-frontend |
| 라이프사이클 | spec-first |
| 관련 SPEC | SPEC-COLOR-001 |

---

## 1. 개요 및 목표

### 1.1 프로젝트 개요

관리자 페이지에 "변환" 탭을 추가하여, 갤러리에 업로드된 래스터 이미지(JPEG, PNG 등)를 `coloring-svg` 라이브러리를 활용해 SVG 색칠하기 파일로 변환하고, 변환 결과를 Supabase Storage의 `svg/` 폴더에 직접 업로드할 수 있는 기능을 구현한다.

### 1.2 목표

- AdminPage에 "변환" 탭 추가 (기존 SVG/갤러리 탭과 동일한 UX)
- 갤러리 이미지 목록에서 변환 대상 이미지 선택
- coloring-svg 라이브러리의 `convertPixels` API + Canvas API를 활용한 브라우저 사이드 변환
- 변환 옵션 조절 (색상 수, 다운샘플 크기 등)
- 변환 결과 SVG 미리보기
- 변환된 SVG를 Supabase `svg/` 폴더에 업로드
- 변환 진행 상태 표시

### 1.3 핵심 가치

관리자가 별도의 외부 도구 없이 앱 내에서 직접 갤러리 이미지를 색칠하기 콘텐츠로 변환할 수 있어 콘텐츠 제작 워크플로우를 대폭 단순화한다.

---

## 2. 환경 (Environment)

### 2.1 플랫폼 요구사항

- 플랫폼: 웹 브라우저 (관리자 전용 기능)
- 지원 브라우저: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- 실행 환경: 클라이언트 사이드 (브라우저 내 변환 처리)
- 배포 환경: Cloudflare Pages (정적 호스팅)
- 백엔드: Supabase Storage

### 2.2 기술 스택

| 기술 | 버전/사양 | 용도 |
|------|----------|------|
| React | 18.3.1 | UI 프레임워크 |
| TypeScript | 5.9.3 | 타입 안전성 |
| Vite | 7.3.1 | 빌드 도구 |
| coloring-svg | 0.1.0 | 이미지-SVG 변환 엔진 |
| Canvas API | - | 이미지 디코딩 (RGBA 픽셀 추출) |
| Supabase | 2.95.3+ | 이미지 저장소 |
| CSS Modules | - | 컴포넌트 스타일링 |

### 2.3 coloring-svg 라이브러리 위치

- 소스 경로: `C:\redeye\claude\coloring-svg`
- 주요 API: `convertPixels(pixels, width, height, options?)`
- 의존성: `imagetracerjs` (내장), `jimp` (선택적 peer dependency, 본 SPEC에서는 미사용)

---

## 3. 가정 (Assumptions)

### 3.1 기술적 가정

| ID | 가정 | 신뢰도 | 근거 | 위험 시 영향 | 검증 방법 |
|----|------|--------|------|-------------|----------|
| A-01 | Canvas API가 모든 대상 브라우저에서 RGBA 픽셀 데이터를 추출할 수 있음 | High | MDN Canvas API 호환성 | 이미지 디코딩 실패 | 브라우저 테스트 |
| A-02 | Supabase Storage public URL이 CORS 제한 없이 fetch 가능함 | Medium | Supabase 기본 CORS 정책 | 이미지 로드 실패, Canvas tainted | Supabase CORS 설정 확인 |
| A-03 | coloring-svg가 생성하는 SVG가 기존 ColoringCanvas 컴포넌트와 호환됨 | Medium | SVG path 기반 구조 | 색칠 기능 미동작 | 생성된 SVG 구조 분석 |
| A-04 | 브라우저 메모리가 4096x4096 이미지의 RGBA 데이터(64MB)를 처리 가능함 | Medium | 최신 브라우저 메모리 한도 | 메모리 부족 오류 | 대용량 이미지 테스트 |
| A-05 | convertPixels 동기 실행이 관리자 사용 시나리오에서 허용 가능한 수준임 | High | 관리자 전용, 빈번하지 않은 작업 | UI 일시 정지 | 변환 소요 시간 측정 |

### 3.2 사용자 가정

- 관리자는 이미 AdminPage 인증을 완료한 상태에서 변환 기능에 접근함
- 관리자는 변환 대상으로 적합한 이미지(선이 명확한 일러스트 등)를 판단할 수 있음
- 관리자는 색상 수(kColors) 등 옵션의 의미를 직관적으로 이해할 수 있음

---

## 4. 요구사항 (Requirements) - EARS 형식

### 4.1 필수 요구사항 (Ubiquitous)

| ID | 요구사항 | 패턴 |
|----|----------|------|
| REQ-U-01 | 시스템은 **항상** 변환 가능한 갤러리 이미지 목록을 표시해야 한다 (JPEG, PNG, BMP, TIFF 형식만) | Ubiquitous |
| REQ-U-02 | 시스템은 **항상** 변환 옵션의 유효성을 검증해야 한다 (kColors: 2-16 범위) | Ubiquitous |
| REQ-U-03 | 시스템은 **항상** 변환 결과의 원본 색상 팔레트 정보를 함께 표시해야 한다 | Ubiquitous |

### 4.2 이벤트 기반 요구사항 (Event-Driven)

| ID | 요구사항 | 패턴 |
|----|----------|------|
| REQ-E-01 | **WHEN** 관리자가 "변환" 탭을 클릭 **THEN** 갤러리 이미지 목록이 썸네일과 함께 표시된다 | Event-Driven |
| REQ-E-02 | **WHEN** 관리자가 갤러리 이미지를 선택 **THEN** 해당 이미지가 선택 상태로 강조 표시되고 변환 옵션 패널이 활성화된다 | Event-Driven |
| REQ-E-03 | **WHEN** 관리자가 변환 버튼을 클릭 **THEN** 이미지가 Canvas API로 디코딩되고 convertPixels를 통해 SVG로 변환된다 | Event-Driven |
| REQ-E-04 | **WHEN** 변환이 완료 **THEN** 변환된 SVG 미리보기와 메타데이터(처리 시간, 색상 수)가 표시된다 | Event-Driven |
| REQ-E-05 | **WHEN** 관리자가 "SVG 저장" 버튼을 클릭 **THEN** 변환된 SVG가 Supabase `svg/` 폴더에 업로드된다 | Event-Driven |
| REQ-E-06 | **WHEN** SVG 업로드가 완료 **THEN** 성공 메시지와 함께 SVG 탭의 목록이 갱신된다 | Event-Driven |
| REQ-E-07 | **WHEN** 변환 중 오류가 발생 **THEN** 사용자 친화적인 오류 메시지가 표시된다 | Event-Driven |
| REQ-E-08 | **WHEN** 관리자가 kColors 슬라이더를 조절 **THEN** 값이 실시간으로 표시된다 | Event-Driven |

### 4.3 상태 기반 요구사항 (State-Driven)

| ID | 요구사항 | 패턴 |
|----|----------|------|
| REQ-S-01 | **IF** 이미지가 선택되지 않은 상태 **THEN** 변환 버튼이 비활성화된다 | State-Driven |
| REQ-S-02 | **IF** 변환이 진행 중인 상태 **THEN** 로딩 인디케이터가 표시되고 추가 변환 요청이 차단된다 | State-Driven |
| REQ-S-03 | **IF** 변환 결과가 존재하는 상태 **THEN** SVG 미리보기와 저장 버튼이 표시된다 | State-Driven |
| REQ-S-04 | **IF** 변환 옵션이 유효하지 않은 상태 **THEN** 변환 버튼이 비활성화되고 경고 메시지가 표시된다 | State-Driven |

### 4.4 금지 요구사항 (Unwanted)

| ID | 요구사항 | 패턴 |
|----|----------|------|
| REQ-N-01 | 시스템은 4096x4096 픽셀을 초과하는 이미지를 변환**하지 않아야 한다** | Unwanted |
| REQ-N-02 | 시스템은 20MB를 초과하는 이미지 파일을 변환**하지 않아야 한다** | Unwanted |
| REQ-N-03 | 시스템은 지원하지 않는 형식(SVG, GIF, WebP 등)의 이미지를 변환**하지 않아야 한다** | Unwanted |
| REQ-N-04 | 시스템은 동일한 이미지에 대해 중복 변환 저장을 경고 없이 수행**하지 않아야 한다** | Unwanted |

### 4.5 선택 요구사항 (Optional)

| ID | 요구사항 | 패턴 |
|----|----------|------|
| REQ-O-01 | **가능하면** Web Worker를 사용하여 변환 중 UI 응답성을 유지하는 기능을 제공한다 | Optional |
| REQ-O-02 | **가능하면** 변환 진행률(validate/cluster/contour/svg 단계)을 실시간으로 표시한다 | Optional |
| REQ-O-03 | **가능하면** 여러 이미지의 일괄 변환 기능을 제공한다 | Optional |
| REQ-O-04 | **가능하면** 변환 결과를 로컬 다운로드할 수 있는 기능을 제공한다 | Optional |

---

## 5. 명세 (Specifications)

### 5.1 변환 파이프라인 명세

#### 5.1.1 처리 흐름

```
갤러리 이미지 URL (Supabase)
    |
    v
[1] fetch()로 이미지 ArrayBuffer 다운로드
    |
    v
[2] Image 객체 생성 + Canvas 렌더링
    |
    v
[3] canvas.getContext('2d').getImageData()로 RGBA 픽셀 추출
    |
    v
[4] convertPixels(pixels, width, height, options) 호출
    |
    v
[5] ConvertResult { svg, palette, layers, metadata } 반환
    |
    v
[6] SVG 미리보기 표시 + 저장 옵션 제공
    |
    v
[7] Supabase svg/ 폴더에 SVG 파일 업로드
```

#### 5.1.2 Canvas API 디코딩 방식을 선택한 이유

| 비교 항목 | Canvas API + convertPixels | jimp + convertImage |
|-----------|---------------------------|---------------------|
| 번들 크기 | 추가 의존성 없음 | jimp ~5MB 추가 |
| 브라우저 호환성 | 모든 대상 브라우저 지원 | 브라우저 호환성 확인 필요 |
| 이미지 디코딩 | 브라우저 네이티브 (빠름) | JavaScript 기반 (느림) |
| 구현 복잡도 | Canvas 코드 작성 필요 | 간단 (buffer 전달만) |
| CORS 제한 | crossOrigin 설정 필요 | fetch로 직접 다운로드 |

결론: Canvas API 방식이 번들 크기 및 성능 면에서 유리하며, 추가 의존성 없이 구현 가능

### 5.2 AdminPage UI 명세

#### 5.2.1 탭 구조 변경

```
기존: [SVG 파일] [갤러리 이미지]
변경: [SVG 파일] [갤러리 이미지] [이미지 변환]
```

#### 5.2.2 변환 탭 레이아웃

```
+------------------------------------------+
|  [이미지 선택 영역]                         |
|  +---------+ +---------+ +---------+     |
|  | 썸네일1  | | 썸네일2  | | 썸네일3  |    |
|  | 파일명   | | 파일명   | | 파일명   |    |
|  +---------+ +---------+ +---------+     |
+------------------------------------------+
|  [변환 옵션 패널]                           |
|  색상 수: [====O======] 6                  |
|  [변환 시작] (비활성: 이미지 미선택 시)       |
+------------------------------------------+
|  [미리보기 영역] (변환 완료 시 표시)          |
|  +------------------+  +--------------+  |
|  | SVG 미리보기      |  | 팔레트 정보   |  |
|  |                  |  | #FF0000 25%  |  |
|  |                  |  | #00FF00 18%  |  |
|  +------------------+  | ...          |  |
|                        +--------------+  |
|  처리 시간: 1.2초 | 색상: 6개              |
|  [SVG 저장] [다운로드]                      |
+------------------------------------------+
```

### 5.3 변환 옵션 명세

| 옵션 | UI 컨트롤 | 기본값 | 범위 | 설명 |
|------|----------|--------|------|------|
| kColors | 슬라이더 + 숫자 표시 | 6 | 2-16 | 추출할 색상 수 |
| downsampleSize | 고급 옵션 (숨김) | 512 | 128-1024 | 클러스터링용 다운샘플 크기 |
| mergeThreshold | 고급 옵션 (숨김) | 30 | 10-100 | 유사 색상 병합 임계값 |
| minContourArea | 고급 옵션 (숨김) | 10 | 1-100 | 최소 윤곽선 면적 |

### 5.4 Supabase 업로드 명세

#### 5.4.1 파일 저장 경로

- 경로: `svg/{timestamp}_converted_{originalName}.svg`
- 예시: `svg/1707552000_converted_VanGogh.svg`

#### 5.4.2 업로드 방식

- 기존 `uploadImage()` 함수를 활용하되, SVG 문자열을 File 객체로 변환하여 업로드
- MIME 타입: `image/svg+xml`

### 5.5 에러 처리 명세

| 에러 상황 | 사용자 메시지 | 처리 |
|-----------|-------------|------|
| 이미지 fetch 실패 | "이미지를 불러올 수 없습니다." | 재시도 안내 |
| Canvas 디코딩 실패 | "이미지를 디코딩할 수 없습니다. 파일이 손상되었을 수 있습니다." | 다른 이미지 선택 안내 |
| 이미지 크기 초과 | "이미지 크기가 4096x4096을 초과합니다." | 제한 안내 |
| 파일 크기 초과 | "파일 크기가 20MB를 초과합니다." | 제한 안내 |
| 변환 실패 | "SVG 변환에 실패했습니다. 다른 이미지를 시도해 주세요." | 재시도/다른 이미지 안내 |
| 업로드 실패 | "SVG 업로드에 실패했습니다." | 재시도 안내 |
| CORS 오류 | "이미지 접근 권한이 없습니다." | Supabase 설정 확인 안내 |

---

## 6. 비기능 요구사항

### 6.1 성능

| 항목 | 목표값 | 비고 |
|------|--------|------|
| 변환 소요 시간 | 10초 이내 (1024x1024 기준) | convertPixels 동기 실행 |
| 메모리 사용량 | 200MB 이내 | 원본 + RGBA + 중간 데이터 |
| SVG 파일 크기 | 5MB 이내 | kColors에 따라 변동 |
| 갤러리 목록 로딩 | 2초 이내 | Supabase API 응답 |

### 6.2 사용성

- 변환 옵션은 기본값으로도 합리적인 결과를 생성해야 함
- 미리보기를 통해 저장 전 결과 확인 가능
- 에러 발생 시 명확한 한국어 메시지 표시

---

## 7. 제약사항

### 7.1 기술적 제약

- 클라이언트 사이드 전용 변환 (서버 사이드 처리 없음)
- convertPixels가 동기 함수이므로 대용량 이미지에서 UI 일시 정지 가능
- Canvas API의 CORS 제한으로 crossOrigin 설정 필요
- coloring-svg 라이브러리가 로컬 경로에 위치하므로 빌드 시 의존성 관리 필요

### 7.2 범위 제약

- 1차 구현에서는 단일 이미지 변환만 지원 (일괄 변환 미포함)
- Web Worker 기반 비동기 변환은 선택 사항
- 변환 옵션 중 고급 옵션(downsampleSize, mergeThreshold, minContourArea)은 접힌 상태로 제공

---

## 8. 추적성 태그

```yaml
tags:
  - SPEC-COLOR-002
  - gallery-to-svg
  - coloring-svg
  - image-conversion
  - admin-page
  - canvas-api
  - supabase-storage
```

---

## 9. 관련 문서

- [구현 계획](./plan.md)
- [인수 기준](./acceptance.md)
- [SPEC-COLOR-001: 웹 기반 컬러링북 애플리케이션](../SPEC-COLOR-001/spec.md)

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-02-10 | manager-spec | 초기 SPEC 작성 |
