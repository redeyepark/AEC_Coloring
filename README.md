# 🎨 AEC 컬러링북

웹 기반 SVG 컬러링북 애플리케이션입니다. 유명 화가 스타일의 라인아트를 색칠할 수 있습니다.

## ✨ 주요 기능

- **랜덤 이미지**: 페이지 로드 시 랜덤으로 이미지 선택
- **블록 단위 색칠**: SVG 영역을 클릭하면 선택한 색상으로 채워집니다
- **44색 팔레트**: 다양한 색상 선택 가능 (빨강, 주황, 노랑, 초록, 파랑, 보라, 핑크, 갈색, 무채색 계열)
- **뒤로가기 (Undo)**: 마지막 색칠 작업 취소 (최대 50개 기록)
- **리셋**: 현재 이미지를 초기 상태로 복원
- **달력 저장**: 색칠한 그림 + 영문 달력 (1080x2340 해상도)
- **배경화면 저장**: 폰 배경화면용 이미지 (1080x2340 해상도, 가로 크롭)

## 🚀 사용 방법

1. `index.html` 파일을 웹 브라우저에서 엽니다
2. 하단 팔레트에서 원하는 색상을 클릭합니다
3. 이미지의 색칠하고 싶은 영역을 클릭합니다
4. 실수했다면 "뒤로가기" 버튼으로 되돌릴 수 있습니다
5. 완성되면 "달력저장" 또는 "배경화면" 버튼으로 저장합니다

## 📁 파일 구조

```
AEC_BG/
├── index.html              # 메인 애플리케이션
├── wrangler.jsonc          # Cloudflare Workers 설정
├── _AEC/
│   ├── DavidHockney.svg    # David Hockney 스타일
│   ├── FridaKahlo.svg      # Frida Kahlo 스타일
│   └── VincentvanGogh.svg  # Vincent van Gogh 스타일
├── .moai/
│   ├── project/            # 프로젝트 문서
│   └── specs/
│       └── SPEC-COLOR-001/ # 프로젝트 명세서
└── README.md
```

## 🛠️ 기술 스택

- HTML5
- CSS3 (Flexbox)
- Vanilla JavaScript
- SVG (경로 기반 색칠)
- Canvas API (이미지 저장)
- Pretendard 폰트
- Cloudflare Workers (배포)

## 📱 저장 기능

### 달력 저장
- 해상도: 1080x2340 (폰 최적화)
- 상단: 색칠한 이미지 (55%)
- 하단: 현재 월 달력 (영문 표기)

### 배경화면 저장
- 해상도: 1080x2340 (폰 최적화)
- 가로 기준 크롭으로 화면에 꽉 차게 표시

## 📋 SPEC 참조

- **SPEC ID**: SPEC-COLOR-001
- **명세서**: [spec.md](.moai/specs/SPEC-COLOR-001/spec.md)
- **구현 계획**: [plan.md](.moai/specs/SPEC-COLOR-001/plan.md)

## 📝 라이선스

이 프로젝트는 개인 사용 목적으로 제작되었습니다.

---

*MoAI-ADK로 생성됨*
