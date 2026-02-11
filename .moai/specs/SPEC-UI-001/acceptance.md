---
spec_id: SPEC-UI-001
title: 색칠 효과음 기능 - 인수 기준
version: 0.1.0
status: draft
created: 2026-02-11
updated: 2026-02-11
author: JWPARK
---

# SPEC-UI-001: 인수 기준 (Acceptance Criteria)

## 테스트 시나리오

---

### ACC-01: 색칠 시 효과음 재생

**관련 요구사항**: REQ-E-01, REQ-U-01

```gherkin
Feature: 색칠 효과음 재생

  Scenario: 새로운 색상으로 path를 색칠하면 pop 효과음이 재생된다
    Given 사용자가 색칠 앱에 접속하여 SVG 이미지가 로드되어 있다
    And 팔레트에서 빨간색이 선택되어 있다
    And 음소거 상태가 OFF이다
    When 사용자가 색칠되지 않은 흰색 SVG path를 클릭한다
    Then fillPath가 true를 반환한다
    And 부드러운 pop/click 효과음이 재생된다
    And 효과음은 약 0.1초 내에 종료된다

  Scenario: 다른 색상으로 이미 색칠된 path를 다시 색칠하면 효과음이 재생된다
    Given 빨간색으로 색칠된 SVG path가 존재한다
    And 팔레트에서 파란색이 선택되어 있다
    When 사용자가 빨간색 path를 클릭한다
    Then fillPath가 true를 반환한다 (색상이 변경됨)
    And pop 효과음이 재생된다
```

---

### ACC-02: 같은 색상 클릭 시 효과음 미재생

**관련 요구사항**: REQ-E-02

```gherkin
Feature: 색상 미변경 시 효과음 없음

  Scenario: 이미 같은 색상으로 칠해진 path를 클릭하면 효과음이 재생되지 않는다
    Given 빨간색으로 색칠된 SVG path가 존재한다
    And 팔레트에서 빨간색이 선택되어 있다
    When 사용자가 해당 빨간색 path를 클릭한다
    Then fillPath가 false를 반환한다 (색상 변경 없음)
    And 효과음이 재생되지 않는다
```

---

### ACC-03: 검은색 경로 클릭 시 효과음 미재생

**관련 요구사항**: REQ-N-01

```gherkin
Feature: 윤곽선 클릭 시 효과음 없음

  Scenario: SVG의 검은색 윤곽선(outline) path를 클릭하면 효과음이 재생되지 않는다
    Given 사용자가 색칠 앱에 접속하여 SVG 이미지가 로드되어 있다
    And 팔레트에서 어떤 색상이든 선택되어 있다
    When 사용자가 검은색 윤곽선 path를 클릭한다
    Then ColoringCanvas.handleClick에서 검은색 path를 필터링한다
    And fillPath가 호출되지 않는다
    And 효과음이 재생되지 않는다
```

---

### ACC-04: 음소거 토글 ON/OFF

**관련 요구사항**: REQ-E-03, REQ-S-01

```gherkin
Feature: 음소거 토글 기능

  Scenario: 음소거 버튼을 클릭하면 효과음이 꺼진다
    Given 음소거 상태가 OFF이다 (스피커 아이콘 표시)
    When 사용자가 음소거 토글 버튼을 클릭한다
    Then 음소거 상태가 ON으로 변경된다
    And 버튼 아이콘이 음소거 상태로 변경된다
    And localStorage에 'aec-bg-sound-muted' 값이 'true'로 저장된다

  Scenario: 음소거 상태에서 색칠하면 효과음이 재생되지 않는다
    Given 음소거 상태가 ON이다
    And 팔레트에서 색상이 선택되어 있다
    When 사용자가 SVG path를 클릭하여 색상이 변경된다
    Then fillPath가 true를 반환한다
    And 효과음이 재생되지 않는다 (음소거 활성화)

  Scenario: 음소거를 해제하면 효과음이 다시 재생된다
    Given 음소거 상태가 ON이다
    When 사용자가 음소거 토글 버튼을 클릭한다
    Then 음소거 상태가 OFF로 변경된다
    And 버튼 아이콘이 스피커 활성 상태로 변경된다
    And localStorage에 'aec-bg-sound-muted' 값이 'false'로 저장된다
    When 사용자가 SVG path를 클릭하여 색상이 변경된다
    Then 효과음이 정상적으로 재생된다
```

---

### ACC-05: 음소거 상태 새로고침 후 유지

**관련 요구사항**: REQ-E-04

```gherkin
Feature: 음소거 상태 영속성

  Scenario: 음소거 상태가 페이지 새로고침 후에도 유지된다
    Given 사용자가 음소거 상태를 ON으로 설정했다
    And localStorage에 'aec-bg-sound-muted'가 'true'로 저장되어 있다
    When 사용자가 페이지를 새로고침한다
    Then 음소거 상태가 ON으로 복원된다
    And 음소거 버튼이 음소거 아이콘을 표시한다
    And 색칠 시 효과음이 재생되지 않는다

  Scenario: 음소거 해제 상태가 페이지 새로고침 후에도 유지된다
    Given 사용자가 음소거 상태를 OFF로 설정했다
    And localStorage에 'aec-bg-sound-muted'가 'false'로 저장되어 있다
    When 사용자가 페이지를 새로고침한다
    Then 음소거 상태가 OFF로 복원된다
    And 색칠 시 효과음이 정상 재생된다

  Scenario: localStorage에 값이 없을 때 기본값은 음소거 해제이다
    Given localStorage에 'aec-bg-sound-muted' 키가 존재하지 않는다
    When 사용자가 처음 앱에 접속한다
    Then 음소거 상태가 OFF (효과음 활성)로 초기화된다
```

---

### ACC-06: iOS Safari에서 첫 제스처 후 정상 재생

**관련 요구사항**: REQ-E-05, REQ-S-02

```gherkin
Feature: iOS Safari AudioContext 호환성

  Scenario: iOS Safari에서 첫 번째 터치 제스처 후 효과음이 정상 재생된다
    Given 사용자가 iOS Safari에서 앱에 접속했다
    And AudioContext 상태가 'suspended'이다
    When 사용자가 SVG path를 처음 클릭(터치)한다
    Then AudioContext.resume()가 호출된다
    And AudioContext 상태가 'running'으로 변경된다
    And 첫 번째 클릭부터 효과음이 재생된다

  Scenario: AudioContext가 이미 running 상태이면 resume를 호출하지 않는다
    Given AudioContext 상태가 이미 'running'이다
    When 사용자가 SVG path를 클릭한다
    Then AudioContext.resume()가 호출되지 않는다
    And 효과음이 즉시 재생된다
```

---

### ACC-07: 성능 기준

**관련 요구사항**: REQ-U-02, REQ-N-02

```gherkin
Feature: 효과음 성능

  Scenario: 효과음 생성이 5ms 미만으로 완료된다
    Given AudioContext가 정상 초기화되어 있다
    When playPopSound()가 호출된다
    Then OscillatorNode 생성부터 start() 호출까지 5ms 미만이어야 한다
    And 색칠 동작에 체감 가능한 지연이 없어야 한다

  Scenario: 빠른 연속 클릭 시 오디오 리소스 누수가 없다
    Given 사용자가 앱에서 색칠 중이다
    When 사용자가 10회 연속으로 빠르게 다른 path를 클릭한다
    Then 각 클릭마다 새 OscillatorNode가 생성된다
    And 이전 OscillatorNode는 재생 완료 후 자동 해제된다
    And 메모리 사용량이 비정상적으로 증가하지 않는다

  Scenario: AudioContext는 앱 생명주기 동안 1개만 존재한다
    Given 앱이 로드되어 있다
    When 여러 번 색칠 동작을 수행한다
    Then AudioContext 인스턴스는 항상 1개만 존재한다
```

---

### ACC-08: 에러 처리

**관련 요구사항**: REQ-N-03

```gherkin
Feature: 오디오 에러 처리

  Scenario: AudioContext 생성 실패 시 앱이 정상 동작한다
    Given 브라우저가 Web Audio API를 지원하지 않는다
    When 앱이 로드된다
    Then AudioContext 생성이 실패하더라도 앱이 크래시하지 않는다
    And 색칠 기능이 효과음 없이 정상 동작한다
    And 음소거 버튼이 표시되지만, 토글해도 오류가 발생하지 않는다

  Scenario: 효과음 재생 중 오류가 발생해도 색칠은 완료된다
    Given AudioContext가 초기화되어 있다
    When playPopSound() 실행 중 예외가 발생한다
    Then 예외가 catch되어 조용히 무시된다
    And fillPath의 색칠 결과는 정상적으로 반영된다
    And 콘솔에 에러 로그가 출력되지 않는다 (사용자 경험 보호)
```

---

## Edge Cases (엣지 케이스)

### EC-01: 매우 빠른 더블 클릭

```gherkin
  Scenario: 같은 path를 빠르게 두 번 클릭한다
    Given 흰색 SVG path가 존재한다
    And 빨간색이 선택되어 있다
    When 사용자가 해당 path를 50ms 간격으로 두 번 클릭한다
    Then 첫 번째 클릭: fillPath true -> 효과음 재생
    And 두 번째 클릭: fillPath false (이미 같은 색) -> 효과음 미재생
```

### EC-02: 브라우저 탭이 비활성 상태일 때

```gherkin
  Scenario: 비활성 탭에서 다시 돌아왔을 때
    Given 사용자가 앱 탭을 비활성화했다가 다시 활성화한다
    When 사용자가 SVG path를 클릭하여 색칠한다
    Then AudioContext가 필요하면 자동으로 resume된다
    And 효과음이 정상적으로 재생된다
```

### EC-03: localStorage 접근 불가

```gherkin
  Scenario: 프라이빗 브라우징 등으로 localStorage가 사용 불가할 때
    Given localStorage.getItem이 예외를 발생시킨다
    When 앱이 로드된다
    Then 음소거 상태가 기본값(OFF)으로 설정된다
    And 토글 시 localStorage 저장 실패가 조용히 무시된다
    And 효과음 기능은 정상 동작한다 (세션 내에서만)
```

---

## Quality Gate (품질 게이트)

### Definition of Done

- [ ] `useSound.ts` hook이 구현되고 AudioContext를 올바르게 관리한다
- [ ] 색상이 변경될 때만 (`fillPath` 반환값 `true`) 효과음이 재생된다
- [ ] 음소거 토글 버튼이 Controls에 추가되고 정상 동작한다
- [ ] 음소거 상태가 localStorage에 저장/복원된다
- [ ] iOS Safari에서 첫 제스처 후 효과음이 정상 재생된다
- [ ] AudioContext 생성 실패 시 앱이 크래시하지 않는다
- [ ] 효과음 생성 시간이 5ms 미만이다
- [ ] 빠른 연속 클릭 시 메모리 누수가 없다
- [ ] TypeScript 컴파일 에러 0개
- [ ] 기존 색칠 기능에 regression이 없다

### 검증 방법

| 항목              | 검증 방법                                              |
| ----------------- | ------------------------------------------------------ |
| 효과음 재생       | 수동 테스트: 색칠 시 소리 확인                         |
| 효과음 미재생     | 수동 테스트: 같은 색/검은색 클릭 시 무음 확인          |
| 음소거 토글       | 수동 테스트: 버튼 클릭 후 상태 변경 확인               |
| localStorage 영속 | 수동 테스트: 새로고침 후 음소거 상태 유지 확인          |
| iOS Safari        | 실기기 테스트: iPhone에서 첫 터치 후 소리 재생 확인     |
| 성능              | `performance.now()` 측정 또는 DevTools Performance 탭  |
| 메모리 누수       | DevTools Memory 탭에서 반복 클릭 후 힙 스냅샷 비교     |
| 에러 처리         | DevTools에서 AudioContext mock 제거 후 정상 동작 확인   |
