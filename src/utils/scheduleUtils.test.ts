import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseScheduleFromFilename,
  createScheduledFilename,
  isImageVisibleByFilename,
  getScheduleStatusByFilename,
  getCleanFilename,
  getScheduleLabel,
} from './scheduleUtils';
import type { ScheduleStatus } from './scheduleUtils';

// ============================================================
// parseScheduleFromFilename 테스트
// ============================================================
describe('parseScheduleFromFilename', () => {
  it('정상적인 스케줄 파일명을 올바르게 파싱한다', () => {
    const result = parseScheduleFromFilename('20260201_20260228_flower.svg');
    expect(result).toEqual({
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      originalName: 'flower.svg',
      hasSchedule: true,
    });
  });

  it('종료일이 99991231이면 endDate를 null로 반환한다 (무기한)', () => {
    const result = parseScheduleFromFilename('20260301_99991231_cat.svg');
    expect(result).toEqual({
      startDate: '2026-03-01',
      endDate: null,
      originalName: 'cat.svg',
      hasSchedule: true,
    });
  });

  it('스케줄 형식이 아닌 일반 파일명은 hasSchedule false를 반환한다', () => {
    const result = parseScheduleFromFilename('flower.svg');
    expect(result).toEqual({
      startDate: null,
      endDate: null,
      originalName: 'flower.svg',
      hasSchedule: false,
    });
  });

  it('빈 문자열을 입력하면 hasSchedule false를 반환한다', () => {
    const result = parseScheduleFromFilename('');
    expect(result).toEqual({
      startDate: null,
      endDate: null,
      originalName: '',
      hasSchedule: false,
    });
  });

  it('언더스코어만 있는 파일명은 스케줄로 인식하지 않는다', () => {
    const result = parseScheduleFromFilename('___');
    expect(result).toEqual({
      startDate: null,
      endDate: null,
      originalName: '___',
      hasSchedule: false,
    });
  });

  it('숫자가 있지만 스케줄 패턴이 아닌 파일명은 스케줄로 인식하지 않는다', () => {
    const result = parseScheduleFromFilename('12345_flower.svg');
    expect(result).toEqual({
      startDate: null,
      endDate: null,
      originalName: '12345_flower.svg',
      hasSchedule: false,
    });
  });

  it('8자리 숫자가 하나만 있는 파일명은 스케줄로 인식하지 않는다', () => {
    const result = parseScheduleFromFilename('20260201_flower.svg');
    expect(result).toEqual({
      startDate: null,
      endDate: null,
      originalName: '20260201_flower.svg',
      hasSchedule: false,
    });
  });

  it('원본 파일명에 언더스코어가 포함된 경우도 올바르게 파싱한다', () => {
    const result = parseScheduleFromFilename('20260201_20260228_my_flower_image.svg');
    expect(result).toEqual({
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      originalName: 'my_flower_image.svg',
      hasSchedule: true,
    });
  });

  it('원본 파일명에 특수문자가 포함된 경우도 올바르게 파싱한다', () => {
    const result = parseScheduleFromFilename('20260101_20261231_flower (1).svg');
    expect(result).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      originalName: 'flower (1).svg',
      hasSchedule: true,
    });
  });

  it('원본 파일명에 한글이 포함된 경우도 올바르게 파싱한다', () => {
    const result = parseScheduleFromFilename('20260201_20260228_꽃그림.svg');
    expect(result).toEqual({
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      originalName: '꽃그림.svg',
      hasSchedule: true,
    });
  });

  it('매우 긴 파일명도 올바르게 파싱한다', () => {
    const longName = 'a'.repeat(200) + '.svg';
    const result = parseScheduleFromFilename(`20260101_20261231_${longName}`);
    expect(result).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      originalName: longName,
      hasSchedule: true,
    });
  });

  it('날짜 형식이 YYYYMMDD가 아닌 9자리 숫자이면 스케줄로 인식하지 않는다', () => {
    const result = parseScheduleFromFilename('123456789_123456789_flower.svg');
    expect(result).toEqual({
      startDate: null,
      endDate: null,
      originalName: '123456789_123456789_flower.svg',
      hasSchedule: false,
    });
  });

  it('날짜 뒤 원본 파일명 부분이 비어있지 않아야 매칭된다', () => {
    // regex는 (.+)이므로 최소 1글자 필요
    const result = parseScheduleFromFilename('20260201_20260228_');
    expect(result).toEqual({
      startDate: null,
      endDate: null,
      originalName: '20260201_20260228_',
      hasSchedule: false,
    });
  });
});

// ============================================================
// createScheduledFilename 테스트
// ============================================================
describe('createScheduledFilename', () => {
  beforeEach(() => {
    // createScheduledFilename에서 getTodayString 내부적으로 new Date()를 사용
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-11'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('시작일과 종료일이 모두 있으면 스케줄 파일명을 생성한다', () => {
    const result = createScheduledFilename('flower.svg', '2026-02-01', '2026-02-28');
    expect(result).toBe('20260201_20260228_flower.svg');
  });

  it('시작일과 종료일이 모두 null이면 원본 파일명을 그대로 반환한다', () => {
    const result = createScheduledFilename('flower.svg', null, null);
    expect(result).toBe('flower.svg');
  });

  it('시작일이 null이면 오늘 날짜를 시작일로 사용한다', () => {
    const result = createScheduledFilename('flower.svg', null, '2026-03-31');
    expect(result).toBe('20260211_20260331_flower.svg');
  });

  it('종료일이 null이면 99991231을 종료일로 사용한다 (무기한)', () => {
    const result = createScheduledFilename('flower.svg', '2026-02-01', null);
    expect(result).toBe('20260201_99991231_flower.svg');
  });

  it('원본 파일명에 언더스코어가 포함되어도 올바르게 생성한다', () => {
    const result = createScheduledFilename('my_flower_image.svg', '2026-01-01', '2026-12-31');
    expect(result).toBe('20260101_20261231_my_flower_image.svg');
  });

  it('원본 파일명에 특수문자가 포함되어도 올바르게 생성한다', () => {
    const result = createScheduledFilename('flower (1).svg', '2026-01-01', '2026-12-31');
    expect(result).toBe('20260101_20261231_flower (1).svg');
  });

  it('빈 문자열 원본 파일명과 날짜가 없으면 빈 문자열을 반환한다', () => {
    const result = createScheduledFilename('', null, null);
    expect(result).toBe('');
  });

  it('빈 문자열 원본 파일명에 날짜가 있으면 스케줄 형식으로 생성한다', () => {
    const result = createScheduledFilename('', '2026-01-01', '2026-12-31');
    expect(result).toBe('20260101_20261231_');
  });
});

// ============================================================
// isImageVisibleByFilename 테스트
// ============================================================
describe('isImageVisibleByFilename', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 오늘을 2026-02-11로 고정
    vi.setSystemTime(new Date('2026-02-11T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('스케줄이 없는 파일명은 항상 true를 반환한다', () => {
    expect(isImageVisibleByFilename('flower.svg')).toBe(true);
  });

  it('빈 문자열 파일명은 스케줄이 없으므로 true를 반환한다', () => {
    expect(isImageVisibleByFilename('')).toBe(true);
  });

  it('시작일 이전이면 false를 반환한다', () => {
    // 오늘: 2026-02-11, 시작일: 2026-03-01
    expect(isImageVisibleByFilename('20260301_20260331_flower.svg')).toBe(false);
  });

  it('종료일 이후이면 false를 반환한다', () => {
    // 오늘: 2026-02-11, 종료일: 2026-01-31
    expect(isImageVisibleByFilename('20260101_20260131_flower.svg')).toBe(false);
  });

  it('시작일과 종료일 사이이면 true를 반환한다', () => {
    // 오늘: 2026-02-11, 기간: 2026-02-01 ~ 2026-02-28
    expect(isImageVisibleByFilename('20260201_20260228_flower.svg')).toBe(true);
  });

  it('오늘이 시작일과 같은 날이면 true를 반환한다 (경계값)', () => {
    // 오늘: 2026-02-11, 시작일: 2026-02-11
    expect(isImageVisibleByFilename('20260211_20260228_flower.svg')).toBe(true);
  });

  it('오늘이 종료일과 같은 날이면 true를 반환한다 (경계값)', () => {
    // 오늘: 2026-02-11, 종료일: 2026-02-11
    expect(isImageVisibleByFilename('20260201_20260211_flower.svg')).toBe(true);
  });

  it('종료일이 99991231(무기한)이면 시작일 이후 항상 true를 반환한다', () => {
    // 오늘: 2026-02-11, 시작일: 2026-01-01, 종료일: 무기한(null)
    expect(isImageVisibleByFilename('20260101_99991231_flower.svg')).toBe(true);
  });

  it('종료일이 99991231이고 시작일 이전이면 false를 반환한다', () => {
    // 오늘: 2026-02-11, 시작일: 2026-03-01, 종료일: 무기한(null)
    expect(isImageVisibleByFilename('20260301_99991231_flower.svg')).toBe(false);
  });

  it('시작일과 종료일이 같은 하루짜리 스케줄에서 당일이면 true를 반환한다', () => {
    // 오늘: 2026-02-11, 시작일=종료일: 2026-02-11
    expect(isImageVisibleByFilename('20260211_20260211_flower.svg')).toBe(true);
  });

  it('시작일과 종료일이 같은 하루짜리 스케줄에서 당일이 아니면 false를 반환한다', () => {
    // 오늘: 2026-02-11, 시작일=종료일: 2026-02-10 (어제)
    expect(isImageVisibleByFilename('20260210_20260210_flower.svg')).toBe(false);
  });
});

// ============================================================
// getScheduleStatusByFilename 테스트
// ============================================================
describe('getScheduleStatusByFilename', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 오늘을 2026-02-11로 고정
    vi.setSystemTime(new Date('2026-02-11T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('스케줄이 없는 파일명은 none을 반환한다', () => {
    expect(getScheduleStatusByFilename('flower.svg')).toBe('none');
  });

  it('빈 문자열 파일명은 none을 반환한다', () => {
    expect(getScheduleStatusByFilename('')).toBe('none');
  });

  it('시작일 이전이면 scheduled를 반환한다', () => {
    // 오늘: 2026-02-11, 시작일: 2026-03-01
    expect(getScheduleStatusByFilename('20260301_20260331_flower.svg')).toBe('scheduled');
  });

  it('종료일 이후이면 expired를 반환한다', () => {
    // 오늘: 2026-02-11, 종료일: 2026-01-31
    expect(getScheduleStatusByFilename('20260101_20260131_flower.svg')).toBe('expired');
  });

  it('시작일과 종료일 사이이면 active를 반환한다', () => {
    // 오늘: 2026-02-11, 기간: 2026-02-01 ~ 2026-02-28
    expect(getScheduleStatusByFilename('20260201_20260228_flower.svg')).toBe('active');
  });

  it('오늘이 시작일과 같으면 active를 반환한다 (경계값)', () => {
    expect(getScheduleStatusByFilename('20260211_20260228_flower.svg')).toBe('active');
  });

  it('오늘이 종료일과 같으면 active를 반환한다 (경계값)', () => {
    expect(getScheduleStatusByFilename('20260201_20260211_flower.svg')).toBe('active');
  });

  it('종료일이 99991231(무기한)이고 시작일 이후이면 active를 반환한다', () => {
    expect(getScheduleStatusByFilename('20260101_99991231_flower.svg')).toBe('active');
  });

  it('종료일이 99991231(무기한)이고 시작일 이전이면 scheduled를 반환한다', () => {
    expect(getScheduleStatusByFilename('20260301_99991231_flower.svg')).toBe('scheduled');
  });

  it('하루짜리 스케줄에서 당일이면 active를 반환한다', () => {
    expect(getScheduleStatusByFilename('20260211_20260211_flower.svg')).toBe('active');
  });

  it('하루짜리 스케줄에서 지난 날이면 expired를 반환한다', () => {
    expect(getScheduleStatusByFilename('20260210_20260210_flower.svg')).toBe('expired');
  });

  it('하루짜리 스케줄에서 미래 날이면 scheduled를 반환한다', () => {
    expect(getScheduleStatusByFilename('20260212_20260212_flower.svg')).toBe('scheduled');
  });
});

// ============================================================
// getCleanFilename 테스트
// ============================================================
describe('getCleanFilename', () => {
  it('스케줄 접두사와 타임스탬프를 모두 제거한다', () => {
    const result = getCleanFilename('20260201_20260228_1738123456789_flower.svg');
    expect(result).toBe('flower.svg');
  });

  it('스케줄 접두사만 있는 경우 스케줄을 제거한다', () => {
    const result = getCleanFilename('20260201_20260228_flower.svg');
    expect(result).toBe('flower.svg');
  });

  it('타임스탬프만 있는 일반 파일명에서 타임스탬프를 제거한다', () => {
    // 스케줄 없는 경우 originalName이 전체 파일명이 되고, 그 안에서 숫자_ 패턴을 제거
    const result = getCleanFilename('1738123456789_flower.svg');
    expect(result).toBe('flower.svg');
  });

  it('접두사가 없는 일반 파일명은 그대로 반환한다', () => {
    const result = getCleanFilename('flower.svg');
    expect(result).toBe('flower.svg');
  });

  it('빈 문자열을 입력하면 빈 문자열을 반환한다', () => {
    const result = getCleanFilename('');
    expect(result).toBe('');
  });

  it('원본 파일명에 언더스코어가 포함된 경우도 올바르게 처리한다', () => {
    const result = getCleanFilename('20260201_20260228_1738123456789_my_flower.svg');
    expect(result).toBe('my_flower.svg');
  });

  it('99991231 무기한 종료일이 있는 파일명도 올바르게 처리한다', () => {
    const result = getCleanFilename('20260301_99991231_1738123456789_cat.svg');
    expect(result).toBe('cat.svg');
  });

  it('스케줄과 타임스탬프 없이 숫자로 시작하는 파일명의 숫자를 제거한다', () => {
    // "123_test.svg"는 스케줄 패턴이 아니므로 originalName = "123_test.svg"
    // 그 후 /^\d+_/ 패턴으로 "123_" 제거
    const result = getCleanFilename('123_test.svg');
    expect(result).toBe('test.svg');
  });

  it('매우 긴 파일명도 올바르게 처리한다', () => {
    const longName = 'a'.repeat(200) + '.svg';
    const result = getCleanFilename(`20260101_20261231_9999999999999_${longName}`);
    expect(result).toBe(longName);
  });

  it('특수문자가 포함된 원본 파일명도 올바르게 처리한다', () => {
    const result = getCleanFilename('20260201_20260228_flower (copy).svg');
    expect(result).toBe('flower (copy).svg');
  });
});

// ============================================================
// getScheduleLabel 테스트
// ============================================================
describe('getScheduleLabel', () => {
  it('scheduled 상태는 "예약됨"을 반환한다', () => {
    expect(getScheduleLabel('scheduled')).toBe('예약됨');
  });

  it('active 상태는 "노출중"을 반환한다', () => {
    expect(getScheduleLabel('active')).toBe('노출중');
  });

  it('expired 상태는 "만료됨"을 반환한다', () => {
    expect(getScheduleLabel('expired')).toBe('만료됨');
  });

  it('none 상태는 빈 문자열을 반환한다', () => {
    expect(getScheduleLabel('none')).toBe('');
  });

  it('모든 ScheduleStatus 값에 대해 올바른 라벨을 반환한다', () => {
    const expectedLabels: Record<ScheduleStatus, string> = {
      scheduled: '예약됨',
      active: '노출중',
      expired: '만료됨',
      none: '',
    };

    for (const [status, label] of Object.entries(expectedLabels)) {
      expect(getScheduleLabel(status as ScheduleStatus)).toBe(label);
    }
  });
});

// ============================================================
// 통합 테스트: 함수 간 상호작용 검증
// ============================================================
describe('통합 테스트', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-11T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('createScheduledFilename으로 생성한 파일명을 parseScheduleFromFilename으로 파싱할 수 있다', () => {
    const filename = createScheduledFilename('flower.svg', '2026-03-01', '2026-03-31');
    const parsed = parseScheduleFromFilename(filename);

    expect(parsed.startDate).toBe('2026-03-01');
    expect(parsed.endDate).toBe('2026-03-31');
    expect(parsed.originalName).toBe('flower.svg');
    expect(parsed.hasSchedule).toBe(true);
  });

  it('createScheduledFilename으로 무기한 파일명을 생성하면 endDate가 null로 파싱된다', () => {
    const filename = createScheduledFilename('flower.svg', '2026-01-01', null);
    const parsed = parseScheduleFromFilename(filename);

    expect(parsed.startDate).toBe('2026-01-01');
    expect(parsed.endDate).toBeNull();
    expect(parsed.hasSchedule).toBe(true);
  });

  it('isImageVisibleByFilename과 getScheduleStatusByFilename의 결과가 일관성을 유지한다', () => {
    // active 상태인 파일명 - visible이어야 함
    const activeFile = '20260201_20260228_flower.svg';
    expect(isImageVisibleByFilename(activeFile)).toBe(true);
    expect(getScheduleStatusByFilename(activeFile)).toBe('active');

    // scheduled 상태인 파일명 - visible이 아니어야 함
    const scheduledFile = '20260301_20260331_flower.svg';
    expect(isImageVisibleByFilename(scheduledFile)).toBe(false);
    expect(getScheduleStatusByFilename(scheduledFile)).toBe('scheduled');

    // expired 상태인 파일명 - visible이 아니어야 함
    const expiredFile = '20260101_20260131_flower.svg';
    expect(isImageVisibleByFilename(expiredFile)).toBe(false);
    expect(getScheduleStatusByFilename(expiredFile)).toBe('expired');

    // none 상태인 파일명 - visible이어야 함
    const noScheduleFile = 'flower.svg';
    expect(isImageVisibleByFilename(noScheduleFile)).toBe(true);
    expect(getScheduleStatusByFilename(noScheduleFile)).toBe('none');
  });

  it('getCleanFilename으로 스케줄 파일명에서 원본 이름을 복원할 수 있다', () => {
    const originalName = 'flower.svg';
    const scheduledFilename = createScheduledFilename(originalName, '2026-01-01', '2026-12-31');
    const cleanName = getCleanFilename(scheduledFilename);

    expect(cleanName).toBe(originalName);
  });

  it('getScheduleLabel이 getScheduleStatusByFilename의 결과에 올바른 라벨을 반환한다', () => {
    const status = getScheduleStatusByFilename('20260201_20260228_flower.svg');
    const label = getScheduleLabel(status);
    expect(label).toBe('노출중');
  });
});
