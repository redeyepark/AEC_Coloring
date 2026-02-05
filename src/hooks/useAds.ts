import { useState, useCallback, useEffect } from 'react';
import { AD_CONFIG } from '../config/adConfig';

const SESSION_STORAGE_KEY = 'aec_ad_session';

interface AdSessionData {
  /** 전면 광고 표시 횟수 */
  interstitialCount: number;
  /** 마지막 전면 광고 표시 시간 (timestamp) */
  lastInterstitialTime: number;
}

/**
 * 광고 관리 훅
 * 전면 광고 표시 횟수와 쿨다운을 추적합니다.
 */
export function useAds() {
  const [sessionData, setSessionData] = useState<AdSessionData>(() => {
    if (typeof window === 'undefined') {
      return { interstitialCount: 0, lastInterstitialTime: 0 };
    }

    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as AdSessionData;
      }
    } catch {
      // sessionStorage 접근 실패 시 기본값 사용
    }

    return { interstitialCount: 0, lastInterstitialTime: 0 };
  });

  // 세션 데이터 저장
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } catch {
      // sessionStorage 저장 실패 무시
    }
  }, [sessionData]);

  /**
   * 전면 광고 표시 가능 여부 확인
   */
  const canShowInterstitial = useCallback((): boolean => {
    // 광고 비활성화 시
    if (!AD_CONFIG.enabled) {
      return false;
    }

    // 세션당 최대 횟수 초과
    if (sessionData.interstitialCount >= AD_CONFIG.interstitial.maxPerSession) {
      return false;
    }

    // 쿨다운 체크
    const now = Date.now();
    const cooldownMs = AD_CONFIG.interstitial.cooldownSeconds * 1000;
    if (now - sessionData.lastInterstitialTime < cooldownMs) {
      return false;
    }

    return true;
  }, [sessionData]);

  /**
   * 전면 광고 표시 완료 기록
   */
  const recordInterstitialShown = useCallback(() => {
    setSessionData(prev => ({
      interstitialCount: prev.interstitialCount + 1,
      lastInterstitialTime: Date.now()
    }));
  }, []);

  /**
   * 남은 쿨다운 시간 (초)
   */
  const getRemainingCooldown = useCallback((): number => {
    const now = Date.now();
    const cooldownMs = AD_CONFIG.interstitial.cooldownSeconds * 1000;
    const elapsed = now - sessionData.lastInterstitialTime;
    const remaining = Math.max(0, cooldownMs - elapsed);
    return Math.ceil(remaining / 1000);
  }, [sessionData.lastInterstitialTime]);

  /**
   * 세션 데이터 초기화 (테스트용)
   */
  const resetSession = useCallback(() => {
    setSessionData({ interstitialCount: 0, lastInterstitialTime: 0 });
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // 무시
    }
  }, []);

  return {
    /** 광고 활성화 여부 */
    isEnabled: AD_CONFIG.enabled,
    /** 테스트 모드 여부 */
    isTestMode: AD_CONFIG.testMode,
    /** 전면 광고 표시 가능 여부 */
    canShowInterstitial,
    /** 전면 광고 표시 기록 */
    recordInterstitialShown,
    /** 남은 쿨다운 시간 (초) */
    getRemainingCooldown,
    /** 현재 세션 전면 광고 표시 횟수 */
    interstitialCount: sessionData.interstitialCount,
    /** 세션 초기화 (테스트용) */
    resetSession
  };
}
