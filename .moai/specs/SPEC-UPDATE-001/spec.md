---
id: SPEC-UPDATE-001
title: Gallery Tab Coloring SVG Conversion
version: 1.0.0
status: draft
created: 2026-02-10
updated: 2026-02-10
author: JWPARK
priority: medium
tags: admin, gallery, svg, conversion, coloring
related-specs: []
---

# SPEC-UPDATE-001: Gallery 탭 색칠놀이 SVG 변환 기능

## 1. 개요

### 1.1 배경

현재 AdminPage의 `convert` 탭에서 갤러리 이미지를 색칠놀이용 SVG로 변환하는 기능이 동작하고 있다. 그러나 관리자가 갤러리 이미지를 관리하면서 동시에 색칠놀이 변환을 하려면 탭을 전환해야 하는 불편함이 있다. Gallery 탭의 각 이미지 카드에 직접 "색칠놀이 변환" 버튼을 추가하여, 관리자가 갤러리 이미지 관리 흐름 안에서 바로 변환 작업을 수행할 수 있도록 한다.

### 1.2 목적

- Gallery 탭에서 개별 이미지 카드 내에 "색칠놀이 변환" 버튼 제공
- 기존 `convertGalleryToSvg()` + `postProcessSvgForColoring()` 로직 100% 재사용
- 변환 결과 미리보기 및 Supabase `svg/` 폴더 저장 기능 제공
- 기존 `convert` 탭은 변경 없이 유지

### 1.3 범위

**포함:**
- AdminPage.tsx의 Gallery 탭 이미지 카드 UI 수정
- 인라인/모달 형태의 k-colors 설정 및 변환 실행 UI
- 변환 결과 미리보기 (SVG 프리뷰 + 메타데이터)
- 변환된 SVG를 Supabase `svg/` 폴더에 저장
- 변환 상태 관리 (로딩, 에러, 성공)

**제외:**
- convert 탭 변경 (기존 유지)
- coloring-svg 라이브러리 수정
- imageConverter.ts 핵심 로직 수정
- 새로운 라이브러리 추가

---

## 2. 환경 (Environment)

### 2.1 기술 스택

| 항목 | 버전/기술 |
|------|-----------|
| Framework | React 18.3.1 |
| Language | TypeScript 5.9.3 |
| Build Tool | Vite 7.3.1 |
| Backend | Supabase Storage |
| SVG 변환 | coloring-svg (local package) |
| Styling | CSS Modules |

### 2.2 관련 파일

| 파일 | 역할 | 변경 수준 |
|------|------|-----------|
| `src/components/AdminPage.tsx` | Gallery 탭 UI + 변환 로직 통합 | **주요 변경** |
| `src/components/AdminPage.module.css` | 변환 버튼/모달 스타일 추가 | **주요 변경** |
| `src/utils/imageConverter.ts` | 변환 유틸리티 (재사용) | 변경 없음 |
| `src/lib/supabase.ts` | Storage API (재사용) | 변경 없음 |

### 2.3 의존성

- `coloring-svg` 라이브러리 (로컬 패키지 `../coloring-svg`, 이미 설치됨)
- Supabase Storage API (`uploadImage`, `listImages`)
- Canvas API (브라우저 내장, `fetchImageAsPixels`에서 사용)

---

## 3. 가정 (Assumptions)

| ID | 가정 | 신뢰도 | 근거 |
|----|------|--------|------|
| A1 | coloring-svg 라이브러리가 정상 동작함 | 높음 | convert 탭에서 이미 검증됨 |
| A2 | Gallery 이미지는 JPEG/PNG 형식임 | 높음 | Supabase gallery/ 폴더 업로드 정책 |
| A3 | 변환 시간은 10~30초 소요됨 | 중간 | 이미지 크기와 복잡도에 따라 다름 |
| A4 | 브라우저 메모리가 대용량 이미지 변환을 처리 가능 | 중간 | 최대 4096x4096, 20MB 제한으로 검증 |
| A5 | 관리자는 한 번에 하나의 이미지만 변환함 | 높음 | UI가 단일 이미지 선택 방식 |

---

## 4. 요구사항 (Requirements)

### 4.1 유비쿼터스 요구사항 (Ubiquitous)

| ID | 요구사항 |
|----|----------|
| REQ-U01 | Gallery 탭의 각 갤러리 이미지 카드에는 **항상** "색칠놀이 변환" 버튼이 표시되어야 한다. |
| REQ-U02 | 변환 기능은 **항상** 기존 `convertGalleryToSvg()` 및 `postProcessSvgForColoring()` 로직을 재사용해야 한다. |
| REQ-U03 | 변환된 SVG 파일명은 **항상** `converted_{원본파일명}.svg` 형식을 따라야 한다. |

### 4.2 이벤트 구동 요구사항 (Event-Driven)

| ID | 요구사항 |
|----|----------|
| REQ-E01 | **WHEN** 관리자가 갤러리 이미지의 "색칠놀이 변환" 버튼을 클릭하면 **THEN** k-colors 설정 UI(슬라이더, 2~16 범위, 기본값 6)가 포함된 인라인 패널 또는 모달이 표시되어야 한다. |
| REQ-E02 | **WHEN** 관리자가 k-colors를 설정하고 "변환 시작" 버튼을 클릭하면 **THEN** `convertGalleryToSvg(imageUrl, { kColors })` 함수가 호출되어 변환이 시작되어야 한다. |
| REQ-E03 | **WHEN** 변환이 완료되면 **THEN** 변환된 SVG 미리보기(이미지), 메타데이터(크기, 색상 수, 처리 시간), 색상 팔레트가 표시되어야 한다. |
| REQ-E04 | **WHEN** 관리자가 "저장" 버튼을 클릭하면 **THEN** 변환된 SVG가 Supabase `images/svg/` 폴더에 업로드되어야 한다. |
| REQ-E05 | **WHEN** 관리자가 "다운로드" 버튼을 클릭하면 **THEN** 변환된 SVG 파일이 브라우저를 통해 로컬에 다운로드되어야 한다. |
| REQ-E06 | **WHEN** 관리자가 변환 패널을 닫거나 다른 이미지의 변환 버튼을 클릭하면 **THEN** 이전 변환 상태(결과, 에러)가 초기화되어야 한다. |

### 4.3 상태 구동 요구사항 (State-Driven)

| ID | 요구사항 |
|----|----------|
| REQ-S01 | **IF** 변환이 진행 중이면 **THEN** 해당 이미지 카드에 로딩 인디케이터(스피너 + "변환 중..." 텍스트)가 표시되어야 한다. |
| REQ-S02 | **IF** 변환이 진행 중이면 **THEN** "변환 시작" 버튼이 비활성화(disabled)되어야 한다. |
| REQ-S03 | **IF** 변환이 완료되면 **THEN** SVG 미리보기와 "저장"/"다운로드" 버튼이 표시되어야 한다. |
| REQ-S04 | **IF** 이미 동일 파일명의 변환된 SVG가 존재하면 **THEN** 덮어쓰기 확인 다이얼로그가 표시되어야 한다. |

### 4.4 선택 요구사항 (Optional)

| ID | 요구사항 |
|----|----------|
| REQ-O01 | **가능하면** 변환 완료 후 자동 저장 옵션을 토글로 제공한다. |
| REQ-O02 | **가능하면** 변환 결과에 원본 이미지와 변환된 SVG를 나란히 비교할 수 있는 뷰를 제공한다. |

### 4.5 원하지 않는 동작 요구사항 (Unwanted Behavior)

| ID | 요구사항 |
|----|----------|
| REQ-N01 | 시스템은 변환 실패 시 기존 갤러리 이미지를 **손상시키지 않아야 한다**. |
| REQ-N02 | 시스템은 변환 중 다른 갤러리 이미지의 관리 기능(토글, 삭제, 노출 설정)을 **차단하지 않아야 한다**. |
| REQ-N03 | 시스템은 변환 실패 시 사용자에게 명확한 에러 메시지를 표시해야 하며, 에러를 **무시하지 않아야 한다**. |
| REQ-N04 | 시스템은 기존 convert 탭의 기능을 **변경하거나 제거하지 않아야 한다**. |

---

## 5. 사양 (Specifications)

### 5.1 UI 사양

#### Gallery 탭 이미지 카드 변경

현재 이미지 카드의 `imageActions` 영역에 "색칠놀이 변환" 버튼을 추가한다.

```
기존 버튼 순서: [노출 설정] [사용/미사용 토글] [보기] [삭제]
변경 후:       [색칠놀이 변환] [노출 설정] [사용/미사용 토글] [보기] [삭제]
```

#### 변환 패널 (인라인 확장)

변환 버튼 클릭 시 해당 이미지 카드 아래에 인라인 확장 패널이 나타난다.

```
┌─────────────────────────────────────────────┐
│ [이미지 썸네일] 파일명.jpg                    │
│ [색칠놀이 변환] [노출 설정] [토글] [보기] [삭제]│
├─────────────────────────────────────────────┤
│ 색상 수: [===●========] 6                    │
│ [변환 시작]                                   │
│                                              │
│ (변환 완료 시)                                │
│ ┌──────────┐  크기: 800x600                  │
│ │  SVG     │  색상: 6색                       │
│ │ 미리보기  │  처리시간: 1234ms                │
│ └──────────┘                                  │
│ 팔레트: [■][■][■][■][■][■]                   │
│ [SVG 저장] [다운로드] [닫기]                   │
└─────────────────────────────────────────────┘
```

### 5.2 상태 관리 사양

Gallery 탭 변환에 사용할 상태 변수:

| 상태 | 타입 | 용도 |
|------|------|------|
| `galleryConvertingImage` | `ImageItem \| null` | 현재 변환 패널이 열린 이미지 |
| `galleryConvertResult` | `ConvertResult \| null` | Gallery 탭 변환 결과 |
| `galleryKColors` | `number` | Gallery 탭 k-colors 설정값 (기본 6) |
| `isGalleryConverting` | `boolean` | Gallery 탭 변환 진행 중 플래그 |
| `galleryConvertError` | `string \| null` | Gallery 탭 변환 에러 메시지 |
| `isGallerySavingSvg` | `boolean` | Gallery 탭 SVG 저장 진행 중 플래그 |

### 5.3 변환 파이프라인

1. 관리자가 "색칠놀이 변환" 클릭
2. 인라인 패널 표시 (k-colors 슬라이더)
3. "변환 시작" 클릭
4. `fetchImageAsPixels(imageUrl)` - 이미지 다운로드 및 RGBA 픽셀 추출
5. `convertPixels(pixels, width, height, { kColors })` - K-Means 클러스터링 + 컨투어 추출
6. `postProcessSvgForColoring(svgString)` - Natural Breaks 알고리즘으로 흑백 변환
7. 결과 표시 (SVG 미리보기 + 메타데이터 + 팔레트)
8. "저장" 클릭 시 `uploadImage(file, 'svg')` 호출

### 5.4 에러 처리 사양

| 에러 상황 | 처리 방식 |
|-----------|----------|
| 이미지 다운로드 실패 | "이미지를 다운로드할 수 없습니다" 에러 메시지 표시 |
| 이미지 크기 초과 (4096px, 20MB) | validateImageForConversion 결과 에러 메시지 표시 |
| Canvas 컨텍스트 생성 실패 | "Canvas 컨텍스트를 생성할 수 없습니다" 에러 메시지 표시 |
| 변환 라이브러리 오류 | "변환에 실패했습니다: {에러 내용}" 에러 메시지 표시 |
| Supabase 업로드 실패 | "SVG 파일 저장에 실패했습니다" 에러 메시지 표시 |

---

## 6. 제약사항 (Constraints)

| ID | 제약사항 | 근거 |
|----|----------|------|
| C01 | 이미지 최대 크기 4096x4096 픽셀 | coloring-svg 라이브러리 제한 |
| C02 | 파일 최대 크기 20MB | imageConverter.ts 검증 로직 |
| C03 | K-Colors 범위 2~16 | coloring-svg 라이브러리 지원 범위 |
| C04 | 변환은 브라우저 메인 스레드에서 실행 | Web Worker 미사용 (기존 동일) |
| C05 | Supabase Anonymous Key 기반 접근 | 공개 읽기/쓰기 정책 |

---

## 7. 추적성 (Traceability)

| 요구사항 | 관련 파일 | 구현 방법 |
|----------|-----------|-----------|
| REQ-U01 | AdminPage.tsx | Gallery 탭 imageActions에 버튼 추가 |
| REQ-E01 | AdminPage.tsx | 인라인 패널 토글 상태 관리 |
| REQ-E02 | AdminPage.tsx, imageConverter.ts | handleGalleryConvert() 함수 호출 |
| REQ-E03 | AdminPage.tsx | 변환 결과 UI 렌더링 |
| REQ-E04 | AdminPage.tsx, supabase.ts | handleGallerySaveSvg() 함수 호출 |
| REQ-S01 | AdminPage.tsx, AdminPage.module.css | isGalleryConverting 상태 기반 UI |
| REQ-N01 | imageConverter.ts | try-catch 에러 핸들링 |
| REQ-N04 | AdminPage.tsx | convert 탭 코드 미변경 |
