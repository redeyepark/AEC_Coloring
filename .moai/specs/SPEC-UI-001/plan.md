---
spec_id: SPEC-UI-001
title: 색칠 효과음 기능 - 구현 계획
version: 0.1.0
status: draft
created: 2026-02-11
updated: 2026-02-11
author: JWPARK
---

# SPEC-UI-001: 구현 계획

## 1. 구현 전략 요약

Web Audio API의 OscillatorNode를 활용하여 외부 파일 없이 실시간으로 pop/click 효과음을 합성한다.
`useSound` 커스텀 hook을 생성하고, 기존 `fillPath` 반환값을 기준으로 효과음 재생을 트리거한다.
기존 코드의 구조와 이벤트 흐름을 최대한 보존하면서 최소한의 변경으로 통합한다.

---

## 2. Milestones

### Milestone 1: 사운드 엔진 (Priority High)

**목표**: Web Audio API 기반 효과음 합성 엔진 구현

**신규 파일**: `src/hooks/useSound.ts`

구현 내용:

- AudioContext 싱글턴 생성 및 관리
  - `useRef`로 AudioContext 인스턴스를 컴포넌트 생명주기에 바인딩
  - lazy initialization: 첫 호출 시에만 AudioContext 생성
- `playPopSound()` 함수 구현
  - OscillatorNode 생성 (type: `sine`)
  - 주파수: 800Hz -> 400Hz 하강 (0.08초, `exponentialRampToValueAtTime`)
  - GainNode: 0.3 -> 0.0 감쇠 (0.1초, `exponentialRampToValueAtTime`)
  - OscillatorNode 자동 정리: `stop()` 호출 후 GC에 의해 수거
- 음소거 상태 관리
  - `useState<boolean>` + localStorage 동기화
  - `playPopSound()` 내부에서 음소거 상태 확인 후 early return
- iOS Safari AudioContext resume 처리
  - AudioContext 상태가 `suspended`이면 `resume()` 호출
  - 첫 사용자 제스처 시 자동 unlock

**핵심 코드 구조**:

```typescript
// src/hooks/useSound.ts
export function useSound(): UseSoundReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('aec-bg-sound-muted') === 'true';
  });

  const getAudioContext = useCallback((): AudioContext | null => {
    // lazy init + error handling
  }, []);

  const playPopSound = useCallback(() => {
    if (isMuted) return;
    // OscillatorNode + GainNode 합성
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('aec-bg-sound-muted', String(next));
      return next;
    });
  }, []);

  return { playPopSound, isMuted, toggleMute };
}
```

**관련 요구사항**: REQ-U-01, REQ-U-02, REQ-E-05, REQ-S-02, REQ-N-02, REQ-N-03

---

### Milestone 2: 앱 통합 (Priority High)

**목표**: 기존 색칠 흐름에 효과음 트리거 연결

**수정 파일**: `src/App.tsx`

구현 내용:

- `useSound` hook 호출
- `fillPath` 래핑: `fillPath` 호출 후 반환값이 `true`이면 `playPopSound()` 호출
- 기존 `onPathClick` prop 흐름을 유지하면서 래핑 함수 전달

**변경 접근법**:

```typescript
// App.tsx 내부
const { playPopSound, isMuted, toggleMute } = useSound();

// fillPath를 래핑하는 함수
const handlePathClick = useCallback((pathElement: SVGPathElement) => {
  const colorChanged = fillPath(pathElement);
  if (colorChanged) {
    playPopSound();
  }
}, [fillPath, playPopSound]);

// ColoringCanvas에 래핑된 함수 전달
<ColoringCanvas onPathClick={handlePathClick} ... />
```

**영향 범위**:
- `App.tsx`: `onPathClick`에 전달하는 함수만 변경
- `ColoringCanvas.tsx`: 변경 없음
- `useColoring.ts`: 변경 없음

**관련 요구사항**: REQ-E-01, REQ-E-02, REQ-N-01

---

### Milestone 3: 음소거 UI (Priority High)

**목표**: Controls 컴포넌트에 음소거 토글 버튼 추가

**수정 파일**: `src/components/Controls.tsx`

구현 내용:

- 음소거 토글 버튼 추가
  - 아이콘: 스피커 ON/OFF 상태 (SVG inline 아이콘 또는 텍스트)
  - 위치: 기존 Undo/Redo/Reset/Complete 버튼 영역에 추가
- props 확장: `isMuted: boolean`, `onToggleMute: () => void`
- 버튼 스타일: 기존 Controls 버튼과 일관된 디자인

**Props 변경**:

```typescript
interface ControlsProps {
  // 기존 props...
  isMuted: boolean;
  onToggleMute: () => void;
}
```

**관련 요구사항**: REQ-E-03, REQ-S-01

---

### Milestone 4: 영속성 및 초기화 (Priority Medium)

**목표**: 음소거 설정의 localStorage 저장/복원

구현 내용:

- 이미 Milestone 1의 `useSound` hook에 포함
- localStorage 키: `aec-bg-sound-muted`
- 초기값: `useState` 초기화 함수에서 localStorage 읽기
- 변경 시: `toggleMute` 내부에서 localStorage 저장
- 별도 추가 작업 불필요 (Milestone 1에서 완료)

**관련 요구사항**: REQ-E-03, REQ-E-04

---

### Milestone 5: 크로스 브라우저 호환성 (Priority Medium)

**목표**: iOS Safari 등 제한적 환경에서의 정상 동작 보장

구현 내용:

- AudioContext 생성 시 `window.AudioContext || window.webkitAudioContext` fallback
- `suspended` 상태 감지 및 사용자 제스처 기반 `resume()`
- AudioContext 생성 실패 시 try-catch로 graceful degradation
- 효과음 실패가 애플리케이션 기능에 영향을 주지 않도록 보장

**관련 요구사항**: REQ-E-05, REQ-S-02, REQ-N-03

---

## 3. 파일별 변경 요약

| 파일                         | 작업    | 변경 규모 | 설명                           |
| ---------------------------- | ------- | --------- | ------------------------------ |
| `src/hooks/useSound.ts`      | 신규    | ~80줄     | Web Audio API 커스텀 hook      |
| `src/App.tsx`                | 수정    | ~15줄     | useSound 통합, fillPath 래핑   |
| `src/components/Controls.tsx`| 수정    | ~20줄     | 음소거 토글 버튼 추가          |

**총 변경량**: 약 115줄 (신규 80줄 + 수정 35줄)

---

## 4. 기술적 접근

### 4.1 Web Audio API 선택 근거

| 대안               | 장점                | 단점                                  | 결정    |
| ------------------ | ------------------- | ------------------------------------- | ------- |
| Web Audio API 합성 | 외부 파일 불필요, 번들 크기 영향 없음 | 합성 파라미터 조정 필요               | 채택    |
| HTML5 Audio 태그   | 간단한 구현         | 외부 파일 필요, 네트워크 요청, 지연   | 기각    |
| Howler.js 라이브러리 | 풍부한 API         | 외부 의존성 추가, 번들 크기 증가      | 기각    |

### 4.2 아키텍처 설계 방향

- **Separation of Concerns**: 오디오 로직은 `useSound` hook에 완전 캡슐화
- **기존 코드 무침투**: `ColoringCanvas.tsx`와 `useColoring.ts`는 수정하지 않음
- **Graceful Degradation**: 오디오 실패 시 색칠 기능에 영향 없음
- **단일 AudioContext**: 리소스 효율을 위해 앱 생명주기 동안 단일 인스턴스 유지

---

## 5. 의존성

- **외부 라이브러리**: 없음
- **API 의존성**: Web Audio API (브라우저 내장)
- **파일 의존성**: 없음 (외부 오디오 파일 불필요)
- **다른 SPEC 의존성**: 없음

---

## 6. 리스크 분석

### 리스크 1: iOS Safari AudioContext 제한

- **가능성**: 높음
- **영향**: 첫 클릭 시 소리가 재생되지 않을 수 있음
- **대응**: AudioContext `suspended` 상태 감지 후 자동 `resume()` 호출. 첫 사용자 제스처 시 unlock 처리

### 리스크 2: 빠른 연속 클릭 시 오디오 겹침

- **가능성**: 중간
- **영향**: 소리가 겹쳐서 불쾌할 수 있음
- **대응**: OscillatorNode는 짧은 수명(~0.1초)이므로 자연스럽게 해결. 각 클릭마다 새 OscillatorNode 생성 후 자동 해제

### 리스크 3: AudioContext 생성 실패

- **가능성**: 낮음 (매우 오래된 브라우저에서만)
- **영향**: 효과음이 재생되지 않음
- **대응**: try-catch로 감싸고, 실패 시 조용히 무시. 색칠 기능은 정상 동작 유지

### 리스크 4: Web Audio API 크로스 브라우저 차이

- **가능성**: 낮음
- **영향**: 특정 브라우저에서 소리가 다르게 들릴 수 있음
- **대응**: 단순한 OscillatorNode + GainNode 조합만 사용하여 브라우저 간 차이 최소화

---

## 7. 다음 단계

1. `/moai run SPEC-UI-001` 명령으로 DDD 구현 사이클 시작
2. expert-frontend 에이전트가 useSound.ts 구현
3. 크로스 브라우저 테스트 (특히 iOS Safari)
4. 사용자 피드백 수집 후 사운드 파라미터 미세 조정
