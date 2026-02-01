# 🎨 AEC 컬러링북

웹 기반 SVG 컬러링북 애플리케이션입니다. 베레모와 안경을 착용한 신사의 라인아트 이미지를 클릭하여 색칠할 수 있습니다.

## ✨ 주요 기능

- **클릭 색칠**: SVG 영역을 클릭하면 선택한 색상으로 채워집니다
- **14색 팔레트**: 다양한 색상 선택 가능
- **초기화**: 리셋 버튼으로 원래 상태로 복원
- **저장**: 완성된 작품을 PNG 이미지로 다운로드
- **폴라로이드 프레임**: 사진 액자 스타일의 UI

## 🚀 사용 방법

1. `index.html` 파일을 웹 브라우저에서 엽니다
2. 하단 팔레트에서 원하는 색상을 클릭합니다
3. 이미지의 색칠하고 싶은 영역을 클릭합니다
4. 완성되면 "저장" 버튼을 눌러 이미지를 다운로드합니다

## 📁 파일 구조

```
AEC_BG/
├── index.html              # 메인 애플리케이션
├── _AEC/
│   ├── AEC_BG.png          # 원본 PNG 이미지
│   └── sketch*.svg         # SVG 라인아트 이미지
├── .moai/
│   └── specs/
│       └── SPEC-COLOR-001/ # 프로젝트 명세서
└── README.md
```

## 🛠️ 기술 스택

- HTML5
- CSS3 (Flexbox, 폴라로이드 효과)
- Vanilla JavaScript
- SVG (경로 기반 색칠)
- Pretendard 폰트

## 📋 SPEC 참조

- **SPEC ID**: SPEC-COLOR-001
- **명세서**: [spec.md](.moai/specs/SPEC-COLOR-001/spec.md)
- **구현 계획**: [plan.md](.moai/specs/SPEC-COLOR-001/plan.md)

## 📝 라이선스

이 프로젝트는 개인 사용 목적으로 제작되었습니다.

---

*MoAI-ADK로 생성됨*
