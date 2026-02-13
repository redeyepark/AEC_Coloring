---
id: SPEC-UI-003
document: plan
version: "1.0.0"
created: "2026-02-13"
updated: "2026-02-13"
author: JWPARK
---

# SPEC-UI-003 구현 계획: "내 작품" (MyWorks) 갤러리 기능

## 구현 개요

기존 placeholder 상태인 MyWorksPage를 실제 작품 갤러리로 교체하고, AdminPage에 3번째 탭을 추가하여 관리자가 작품을 업로드/관리할 수 있도록 한다. Supabase Storage의 `myworks/` 폴더를 신규 생성하여 이미지를 저장하며, 파일명 인코딩 방식으로 메타데이터(제목, 작가명)를 관리한다.

---

## 마일스톤

### Primary Goal: 데이터 계층 확장

**T1: Supabase 및 유틸리티 확장**

수정 파일:
- `src/lib/supabase.ts` - ImageType에 `'myworks'` 추가, folder 매핑 확장

신규 파일:
- `src/utils/myworksUtils.ts` - 파일명 파싱/생성 유틸리티

타입 수정:
- `src/types/index.ts` - `MyWorkItem` 인터페이스 추가

구현 내용:
- `ImageType` 타입 유니온에 `'myworks'` 리터럴 추가
- `uploadImage()` 내부 folder 분기에 `'myworks'` 케이스 추가
- `listImages()` 내부 folder 분기에 `'myworks'` 케이스 추가
- `parseMyWorkFilename()`: 파일명에서 제목/작가명 추출
- `buildMyWorkFilename()`: 제목/작가명을 파일명으로 인코딩
- `sanitizeMetaString()`: 특수문자 제거, 공백 하이픈 치환

검증 기준:
- `listImages('myworks')` 호출 시 myworks 폴더 이미지 목록 반환
- 파일명 인코딩/디코딩 왕복 테스트 통과

---

### Secondary Goal: 관리자 기능 구현

**T2: AdminPage 내 작품 탭 추가**

수정 파일:
- `src/components/AdminPage.tsx` - 3번째 탭 "내 작품" 추가
- `src/components/AdminPage.module.css` - 3탭 레이아웃 스타일 조정

구현 내용:
- 탭 UI 확장: `[SVG 파일] [갤러리 이미지] [내 작품]`
- `activeTab` 타입을 기존 `ImageType`과 연동 (`'svg' | 'gallery' | 'myworks'`)
- myworks 탭 전용 업로드 폼 구현:
  - 파일 선택 input (`accept="image/png,image/jpeg"`)
  - 제목 입력 input (maxLength=50, required)
  - 작가명 입력 input (maxLength=30, required)
  - 업로드 버튼 (모든 필드 입력 시에만 활성화)
- 업로드 처리:
  - `buildMyWorkFilename()`으로 파일명 생성
  - 파일을 Blob으로 재생성하여 새 파일명 적용
  - `uploadImage(newFile, 'myworks')` 호출
- 목록 표시:
  - `parseMyWorkFilename()`으로 제목/작가명 파싱하여 표시
  - 기존 이미지 목록 UI 패턴 재사용 (썸네일, 이름, 삭제 버튼)
- 삭제 기능:
  - 기존 `handleDelete()` 로직 그대로 활용

검증 기준:
- 3번째 탭 정상 표시 및 전환
- 메타데이터 미입력 시 업로드 버튼 비활성화
- 업로드 후 목록 자동 새로고침
- 삭제 후 목록 자동 새로고침

---

### Tertiary Goal: 사용자 갤러리 화면

**T3: MyWorksPage 갤러리 구현**

수정 파일:
- `src/components/MyWorksPage.tsx` - placeholder 제거, 실제 갤러리 구현
- `src/components/MyWorksPage.module.css` - 갤러리 그리드/카드 스타일

구현 내용:
- 상태 관리:
  - `works: MyWorkItem[]` (작품 목록)
  - `isLoading: boolean`
  - `error: string | null`
  - `selectedWork: MyWorkItem | null` (전체화면 대상)
- 데이터 로드:
  - `useEffect`에서 `listImages('myworks')` 호출
  - 결과를 `parseMyWorkFilename()`으로 파싱하여 `MyWorkItem[]` 변환
- 상태별 UI:
  - 로딩: 로딩 인디케이터
  - 에러: 에러 메시지 + 재시도 안내
  - 빈 목록: "아직 등록된 작품이 없습니다" 메시지
  - 정상: 그리드 갤러리 표시
- 그리드 레이아웃:
  - CSS Grid: `repeat(auto-fill, minmax(150px, 1fr))`
  - 카드: 썸네일 + 제목 + 작가명
  - 기존 ImageGallery 스타일 패턴 참고
- 뒤로가기:
  - 기존 `onBack` prop 유지 (MorePage로 복귀)

검증 기준:
- 작품 목록 정상 표시
- 3가지 상태(로딩/에러/빈 목록) 정상 처리
- 뒤로가기 정상 동작

---

**T4: FullscreenViewer 전체화면 뷰어**

신규 파일:
- `src/components/FullscreenViewer.tsx` - 전체화면 이미지 뷰어
- `src/components/FullscreenViewer.module.css` - 전체화면 오버레이 스타일

구현 내용:
- 오버레이 UI:
  - 배경: `rgba(0, 0, 0, 0.9)` 반투명 검정
  - 포지션: `position: fixed; inset: 0; z-index: 1000`
  - 이미지: 중앙 정렬, `object-fit: contain`, 최대 90vw/80vh
- 정보 표시:
  - 이미지 하단에 제목 (큰 글씨, 흰색)
  - 제목 아래 작가명 (작은 글씨, 밝은 회색)
- 닫기 동작:
  - 우측 상단 X 버튼 클릭
  - 배경(이미지 외 영역) 클릭
  - ESC 키 입력
- MyWorksPage 통합:
  - 카드 터치 시 `selectedWork` 설정
  - `selectedWork !== null`일 때 FullscreenViewer 렌더링
  - 닫기 시 `selectedWork = null`

검증 기준:
- 카드 터치 시 전체화면 오버레이 정상 표시
- 제목/작가명 정확히 표시
- 3가지 닫기 방법 모두 정상 동작
- body 스크롤 잠금 (오버레이 표시 중)

---

### Optional Goal: 품질 개선

**T5: 접근성 및 UX 개선**

- 이미지 `alt` 태그에 제목 + 작가명 포함
- 키보드 네비게이션 지원 (Tab, Enter, Escape)
- 전체화면 뷰어 포커스 트랩 (focus trap)
- 이미지 lazy loading 적용 (`loading="lazy"`)

---

## 수정/생성 파일 요약

| 파일 | 작업 | 태스크 |
|------|------|--------|
| `src/lib/supabase.ts` | 수정 | T1 |
| `src/types/index.ts` | 수정 | T1 |
| `src/utils/myworksUtils.ts` | **신규** | T1 |
| `src/components/AdminPage.tsx` | 수정 | T2 |
| `src/components/AdminPage.module.css` | 수정 | T2 |
| `src/components/MyWorksPage.tsx` | 수정 | T3 |
| `src/components/MyWorksPage.module.css` | 수정 | T3 |
| `src/components/FullscreenViewer.tsx` | **신규** | T4 |
| `src/components/FullscreenViewer.module.css` | **신규** | T4 |

---

## 기술 접근 방식

### 메타데이터 저장 전략: 파일명 인코딩

DB 테이블 생성 없이 파일명에 메타데이터를 인코딩하는 방식을 채택한다.

장점:
- 추가 DB 스키마 불필요 (Supabase 무료 플랜 범위 내)
- 기존 `listImages()` 함수 구조 그대로 활용
- 파일 이동/백업 시 메타데이터 유실 없음

단점:
- 파일명 길이 제한에 따른 제목/작가명 길이 제약
- 특수문자 처리 필요
- 검색/필터링 기능 제한 (클라이언트 사이드만 가능)

### AdminPage 탭 확장 전략

기존 2탭 구조에 3번째 탭을 추가하되, `activeTab` 상태의 타입을 기존 `ImageType`과 통일한다. myworks 탭에서는 일반 파일 업로드 대신 메타데이터 입력 폼을 추가 제공하므로, 탭별 조건부 렌더링으로 구현한다.

### 전체화면 뷰어 전략

별도 컴포넌트(`FullscreenViewer`)로 분리하여 재사용성을 확보한다. 향후 갤러리 이미지 뷰어 등에서도 활용 가능한 범용 구조로 설계한다.

---

## 위험 분석

| 위험 | 가능성 | 영향도 | 대응 방안 |
|------|--------|--------|-----------|
| 파일명 특수문자 인코딩 오류 | 중 | 중 | sanitize 함수로 허용 문자만 통과, 단위 테스트 확보 |
| 대량 이미지 로드 성능 | 하 | 중 | 초기에는 전체 로드, 50장 초과 시 페이지네이션 별도 SPEC |
| Supabase Storage 폴더 미존재 | 하 | 저 | 첫 업로드 시 자동 생성 (Supabase 기본 동작) |
| 관리자 탭 3개 레이아웃 깨짐 | 하 | 저 | CSS flex 기반 균등 분할, 모바일 반응형 테스트 |
| 파일명 파싱 실패 (비정상 형식) | 중 | 저 | fallback: 파일명 전체를 제목으로 표시, 작가명 "알 수 없음" |

---

## 의존성

- Supabase Storage 버킷 `images` (기존 사용 중)
- React 18.3.1, TypeScript 5.9, Vite 7.3.1 (기존 스택)
- 외부 라이브러리 추가 없음
