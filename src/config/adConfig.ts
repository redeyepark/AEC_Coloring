/**
 * Google AdSense 광고 설정
 * 어린이 대상 앱 (COPPA 준수)
 * - 개인 맞춤 광고 비활성화 (tfcd=1)
 * - 최소한의 광고 빈도
 * - 아동 보호 태그 적용
 */
export const AD_CONFIG = {
  /** 광고 기능 활성화 여부 */
  enabled: true,

  /** 테스트 모드 - true면 플레이스홀더 표시, false면 실제 AdSense 로드 */
  testMode: false,

  /** 어린이 대상 콘텐츠 여부 (COPPA 준수) */
  childDirectedTreatment: true,

  /** AdSense Publisher ID */
  publisherId: 'ca-pub-9204948456666925',

  /** 광고 슬롯 ID (AdSense 대시보드에서 실제 ID로 교체 필요) */
  slots: {
    /** 배너 광고 슬롯 */
    banner: 'XXXXXXXXXX',
    /** 전면 광고 슬롯 */
    interstitial: 'XXXXXXXXXX'
  },

  /** 전면 광고 설정 (어린이 앱 - 최소화된 광고 빈도) */
  interstitial: {
    /** 세션당 최대 전면 광고 표시 횟수 (어린이 UX 고려하여 최소화) */
    maxPerSession: 1,
    /** 전면 광고 간 최소 간격 (초) */
    cooldownSeconds: 120,
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
