# 메뉴트리 구조 분석

> 분석일: 2026-02-11
> 대상: AEC_BG 색칠하기 앱
> 분석 방법: UltraThink (Sequential Thinking MCP)

---

## 1. 앱 Phase 정의

```typescript
type AppPhase = 'intro' | 'gallery' | 'coloring' | 'result' | 'admin' |
                'privacy' | 'colorguide' | 'colorstory' | 'about' |
                'artist' | 'more' | 'myworks';
```

총 **12개 Phase**, **4개 탭** (`home`, `gallery`, `coloring`, `more`)

---

## 2. 메뉴트리 구조

```
App (12개 Phase)
├── [탭바] intro (홈) ← 앱 진입점
│   └── admin (오버레이, 숨겨진 버튼 / ?admin=true)
│
├── [탭바] gallery (갤러리) ← 콘텐츠 선택 허브
│   └── coloring (색칠하기) ← 몰입형, 탭바 없음
│       └── result (결과) ← 탭바 없음
│
├── [탭바] more (더보기) ← 메뉴 허브
│   ├── [탭바] myworks (내 작품)
│   ├── colorguide (색칠 가이드) ← 탭바 없음
│   ├── colorstory (색상 이야기) ← 탭바 없음
│   ├── about (앱 소개) ← 탭바 없음
│   ├── artist (작가 소개) ← 탭바 없음
│   └── privacy (개인정보처리방침) ← 탭바 없음
│
└── coloring 탭 → 이미지 미선택 시 gallery로 리다이렉트
```

---

## 3. 네비게이션 계층

| 계층 | 화면 | 접근 방식 |
|------|------|-----------|
| L1 (탭바 직접 접근) | intro, gallery, more | BottomTabBar 탭 클릭 |
| L2 (버튼 접근) | coloring, myworks, colorguide, colorstory, about, artist, privacy | 상위 화면에서 버튼 클릭 |
| L3 (작업 완료) | result | coloring에서 완료 버튼 |
| Overlay | admin | 숨겨진 버튼 또는 URL 파라미터 |

---

## 4. 화면별 네비게이션 상세

### 4.1 intro (홈)

| 항목 | 내용 |
|------|------|
| 탭바 | 표시 |
| 이동 가능 화면 | gallery (탭바/화면클릭), more (탭바), admin (관리버튼) |
| 컴포넌트 | IntroPage |
| Props | onStart, onAdminOpen |

### 4.2 gallery (갤러리)

| 항목 | 내용 |
|------|------|
| 탭바 | 표시 |
| 이동 가능 화면 | intro (탭바), coloring (이미지 선택), more (탭바) |
| 컴포넌트 | ImageGallery |
| Props | images, isLoading, error, onImageSelect |

### 4.3 coloring (색칠하기)

| 항목 | 내용 |
|------|------|
| 탭바 | 숨김 (몰입형) |
| 이동 가능 화면 | gallery (헤더 뒤로가기), result (헤더 완료) |
| 컴포넌트 | ColoringHeader + ColoringCanvas + Palette + Controls |
| 헤더 | 뒤로가기 (좌) / 이미지명 (중앙) / 완료 (우) |

### 4.4 result (결과)

| 항목 | 내용 |
|------|------|
| 탭바 | 숨김 |
| 이동 가능 화면 | intro (새로 시작하기) |
| 컴포넌트 | ResultPage |
| Props | svgRef, onSaveImage, onSaveCalendar, onSaveWallpaper, onSaveDiary, onRestart |

### 4.5 more (더보기)

| 항목 | 내용 |
|------|------|
| 탭바 | 표시 |
| 이동 가능 화면 | intro (탭바), gallery (탭바), myworks, colorguide, colorstory, about, artist, privacy |
| 컴포넌트 | MorePage |
| 메뉴 항목 | 6개 (내 작품, 색칠 가이드, 색상 이야기, 앱 소개, 작가 소개, 개인정보처리방침) |

### 4.6 myworks (내 작품)

| 항목 | 내용 |
|------|------|
| 탭바 | 표시 |
| 이동 가능 화면 | more (뒤로가기), intro/gallery (탭바) |
| 컴포넌트 | MyWorksPage + FullscreenViewer |
| 기능 | 관리자 업로드 작품을 그리드 갤러리로 표시, 카드 터치 시 전체화면 뷰어 |
| 카드 구성 | 썸네일 이미지 + 제목 + 작가명 |
| 전체화면 | FullscreenViewer 오버레이 (닫기 버튼 또는 배경 터치로 닫기) |
| 데이터 | Supabase Storage `myworks/` 폴더, 파일명에서 메타데이터 파싱 |
| 관리 | AdminPage 3번째 탭에서 업로드/삭제 |

### 4.7 콘텐츠 페이지 (5개)

| 화면 | 컴포넌트 | 탭바 | 이동 가능 |
|------|----------|------|-----------|
| colorguide | ColorGuidePage | 숨김 | more (뒤로) |
| colorstory | ColorStoryPage | 숨김 | more (뒤로) |
| about | AboutPage | 숨김 | more (뒤로) |
| artist | ArtistPage | 숨김 | more (뒤로) |
| privacy | PrivacyPage | 숨김 | more (뒤로) |

### 4.8 admin (관리)

| 항목 | 내용 |
|------|------|
| 표시 방식 | 오버레이 (기존 화면 위에 표시) |
| 접근 방법 | IntroPage 숨겨진 버튼 / URL `?admin=true` |
| 닫기 | 닫기 버튼 → 오버레이 제거, 원래 Phase 유지 |

---

## 5. 탭바 표시 현황

| 구분 | 화면 | 탭바 | 비고 |
|------|------|------|------|
| L1 허브 | intro | O | 앱 진입점 |
| L1 허브 | gallery | O | 콘텐츠 선택 |
| L1 허브 | more | O | 메뉴 허브 |
| L2 more하위 | myworks | **O** | 작품 갤러리 (카드 터치 시 전체화면 뷰어) |
| L2 more하위 | colorguide | **X** | 뒤로가기만 |
| L2 more하위 | colorstory | **X** | 뒤로가기만 |
| L2 more하위 | about | **X** | 뒤로가기만 |
| L2 more하위 | artist | **X** | 뒤로가기만 |
| L2 more하위 | privacy | **X** | 뒤로가기만 |
| L2 몰입형 | coloring | X | 의도적 (몰입) |
| L3 결과 | result | X | 의도적 |
| Overlay | admin | - | 오버레이 |

---

## 6. 네비게이션 경로표

| 시작 | 목표 | 최단 경로 | 클릭 수 |
|------|------|-----------|---------|
| intro → gallery | 탭바 클릭 | 1 |
| intro → coloring | 탭바 → 이미지 선택 | 2 |
| intro → more | 탭바 클릭 | 1 |
| gallery → coloring | 이미지 선택 | 1 |
| coloring → gallery | 뒤로 버튼 | 1 |
| coloring → result | 완료 버튼 | 1 |
| result → intro | 새로 시작하기 | 1 |
| result → gallery | 새로시작 → 탭바 | **2** |
| more → 콘텐츠 | 메뉴 버튼 | 1 |
| 콘텐츠 → more | 뒤로 버튼 | 1 |
| 콘텐츠 → intro | 뒤로 → 탭바 | **2** |

---

## 7. Phase 전환 맵

```
intro ──탭바──→ gallery ──이미지선택──→ coloring ──완료──→ result
  │                                       │                    │
  ←────────────────탭바────────────────────┘                    │
  ←────────────────────────────새로시작────────────────────────┘
  │
  ├──탭바──→ more ──버튼──→ myworks ──뒤로──→ more
  │           ├──버튼──→ colorguide ──뒤로──→ more
  │           ├──버튼──→ colorstory ──뒤로──→ more
  │           ├──버튼──→ about ──뒤로──→ more
  │           ├──버튼──→ artist ──뒤로──→ more
  │           └──버튼──→ privacy ──뒤로──→ more
  │
  └──관리버튼──→ admin (오버레이) ──닫기──→ 원래 Phase
```

---

## 8. 특수 네비게이션 로직

### 8.1 coloring 탭 리다이렉트

```typescript
// App.tsx handleTabChange
case 'coloring':
  if (!currentImage) {
    setPhase('gallery');      // 이미지 없으면 갤러리로
    setActiveTab('gallery');
  } else {
    setPhase('coloring');     // 이미지 있으면 색칠 화면
  }
```

### 8.2 admin 오버레이 접근

```typescript
// URL 파라미터 방식
const params = new URLSearchParams(window.location.search);
if (params.get('admin') === 'true') {
  setShowAdmin(true);
}

// 오버레이는 intro, gallery, more 화면에서 표시 가능
```

### 8.3 reset 확인 다이얼로그

```typescript
// Controls.tsx
if (window.confirm('처음부터 다시 색칠하시겠습니까?')) {
  onReset();
}
```

---

## 9. 발견된 문제점

### P1 (높음) - result 화면 고립

- **현상**: "새로 시작하기" 버튼 1개만 존재, intro로만 이동 가능
- **영향**: 갤러리에서 다른 그림 바로 시작 불가 (2클릭 필요)
- **제안**: "다른 그림 색칠하기" 버튼 추가로 gallery 직행 가능하게

### P2 (중간) - 콘텐츠 페이지 탭바 불일치

- **현상**: myworks만 탭바 표시, 나머지 5개 콘텐츠 페이지는 탭바 없음
- **원인**: myworks가 이전에 탭바의 4번째 탭이었던 역사적 이유
- **영향**: 같은 계층 페이지인데 일관되지 않은 네비게이션 경험
- **비고**: SPEC-UI-003으로 myworks가 실제 갤러리로 구현되었으므로 탭바 유지가 합리적일 수 있음 (작품 감상과 다른 탭 간 빠른 전환)
- **제안**:
  - 옵션 A: 모든 콘텐츠 페이지에 탭바 추가 (일관성+접근성 향상)
  - 옵션 B: myworks에서 탭바 제거 (일관성+몰입 향상)

### P3 (낮음) - coloring 이탈 경고 없음

- **현상**: 색칠 중 뒤로가기 시 확인 없이 바로 gallery로 이동
- **영향**: 작업 손실 위험
- **제안**: 변경사항이 있을 때 확인 다이얼로그 표시

### P4 (낮음) - coloring 탭 조용한 리다이렉트

- **현상**: 이미지 미선택 시 갤러리로 안내 없이 리다이렉트
- **영향**: 사용자가 왜 갤러리로 왔는지 알 수 없음
- **제안**: "먼저 이미지를 선택해주세요" 토스트 메시지

---

## 10. 핵심 컴포넌트 파일 참조

| 컴포넌트 | 파일 경로 |
|----------|-----------|
| 앱 라우팅 | `src/App.tsx` |
| 하단 탭바 | `src/components/BottomTabBar.tsx` |
| 색칠 헤더 | `src/components/ColoringHeader.tsx` |
| 홈 | `src/components/IntroPage.tsx` |
| 갤러리 | `src/components/ImageGallery.tsx` |
| 색칠 캔버스 | `src/components/ColoringCanvas.tsx` |
| 팔레트 | `src/components/Palette.tsx` |
| 컨트롤 | `src/components/Controls.tsx` |
| 결과 | `src/components/ResultPage.tsx` |
| 더보기 | `src/components/MorePage.tsx` |
| 내 작품 | `src/components/MyWorksPage.tsx` |
| 전체화면 뷰어 | `src/components/FullscreenViewer.tsx` |
| 색칠 가이드 | `src/components/ColorGuidePage.tsx` |
| 색상 이야기 | `src/components/ColorStoryPage.tsx` |
| 앱 소개 | `src/components/AboutPage.tsx` |
| 작가 소개 | `src/components/ArtistPage.tsx` |
| 개인정보 | `src/components/PrivacyPage.tsx` |
| 관리자 | `src/components/AdminPage.tsx` |
| 타입 정의 | `src/types/index.ts` |
