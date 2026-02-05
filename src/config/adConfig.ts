/**
 * Google AdSense 광고 설정
 * 어린이 대상 앱이므로 테스트 모드에서는 추적 스크립트를 로드하지 않습니다.
 */
export const AD_CONFIG = {
  /** 광고 기능 활성화 여부 */
  enabled: true,

  /** 테스트 모드 - true면 플레이스홀더 표시, false면 실제 AdSense 로드 */
  testMode: false,

  /** AdSense Publisher ID */
  publisherId: 'ca-pub-9204948456666925',

  /** 광고 슬롯 ID */
  slots: {
    /** 배너 광고 슬롯 */
    banner: 'XXXXXXXXXX',
    /** 전면 광고 슬롯 */
    interstitial: 'XXXXXXXXXX'
  },

  /** 전면 광고 설정 */
  interstitial: {
    /** 세션당 최대 전면 광고 표시 횟수 */
    maxPerSession: 3,
    /** 전면 광고 간 최소 간격 (초) */
    cooldownSeconds: 60,
    /** 전면 광고 카운트다운 시간 (초) */
    countdownSeconds: 5
  },

  /** 배너 광고 크기 */
  banner: {
    /** 모바일 배너 크기 */
    mobile: { width: 320, height: 100 },
    /** 데스크톱 배너 크기 */
    desktop: { width: 728, height: 90 }
  }
} as const;

export type AdConfig = typeof AD_CONFIG;
