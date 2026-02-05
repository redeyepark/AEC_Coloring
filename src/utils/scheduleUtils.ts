/**
 * 파일명 기반 스케줄링 유틸리티
 *
 * 파일명 형식: {시작일}_{종료일}_{원본파일명}
 * 예시:
 * - 20260201_20260228_flower.svg → 2026-02-01 ~ 2026-02-28 노출
 * - 20260301_99991231_cat.svg → 2026-03-01부터 무기한 노출
 * - flower.svg → 날짜 없음 = 항상 노출
 */

export interface ParsedSchedule {
  startDate: string | null; // YYYY-MM-DD 형식
  endDate: string | null;   // YYYY-MM-DD 형식
  originalName: string;     // 원본 파일명
  hasSchedule: boolean;     // 스케줄이 설정되어 있는지
}

export type ScheduleStatus = 'scheduled' | 'active' | 'expired' | 'none';

// 날짜 형식 상수
const DATE_REGEX = /^(\d{8})_(\d{8})_(.+)$/;
const UNLIMITED_END_DATE = '99991231';

/**
 * 파일명에서 스케줄 정보 파싱
 */
export function parseScheduleFromFilename(filename: string): ParsedSchedule {
  const match = filename.match(DATE_REGEX);

  if (!match) {
    // 스케줄 형식이 아닌 경우 - 항상 노출
    return {
      startDate: null,
      endDate: null,
      originalName: filename,
      hasSchedule: false,
    };
  }

  const [, startStr, endStr, originalName] = match;

  // YYYYMMDD → YYYY-MM-DD 변환
  const startDate = `${startStr.slice(0, 4)}-${startStr.slice(4, 6)}-${startStr.slice(6, 8)}`;
  const endDate = endStr === UNLIMITED_END_DATE
    ? null
    : `${endStr.slice(0, 4)}-${endStr.slice(4, 6)}-${endStr.slice(6, 8)}`;

  return {
    startDate,
    endDate,
    originalName,
    hasSchedule: true,
  };
}

/**
 * 스케줄 정보로 새 파일명 생성
 */
export function createScheduledFilename(
  originalName: string,
  startDate: string | null,
  endDate: string | null
): string {
  // 스케줄이 없으면 원본 파일명 반환
  if (!startDate && !endDate) {
    return originalName;
  }

  // 날짜 형식 변환 (YYYY-MM-DD → YYYYMMDD)
  const startStr = startDate ? startDate.replace(/-/g, '') : getTodayString();
  const endStr = endDate ? endDate.replace(/-/g, '') : UNLIMITED_END_DATE;

  return `${startStr}_${endStr}_${originalName}`;
}

/**
 * 오늘 날짜를 YYYYMMDD 형식으로 반환
 */
function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * 이미지가 현재 노출 가능한지 확인
 */
export function isImageVisibleByFilename(filename: string): boolean {
  const schedule = parseScheduleFromFilename(filename);

  // 스케줄이 없으면 항상 노출
  if (!schedule.hasSchedule) {
    return true;
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // 시작일 이전이면 미노출
  if (schedule.startDate && today < schedule.startDate) {
    return false;
  }

  // 종료일 이후면 미노출
  if (schedule.endDate && today > schedule.endDate) {
    return false;
  }

  return true;
}

/**
 * 이미지의 노출 상태 확인
 */
export function getScheduleStatusByFilename(filename: string): ScheduleStatus {
  const schedule = parseScheduleFromFilename(filename);

  // 스케줄이 없으면 none
  if (!schedule.hasSchedule) {
    return 'none';
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // 시작일 이전이면 scheduled
  if (schedule.startDate && today < schedule.startDate) {
    return 'scheduled';
  }

  // 종료일 이후면 expired
  if (schedule.endDate && today > schedule.endDate) {
    return 'expired';
  }

  return 'active';
}

/**
 * 파일명에서 원본 이름 추출 (타임스탬프 및 스케줄 정보 제거)
 */
export function getCleanFilename(filename: string): string {
  const schedule = parseScheduleFromFilename(filename);
  let name = schedule.originalName;

  // 업로드 시 추가된 타임스탬프 제거 (예: 1738123456789_flower.svg → flower.svg)
  name = name.replace(/^\d+_/, '');

  return name;
}

/**
 * 스케줄 라벨 가져오기
 */
export function getScheduleLabel(status: ScheduleStatus): string {
  switch (status) {
    case 'scheduled': return '예약됨';
    case 'active': return '노출중';
    case 'expired': return '만료됨';
    default: return '';
  }
}
