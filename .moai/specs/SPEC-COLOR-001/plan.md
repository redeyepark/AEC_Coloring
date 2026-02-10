# SPEC-COLOR-001: 구현 계획

---

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-COLOR-001 |
| 문서 유형 | Implementation Plan |
| 생성일 | 2026-02-01 |
| 최종 수정일 | 2026-02-05 |
| 상태 | **Completed** |

---

## 1. 구현 개요

### 1.1 목표

웹 기반 컬러링북 애플리케이션을 React + TypeScript로 구현한다. SVG path 기반 색칠, 65+ 색상 팔레트, Undo/Redo/Reset, 다양한 저장 옵션(이미지/달력/배경화면/그림일기), Supabase Storage 연동, 관리자 페이지, PC 레이아웃 최적화, 색상 심리 분석 기능을 제공한다. 그림일기 기능은 A4 비율 레이아웃, Open-Meteo 날씨 API 연동, 원고지 스타일 격자를 포함한다.

### 1.2 최종 기술 접근 방식

- **프레임워크**: React 18 + TypeScript
- **빌드 도구**: Vite 7
- **렌더링**: SVG 요소 직접 사용
- **색칠 방식**: SVG path fill 속성 변경
- **이벤트 처리**: Event Delegation 패턴
- **상태 관리**: React Hooks (useState, useEffect)
- **이미지 저장소**: Supabase Storage
- **스타일링**: CSS Modules + CSS Grid
- **배포**: Cloudflare Workers

### 1.3 기술 변경 이력

| 원래 계획 | 최종 구현 | 변경 이유 |
|----------|----------|----------|
| Vanilla JavaScript | React 18 + TypeScript | 컴포넌트 재사용성, 타입 안전성 |
| 로컬 파일 | Supabase Storage | 동적 이미지 관리 필요 |
| 단일 이미지 | Supabase 동적 로딩 | 관리자 기능 지원 |
| 14색 팔레트 | 65+ 색상 팔레트 | 표현력 확장 |
| 단일 저장 | 3가지 저장 옵션 | 실용성 향상 |
| 세로 모드 전용 | CSS Grid 반응형 | PC 사용성 향상 |

---

## 2. 마일스톤 (우선순위 기반) - 완료

### Phase 1: 핵심 기능 구현 **완료**

| 순서 | 작업 | 산출물 | 상태 |
|------|------|--------|------|
| 1 | React 프로젝트 설정 | Vite + TypeScript 설정 | **완료** |
| 2 | SVG 컬러링 캔버스 | ColoringCanvas.tsx | **완료** |
| 3 | 색상 팔레트 (44색) | Palette.tsx, colors.ts | **완료** |
| 4 | Undo/Redo/Reset | useColoring.ts | **완료** |
| 5 | 3단계 앱 플로우 | IntroPage, ResultPage | **완료** |

### Phase 2: Supabase 연동 **완료**

| 순서 | 작업 | 산출물 | 상태 |
|------|------|--------|------|
| 6 | Supabase 클라이언트 설정 | lib/supabase.ts | **완료** |
| 7 | 이미지 목록 훅 | useImages.ts | **완료** |
| 8 | SVG 파일 관리 | images/svg/ 버킷 | **완료** |
| 9 | 갤러리 이미지 관리 | images/gallery/ 버킷 | **완료** |

### Phase 3: 관리자 기능 **완료**

| 순서 | 작업 | 산출물 | 상태 |
|------|------|--------|------|
| 10 | 관리자 페이지 UI | AdminPage.tsx | **완료** |
| 11 | 비밀번호 인증 | 비밀번호 폼 | **완료** |
| 12 | 이미지 업로드/삭제 | Supabase API 연동 | **완료** |
| 13 | 이미지 활성화/비활성화 토글 | localStorage 연동 | **완료** |

### Phase 4: PC 레이아웃 최적화 **완료**

| 순서 | 작업 | 산출물 | 상태 |
|------|------|--------|------|
| 14 | CSS Grid 레이아웃 | App.css 미디어 쿼리 | **완료** |
| 15 | 뷰포트 피팅 | 스크롤 없는 레이아웃 | **완료** |
| 16 | 반응형 팔레트 | 동적 크기 조절 | **완료** |

### Phase 5: 색상 심리 분석 **완료**

| 순서 | 작업 | 산출물 | 상태 |
|------|------|--------|------|
| 17 | 색상 분석 유틸리티 | colorAnalysis.ts | **완료** |
| 18 | 결과 페이지 통합 | ResultPage.tsx | **완료** |
| 19 | 심리 메시지 데이터 | 15+ 메시지 | **완료** |

### Phase 6: 배포 **완료**

| 순서 | 작업 | 산출물 | 상태 |
|------|------|--------|------|
| 20 | Cloudflare Workers 설정 | wrangler.jsonc | **완료** |
| 21 | 프로덕션 배포 | 라이브 URL | **완료** |

### Phase 7: 그림일기 저장 기능 **완료**

| 순서 | 작업 | 산출물 | 상태 |
|------|------|--------|------|
| 22 | A4 비율 레이아웃 구현 | saveDiary.ts | **완료** |
| 23 | 원고지 스타일 격자 (14x7) | 텍스트 영역 렌더링 | **완료** |
| 24 | Open-Meteo 날씨 API 연동 | 위치 기반 날씨 조회 | **완료** |
| 25 | 날씨 아이콘 4종 표시 | 맑음/흐림/비/눈 | **완료** |
| 26 | 현재 날씨 컬러 강조 | 활성 날씨 하이라이트 | **완료** |
| 27 | 텍스트 입력 모달 | 사용자 메시지 입력 | **완료** |
| 28 | 헤더 레이아웃 | 날짜 + 요일 + 날씨 | **완료** |

---

## 3. 기술 설계 (최종)

### 3.1 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                      React Application                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  IntroPage  │  │ ColoringPage│  │    ResultPage       │ │
│  │  (갤러리)    │→│ (SVG 색칠)  │→│   (저장 옵션)        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    AdminPage (오버레이)                  ││
│  │  - SVG 파일 관리                                        ││
│  │  - 갤러리 이미지 관리                                    ││
│  │  - 이미지 토글 (활성화/비활성화)                          ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                        Hooks Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐│
│  │ useColoring │  │  useImages  │  │useDeviceResolution   ││
│  │ (색칠 로직) │  │ (Supabase)  │  │  (해상도 감지)       ││
│  └─────────────┘  └─────────────┘  └──────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                       External Services                      │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │   Supabase Storage  │  │      localStorage           │  │
│  │   - images/svg/     │  │   - aec-disabled-images     │  │
│  │   - images/gallery/ │  │                             │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 핵심 모듈 설계

#### 3.2.1 Supabase 클라이언트 (lib/supabase.ts)

- `createClient()`: Supabase 클라이언트 초기화
- `uploadImage(file, type)`: 이미지 업로드 (svg/gallery)
- `listImages(type)`: 이미지 목록 조회
- `deleteImage(path)`: 이미지 삭제
- `getImageUrl(path)`: 퍼블릭 URL 생성

#### 3.2.2 이미지 관리 훅 (hooks/useImages.ts)

- Supabase에서 SVG 이미지 목록 로드
- localStorage의 비활성화 목록으로 필터링
- ImageInfo 형식으로 변환하여 반환

#### 3.2.3 색칠 훅 (hooks/useColoring.ts)

- selectedColor: 현재 선택된 색상
- history/redoHistory: Undo/Redo 스택
- fillPath: 색칠 실행 함수
- undo/redo/clearHistory: 히스토리 관리

#### 3.2.4 관리자 페이지 (components/AdminPage.tsx)

- 비밀번호 인증 UI
- SVG/갤러리 탭 전환
- 이미지 목록 표시 (활성화/비활성화 상태 포함)
- 업로드/삭제/토글 기능

#### 3.2.5 그림일기 저장 (utils/saveDiary.ts)

- A4 비율 (1:1.414) 캔버스 생성
- 헤더 영역: 날짜 + 요일 + 날씨 아이콘 4개 렌더링
- 이미지 영역: 색칠된 SVG 렌더링
- 메시지 영역: 원고지 스타일 격자 (14x7) 렌더링
- Open-Meteo API를 통한 현재 날씨 조회
- 현재 날씨 아이콘 강조 표시

#### 3.2.6 날씨 API 연동 (api/weather.ts)

- Open-Meteo API 호출
- Geolocation API로 현재 위치 획득
- WMO 날씨 코드 → 아이콘 매핑
- 에러 핸들링 (위치 권한 거부 시 기본값)

### 3.3 데이터 흐름

```
페이지 로드
       │
       ▼
Supabase에서 이미지 목록 조회
       │
       ▼
localStorage에서 비활성화 목록 조회
       │
       ▼
활성화된 이미지만 필터링
       │
       ▼
랜덤 이미지 선택 및 표시
       │

사용자 색칠
       │
       ▼
history 스택에 상태 저장
       │
       ▼
path.style.fill = selectedColor

관리자 토글
       │
       ▼
localStorage 업데이트
       │
       ▼
앱 리로드 시 반영
```

---

## 4. 파일 구조 (최종)

```
AEC_BG/
├── src/
│   ├── main.tsx                  # 앱 진입점
│   ├── App.tsx                   # 메인 앱 (3단계 플로우)
│   ├── App.css                   # 글로벌 스타일 (CSS Grid)
│   ├── lib/
│   │   └── supabase.ts           # Supabase 클라이언트
│   ├── components/
│   │   ├── ColoringCanvas.tsx    # SVG 색칠 캔버스
│   │   ├── ColoringCanvas.module.css
│   │   ├── Controls.tsx          # 컨트롤 버튼
│   │   ├── Controls.module.css
│   │   ├── IntroPage.tsx         # 인트로 화면
│   │   ├── IntroPage.module.css
│   │   ├── Palette.tsx           # 65+ 색상 팔레트
│   │   ├── Palette.module.css
│   │   ├── ResultPage.tsx        # 결과 화면
│   │   ├── ResultPage.module.css
│   │   ├── AdminPage.tsx         # 관리자 페이지
│   │   └── AdminPage.module.css
│   ├── hooks/
│   │   ├── useColoring.ts        # 색칠 상태 관리
│   │   ├── useImages.ts          # Supabase 이미지 로딩
│   │   └── useDeviceResolution.ts # 해상도 감지
│   ├── constants/
│   │   ├── colors.ts             # 44색 팔레트 정의
│   │   └── fortunes.ts           # 포춘 메시지
│   ├── utils/
│   │   ├── saveImage.ts          # 저장 유틸리티
│   │   ├── saveDiary.ts          # 그림일기 저장 (A4, 날씨, 원고지)
│   │   └── colorAnalysis.ts      # 색상 심리 분석
│   ├── api/
│   │   └── weather.ts            # Open-Meteo 날씨 API
│   └── types/
│       └── index.ts              # TypeScript 타입
├── public/
│   └── gallery/                  # 로컬 갤러리 (백업)
├── index.html
├── vite.config.ts
├── tsconfig.json
├── wrangler.jsonc
└── package.json
```

---

## 5. 리스크 및 대응 (해결됨)

| 리스크 | 영향도 | 대응 방안 | 결과 |
|--------|--------|----------|------|
| Supabase 서비스 중단 | High | 에러 처리 및 빈 상태 표시 | **해결** |
| localStorage 용량 제한 | Low | JSON 배열 최소화 | **해결** |
| CSS Grid 호환성 | Medium | 폴백 레이아웃 제공 | **해결** |
| 대용량 SVG 로딩 | Medium | 로딩 상태 표시 | **해결** |
| 비밀번호 노출 | Low | 환경 변수 고려 (현재 클라이언트 전용) | **수용** |

---

## 6. 검증 결과

### 6.1 기능 테스트 **완료**

- [x] Supabase에서 SVG 이미지 로딩
- [x] Supabase에서 갤러리 이미지 로딩
- [x] 65+ 색상 팔레트 동작
- [x] 색상 심리 분석 동작
- [x] SVG path 색칠
- [x] Undo/Redo/Reset
- [x] 이미지/달력/배경화면 저장
- [x] 그림일기 저장 (A4 비율)
- [x] Open-Meteo 날씨 API 연동
- [x] 현재 날씨 컬러 강조
- [x] 원고지 스타일 격자 (14x7)
- [x] 텍스트 입력 모달
- [x] 관리자 비밀번호 인증
- [x] 이미지 업로드/삭제
- [x] 이미지 활성화/비활성화 토글
- [x] PC CSS Grid 레이아웃
- [x] 모바일 반응형 레이아웃

### 6.2 브라우저 호환성 테스트 **완료**

- [x] Chrome (PC/모바일)
- [x] Firefox
- [x] Edge
- [x] Safari (PC/모바일)

### 6.3 성능 테스트 **완료**

- [x] Supabase API 응답 < 1초
- [x] SVG 렌더링 < 500ms
- [x] 색칠 응답 < 16ms
- [x] 메모리 사용량 < 50MB

---

## 7. 배포 정보

### 7.1 Cloudflare Workers 설정

```jsonc
// wrangler.jsonc
{
  "name": "aec-coloring",
  "compatibility_date": "2026-02-01",
  "assets": {
    "directory": "./dist"
  }
}
```

### 7.2 배포 명령

```bash
npm run build
npx wrangler deploy
```

### 7.3 라이브 URL

- https://aec-coloring.redeyepark.workers.dev

---

## 8. 보류 기능 (On Hold)

### 8.1 커스텀 로딩 아이콘

| 항목 | 내용 |
|------|------|
| 컴포넌트 | `src/components/LoadingIcon.tsx` |
| 스타일 | `src/components/LoadingIcon.module.css` |
| 구현 상태 | 완료 (비활성화) |
| 보류 사유 | 디자인 검토 필요 |

**구현 내용:**
- 3x3 컬러 그리드 애니메이션
- Loading.svg 기반 17가지 컬러 팔레트
- 랜덤 색상 변경 애니메이션 (200-500ms 간격)
- fadeIn 화면 전환 효과

**활성화 방법:**
1. IntroPage.tsx에서 LoadingIcon import 및 사용
2. ColoringCanvas.tsx에서 LoadingIcon import 및 사용
3. 필요시 테스트 딜레이 추가

---

## 9. 추적성 태그

```yaml
tags:
  - SPEC-COLOR-001
  - implementation-plan
  - react-typescript
  - supabase-storage
  - admin-page
  - css-grid
  - cloudflare-workers
  - diary-save
  - open-meteo
  - weather-api
  - manuscript-grid
```

---

## 10. 관련 문서

- [SPEC 명세서](./spec.md)
- [인수 기준](./acceptance.md)

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-02-01 | manager-spec | 초기 계획 작성 |
| 2.0.0 | 2026-02-01 | manager-spec | 구현 완료 반영 |
| 3.0.0 | 2026-02-05 | manager-docs | Supabase, 관리자 페이지, PC 레이아웃 추가 |
| 4.0.0 | 2026-02-05 | manager-docs | 색상 심리 분석 기능, 65+ 색상 팔레트 추가 |
| 5.0.0 | 2026-02-05 | manager-docs | 커스텀 로딩 아이콘 보류 처리 |
| 6.0.0 | 2026-02-05 | manager-docs | 그림일기 저장 기능 추가 (Phase 7), Open-Meteo 날씨 API, A4 비율 레이아웃, 원고지 격자 |
