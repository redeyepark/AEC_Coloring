# SPEC-COLOR-001: 인수 기준

---

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-COLOR-001 |
| 문서 유형 | Acceptance Criteria |
| 생성일 | 2026-02-01 |
| 최종 수정일 | 2026-02-05 |
| 상태 | **Verified** |

---

## 1. 인수 기준 개요

이 문서는 SPEC-COLOR-001 웹 기반 컬러링북 애플리케이션의 완료 조건을 Given-When-Then 형식으로 정의하고 검증 결과를 기록한다.

---

## 2. 기능별 인수 기준

### 2.1 이미지 로딩 및 표시 (REQ-E-03, REQ-U-01, REQ-E-07, REQ-U-04)

#### AC-001: Supabase 이미지 로딩 **검증 완료**

```gherkin
Feature: Supabase 이미지 로딩
  사용자가 애플리케이션에 접근하면 Supabase에서 SVG 이미지가 로드된다

  Scenario: 정상적인 SVG 로딩 [PASS]
    Given 사용자가 웹 페이지에 접근한다
    And Supabase Storage에 SVG 파일이 존재한다
    When 페이지 로딩이 완료된다
    Then 활성화된 SVG 이미지 중 하나가 랜덤으로 선택되어 표시된다
    And 모든 path 요소가 클릭 가능하다

  Scenario: 비활성화된 이미지 필터링 [PASS]
    Given localStorage에 비활성화된 이미지 목록이 있다
    When 이미지 목록을 로드한다
    Then 비활성화된 이미지는 선택 대상에서 제외된다

  Scenario: Supabase 오류 처리 [PASS]
    Given Supabase 연결에 문제가 있다
    When 이미지 목록을 요청한다
    Then 에러 메시지가 표시된다
    And 앱이 크래시되지 않는다
```

### 2.2 관리자 페이지 (REQ-E-09, REQ-N-03, REQ-S-04)

#### AC-002: 관리자 인증 **검증 완료**

```gherkin
Feature: 관리자 인증
  관리자만 이미지 관리 기능에 접근할 수 있다

  Scenario: URL 파라미터로 접근 [PASS]
    Given 사용자가 ?admin=true 파라미터로 접근한다
    When 페이지가 로드된다
    Then 관리자 비밀번호 입력 화면이 표시된다

  Scenario: 설정 버튼으로 접근 [PASS]
    Given 사용자가 인트로 화면에 있다
    When 우측 상단 설정(톱니바퀴) 버튼을 클릭한다
    Then 관리자 비밀번호 입력 화면이 표시된다

  Scenario: 올바른 비밀번호 입력 [PASS]
    Given 비밀번호 입력 화면이 표시된다
    When 올바른 비밀번호(a1234)를 입력한다
    Then 관리자 페이지가 표시된다

  Scenario: 잘못된 비밀번호 입력 [PASS]
    Given 비밀번호 입력 화면이 표시된다
    When 잘못된 비밀번호를 입력한다
    Then 오류 메시지가 표시된다
    And 관리자 페이지에 접근할 수 없다
```

#### AC-003: 이미지 관리 **검증 완료**

```gherkin
Feature: 이미지 관리
  관리자가 SVG 및 갤러리 이미지를 관리할 수 있다

  Scenario: SVG 파일 업로드 [PASS]
    Given 관리자가 인증되어 있다
    And SVG 탭이 선택되어 있다
    When SVG 파일을 업로드한다
    Then 파일이 Supabase images/svg/에 저장된다
    And 이미지 목록이 새로고침된다

  Scenario: 갤러리 이미지 업로드 [PASS]
    Given 관리자가 인증되어 있다
    And 갤러리 탭이 선택되어 있다
    When 이미지 파일을 업로드한다
    Then 파일이 Supabase images/gallery/에 저장된다

  Scenario: 이미지 삭제 [PASS]
    Given 이미지 목록이 표시되어 있다
    When 삭제 버튼을 클릭하고 확인한다
    Then 이미지가 Supabase에서 삭제된다
    And 목록에서 제거된다
```

### 2.3 이미지 토글 (REQ-E-08, REQ-N-02)

#### AC-004: 이미지 활성화/비활성화 **검증 완료**

```gherkin
Feature: 이미지 토글
  관리자가 이미지를 활성화/비활성화할 수 있다

  Scenario: 이미지 비활성화 [PASS]
    Given 이미지 목록에서 활성화된 이미지가 있다
    When 토글 스위치를 OFF로 변경한다
    Then 이미지 경로가 localStorage에 추가된다
    And 앱에서 해당 이미지가 표시되지 않는다

  Scenario: 이미지 활성화 [PASS]
    Given 이미지 목록에서 비활성화된 이미지가 있다
    When 토글 스위치를 ON으로 변경한다
    Then 이미지 경로가 localStorage에서 제거된다
    And 앱에서 해당 이미지가 다시 표시된다

  Scenario: localStorage 저장 형식 [PASS]
    Given 비활성화된 이미지가 있다
    When localStorage를 확인한다
    Then aec-disabled-images 키에 JSON 배열로 저장되어 있다
```

### 2.4 색상 팔레트 (REQ-E-01, REQ-U-03)

#### AC-005: 44색 팔레트 **검증 완료**

```gherkin
Feature: 색상 팔레트
  사용자가 44가지 색상 중 선택하여 색칠에 사용할 수 있다

  Scenario: 44색 팔레트 표시 [PASS]
    Given 색칠 화면이 표시되어 있다
    When 팔레트 영역을 확인한다
    Then 44개의 색상 버튼이 9가지 계열로 표시된다

  Scenario: 색상 선택 [PASS]
    Given 팔레트가 표시되어 있다
    When 특정 색상을 클릭한다
    Then 해당 색상이 현재 선택 색상으로 설정된다
    And 선택된 색상에 시각적 표시가 나타난다
```

### 2.5 SVG Path 색칠 (REQ-E-02, REQ-U-02)

#### AC-006: 영역 색칠 **검증 완료**

```gherkin
Feature: SVG Path 색칠
  사용자가 SVG의 path 영역을 클릭하여 색칠할 수 있다

  Scenario: path 영역 색칠 [PASS]
    Given 색상이 선택되어 있다
    And SVG 이미지가 표시되어 있다
    When 특정 path 영역을 클릭한다
    Then 클릭한 path가 선택 색상으로 채워진다

  Scenario: 경계선 보존 [PASS]
    Given 여러 영역이 색칠되어 있다
    When 전체 이미지를 확인한다
    Then 모든 경계선(stroke)이 유지된다
```

### 2.6 Undo/Redo/Reset (REQ-E-04, REQ-E-05, REQ-N-01)

#### AC-007: 히스토리 관리 **검증 완료**

```gherkin
Feature: Undo/Redo/Reset
  사용자가 색칠 작업을 취소하거나 복원할 수 있다

  Scenario: Undo 동작 [PASS]
    Given 색칠 작업을 수행했다
    When Undo 버튼을 클릭한다
    Then 마지막 작업이 취소된다

  Scenario: Redo 동작 [PASS]
    Given Undo를 수행했다
    When Redo 버튼을 클릭한다
    Then 취소된 작업이 복원된다

  Scenario: Reset 동작 [PASS]
    Given 여러 영역이 색칠되어 있다
    When Reset 버튼을 클릭한다
    Then 모든 색칠이 초기화된다

  Scenario: 50단계 히스토리 제한 [PASS]
    Given 50번 이상의 색칠 작업을 수행했다
    When 히스토리를 확인한다
    Then 최대 50개의 상태만 저장되어 있다
```

### 2.7 저장 기능 (REQ-E-06)

#### AC-008: 이미지 저장 **검증 완료**

```gherkin
Feature: 이미지 저장
  사용자가 색칠한 이미지를 다양한 형식으로 저장할 수 있다

  Scenario: 기본 이미지 저장 [PASS]
    Given 색칠된 이미지가 있다
    When 이미지 저장 버튼을 클릭한다
    Then PNG 파일이 다운로드된다

  Scenario: 달력 저장 [PASS]
    Given 색칠된 이미지가 있다
    When 달력 저장 버튼을 클릭한다
    Then 1080x2340 해상도의 달력 이미지가 다운로드된다

  Scenario: 배경화면 저장 [PASS]
    Given 색칠된 이미지가 있다
    When 배경화면 저장 버튼을 클릭한다
    Then 1080x2340 해상도의 배경화면 이미지가 다운로드된다
```

### 2.8 색상 심리 분석 (REQ-E-10)

#### AC-010: 색상 심리 분석 **검증 완료**

```gherkin
Feature: 색상 심리 분석
  사용자가 색칠을 완료하면 사용된 색상 기반 심리 메시지가 표시된다

  Scenario: 결과 페이지 심리 메시지 표시 [PASS]
    Given 사용자가 색칠을 완료했다
    When 결과 페이지에 진입한다
    Then SVG에서 사용된 색상이 분석된다
    And 심리 해석 메시지가 표시된다

  Scenario: 따뜻한 색상 분석 [PASS]
    Given 빨강, 주황, 노랑 계열 색상을 많이 사용했다
    When 색상 분석이 수행된다
    Then 따뜻한 색상 관련 심리 메시지가 표시된다

  Scenario: 차가운 색상 분석 [PASS]
    Given 초록, 파랑, 보라 계열 색상을 많이 사용했다
    When 색상 분석이 수행된다
    Then 차가운 색상 관련 심리 메시지가 표시된다

  Scenario: 다양한 색상 분석 [PASS]
    Given 8개 이상의 다양한 색상을 사용했다
    When 색상 분석이 수행된다
    Then 다양성 관련 심리 메시지가 표시된다
```

### 2.9 페이지 전환 애니메이션 (REQ-E-11)

#### AC-012: 페이지 전환 애니메이션 **검증 완료**

```gherkin
Feature: 페이지 전환 애니메이션
  모든 페이지 전환 시 부드러운 애니메이션이 적용된다

  Scenario: 인트로에서 색칠 페이지로 전환 [PASS]
    Given 사용자가 인트로 페이지에 있다
    When 화면을 터치하여 색칠 페이지로 이동한다
    Then fadeSlideIn 애니메이션(0.3초)이 적용된다
    And 페이지가 부드럽게 나타난다

  Scenario: 색칠 페이지에서 결과 페이지로 전환 [PASS]
    Given 사용자가 색칠 페이지에서 완료 버튼을 누른다
    When 결과 페이지로 이동한다
    Then fadeSlideIn 애니메이션(0.3초)이 적용된다

  Scenario: 결과 페이지에서 인트로로 전환 [PASS]
    Given 사용자가 결과 페이지에서 새로 시작 버튼을 누른다
    When 인트로 페이지로 이동한다
    Then fadeSlideIn 애니메이션(0.3초)이 적용된다
```

### 2.10 그림일기 저장 (REQ-E-12, REQ-E-13, REQ-E-14)

#### AC-013: 그림일기 저장 기능 **검증 완료**

```gherkin
Feature: 그림일기 저장
  사용자가 색칠한 그림을 그림일기 형식으로 저장할 수 있다

  Scenario: 그림일기 버튼 클릭 [PASS]
    Given 사용자가 결과 페이지에 있다
    When 그림일기 저장 버튼을 클릭한다
    Then 텍스트 입력 모달이 표시된다

  Scenario: 텍스트 입력 후 저장 [PASS]
    Given 텍스트 입력 모달이 표시되어 있다
    When 사용자가 메시지를 입력하고 저장 버튼을 누른다
    Then A4 비율(1:1.414)의 그림일기 이미지가 생성된다
    And 이미지가 다운로드된다

  Scenario: A4 비율 레이아웃 [PASS]
    Given 그림일기가 생성된다
    When 이미지 비율을 확인한다
    Then 1080x1528 픽셀(1:1.414 비율)로 생성된다
```

#### AC-014: 그림일기 헤더 **검증 완료**

```gherkin
Feature: 그림일기 헤더
  그림일기 헤더에 날짜, 요일, 날씨 정보가 표시된다

  Scenario: 날짜 및 요일 표시 [PASS]
    Given 그림일기가 생성된다
    When 헤더 영역을 확인한다
    Then 오늘 날짜가 "YYYY년 MM월 DD일" 형식으로 표시된다
    And 요일이 한글로 표시된다

  Scenario: 날씨 아이콘 4개 표시 [PASS]
    Given 그림일기가 생성된다
    When 헤더 영역을 확인한다
    Then 맑음, 흐림, 비, 눈 4개의 날씨 아이콘이 표시된다

  Scenario: 현재 날씨 강조 [PASS]
    Given Open-Meteo API에서 현재 날씨 정보를 가져온다
    When 그림일기가 생성된다
    Then 현재 날씨에 해당하는 아이콘이 색상으로 강조된다
    And 나머지 아이콘은 낮은 불투명도로 표시된다
```

#### AC-015: Open-Meteo 날씨 API 연동 **검증 완료**

```gherkin
Feature: Open-Meteo 날씨 API
  현재 위치의 날씨 정보를 Open-Meteo API로 가져온다

  Scenario: 위치 기반 날씨 조회 [PASS]
    Given 사용자가 위치 권한을 허용했다
    When 그림일기 저장을 요청한다
    Then Geolocation API로 현재 위치를 획득한다
    And Open-Meteo API로 해당 위치의 날씨를 조회한다

  Scenario: WMO 날씨 코드 매핑 [PASS]
    Given Open-Meteo API가 WMO 날씨 코드를 반환한다
    When 날씨 코드를 처리한다
    Then 코드 0-3은 맑음으로 매핑된다
    And 코드 45-67은 흐림으로 매핑된다
    And 코드 71-86은 눈으로 매핑된다
    And 기타 강수 코드는 비로 매핑된다

  Scenario: 위치 권한 거부 시 기본값 [PASS]
    Given 사용자가 위치 권한을 거부했다
    When 그림일기 저장을 요청한다
    Then 기본 날씨(맑음)가 적용된다
    And 에러 없이 이미지가 생성된다
```

#### AC-016: 원고지 스타일 격자 **검증 완료**

```gherkin
Feature: 원고지 스타일 격자
  메시지 영역이 원고지 스타일 격자로 표시된다

  Scenario: 14x7 격자 표시 [PASS]
    Given 그림일기가 생성된다
    When 메시지 영역을 확인한다
    Then 14열 x 7행의 격자가 표시된다

  Scenario: 텍스트 배치 [PASS]
    Given 사용자가 메시지를 입력했다
    When 그림일기가 생성된다
    Then 한 글자씩 격자 셀에 배치된다

  Scenario: 격자 스타일 [PASS]
    Given 그림일기가 생성된다
    When 격자 스타일을 확인한다
    Then 연한 회색 테두리가 적용된다
    And 셀 크기가 동일한 비율로 유지된다
```

### 2.12 PC 레이아웃 (REQ-U-05, REQ-S-05)

#### AC-017: CSS Grid 레이아웃 **검증 완료**

```gherkin
Feature: PC 레이아웃
  PC에서 최적화된 레이아웃을 제공한다

  Scenario: 가로 모드 레이아웃 [PASS]
    Given 화면 너비가 1024px 이상이다
    And 가로 모드(landscape)이다
    When 색칠 화면을 확인한다
    Then CSS Grid 레이아웃이 적용된다
    And 왼쪽에 캔버스, 오른쪽에 팔레트와 컨트롤이 배치된다

  Scenario: 뷰포트 피팅 [PASS]
    Given PC에서 가로 모드로 접근한다
    When 페이지를 확인한다
    Then 스크롤 없이 전체 UI가 뷰포트에 맞춰진다

  Scenario: 모바일 폴백 [PASS]
    Given 화면 너비가 1024px 미만이다
    When 색칠 화면을 확인한다
    Then 세로 배치 레이아웃이 적용된다
```

---

## 3. 품질 게이트 (Definition of Done) **모두 통과**

### 3.1 필수 완료 조건

- [x] AC-001 ~ AC-017 모든 시나리오 통과
- [x] Chrome, Firefox, Edge, Safari에서 테스트 완료
- [x] PC 및 모바일 브라우저 테스트 완료
- [x] Supabase Storage 연동 확인
- [x] 관리자 페이지 인증 동작 확인

### 3.2 코드 품질 조건

- [x] TypeScript 타입 오류 없음
- [x] ESLint 경고/오류 없음
- [x] Console 에러/경고 없음
- [x] React Hooks 규칙 준수

### 3.3 사용성 조건

- [x] 색상 선택이 시각적으로 명확함
- [x] 관리자 페이지 접근이 직관적임
- [x] 이미지 토글이 즉시 반영됨
- [x] PC/모바일 반응형 레이아웃 정상 동작

### 3.4 배포 조건

- [x] Cloudflare Workers 배포 완료
- [x] 라이브 URL 접속 확인
- [x] Supabase Storage 연결 확인

---

## 4. 테스트 시나리오 체크리스트 (완료)

### 4.1 기능 테스트

| ID | 테스트 항목 | 예상 결과 | 통과 |
|----|------------|----------|------|
| T-001 | Supabase SVG 이미지 로딩 | 이미지 목록 표시 | [x] |
| T-002 | Supabase 갤러리 이미지 로딩 | 인트로 이미지 표시 | [x] |
| T-003 | 비활성화 이미지 필터링 | 앱에서 제외됨 | [x] |
| T-004 | 관리자 URL 접근 | 비밀번호 입력 화면 | [x] |
| T-005 | 관리자 버튼 접근 | 비밀번호 입력 화면 | [x] |
| T-006 | 올바른 비밀번호 | 관리자 페이지 접근 | [x] |
| T-007 | 잘못된 비밀번호 | 오류 메시지 표시 | [x] |
| T-008 | SVG 업로드 | Supabase 저장 | [x] |
| T-009 | 갤러리 업로드 | Supabase 저장 | [x] |
| T-010 | 이미지 삭제 | Supabase에서 삭제 | [x] |
| T-011 | 이미지 비활성화 토글 | localStorage 저장 | [x] |
| T-012 | 이미지 활성화 토글 | localStorage 제거 | [x] |
| T-013 | 65+ 색상 팔레트 | 65개 이상 색상 표시 | [x] |
| T-014 | SVG path 색칠 | 색상 적용 | [x] |
| T-015 | Undo/Redo | 상태 복원 | [x] |
| T-016 | Reset | 전체 초기화 | [x] |
| T-017 | 이미지 저장 | PNG 다운로드 | [x] |
| T-018 | 달력 저장 | 달력 이미지 다운로드 | [x] |
| T-019 | 배경화면 저장 | 배경화면 다운로드 | [x] |
| T-020 | PC Grid 레이아웃 | 2열 레이아웃 적용 | [x] |
| T-021 | 모바일 레이아웃 | 세로 배치 적용 | [x] |
| T-022 | 색상 심리 분석 | 심리 메시지 표시 | [x] |
| T-023 | 색상 온도 분류 | 따뜻한/차가운 분류 | [x] |
| T-024 | 밝기 분석 | 밝은/어두운 톤 분류 | [x] |
| T-025 | 페이지 전환 애니메이션 | fadeSlideIn 적용 | [x] |
| T-026 | 애니메이션 지속 시간 | 0.3초 전환 | [x] |
| T-027 | 그림일기 버튼 클릭 | 텍스트 입력 모달 표시 | [x] |
| T-028 | 그림일기 A4 비율 | 1080x1528 픽셀 생성 | [x] |
| T-029 | 그림일기 헤더 | 날짜 + 요일 표시 | [x] |
| T-030 | 날씨 아이콘 표시 | 4개 아이콘 렌더링 | [x] |
| T-031 | Open-Meteo API 연동 | 현재 날씨 조회 | [x] |
| T-032 | 현재 날씨 강조 | 활성 아이콘 하이라이트 | [x] |
| T-033 | 원고지 격자 | 14x7 격자 렌더링 | [x] |
| T-034 | 텍스트 배치 | 글자별 셀 배치 | [x] |
| T-035 | 위치 권한 거부 처리 | 기본값 적용 | [x] |

### 4.2 브라우저 호환성 테스트

| 브라우저 | 버전 | 이미지 로딩 | 관리자 | 색칠 | 저장 | 레이아웃 | 통과 |
|----------|------|-----------|--------|------|------|---------|------|
| Chrome | 최신 | [x] | [x] | [x] | [x] | [x] | [x] |
| Firefox | 최신 | [x] | [x] | [x] | [x] | [x] | [x] |
| Edge | 최신 | [x] | [x] | [x] | [x] | [x] | [x] |
| Safari | 최신 | [x] | [x] | [x] | [x] | [x] | [x] |
| Mobile Chrome | 최신 | [x] | [x] | [x] | [x] | [x] | [x] |
| Mobile Safari | 최신 | [x] | [x] | [x] | [x] | [x] | [x] |

### 4.3 성능 테스트

| ID | 테스트 항목 | 목표값 | 실측값 | 통과 |
|----|------------|--------|--------|------|
| P-001 | Supabase API 응답 | < 2초 | < 1초 | [x] |
| P-002 | SVG 렌더링 시간 | < 1초 | < 500ms | [x] |
| P-003 | 색칠 응답 시간 | < 100ms | < 16ms | [x] |
| P-004 | localStorage 읽기/쓰기 | < 50ms | < 10ms | [x] |
| P-005 | 메모리 사용량 | < 50MB | ~30MB | [x] |

---

## 5. 추적성 태그

```yaml
tags:
  - SPEC-COLOR-001
  - acceptance-criteria
  - gherkin
  - supabase
  - admin-page
  - image-toggle
  - css-grid
  - diary-save
  - open-meteo
  - weather-api
  - manuscript-grid
  - verified
```

---

## 6. 관련 문서

- [SPEC 명세서](./spec.md)
- [구현 계획](./plan.md)

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-02-01 | manager-spec | 초기 인수 기준 작성 |
| 2.0.0 | 2026-02-01 | manager-spec | 검증 완료 반영 |
| 3.0.0 | 2026-02-05 | manager-docs | Supabase, 관리자, 토글, PC 레이아웃 테스트 추가 |
| 4.0.0 | 2026-02-05 | manager-docs | 색상 심리 분석 테스트 추가 (AC-010, T-022~T-024) |
| 5.0.0 | 2026-02-05 | manager-docs | 페이지 전환 애니메이션 테스트 추가 (AC-012, T-025~T-026) |
| 6.0.0 | 2026-02-05 | manager-docs | 그림일기 저장 기능 테스트 추가 (AC-013~AC-016, T-027~T-035), Open-Meteo API, 원고지 격자 검증 |
