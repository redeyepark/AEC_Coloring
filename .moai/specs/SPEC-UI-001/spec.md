---
id: SPEC-UI-001
title: Coloring Sound Effects
version: 0.1.0
status: draft
created: 2026-02-11
updated: 2026-02-11
author: JWPARK
priority: medium
lifecycle: spec-first
related_specs: []
tags: audio, web-audio-api, ux, coloring
---

# SPEC-UI-001: 색칠 효과음 기능

## HISTORY

| 버전  | 날짜       | 작성자 | 변경 내용        |
| ----- | ---------- | ------ | ---------------- |
| 0.1.0 | 2026-02-11 | JWPARK | 초기 SPEC 작성   |

---

## 1. Environment (환경)

### 1.1 시스템 환경

- **런타임**: 모던 브라우저 (Chrome 90+, Firefox 88+, Safari 15+, Edge 90+)
- **프레임워크**: React 18.3.1, TypeScript 5.9.3, Vite 7.3.1
- **배포**: Cloudflare Pages
- **오디오 인프라**: 현재 없음 (신규 구축)

### 1.2 기술 스택

- **오디오 API**: Web Audio API (브라우저 내장, 외부 라이브러리 불필요)
- **음향 합성**: OscillatorNode 기반 pop/click 사운드 생성
- **상태 관리**: React useState/useRef (기존 패턴 유지)
- **영속성**: localStorage (음소거 설정 저장)

### 1.3 의존성

- 외부 라이브러리 의존성 없음
- 외부 오디오 파일 불필요 (Web Audio API로 실시간 합성)
- Web Audio API는 모든 대상 브라우저에서 지원됨

---

## 2. Assumptions (가정)

### 2.1 기술적 가정

- [A-01] 사용자의 브라우저는 Web Audio API를 지원한다 (대상 브라우저 범위 내)
- [A-02] AudioContext는 사용자 제스처(클릭) 이후에 정상적으로 resume된다
- [A-03] OscillatorNode 기반 음향 합성은 모든 대상 브라우저에서 동일하게 동작한다
- [A-04] localStorage는 사용 가능하며, 음소거 설정을 저장할 수 있다

### 2.2 사용자 행동 가정

- [A-05] 대상 사용자는 어린이이므로, 부드럽고 즐거운 pop/click 소리가 적합하다
- [A-06] 사용자는 효과음을 끌 수 있어야 한다 (공공 장소, 조용한 환경)
- [A-07] 빠른 연속 클릭(rapid clicking)이 발생할 수 있다

### 2.3 아키텍처 가정

- [A-08] `fillPath()` 함수가 `boolean`을 반환하며, `true`일 때만 색상이 실제 변경된 것이다
- [A-09] 기존 색칠 이벤트 흐름(ColoringCanvas -> onPathClick -> fillPath)을 수정하지 않고 효과음을 추가할 수 있다

---

## 3. Requirements (요구사항)

### 3.1 Ubiquitous Requirements (항상 적용)

- **[REQ-U-01]** 시스템은 **항상** Web Audio API를 사용하여 효과음을 생성해야 한다. 외부 오디오 파일을 사용하지 않는다.
- **[REQ-U-02]** 시스템은 **항상** 효과음 생성 시 5ms 미만의 지연시간을 유지해야 한다. 색칠 동작에 체감 가능한 지연이 발생하지 않아야 한다.

### 3.2 Event-Driven Requirements (이벤트 기반)

- **[REQ-E-01]** **WHEN** 사용자가 SVG path를 클릭하여 색상이 실제 변경되면 (`fillPath` 반환값 `true`), **THEN** 부드러운 pop/click 효과음이 재생되어야 한다.
- **[REQ-E-02]** **WHEN** 사용자가 SVG path를 클릭했으나 색상이 변경되지 않으면 (`fillPath` 반환값 `false`), **THEN** 효과음이 재생되지 않아야 한다.
- **[REQ-E-03]** **WHEN** 사용자가 음소거 토글 버튼을 클릭하면, **THEN** 음소거 상태가 전환되고 해당 설정이 localStorage에 저장되어야 한다.
- **[REQ-E-04]** **WHEN** 애플리케이션이 로드되면, **THEN** localStorage에서 음소거 설정을 읽어 이전 상태를 복원해야 한다.
- **[REQ-E-05]** **WHEN** iOS Safari에서 사용자가 첫 번째 제스처(터치/클릭)를 수행하면, **THEN** AudioContext가 resume되어 이후 효과음이 정상 재생되어야 한다.

### 3.3 State-Driven Requirements (상태 기반)

- **[REQ-S-01]** **IF** 음소거 상태가 활성화(ON)되어 있으면, **THEN** 모든 효과음 재생이 차단되어야 한다.
- **[REQ-S-02]** **IF** AudioContext 상태가 `suspended`이면, **THEN** 사용자 제스처 시 자동으로 `resume()`을 호출해야 한다.

### 3.4 Unwanted Behavior Requirements (금지 사항)

- **[REQ-N-01]** 시스템은 검은색 윤곽선(outline) path 클릭 시 효과음을 재생**하지 않아야 한다**. (기존 로직에서 검은색 path 클릭은 fillPath에 도달하지 않으므로 자연스럽게 충족)
- **[REQ-N-02]** 시스템은 빠른 연속 클릭 시 오디오 리소스 누수(AudioNode 미해제)가 발생**하지 않아야 한다**.
- **[REQ-N-03]** 시스템은 AudioContext 생성 실패 시 애플리케이션 크래시가 발생**하지 않아야 한다**. 오디오 실패는 조용히 무시되어야 한다.

---

## 4. Specifications (기술 명세)

### 4.1 사운드 합성 명세

| 파라미터         | 값                 | 설명                          |
| ---------------- | ------------------ | ----------------------------- |
| Oscillator 타입  | `sine`             | 부드러운 톤 생성              |
| 시작 주파수      | 800Hz              | pop 소리의 시작 음높이        |
| 종료 주파수      | 400Hz              | 빠른 하강으로 pop 느낌 생성   |
| 주파수 하강 시간 | 0.08초             | 짧은 주파수 sweep             |
| GainNode 시작값  | 0.3                | 적절한 볼륨 (어린이용 앱)     |
| GainNode 종료값  | 0.0                | fade out                      |
| 감쇠 시간        | 0.1초              | 빠른 감쇠로 깔끔한 소리       |
| 총 재생 시간     | ~0.1초             | 짧고 경쾌한 pop sound         |

### 4.2 컴포넌트 구조

```
src/
  hooks/
    useSound.ts          # Web Audio API 커스텀 hook (신규)
  components/
    Controls.tsx         # 음소거 토글 버튼 추가 (수정)
  App.tsx                # useSound 통합, fillPath 래핑 (수정)
```

### 4.3 useSound Hook 인터페이스

```typescript
interface UseSoundReturn {
  playPopSound: () => void;    // pop 효과음 재생
  isMuted: boolean;            // 현재 음소거 상태
  toggleMute: () => void;      // 음소거 토글
}

function useSound(): UseSoundReturn;
```

### 4.4 localStorage 스키마

| 키                      | 타입      | 기본값  | 설명             |
| ----------------------- | --------- | ------- | ---------------- |
| `aec-bg-sound-muted`    | `string`  | `"false"` | 음소거 상태 저장 |

### 4.5 성능 요구사항

| 지표                | 목표값    | 측정 방법                              |
| ------------------- | --------- | -------------------------------------- |
| 효과음 생성 시간    | < 5ms     | `performance.now()` 전후 측정          |
| AudioContext 생성    | 1회       | 애플리케이션 생명주기 동안 단일 인스턴스 |
| 메모리 누수         | 0건       | OscillatorNode는 재생 후 자동 해제     |

### 4.6 브라우저 호환성

| 브라우저           | Web Audio API | AudioContext resume | 비고                    |
| ------------------ | ------------- | ------------------- | ----------------------- |
| Chrome 90+         | 지원          | 자동                |                         |
| Firefox 88+        | 지원          | 자동                |                         |
| Safari 15+ (macOS) | 지원          | 사용자 제스처 필요  |                         |
| Safari (iOS)       | 지원          | 사용자 제스처 필요  | 첫 터치 시 resume 필수  |
| Edge 90+           | 지원          | 자동                | Chromium 기반           |

---

## 5. Traceability (추적성)

| 요구사항 ID | 구현 파일           | 테스트 시나리오       |
| ----------- | ------------------- | --------------------- |
| REQ-U-01    | useSound.ts         | ACC-01, ACC-03        |
| REQ-U-02    | useSound.ts         | ACC-07 (성능)         |
| REQ-E-01    | App.tsx, useSound.ts | ACC-01                |
| REQ-E-02    | App.tsx             | ACC-02                |
| REQ-E-03    | Controls.tsx        | ACC-04                |
| REQ-E-04    | useSound.ts         | ACC-05                |
| REQ-E-05    | useSound.ts         | ACC-06                |
| REQ-S-01    | useSound.ts         | ACC-04                |
| REQ-S-02    | useSound.ts         | ACC-06                |
| REQ-N-01    | (기존 로직)         | ACC-03                |
| REQ-N-02    | useSound.ts         | ACC-07 (성능)         |
| REQ-N-03    | useSound.ts         | ACC-08 (에러 처리)    |
