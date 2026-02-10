# SPEC-COLOR-002: 인수 기준

---

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-COLOR-002 |
| 제목 | 갤러리 이미지 SVG 변환 기능 |
| 생성일 | 2026-02-10 |
| 상태 | Planned |

---

## 1. 인수 테스트 시나리오

### 1.1 변환 탭 접근 (REQ-E-01)

**Scenario: 관리자가 변환 탭에 접근한다**

```gherkin
Given 관리자가 AdminPage에 인증된 상태
When "이미지 변환" 탭을 클릭하면
Then 갤러리 이미지 목록이 썸네일 그리드로 표시된다
And 지원 형식(JPEG, PNG, BMP, TIFF)의 이미지만 표시된다
And 변환 옵션 패널이 기본값(kColors: 6)으로 표시된다
```

---

### 1.2 이미지 선택 (REQ-E-02, REQ-S-01)

**Scenario: 관리자가 변환할 이미지를 선택한다**

```gherkin
Given 변환 탭에 갤러리 이미지가 표시된 상태
When 이미지를 클릭하면
Then 해당 이미지가 선택 상태로 강조 표시된다
And 변환 버튼이 활성화된다
```

**Scenario: 이미지가 선택되지 않은 상태에서 변환 시도**

```gherkin
Given 변환 탭에서 이미지가 선택되지 않은 상태
Then 변환 버튼이 비활성화 상태로 표시된다
And 버튼 클릭이 불가능하다
```

---

### 1.3 변환 옵션 설정 (REQ-E-08, REQ-U-02, REQ-S-04)

**Scenario: 관리자가 색상 수를 조절한다**

```gherkin
Given 변환 탭에서 이미지가 선택된 상태
When kColors 슬라이더를 8로 조절하면
Then 슬라이더 옆에 "8"이 실시간으로 표시된다
And 변환 버튼이 활성 상태를 유지한다
```

**Scenario: 유효하지 않은 옵션 값 입력**

```gherkin
Given 변환 옵션 패널이 표시된 상태
When kColors 값이 2 미만 또는 16 초과로 설정되면
Then 경고 메시지가 표시된다
And 변환 버튼이 비활성화된다
```

---

### 1.4 변환 실행 (REQ-E-03, REQ-S-02)

**Scenario: 관리자가 이미지 변환을 실행한다**

```gherkin
Given 갤러리 이미지가 선택되고 변환 옵션이 유효한 상태
When "변환 시작" 버튼을 클릭하면
Then 로딩 인디케이터가 표시된다
And 변환 버튼이 비활성화되어 중복 클릭이 방지된다
And 이미지가 Canvas API로 디코딩되어 convertPixels로 전달된다
```

---

### 1.5 변환 결과 표시 (REQ-E-04, REQ-S-03, REQ-U-03)

**Scenario: 변환이 성공적으로 완료된다**

```gherkin
Given 이미지 변환이 진행 중인 상태
When 변환이 완료되면
Then SVG 미리보기가 표시된다
And 추출된 색상 팔레트(hex 코드 + 비율)가 표시된다
And 처리 시간과 색상 수 메타데이터가 표시된다
And "SVG 저장" 버튼이 활성화된다
```

---

### 1.6 SVG 저장 (REQ-E-05, REQ-E-06)

**Scenario: 변환된 SVG를 Supabase에 저장한다**

```gherkin
Given 변환된 SVG 미리보기가 표시된 상태
When "SVG 저장" 버튼을 클릭하면
Then SVG 파일이 Supabase Storage의 svg/ 폴더에 업로드된다
And 파일명은 "{timestamp}_converted_{originalName}.svg" 형식이다
And 성공 메시지가 표시된다
```

---

### 1.7 에러 처리 (REQ-E-07)

**Scenario: 이미지 fetch 실패**

```gherkin
Given 변환 탭에서 이미지를 선택하고 변환을 시작한 상태
When 이미지 다운로드에 실패하면
Then "이미지를 불러올 수 없습니다." 에러 메시지가 표시된다
And 로딩 인디케이터가 숨겨진다
And 다른 이미지를 선택할 수 있다
```

**Scenario: 변환 실패**

```gherkin
Given 이미지 디코딩이 완료된 상태
When convertPixels 변환에 실패하면
Then "SVG 변환에 실패했습니다." 에러 메시지가 표시된다
And 로딩 인디케이터가 숨겨진다
```

**Scenario: 업로드 실패**

```gherkin
Given SVG 변환이 완료된 상태
When Supabase 업로드에 실패하면
Then "SVG 업로드에 실패했습니다." 에러 메시지가 표시된다
And SVG 미리보기는 유지되어 재시도가 가능하다
```

---

### 1.8 이미지 제한 검증 (REQ-N-01, REQ-N-02, REQ-N-03)

**Scenario: 크기 초과 이미지 차단**

```gherkin
Given 변환 탭에서 이미지가 표시된 상태
When 4096x4096을 초과하는 이미지가 감지되면
Then 해당 이미지에 "크기 초과" 경고가 표시된다
And 해당 이미지는 변환 대상으로 선택할 수 없다
```

**Scenario: 파일 크기 초과 차단**

```gherkin
Given 변환 탭에서 이미지가 표시된 상태
When 20MB를 초과하는 이미지 파일이 감지되면
Then 해당 이미지에 "파일 크기 초과" 경고가 표시된다
And 해당 이미지는 변환 대상으로 선택할 수 없다
```

**Scenario: 미지원 형식 필터링**

```gherkin
Given 변환 탭이 활성화된 상태
When 갤러리 이미지 목록을 로드하면
Then SVG, GIF, WebP 형식의 파일은 목록에서 제외된다
And JPEG, PNG, BMP, TIFF 형식만 표시된다
```

---

### 1.9 중복 변환 경고 (REQ-N-04)

**Scenario: 이미 변환된 이미지의 재변환 시도**

```gherkin
Given 이전에 변환된 이미지와 동일한 원본 이미지를 선택한 상태
When "SVG 저장" 버튼을 클릭하면
Then "이미 변환된 파일이 존재합니다. 덮어쓰시겠습니까?" 경고가 표시된다
And 관리자가 확인/취소를 선택할 수 있다
```

---

## 2. 품질 게이트 기준

### 2.1 기능 완성도

| 기준 | 목표 | 검증 방법 |
|------|------|----------|
| 필수 요구사항(U) 구현 | 100% | 모든 REQ-U 항목 동작 확인 |
| 이벤트 요구사항(E) 구현 | 100% | 모든 REQ-E 항목 시나리오 통과 |
| 상태 요구사항(S) 구현 | 100% | 모든 REQ-S 항목 상태 전환 확인 |
| 금지 요구사항(N) 구현 | 100% | 모든 REQ-N 항목 차단 확인 |
| 인수 테스트 시나리오 통과 | 100% | 위 Gherkin 시나리오 전체 통과 |

### 2.2 성능 기준

| 기준 | 목표값 | 측정 방법 |
|------|--------|----------|
| 1024x1024 이미지 변환 시간 | 10초 이내 | Chrome DevTools Performance 탭 |
| 메모리 사용 증가량 | 200MB 이내 | Chrome DevTools Memory 탭 |
| SVG 파일 크기 | 5MB 이내 | 생성된 파일 크기 확인 |
| 갤러리 목록 로딩 시간 | 2초 이내 | Network 탭 |

### 2.3 사용성 기준

| 기준 | 검증 방법 |
|------|----------|
| 변환 결과를 저장 전 미리보기 가능 | SVG 미리보기 패널 확인 |
| 에러 발생 시 한국어 메시지 표시 | 각 에러 시나리오에서 메시지 확인 |
| 변환 옵션 기본값으로 합리적 결과 생성 | kColors=6 기본 설정으로 변환 테스트 |
| 기존 AdminPage 기능에 영향 없음 | SVG/갤러리 탭 기능 회귀 테스트 |

---

## 3. Definition of Done

- [ ] 모든 필수(U)/이벤트(E)/상태(S)/금지(N) 요구사항이 구현됨
- [ ] 인수 테스트 시나리오가 모두 통과함
- [ ] 변환된 SVG가 기존 ColoringCanvas 컴포넌트에서 정상 동작함
- [ ] 에러 핸들링이 모든 실패 시나리오를 커버함
- [ ] 성능 기준(10초 이내 변환, 200MB 이내 메모리)을 충족함
- [ ] 기존 AdminPage(SVG/갤러리 탭) 기능에 회귀 없음
- [ ] TypeScript 타입 에러 없음
- [ ] CSS 스타일이 모바일/데스크톱에서 적절히 표시됨

---

## 4. 추적성 태그

```yaml
tags:
  - SPEC-COLOR-002
  - gallery-to-svg
  - acceptance-criteria
```

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-02-10 | manager-spec | 초기 인수 기준 작성 |
