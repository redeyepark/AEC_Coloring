# SPEC-COLOR-002: 구현 계획

---

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-COLOR-002 |
| 제목 | 갤러리 이미지 SVG 변환 기능 |
| 생성일 | 2026-02-10 |
| 상태 | Planned |

---

## 1. 마일스톤

### 마일스톤 1: coloring-svg 라이브러리 통합 (Primary Goal)

**목표**: coloring-svg 패키지를 프로젝트에 통합하고 Canvas API 기반 이미지 디코딩 유틸리티를 구현한다.

**작업 항목**:

1. coloring-svg 패키지 의존성 설정
   - npm link 또는 로컬 경로 참조 설정
   - Vite 빌드 설정에서 올바르게 번들링되는지 확인
   - TypeScript 타입 인식 확인

2. 이미지 변환 유틸리티 모듈 작성 (`src/utils/imageConverter.ts`)
   - `fetchImageAsPixels(url: string)`: URL에서 이미지를 fetch하고 Canvas API로 RGBA 픽셀 데이터 추출
   - `convertGalleryToSvg(url: string, options?: ConvertOptions)`: 갤러리 이미지 URL을 SVG로 변환하는 래퍼 함수
   - 이미지 크기 및 형식 사전 검증 로직
   - CORS crossOrigin 설정 처리

3. 변환 기능 단위 테스트
   - Canvas 디코딩 동작 확인
   - convertPixels 결과 검증
   - 에러 케이스 (크기 초과, 형식 미지원) 테스트

**관련 요구사항**: REQ-U-01, REQ-U-02, REQ-N-01, REQ-N-02, REQ-N-03

---

### 마일스톤 2: AdminPage "변환" 탭 UI 구현 (Primary Goal)

**목표**: AdminPage에 세 번째 탭("이미지 변환")을 추가하고, 갤러리 이미지 선택 및 변환 옵션 UI를 구현한다.

**작업 항목**:

1. AdminPage 탭 구조 확장
   - `activeTab` 타입 확장: `'svg' | 'gallery' | 'convert'`
   - 세 번째 탭 버튼 "이미지 변환" 추가
   - 탭 전환 시 상태 초기화 로직

2. 갤러리 이미지 선택 UI
   - 갤러리 이미지 목록을 썸네일 그리드로 표시
   - 이미지 클릭 시 선택/해제 토글
   - 선택된 이미지 시각적 강조 (테두리, 체크마크)
   - 이미지 파일명 및 업로드일 표시
   - 지원 형식(JPEG, PNG, BMP, TIFF)만 필터링하여 표시

3. 변환 옵션 패널
   - kColors 슬라이더 (범위: 2-16, 기본값: 6)
   - 현재 값 실시간 표시
   - 고급 옵션 토글 (접힌 상태): downsampleSize, mergeThreshold, minContourArea
   - 옵션 유효성 검증 및 경고 메시지

4. 변환 버튼
   - 이미지 미선택 시 비활성화
   - 변환 중 로딩 상태 표시 ("변환 중...")
   - 중복 클릭 방지

5. CSS 스타일 추가 (`AdminPage.module.css`)
   - 이미지 그리드 레이아웃
   - 선택 상태 스타일
   - 슬라이더 스타일
   - 미리보기 영역 스타일
   - 팔레트 정보 표시 스타일

**관련 요구사항**: REQ-E-01, REQ-E-02, REQ-E-08, REQ-S-01, REQ-S-04

---

### 마일스톤 3: 변환 실행 및 업로드 파이프라인 (Primary Goal)

**목표**: 이미지 변환 실행, SVG 미리보기, Supabase 업로드까지의 전체 파이프라인을 구현한다.

**작업 항목**:

1. 변환 실행 로직
   - 선택된 이미지 URL로 `convertGalleryToSvg()` 호출
   - 변환 중 로딩 상태 관리
   - 변환 결과 상태 저장 (ConvertResult)

2. SVG 미리보기 패널
   - 변환된 SVG를 `dangerouslySetInnerHTML` 또는 `<img>` + Data URL로 렌더링
   - 원본 이미지와 변환 결과 나란히 비교 (선택 사항)
   - 메타데이터 표시: 처리 시간, 색상 수, 이미지 크기

3. 색상 팔레트 정보 표시
   - 추출된 색상 목록 (hex + percentage)
   - 색상 원형 아이콘 + 비율 텍스트

4. Supabase 업로드 연동
   - SVG 문자열을 File 객체로 변환
   - `uploadImage(file, 'svg')` 호출로 `svg/` 폴더에 업로드
   - 파일명 생성: `{timestamp}_converted_{originalName}.svg`
   - 업로드 성공/실패 메시지 표시
   - 업로드 완료 후 변환 결과 초기화

5. 에러 핸들링
   - 각 단계별 try-catch 처리
   - 사용자 친화적 한국어 에러 메시지 표시
   - ImageValidationError와 ConversionError 구분 처리

**관련 요구사항**: REQ-E-03, REQ-E-04, REQ-E-05, REQ-E-06, REQ-E-07, REQ-S-02, REQ-S-03, REQ-U-03, REQ-N-04

---

### 마일스톤 4: UX 개선 및 안정화 (Secondary Goal)

**목표**: 사용자 경험을 개선하고 엣지 케이스를 처리한다.

**작업 항목**:

1. 변환 단계 표시
   - "이미지 다운로드 중..." / "색상 분석 중..." / "윤곽선 추출 중..." / "SVG 생성 중..." 단계별 메시지
   - 변환 전 이미지 크기/형식 사전 검증 결과 표시

2. 중복 변환 경고
   - 이미 `svg/` 폴더에 동일 원본 기반 변환 파일이 존재하는 경우 경고
   - 덮어쓰기/취소 선택 제공

3. 이미지 크기 제한 사전 검증
   - 이미지 선택 시 크기/형식 즉시 검증
   - 부적합한 이미지는 선택 불가 처리 또는 경고 배지 표시

4. 반응형 레이아웃 최적화
   - 모바일에서 변환 탭 레이아웃 조정
   - 미리보기 영역 크기 최적화

**관련 요구사항**: REQ-N-01, REQ-N-02, REQ-N-03, REQ-N-04

---

### 마일스톤 5: 고급 기능 (Optional Goal)

**목표**: 선택적 고급 기능을 구현한다.

**작업 항목**:

1. Web Worker 기반 비동기 변환
   - Worker 스크립트 작성 (`src/workers/converter.worker.ts`)
   - Main thread <-> Worker 간 메시지 프로토콜 정의
   - 실시간 진행률 표시 연동

2. 로컬 다운로드 기능
   - 변환된 SVG를 로컬 파일로 다운로드
   - Blob URL 생성 + `<a download>` 활용

3. 일괄 변환 기능
   - 복수 이미지 선택 UI
   - 순차 변환 + 진행률 표시
   - 결과 일괄 업로드

**관련 요구사항**: REQ-O-01, REQ-O-02, REQ-O-03, REQ-O-04

---

## 2. 기술적 접근 방식

### 2.1 아키텍처

```
AdminPage.tsx (변환 탭 UI)
    |
    v
imageConverter.ts (변환 유틸리티)
    |
    +-- fetchImageAsPixels() --> Canvas API
    +-- convertGalleryToSvg() --> coloring-svg convertPixels()
    |
    v
supabase.ts (기존 uploadImage API)
```

### 2.2 주요 기술 결정

| 결정 사항 | 선택 | 근거 |
|-----------|------|------|
| 이미지 디코딩 방식 | Canvas API + convertPixels | 추가 의존성 없음, 번들 크기 최소화 |
| 변환 실행 방식 | 메인 스레드 동기 실행 | 관리자 전용 기능, 구현 단순성, Web Worker는 Optional |
| 미리보기 방식 | SVG Data URL + `<img>` 태그 | XSS 방지, 안전한 렌더링 |
| 파일명 규칙 | `{timestamp}_converted_{name}.svg` | 기존 파일명 규칙과 일관성, 변환 출처 식별 |

### 2.3 coloring-svg 의존성 관리

**개발 환경**:
```bash
# 방법 1: npm link (개발 중)
cd C:\redeye\claude\coloring-svg
npm link
cd C:\redeye\claude\AEC_BG
npm link coloring-svg

# 방법 2: 로컬 경로 참조 (package.json)
"dependencies": {
  "coloring-svg": "file:../coloring-svg"
}
```

**Vite 설정**: coloring-svg가 ESM 모듈이므로 별도 설정 없이 번들링 가능. `imagetracerjs` 의존성이 CJS인 경우 Vite의 자동 변환이 처리.

---

## 3. 의존성 분석

### 3.1 신규 의존성

| 패키지 | 버전 | 용도 | 크기 영향 |
|--------|------|------|----------|
| coloring-svg | 0.1.0 | 이미지-SVG 변환 엔진 | ~50KB (imagetracerjs 포함) |

### 3.2 기존 활용 의존성

| 패키지 | 용도 |
|--------|------|
| @supabase/supabase-js | SVG 업로드, 갤러리 이미지 목록 |
| react | UI 컴포넌트 |

### 3.3 불필요 의존성 (설치하지 않음)

| 패키지 | 미사용 이유 |
|--------|------------|
| jimp | Canvas API로 대체, 번들 크기 절약 (~5MB) |

---

## 4. 리스크 평가

### 4.1 기술적 리스크

| 리스크 | 영향도 | 발생 확률 | 대응 방안 |
|--------|--------|-----------|----------|
| CORS 오류로 Canvas 이미지 접근 실패 | High | Medium | Supabase Storage CORS 설정 확인, crossOrigin="anonymous" 적용, 필요 시 fetch + createObjectURL 우회 |
| 대용량 이미지 변환 시 UI 정지 | Medium | High | 변환 중 로딩 UI 표시, 이미지 크기 제한 적용, Optional로 Web Worker 구현 |
| 생성된 SVG가 ColoringCanvas와 비호환 | High | Medium | 변환 후 SVG 구조 분석, 필요 시 SVG 후처리 로직 추가 |
| coloring-svg Vite 번들링 실패 | Medium | Low | imagetracerjs CJS 호환성 확인, 필요 시 optimizeDeps 설정 |
| 브라우저 메모리 부족 | Medium | Low | 4096x4096 제한 적용, 변환 완료 후 Canvas 참조 해제 |

### 4.2 비즈니스 리스크

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|----------|
| 변환 품질이 색칠하기에 부적합 | High | kColors 옵션으로 조정, 미리보기로 사전 확인, 부적합 시 다른 이미지 안내 |
| Supabase 스토리지 용량 부족 | Low | 불필요 SVG 정리 안내, 스토리지 사용량 모니터링 |

---

## 5. 수정 대상 파일

### 5.1 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/components/AdminPage.tsx` | 변환 탭 추가, 변환 UI 구현 (약 200-300줄 추가) |
| `src/components/AdminPage.module.css` | 변환 관련 CSS 스타일 추가 |
| `package.json` | coloring-svg 의존성 추가 |

### 5.2 신규 파일

| 파일 | 용도 |
|------|------|
| `src/utils/imageConverter.ts` | Canvas 디코딩 + convertPixels 래핑 유틸리티 |

### 5.3 참조 파일 (수정 없음)

| 파일 | 참조 이유 |
|------|----------|
| `src/lib/supabase.ts` | 기존 uploadImage, listImages API 활용 |
| `src/utils/scheduleUtils.ts` | 파일명 파싱 유틸리티 참조 |

---

## 6. 추적성 태그

```yaml
tags:
  - SPEC-COLOR-002
  - gallery-to-svg
  - coloring-svg
  - admin-page
```

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-02-10 | manager-spec | 초기 구현 계획 작성 |
