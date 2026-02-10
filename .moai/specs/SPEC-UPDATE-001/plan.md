---
spec-id: SPEC-UPDATE-001
type: implementation-plan
version: 1.0.0
created: 2026-02-10
updated: 2026-02-10
author: JWPARK
---

# SPEC-UPDATE-001: 구현 계획

## 1. 구현 전략

### 1.1 핵심 원칙

- **기존 로직 100% 재사용**: `convertGalleryToSvg()`, `postProcessSvgForColoring()`, `handleSaveSvg()` 패턴을 그대로 활용
- **최소 변경 원칙**: AdminPage.tsx와 AdminPage.module.css만 수정
- **convert 탭 무변경**: 기존 convert 탭 코드는 일체 수정하지 않음
- **상태 분리**: Gallery 탭 변환 상태와 convert 탭 변환 상태를 독립적으로 관리

### 1.2 아키텍처 접근

Gallery 탭의 이미지 카드에 인라인 확장 패널 방식을 채택한다. 모달 방식 대비 컨텍스트 유지가 좋고, 변환 대상 이미지를 시각적으로 확인하면서 작업할 수 있다.

```
AdminPage.tsx
├── Gallery 탭 이미지 카드 (기존)
│   ├── 이미지 썸네일 (기존)
│   ├── 이미지 정보 (기존)
│   ├── 이미지 액션 버튼 (기존 + "색칠놀이 변환" 추가)
│   └── [NEW] 인라인 변환 패널 (조건부 렌더링)
│       ├── k-colors 슬라이더
│       ├── 변환 시작 버튼
│       ├── 로딩 인디케이터
│       ├── 에러 메시지
│       ├── SVG 미리보기 + 메타데이터
│       ├── 색상 팔레트
│       └── 저장/다운로드/닫기 버튼
└── convert 탭 (변경 없음)
```

---

## 2. 마일스톤

### Primary Goal: Gallery 탭 변환 버튼 및 인라인 패널

**Task 1: 상태 변수 추가**
- `galleryConvertingImage`: 현재 변환 패널이 열린 이미지 (`ImageItem | null`)
- `galleryConvertResult`: 변환 결과 (`ConvertResult | null`)
- `galleryKColors`: k-colors 설정값 (`number`, 기본 6)
- `isGalleryConverting`: 변환 진행 중 플래그 (`boolean`)
- `galleryConvertError`: 에러 메시지 (`string | null`)
- `isGallerySavingSvg`: SVG 저장 진행 중 플래그 (`boolean`)

**Task 2: 핸들러 함수 추가**
- `handleGalleryConvertToggle(image)`: 인라인 패널 토글 (열기/닫기)
- `handleGalleryConvert()`: 변환 실행 (`convertGalleryToSvg` 호출)
- `handleGallerySaveSvg()`: SVG 저장 (`uploadImage` 호출, 기존 `handleSaveSvg` 패턴 재사용)
- `handleGalleryDownloadSvg()`: SVG 로컬 다운로드

**Task 3: Gallery 탭 이미지 카드 UI 수정**
- `imageActions` 영역에 "색칠놀이 변환" 버튼 추가 (gallery 탭일 때만 표시)
- 버튼 클릭 시 인라인 패널 토글

**Task 4: 인라인 변환 패널 구현**
- k-colors 슬라이더 (2~16 범위, 기존 convert 탭과 동일 UI 패턴)
- "변환 시작" 버튼
- 로딩 인디케이터 (스피너 + 텍스트)
- 에러 메시지 표시 영역
- SVG 미리보기 (`data:image/svg+xml` URI 방식)
- 메타데이터 표시 (크기, 색상 수, 처리 시간)
- 색상 팔레트 표시 (swatch + hex + percentage)
- "SVG 저장" / "다운로드" / "닫기" 버튼

### Secondary Goal: CSS 스타일링

**Task 5: AdminPage.module.css 스타일 추가**
- `.galleryConvertBtn`: 색칠놀이 변환 버튼 스타일 (TDS 디자인 시스템 준수)
- `.galleryConvertPanel`: 인라인 패널 컨테이너
- `.galleryConvertSlider`: k-colors 슬라이더 래퍼
- `.galleryConvertPreview`: SVG 미리보기 영역
- `.galleryConvertActions`: 저장/다운로드/닫기 버튼 그룹
- 기존 convert 탭 스타일 클래스와 일부 공유 가능 (`.previewSvg`, `.paletteColors` 등)

### Final Goal: 통합 검증

**Task 6: 통합 테스트 및 검증**
- Gallery 탭에서 변환 버튼 클릭 -> 패널 열림 확인
- k-colors 변경 -> 변환 실행 -> 결과 미리보기 확인
- SVG 저장 -> Supabase svg/ 폴더 확인
- 다운로드 -> 로컬 파일 확인
- 에러 케이스 테스트 (대용량 이미지, 네트워크 실패)
- convert 탭 기능 동작 확인 (기존 기능 무변경 검증)

---

## 3. 파일 변경 목록

| 파일 | 변경 유형 | 변경 내용 |
|------|-----------|-----------|
| `src/components/AdminPage.tsx` | 수정 | 상태 변수 추가, 핸들러 함수 추가, Gallery 탭 UI 수정 |
| `src/components/AdminPage.module.css` | 수정 | 인라인 변환 패널 스타일 추가 |
| `src/utils/imageConverter.ts` | 변경 없음 | 기존 로직 재사용 |
| `src/lib/supabase.ts` | 변경 없음 | 기존 API 재사용 |

---

## 4. 기술적 접근

### 4.1 기존 코드 재사용 분석

**변환 로직 (imageConverter.ts)**
- `convertGalleryToSvg(url, options)`: 이미지 URL -> SVG 변환 파이프라인
- `postProcessSvgForColoring(svg)`: 색칠놀이용 후처리 (자동 호출됨)
- `validateImageForConversion()`: 크기/용량 검증 (자동 호출됨)
- 변경 사항: **없음** (그대로 import하여 사용)

**저장 로직 (supabase.ts)**
- `uploadImage(file, 'svg')`: SVG 파일 Supabase 업로드
- `listImages('svg')`: 중복 확인용 SVG 목록 조회
- 변경 사항: **없음** (그대로 import하여 사용)

**UI 패턴 (AdminPage.tsx convert 탭)**
- k-colors 슬라이더 UI 패턴 재사용
- SVG 미리보기 렌더링 패턴 재사용
- 팔레트 표시 패턴 재사용
- 저장/다운로드 버튼 패턴 재사용

### 4.2 상태 분리 전략

Gallery 탭과 convert 탭의 변환 상태를 완전히 분리하여 상호 간섭을 방지한다.

| 상태 | convert 탭 (기존) | Gallery 탭 (신규) |
|------|-------------------|-------------------|
| 선택 이미지 | `convertSelectedImage` | `galleryConvertingImage` |
| 변환 결과 | `convertResult` | `galleryConvertResult` |
| k-colors | `kColors` | `galleryKColors` |
| 변환 중 | `isConverting` | `isGalleryConverting` |
| 에러 | `convertError` | `galleryConvertError` |
| 저장 중 | `isSavingSvg` | `isGallerySavingSvg` |

### 4.3 인라인 패널 렌더링 전략

```
{activeTab !== 'convert' && (
  <div className={styles.imageList}>
    {images.map((image) => (
      <div key={image.path} className={styles.imageItem}>
        {/* 기존 이미지 카드 내용 */}
        ...
        {/* gallery 탭이고, 현재 이미지가 변환 대상일 때 패널 표시 */}
        {activeTab === 'gallery' && galleryConvertingImage?.path === image.path && (
          <div className={styles.galleryConvertPanel}>
            {/* 변환 패널 내용 */}
          </div>
        )}
      </div>
    ))}
  </div>
)}
```

---

## 5. 리스크 및 대응

| 리스크 | 영향도 | 가능성 | 대응 방안 |
|--------|--------|--------|----------|
| 대용량 이미지 변환 시 브라우저 메모리 부족 | 높음 | 낮음 | 기존 4096px/20MB 제한 검증 유지, 에러 메시지로 안내 |
| 변환 중 UI 블로킹 (10~30초) | 중간 | 높음 | 로딩 인디케이터로 사용자 피드백 제공, 변환 중 다른 액션은 차단하지 않음 |
| AdminPage.tsx 파일 크기 증가 (현재 843줄) | 낮음 | 높음 | 핸들러 함수 재사용으로 코드 중복 최소화, 필요시 커스텀 훅 분리 고려 |
| Supabase 업로드 실패 | 중간 | 낮음 | try-catch 에러 핸들링, 사용자에게 에러 메시지 표시 |

---

## 6. 전문가 상담 권장

### Frontend Expert (expert-frontend)

이 SPEC은 React 컴포넌트 UI 수정을 포함하고 있어 frontend 전문가 상담을 권장한다:
- 인라인 확장 패널의 접근성(a11y) 검토
- CSS Modules 스타일 패턴 검토
- AdminPage.tsx 크기 관리 및 컴포넌트 분리 검토

---

## 7. 추적성 (Traceability)

| 요구사항 | 마일스톤 | Task |
|----------|----------|------|
| REQ-U01 | Primary Goal | Task 3 |
| REQ-E01 | Primary Goal | Task 3, 4 |
| REQ-E02 | Primary Goal | Task 2, 4 |
| REQ-E03 | Primary Goal | Task 4 |
| REQ-E04 | Primary Goal | Task 2 |
| REQ-E05 | Primary Goal | Task 2 |
| REQ-E06 | Primary Goal | Task 2 |
| REQ-S01~S04 | Primary Goal | Task 1, 4 |
| REQ-N01~N04 | Final Goal | Task 6 |
| 스타일링 | Secondary Goal | Task 5 |
