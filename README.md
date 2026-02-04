# 🎨 AEC 컬러링북 (Daily Coloring)

웹 기반 SVG 컬러링북 애플리케이션입니다. 다양한 라인아트를 색칠하고 달력이나 배경화면으로 저장할 수 있습니다.

> **Apps-in-Toss 배포**: 토스 미니앱으로 출시 준비 완료

## ✨ 주요 기능

- **랜덤 이미지**: 페이지 로드 시 5개 이미지 중 랜덤 선택
- **블록 단위 색칠**: SVG 영역을 클릭하면 선택한 색상으로 채워집니다
- **64색 팔레트**: 12가지 색상 계열 (빨강, 주황, 노랑, 초록, 시안, 파랑, 보라, 핑크, 갈색, 피부색, 머터리얼, 무채색)
- **뒤로가기 (Undo)**: 마지막 색칠 작업 취소 (최대 50개 기록)
- **리셋**: 현재 이미지를 초기 상태로 복원
- **달력 저장**: 색칠한 그림 + 영문 달력 (1080x2340 해상도)
- **배경화면 저장**: 폰 배경화면용 이미지 (1080x2340 해상도, 가로 크롭)
- **반응형 레이아웃**: CSS clamp() 기반 동적 크기 조절

## 🛠️ 기술 스택

- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 7.3.1
- **Design System**: TDS (Toss Design System)
- **Deployment**: Apps-in-Toss (토스 미니앱)
- **SVG**: 경로 기반 색칠
- **Canvas API**: 이미지 저장

## 🚀 개발 환경 설정

### 설치

```bash
npm install
```

### 개발 서버

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### Apps-in-Toss 번들 생성

```bash
npm run bundle
```

### Apps-in-Toss 배포

```bash
npm run deploy
```

## 📁 파일 구조

```
JWY_BG/
├── src/
│   ├── App.tsx              # 메인 애플리케이션 컴포넌트
│   ├── App.css              # 스타일시트
│   ├── main.tsx             # 엔트리 포인트
│   ├── components/          # React 컴포넌트
│   ├── hooks/               # 커스텀 훅
│   ├── constants/           # 상수 (색상 팔레트 등)
│   ├── utils/               # 유틸리티 함수
│   └── types/               # TypeScript 타입 정의
├── public/
│   └── images/              # SVG 이미지 파일 (5개)
├── scripts/
│   └── create-ait.mjs       # Apps-in-Toss 번들 생성 스크립트
├── index.html               # HTML 템플릿
├── package.json             # 프로젝트 설정 및 의존성
├── vite.config.ts           # Vite 설정
├── granite.config.ts        # Granite (Apps-in-Toss) 설정
├── tsconfig.json            # TypeScript 설정
└── vercel.json              # Vercel 배포 설정
```

## 📱 저장 기능

### 달력 저장
- 해상도: 1080x2340 (폰 최적화)
- 상단 55%: 색칠한 이미지
- 하단 45%: 현재 월 달력 (영문 표기)

### 배경화면 저장
- 해상도: 1080x2340 (폰 최적화)
- 가로 기준 크롭으로 화면에 꽉 차게 표시

## 🎨 색상 팔레트 (64색)

| 계열 | 색상 수 |
|------|---------|
| 빨강 | 5색 |
| 주황 | 5색 |
| 노랑 | 6색 |
| 초록 | 5색 |
| 시안 | 4색 |
| 파랑 | 5색 |
| 보라 | 5색 |
| 핑크 | 5색 |
| 갈색 | 7색 |
| 피부색 | 4색 |
| 머터리얼 | 8색 |
| 무채색 | 5색 |

## 📋 SPEC 참조

- **SPEC ID**: SPEC-COLOR-001
- **명세서**: [spec.md](.moai/specs/SPEC-COLOR-001/spec.md)

## 📝 버전 정보

- **버전**: 1.0.1
- **Apps-in-Toss 앱 이름**: dailycoloring

## 📄 라이선스

이 프로젝트는 개인 사용 목적으로 제작되었습니다.

---

*MoAI-ADK로 생성됨*
