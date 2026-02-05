# 🎨 AEC 컬러링북

웹 기반 SVG 컬러링북 애플리케이션입니다. 유명 화가 스타일의 라인아트를 색칠할 수 있습니다.

**🌐 라이브 데모**: https://aec-coloring.redeyepark.workers.dev

## ✨ 주요 기능

- **랜덤 이미지**: 페이지 로드 시 랜덤으로 이미지 선택
- **블록 단위 색칠**: SVG 영역을 클릭하면 선택한 색상으로 채워집니다
- **44색 팔레트**: 다양한 색상 선택 가능 (빨강, 주황, 노랑, 초록, 파랑, 보라, 핑크, 갈색, 무채색 계열)
- **뒤로가기/다시하기 (Undo/Redo)**: 색칠 작업 취소 및 복원 (최대 50개 기록)
- **리셋**: 현재 이미지를 초기 상태로 복원
- **다양한 저장 옵션**:
  - 기본 이미지 저장 (PNG)
  - 달력 저장: 색칠한 그림 + 영문 달력 (1080x2340 해상도)
  - 배경화면 저장: 폰 배경화면용 이미지 (1080x2340 해상도, 가로 크롭)
- **포춘 메시지**: 시작 화면에서 랜덤 행운의 메시지 표시

## 📱 3단계 앱 플로우

1. **인트로 화면**: 갤러리 이미지와 포춘 메시지 → 터치하여 시작
2. **색칠 화면**: SVG 컬러링 → 완료 버튼으로 다음 단계
3. **결과 화면**: 저장 옵션 선택 → 새로 시작 가능

## 🚀 사용 방법

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# Cloudflare Workers 배포
npx wrangler deploy
```

### 프로덕션 사용

1. https://aec-coloring.redeyepark.workers.dev 접속
2. 화면 터치하여 시작
3. 하단 팔레트에서 원하는 색상을 클릭
4. 이미지의 색칠하고 싶은 영역을 클릭
5. 실수했다면 Undo/Redo 버튼으로 되돌릴 수 있습니다
6. 완료 버튼 → 저장 옵션 선택

## 📁 파일 구조

```
AEC_BG/
├── src/
│   ├── main.tsx                  # 앱 진입점
│   ├── App.tsx                   # 메인 앱 컴포넌트
│   ├── App.css                   # 글로벌 스타일
│   ├── components/
│   │   ├── ColoringCanvas.tsx    # SVG 색칠 캔버스
│   │   ├── Controls.tsx          # Undo/Redo/Reset/완료 버튼
│   │   ├── IntroPage.tsx         # 인트로 화면
│   │   ├── Palette.tsx           # 색상 팔레트
│   │   └── ResultPage.tsx        # 결과/저장 화면
│   ├── hooks/
│   │   ├── useColoring.ts        # 색칠 로직 및 히스토리 관리
│   │   └── useImages.ts          # 이미지 목록 관리
│   ├── constants/
│   │   ├── colors.ts             # 44색 팔레트 정의
│   │   └── fortunes.ts           # 포춘 메시지
│   ├── utils/
│   │   └── saveImage.ts          # 이미지/달력/배경화면 저장
│   └── types.ts                  # TypeScript 타입 정의
├── public/
│   ├── _AEC/                     # SVG 원본 이미지
│   │   └── images.json           # 이미지 목록
│   └── gallery/                  # 갤러리 이미지 (인트로용)
├── index.html                    # HTML 템플릿
├── vite.config.ts                # Vite 설정
├── tsconfig.json                 # TypeScript 설정
├── wrangler.jsonc                # Cloudflare Workers 설정
└── package.json                  # 프로젝트 설정
```

## 🛠️ 기술 스택

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: CSS Modules
- **Deployment**: Cloudflare Workers
- **Font**: Pretendard

## 📱 저장 기능

### 기본 이미지 저장
- 색칠한 SVG를 PNG로 저장

### 달력 저장
- 해상도: 1080x2340 (폰 최적화)
- 상단: 색칠한 이미지 (55%)
- 하단: 현재 월 달력 (영문 표기)

### 배경화면 저장
- 해상도: 1080x2340 (폰 최적화)
- 가로 기준 크롭으로 화면에 꽉 차게 표시

## 🖼️ SVG 이미지 목록

- David Hockney 스타일
- Frida Kahlo 스타일
- Vincent van Gogh 스타일
- Bane 스타일
- Batman 스타일
- Doctor Strange 스타일
- Joker 스타일

## 📝 라이선스

이 프로젝트는 개인 사용 목적으로 제작되었습니다.

---

*MoAI-ADK로 생성됨*
