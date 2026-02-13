# 오늘의 컬러링

웹 기반 SVG 색칠하기 앱입니다. 다양한 라인아트를 84색 팔레트로 자유롭게 색칠할 수 있습니다.

**라이브 데모**: https://aec-bg.pages.dev

---

## 주요 기능

### 색칠하기
- **SVG 블록 색칠**: SVG 영역을 터치/클릭하면 선택한 색상으로 채색
- **84색 팔레트**: 4개 대그룹(따뜻한/차가운/자연/무채색), 그룹당 21색 균등 배치
- **핀치 줌**: 터치 기반 확대/축소 지원
- **뒤로가기/다시하기 (Undo/Redo)**: 최대 50개 작업 기록
- **리셋**: 현재 이미지를 초기 상태로 복원
- **색상 심리 분석**: 사용된 색상을 분석하여 심리 상태 메시지 표시

### 갤러리
- **이미지 갤러리**: 다양한 색칠 이미지를 선택할 수 있는 갤러리
- **Supabase Storage 연동**: SVG 파일과 갤러리 이미지를 클라우드에서 관리

### 내 작품 갤러리
- **작품 감상**: 관리자가 업로드한 작품을 그리드 형태로 표시
- **전체화면 뷰어**: 작품 카드를 터치하면 전체화면 오버레이로 감상
- **파일명 기반 메타데이터**: 제목과 작가명을 파일명에서 자동 파싱하여 표시

### 저장 옵션
- **기본 이미지 저장**: 색칠한 SVG를 PNG로 변환
- **달력 저장**: 색칠한 그림 + 영문 달력 (1080x2340 해상도)
- **배경화면 저장**: 폰 배경화면용 이미지 (1080x2340 해상도)
- **그림일기 저장**: A4 비율 원고지 스타일 일기장 (날씨 API 연동)

### 관리자 페이지
- **접근**: URL에 `?admin=true` 추가 또는 홈 화면 설정 버튼
- **비밀번호 보호**: 관리자 인증 필요
- **3탭 관리**: SVG 파일 / 갤러리 이미지 / 내 작품 업로드 및 삭제
- **이미지 활성화/비활성화**: 각 이미지별 사용 여부 토글

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 18.3.1 + TypeScript 5.9 |
| 빌드 도구 | Vite 7.3.1 |
| 스타일링 | CSS Modules + CSS Grid |
| 백엔드 스토리지 | Supabase Storage |
| 날씨 API | Open-Meteo (무료) |
| 테스트 | Vitest |
| 배포 | Cloudflare Pages (Wrangler) |
| 폰트 | Pretendard |

---

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 테스트 실행

```bash
npm run test
```

---

## 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

### Cloudflare Pages 배포

```bash
npm run deploy
```

---

## 앱 플로우

1. **홈 화면**: 갤러리 이미지와 포춘 메시지 표시
2. **갤러리**: 색칠할 이미지를 선택
3. **색칠 화면**: 84색 팔레트로 SVG 라인아트 색칠 (핀치 줌 지원)
4. **결과 화면**: 색상 심리 분석 + 저장 옵션(이미지/달력/배경화면/일기장)

### 내비게이션 구조

- **하단 탭바**: 홈 / 갤러리 / 색칠하기 / 더보기
- **더보기 메뉴**: 내 작품, 색칠 가이드, 색상 이야기, 앱 소개, 작가 소개, 개인정보처리방침

---

## 프로젝트 구조

```
src/
├── App.tsx                    # 앱 라우팅 및 상태 관리
├── components/
│   ├── IntroPage.tsx          # 홈 화면
│   ├── ImageGallery.tsx       # 이미지 갤러리
│   ├── ColoringCanvas.tsx     # 색칠 캔버스
│   ├── Palette.tsx            # 84색 팔레트 (4대그룹)
│   ├── Controls.tsx           # Undo/Redo/Reset/완료 버튼
│   ├── ColoringHeader.tsx     # 색칠 화면 헤더
│   ├── ResultPage.tsx         # 결과 및 저장 화면
│   ├── MorePage.tsx           # 더보기 메뉴
│   ├── MyWorksPage.tsx        # 내 작품 갤러리
│   ├── FullscreenViewer.tsx   # 전체화면 작품 뷰어
│   ├── AdminPage.tsx          # 관리자 페이지 (3탭)
│   ├── BottomTabBar.tsx       # 하단 탭 네비게이션
│   └── ...                    # 콘텐츠 페이지 (가이드, 소개 등)
├── hooks/
│   ├── useColoring.ts         # 색칠 로직 및 히스토리 관리
│   ├── useImages.ts           # Supabase 이미지 목록 관리
│   ├── useCanvasZoom.ts       # 핀치 줌 로직
│   ├── useDeviceResolution.ts # 디바이스 해상도 감지
│   └── useAds.ts              # 광고 상태 관리
├── lib/
│   └── supabase.ts            # Supabase Storage 클라이언트
├── utils/
│   ├── myworksUtils.ts        # 내 작품 파일명 파싱/생성
│   ├── saveImage.ts           # 이미지/달력/배경화면/일기장 저장
│   ├── colorAnalysis.ts       # 색상 심리 분석
│   └── weather.ts             # 날씨 API (Open-Meteo)
├── types/
│   └── index.ts               # TypeScript 타입 정의
├── constants/
│   ├── colors.ts              # 84색 팔레트 정의
│   └── fortunes.ts            # 포춘 메시지
└── config/
    └── adConfig.ts            # 광고 설정
```

### Supabase Storage 버킷 구조

```
images/
├── svg/           # 색칠용 SVG 파일
├── gallery/       # 갤러리 이미지
└── myworks/       # 내 작품 이미지 (제목_by_작가명 형식)
```

---

## 라이선스

ISC
