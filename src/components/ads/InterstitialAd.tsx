import { useState, useEffect, useCallback } from 'react';
import { AD_CONFIG } from '../../config/adConfig';
import styles from './InterstitialAd.module.css';

interface InterstitialAdProps {
  /** 광고 표시 여부 */
  isOpen: boolean;
  /** 광고 닫기 콜백 */
  onClose: () => void;
}

/**
 * 전면 광고 컴포넌트
 * 테스트 모드에서는 플레이스홀더와 카운트다운을 표시하고,
 * 실제 모드에서는 Google AdSense 전면 광고를 표시합니다.
 */
export function InterstitialAd({ isOpen, onClose }: InterstitialAdProps) {
  const [countdown, setCountdown] = useState<number>(AD_CONFIG.interstitial.countdownSeconds);
  const [canClose, setCanClose] = useState(false);

  // 카운트다운 타이머
  useEffect(() => {
    if (!isOpen) {
      // 리셋
      setCountdown(AD_CONFIG.interstitial.countdownSeconds);
      setCanClose(false);
      return;
    }

    if (countdown <= 0) {
      setCanClose(true);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, countdown]);

  // 닫기 핸들러
  const handleClose = useCallback(() => {
    if (canClose) {
      onClose();
    }
  }, [canClose, onClose]);

  // 배경 클릭 핸들러 (닫기 가능할 때만)
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && canClose) {
      onClose();
    }
  }, [canClose, onClose]);

  // 열리지 않았거나 광고 비활성화 시
  if (!isOpen || !AD_CONFIG.enabled) {
    return null;
  }

  // 테스트 모드: 플레이스홀더
  if (AD_CONFIG.testMode) {
    return (
      <div
        className={styles.overlay}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-label="광고"
      >
        <div className={styles.modal}>
          <div className={styles.adContainer}>
            <div className={styles.testPlaceholder}>
              <span className={styles.testIcon}>AD</span>
              <span className={styles.testText}>광고 영역</span>
              <span className={styles.testSubtext}>테스트 모드</span>
            </div>
          </div>

          <div className={styles.footer}>
            {canClose ? (
              <button
                className={styles.closeButton}
                onClick={handleClose}
                type="button"
              >
                닫기
              </button>
            ) : (
              <span className={styles.countdown}>
                {countdown}초 후 닫기 가능
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 실제 모드: AdSense 전면 광고
  // 주의: 실제 AdSense 전면 광고는 별도의 API 호출이 필요합니다.
  // 이 구현은 기본적인 구조만 제공합니다.
  return (
    <div
      className={styles.overlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="광고"
    >
      <div className={styles.modal}>
        <div className={styles.adContainer}>
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '300px', height: '250px' }}
            data-ad-client={AD_CONFIG.publisherId}
            data-ad-slot={AD_CONFIG.slots.interstitial}
            data-ad-format="rectangle"
            data-tag-for-child-directed-treatment="1"
          />
        </div>

        <div className={styles.footer}>
          {canClose ? (
            <button
              className={styles.closeButton}
              onClick={handleClose}
              type="button"
            >
              닫기
            </button>
          ) : (
            <span className={styles.countdown}>
              {countdown}초 후 닫기 가능
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
