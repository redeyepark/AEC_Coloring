---
id: SPEC-UI-004
title: SNS Share Feature
version: 0.1.0
status: reverted
created: 2026-02-13
updated: 2026-02-13
author: JWPARK
priority: medium
tags: share, web-share-api, clipboard, sns, result-page
related_specs:
  - SPEC-UI-001
  - SPEC-UI-002
---

# SPEC-UI-004: SNS 공유 기능

## 1. 환경 (Environment)

### 1.1 프로젝트 컨텍스트

- **앱 이름**: 오늘의 컬러링 (Today's Coloring)
- **기술 스택**: React 18 + TypeScript 5.9 + Vite 7
- **배포 환경**: Cloudflare Pages (HTTPS)
- **타겟 사용자**: 어린이 (COPPA 준수 필요)

### 1.2 현재 상태

- ResultPage에 4개의 저장 버튼 존재 (이미지, 달력, 배경화면, 그림일기)
- 모든 저장은 브라우저 다운로드 방식 (canvas -> PNG -> download)
- SVG -> Canvas 렌더링 패턴이 `saveImage.ts`에 이미 구현됨
- Web Share API 또는 소셜 공유 기능 미구현
- toast 알림 패턴 기존재 (showMessage 함수)

### 1.3 브라우저 호환성

| 브라우저         | Web Share API (files) | Clipboard API (write) |
| ---------------- | --------------------- | --------------------- |
| Chrome (Android) | 지원                  | 지원                  |
| Safari (iOS)     | 지원                  | 지원                  |
| Chrome (Desktop) | 미지원                | 지원                  |
| Firefox          | 미지원                | 부분 지원             |
| Samsung Internet | 지원                  | 지원                  |

### 1.4 대상 파일

| 파일                                 | 역할                        |
| ------------------------------------ | --------------------------- |
| `src/utils/saveImage.ts`             | 이미지 저장 유틸리티        |
| `src/components/ResultPage.tsx`      | 결과 페이지 컴포넌트        |
| `src/components/ResultPage.module.css` | 결과 페이지 스타일          |
| `src/App.tsx`                        | 메인 앱 (props 전달)        |

---

## 2. 가정 (Assumptions)

### 2.1 기술적 가정

- **A1**: Cloudflare Pages는 HTTPS로 서빙되므로 Web Share API와 Clipboard API 모두 사용 가능하다 (Secure Context 충족)
- **A2**: 모바일 사용자가 주요 타겟이므로 Web Share API가 대부분의 경우 지원된다
- **A3**: 기존 SVG -> Canvas -> PNG 변환 패턴을 재사용할 수 있다
- **A4**: navigator.share()의 files 옵션을 사용하면 OS 네이티브 공유 시트가 표시된다
- **A5**: canvas.toBlob()을 통해 File 객체를 생성할 수 있다

### 2.2 비즈니스 가정

- **B1**: COPPA 준수를 위해 외부 SNS SDK를 임베드하지 않는다 (네이티브 Share API만 사용)
- **B2**: 워터마크는 브랜드 인지도 향상을 위해 반드시 포함한다
- **B3**: 공유 이미지에는 사용자 개인정보가 포함되지 않는다

---

## 3. 요구사항 (Requirements)

### 3.1 공유 유틸리티 함수 (shareImage)

**REQ-001** [Ubiquitous]
시스템은 **항상** SVG 엘리먼트를 PNG 이미지로 변환 시 흰색 배경을 적용해야 한다.

**REQ-002** [Event-Driven]
**WHEN** shareImage 함수가 호출되면 **THEN** SVG를 Canvas에 렌더링하고, 우측 하단에 "오늘의 컬러링" 워터마크를 반투명으로 삽입해야 한다.

**REQ-003** [Event-Driven]
**WHEN** Canvas 렌더링이 완료되면 **THEN** canvas.toBlob()으로 PNG Blob을 생성하고, 이를 File 객체로 변환해야 한다.

**REQ-004** [State-Driven]
**IF** navigator.share가 존재하고 navigator.canShare({ files })가 true이면 **THEN** navigator.share()를 호출하여 OS 네이티브 공유 시트를 표시해야 한다.

**REQ-005** [State-Driven]
**IF** navigator.share가 미지원이거나 navigator.canShare({ files })가 false이면 **THEN** navigator.clipboard.write()를 사용하여 이미지를 클립보드에 복사해야 한다.

**REQ-006** [Event-Driven]
**WHEN** 클립보드 복사가 성공하면 **THEN** "클립보드에 복사됨" 토스트 메시지를 표시해야 한다.

**REQ-007** [Unwanted]
시스템은 공유 과정에서 사용자 개인정보를 수집하거나 외부 서버로 전송**하지 않아야 한다**.

### 3.2 공유 버튼 UI

**REQ-008** [Ubiquitous]
시스템은 **항상** ResultPage에 "공유하기" 버튼을 기존 4개 저장 버튼 다음에 표시해야 한다.

**REQ-009** [Ubiquitous]
시스템은 **항상** 공유 버튼에 공유 아이콘 (arrow-up-from-box 스타일)을 포함해야 한다.

**REQ-010** [Event-Driven]
**WHEN** 사용자가 공유하기 버튼을 클릭하면 **THEN** shareImage 함수를 호출해야 한다.

**REQ-011** [State-Driven]
**IF** 공유가 진행 중이면 **THEN** 버튼을 비활성화하고 로딩 상태를 표시해야 한다.

**REQ-012** [Event-Driven]
**WHEN** 공유가 실패하면 **THEN** "공유 실패. 다시 시도해주세요." 토스트 메시지를 표시해야 한다.

### 3.3 워터마크

**REQ-013** [Ubiquitous]
시스템은 **항상** 공유 이미지의 우측 하단에 "오늘의 컬러링" 텍스트 워터마크를 삽입해야 한다.

**REQ-014** [Ubiquitous]
워터마크는 **항상** 반투명 (opacity 0.5 이하)으로 렌더링되어야 하며, 원본 이미지 감상을 방해하지 않아야 한다.

**REQ-015** [Ubiquitous]
워터마크 폰트 크기는 **항상** Canvas 너비 대비 상대적으로 계산해야 한다 (Canvas 너비의 약 3~4%).

### 3.4 공유 메타데이터

**REQ-016** [Ubiquitous]
navigator.share() 호출 시 **항상** 다음 메타데이터를 포함해야 한다:
- title: '오늘의 컬러링'
- text: '오늘 하루, 예쁜 색으로 마음을 채웠어요!'
- files: [생성된 PNG File 객체]

---

## 4. 명세 (Specifications)

### 4.1 shareImage 함수 시그니처

```typescript
// src/utils/saveImage.ts에 추가
export async function shareImage(
  svg: SVGSVGElement,
  imageName: string
): Promise<'shared' | 'copied'>
```

- **매개변수**: svg (색칠된 SVG 엘리먼트), imageName (이미지 이름)
- **반환값**: 'shared' (Web Share 성공) 또는 'copied' (클립보드 복사 성공)
- **예외**: 공유/복사 모두 실패 시 Error throw

### 4.2 워터마크 렌더링 명세

```
위치: Canvas 우측 하단 (right: 10px, bottom: 10px 마진)
텍스트: "오늘의 컬러링"
폰트: bold {canvas.width * 0.035}px Pretendard, sans-serif
색상: rgba(0, 0, 0, 0.4)
정렬: ctx.textAlign = 'right', ctx.textBaseline = 'bottom'
```

### 4.3 공유 흐름

```
사용자 클릭 -> SVG 직렬화 -> Canvas 렌더링 (흰 배경)
  -> 워터마크 삽입 -> canvas.toBlob('image/png')
  -> File 객체 생성
  -> navigator.canShare 확인
    -> 지원: navigator.share({ files, title, text })
    -> 미지원: navigator.clipboard.write([ClipboardItem])
  -> 결과에 따라 토스트 표시
```

### 4.4 ResultPage 변경사항

- `onShareImage` prop 추가 (App.tsx에서 전달)
- 공유 버튼 상태 관리: `isSharing` (진행 중 여부, 반복 공유 허용)
- 기존 저장 버튼과 달리, 공유 버튼은 한 번 사용 후에도 비활성화되지 않음 (반복 공유 가능)

### 4.5 파일 변경 범위

| 파일                              | 변경 유형 | 설명                                        |
| --------------------------------- | --------- | ------------------------------------------- |
| `src/utils/saveImage.ts`          | 추가      | shareImage() 함수, drawWatermark() 헬퍼     |
| `src/components/ResultPage.tsx`   | 수정      | 공유 버튼 추가, onShareImage prop            |
| `src/components/ResultPage.module.css` | 수정 | shareBtn 스타일 추가                         |
| `src/App.tsx`                     | 수정      | handleShareImage 핸들러, prop 전달           |

### 4.6 제약사항

- 외부 SDK 임포트 금지 (COPPA 준수)
- 서버 사이드 처리 없음 (모든 처리는 클라이언트에서)
- 기존 saveImage.ts 패턴 유지 (SVG -> Canvas -> Blob 흐름)
- 광고는 공유 동작에 표시하지 않음 (사용자 경험 우선)

---

## 5. 추적성 (Traceability)

| 요구사항 ID | 구현 태스크 | 수락 기준   |
| ----------- | ----------- | ----------- |
| REQ-001~003 | T1          | AC-001      |
| REQ-004~006 | T3          | AC-002, AC-003 |
| REQ-007     | T1          | AC-005      |
| REQ-008~012 | T2          | AC-001, AC-004 |
| REQ-013~015 | T1          | AC-001      |
| REQ-016     | T1          | AC-002      |
