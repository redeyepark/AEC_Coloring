---
id: SPEC-UI-003
version: "1.0.0"
status: completed
created: "2026-02-13"
updated: "2026-02-13"
author: JWPARK
priority: medium
tags: myworks, gallery, admin, fullscreen, supabase
---

# SPEC-UI-003: "내 작품" (MyWorks) 갤러리 기능

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-02-13 | JWPARK | 최초 작성 - 내 작품 갤러리, 관리자 업로드, 전체화면 뷰어 |
| 1.0.1 | 2026-02-13 | JWPARK | 구현 완료 - 모든 요구사항(REQ-MW, REQ-ADM, REQ-DATA) 구현 및 검증 |

---

## 1. Environment (환경)

### 1.1 시스템 환경

- **프레임워크**: React 18.3.1 + TypeScript 5.9 + Vite 7.3.1
- **백엔드 스토리지**: Supabase Storage (버킷: `images`, 기존 폴더: `svg/`, `gallery/`)
- **대상 플랫폼**: 모바일 웹 (터치 기반), 태블릿, 데스크톱

### 1.2 현재 아키텍처

- **라우팅**: `AppPhase` 상태 기반 조건부 렌더링 (`src/App.tsx`)
- **Phase 종류**: intro, gallery, coloring, result, admin, privacy, colorguide, colorstory, about, artist, more, myworks
- **MyWorksPage**: 현재 placeholder ("준비 중입니다" 메시지만 표시)
- **AdminPage**: 비밀번호 인증(a1234), 2개 탭(SVG 파일, 갤러리 이미지), 업로드/삭제/활성화/스케줄/이름변경 기능
- **Supabase 연동**: `src/lib/supabase.ts` - `uploadImage`, `listImages`, `deleteImage`, `renameImage` 함수 제공
- **ImageType**: `'svg' | 'gallery'` (확장 필요)

### 1.3 핵심 파일 구조

| 파일 | 역할 | 현재 상태 |
|------|------|-----------|
| `src/components/MyWorksPage.tsx` | 내 작품 화면 | placeholder ("준비 중") |
| `src/components/MyWorksPage.module.css` | 내 작품 스타일 | 기본 스타일만 존재 |
| `src/components/AdminPage.tsx` | 관리자 페이지 | SVG/Gallery 2탭 운영 |
| `src/components/AdminPage.module.css` | 관리자 스타일 | 2탭 기준 스타일 |
| `src/lib/supabase.ts` | Supabase 클라이언트 | ImageType에 'myworks' 미포함 |
| `src/types/index.ts` | 타입 정의 | ImageInfo (file, name) |
| `src/App.tsx` | 앱 라우팅 | myworks phase 정의 완료 |
| `src/components/MorePage.tsx` | 더보기 메뉴 | "내 작품" 메뉴 항목 존재 |

### 1.4 관련 SPEC

- **SPEC-UI-002**: 메뉴 구조 개선 및 네비게이션 재설계 (MyWorksPage placeholder 생성, MorePage에서 네비게이션 연결 완료)

---

## 2. Assumptions (가정)

### 2.1 기술적 가정

- [A-1] Supabase Storage 버킷 `images`에 `myworks/` 폴더를 추가하여 기존 `svg/`, `gallery/` 구조와 동일하게 운영할 수 있다
- [A-2] 기존 `uploadImage`, `listImages`, `deleteImage`, `renameImage` 함수는 `ImageType` 확장만으로 `myworks` 폴더를 지원할 수 있다
- [A-3] 메타데이터(제목, 작가명)는 파일명 인코딩 방식(`{title}_by_{artist}.{ext}`)으로 저장하며, 별도 DB 테이블 없이 운영 가능하다
- [A-4] PNG/JPG 이미지 파일 크기는 모바일 환경 기준 최대 10MB 이내로 제한한다

### 2.2 비즈니스 가정

- [A-5] "내 작품" 갤러리는 읽기 전용(View-only)으로, 일반 사용자는 작품 업로드/수정/삭제가 불가하다
- [A-6] 관리자만 AdminPage의 새 탭을 통해 작품 이미지를 업로드하며, 업로드 시 제목과 작가명을 필수 입력한다
- [A-7] 갤러리 표시 정보는 제목과 작가명 2개 필드만 표시하며, 날짜/설명 등 추가 메타데이터는 제공하지 않는다
- [A-8] 전체화면 뷰어는 이미지 확인 용도로만 사용하며, 좋아요/댓글 등 소셜 기능은 포함하지 않는다

### 2.3 위험 가정

- [A-9] 파일명에 특수문자가 포함될 경우 인코딩 문제가 발생할 수 있으며, 제목/작가명에서 특수문자를 제거하거나 인코딩 처리가 필요하다
- [A-10] 대량의 이미지(50장 이상) 로드 시 Supabase Storage API 응답 시간이 늘어날 수 있으며, 페이지네이션이 필요할 수 있다

---

## 3. Requirements (요구사항)

### 3.1 모듈: REQ-MW (내 작품 갤러리)

#### REQ-MW-001 [Ubiquitous] 작품 갤러리 표시

시스템은 **항상** 내 작품 페이지에서 업로드된 모든 작품을 그리드 레이아웃으로 표시해야 한다.

- 그리드 레이아웃: `repeat(auto-fill, minmax(150px, 1fr))` (기존 ImageGallery 패턴 준수)
- 각 카드에 썸네일 이미지, 제목, 작가명 표시
- 카드 스타일: 흰색 배경, 둥근 모서리, 그림자 효과 (기존 디자인 시스템 준수)
- 최신 업로드 순으로 정렬

#### REQ-MW-002 [Event-Driven] 작품 전체화면 보기

**WHEN** 사용자가 갤러리에서 작품 카드를 터치하면 **THEN** 해당 작품을 전체화면 오버레이로 표시해야 한다.

- 이미지를 화면 중앙에 최대 크기로 표시 (가로세로 비율 유지)
- 제목과 작가명을 이미지 하단에 표시
- 반투명 검은 배경 오버레이 적용 (rgba(0,0,0,0.9))

#### REQ-MW-003 [Event-Driven] 전체화면 닫기

**WHEN** 사용자가 전체화면 오버레이의 닫기 버튼을 터치하거나 배경을 터치하면 **THEN** 전체화면을 닫고 갤러리 목록으로 돌아가야 한다.

- 닫기 버튼: 우측 상단 X 아이콘
- 배경 터치로도 닫기 가능

#### REQ-MW-004 [State-Driven] 갤러리 상태 처리

**IF** 업로드된 작품이 없으면 **THEN** 적절한 빈 상태 메시지를 표시해야 한다.

- "아직 등록된 작품이 없습니다" 메시지 표시
- 로딩 중 상태: 로딩 인디케이터 표시
- 에러 상태: 에러 메시지 및 재시도 안내 표시

#### REQ-MW-005 [Unwanted] 일반 사용자 업로드 차단

시스템은 일반 사용자에게 작품 업로드, 수정, 삭제 기능을 제공**하지 않아야 한다**.

- MyWorksPage에는 업로드 버튼 미노출
- 관리자 기능은 AdminPage에서만 제공

---

### 3.2 모듈: REQ-ADM (관리자 작품 관리)

#### REQ-ADM-001 [Event-Driven] 관리자 내 작품 탭

**WHEN** 관리자가 AdminPage에서 "내 작품" 탭을 선택하면 **THEN** myworks 폴더의 이미지 목록을 표시해야 한다.

- AdminPage 탭 구성: [SVG 파일] [갤러리 이미지] [내 작품] (3개 탭)
- 기존 탭과 동일한 이미지 리스트 UI 패턴 적용
- 썸네일 미리보기, 제목/작가명 표시, 삭제 버튼

#### REQ-ADM-002 [Event-Driven] 작품 업로드 폼

**WHEN** 관리자가 내 작품 탭에서 업로드 버튼을 클릭하면 **THEN** 파일 선택 및 메타데이터 입력 폼을 제공해야 한다.

- 파일 선택: PNG/JPG만 허용 (`accept="image/png,image/jpeg"`)
- 제목 입력: 필수 텍스트 필드 (최대 50자)
- 작가명 입력: 필수 텍스트 필드 (최대 30자)
- 업로드 버튼: 모든 필드 입력 완료 시에만 활성화

#### REQ-ADM-003 [Event-Driven] 작품 업로드 실행

**WHEN** 관리자가 파일과 메타데이터를 입력하고 업로드 버튼을 클릭하면 **THEN** Supabase Storage `myworks/` 폴더에 이미지를 업로드해야 한다.

- 파일명 형식: `{timestamp}_{title}_by_{artist}.{ext}`
- 제목/작가명의 공백은 하이픈(-)으로 치환
- 특수문자는 제거 (한글, 영문, 숫자, 하이픈만 허용)
- 업로드 성공/실패 메시지 표시

#### REQ-ADM-004 [Event-Driven] 작품 삭제

**WHEN** 관리자가 작품 목록에서 삭제 버튼을 클릭하면 **THEN** 확인 후 Supabase Storage에서 해당 파일을 삭제해야 한다.

- 삭제 전 확인 다이얼로그 표시 ("해당 작품을 삭제하시겠습니까?")
- 삭제 성공 시 목록 자동 새로고침

#### REQ-ADM-005 [Unwanted] 메타데이터 미입력 업로드 방지

시스템은 제목 또는 작가명이 입력되지 않은 상태에서 업로드를 실행**하지 않아야 한다**.

- 빈 필드가 있으면 업로드 버튼 비활성화
- 공백만 입력한 경우도 빈 값으로 처리

---

### 3.3 모듈: REQ-DATA (데이터 계층)

#### REQ-DATA-001 [Ubiquitous] ImageType 확장

시스템은 **항상** `ImageType` 타입에 `'myworks'`를 포함하여 Supabase Storage의 `myworks/` 폴더를 지원해야 한다.

- `ImageType`: `'svg' | 'gallery' | 'myworks'`
- `listImages('myworks')`: myworks 폴더 이미지 목록 반환
- `uploadImage(file, 'myworks')`: myworks 폴더에 업로드
- `deleteImage(path)`: myworks 폴더 파일 삭제 (기존 함수 활용)

#### REQ-DATA-002 [Event-Driven] 파일명 기반 메타데이터 파싱

**WHEN** 작품 목록을 로드하면 **THEN** 파일명에서 제목과 작가명을 파싱하여 표시해야 한다.

- 파일명 형식: `{timestamp}_{title}_by_{artist}.{ext}`
- 파싱 로직: `_by_` 구분자로 제목과 작가명 분리
- 타임스탬프 접두사 제거 후 제목 추출
- 하이픈(-)은 공백으로 복원하여 표시

---

## 4. Specifications (사양)

### 4.1 기술 사양

#### 4.1.1 MyWorksPage 컴포넌트 (수정)

```
컴포넌트: MyWorksPage
위치: src/components/MyWorksPage.tsx (기존 파일 전면 수정)
Props:
  - onBack: () => void

상태:
  - works: MyWorkItem[] (작품 목록)
  - isLoading: boolean
  - error: string | null
  - selectedWork: MyWorkItem | null (전체화면 표시 대상)

의존성: listImages('myworks'), parseMyWorkFilename()
```

#### 4.1.2 FullscreenViewer 컴포넌트 (신규)

```
컴포넌트: FullscreenViewer
위치: src/components/FullscreenViewer.tsx (신규 생성)
Props:
  - imageUrl: string
  - title: string
  - artist: string
  - onClose: () => void

UI:
  - 반투명 검정 오버레이 (rgba(0,0,0,0.9))
  - 중앙 정렬된 이미지 (object-fit: contain)
  - 하단 정보: 제목 + 작가명
  - 우측 상단 닫기(X) 버튼
```

#### 4.1.3 AdminPage 확장

```
변경 사항:
  - activeTab 타입: ImageType ('svg' | 'gallery' | 'myworks')
  - 3번째 탭 "내 작품" 추가
  - myworks 탭 전용 업로드 폼: 파일 + 제목 + 작가명
  - 파일 필터: accept="image/png,image/jpeg"
  - 업로드 파일명 생성: buildMyWorkFilename(title, artist, ext)
```

#### 4.1.4 Supabase 유틸 확장

```
변경 파일: src/lib/supabase.ts
  - ImageType 확장: 'svg' | 'gallery' | 'myworks'
  - listImages() 내부 folder 매핑에 'myworks' 추가
  - uploadImage() 내부 folder 매핑에 'myworks' 추가

신규 유틸: src/utils/myworksUtils.ts
  - parseMyWorkFilename(filename): { title: string; artist: string }
  - buildMyWorkFilename(title, artist, ext): string
  - sanitizeMetaString(str): string (특수문자 제거, 공백→하이픈)
```

### 4.2 타입 정의

```typescript
// src/types/index.ts 에 추가
interface MyWorkItem {
  file: string;    // 이미지 URL
  path: string;    // Supabase Storage 경로
  title: string;   // 작품 제목
  artist: string;  // 작가명
}
```

### 4.3 파일명 인코딩 규칙

```
인코딩: {timestamp}_{sanitized-title}_by_{sanitized-artist}.{ext}
예시:   1707800000000_봄의-꽃밭_by_김영희.jpg
디코딩: 타임스탬프 제거 → "_by_" 분리 → 하이픈→공백 → "봄의 꽃밭" / "김영희"

sanitize 규칙:
  - 허용 문자: 한글, 영문, 숫자, 하이픈(-)
  - 공백 → 하이픈(-) 치환
  - 기타 특수문자 제거
  - 연속 하이픈 → 단일 하이픈
  - 선행/후행 하이픈 제거
```

### 4.4 성능 기준

| 항목 | 기준 |
|------|------|
| 작품 목록 로드 | 2초 이내 |
| 전체화면 이미지 로드 | 3초 이내 |
| 관리자 업로드 완료 | 5초 이내 (10MB 이하 파일) |
| 갤러리 그리드 렌더링 | 100ms 이내 |

---

## 5. Traceability (추적성)

| 요구사항 ID | plan.md 태스크 | acceptance.md 시나리오 |
|-------------|---------------|----------------------|
| REQ-MW-001 | T3, T4 | AC-MW-001 |
| REQ-MW-002 | T4 | AC-MW-002 |
| REQ-MW-003 | T4 | AC-MW-003 |
| REQ-MW-004 | T3 | AC-MW-004 |
| REQ-MW-005 | T3 | AC-MW-005 |
| REQ-ADM-001 | T2 | AC-ADM-001 |
| REQ-ADM-002 | T2 | AC-ADM-002 |
| REQ-ADM-003 | T1, T2 | AC-ADM-003 |
| REQ-ADM-004 | T2 | AC-ADM-004 |
| REQ-ADM-005 | T2 | AC-ADM-005 |
| REQ-DATA-001 | T1 | AC-DATA-001 |
| REQ-DATA-002 | T1 | AC-DATA-002 |
