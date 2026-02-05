import { useEffect, useRef } from 'react';
import { AD_CONFIG } from '../../config/adConfig';
import styles from './BannerAd.module.css';

interface BannerAdProps {
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 배너 광고 컴포넌트
 * 테스트 모드에서는 플레이스홀더를 표시하고,
 * 실제 모드에서는 Google AdSense 스크립트를 삽입합니다.
 */
export function BannerAd({ className }: BannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adLoadedRef = useRef(false);

  useEffect(() => {
    // 광고 비활성화 또는 테스트 모드일 경우 스크립트 로드 안 함
    if (!AD_CONFIG.enabled || AD_CONFIG.testMode) {
      return;
    }

    // 이미 로드됨
    if (adLoadedRef.current) {
      return;
    }

    // AdSense 스크립트 로드
    const loadAdSenseScript = () => {
      // 이미 스크립트가 있는지 확인
      if (document.querySelector(`script[src*="pagead2.googlesyndication.com"]`)) {
        initAd();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CONFIG.publisherId}`;
      script.crossOrigin = 'anonymous';
      script.onload = initAd;
      document.head.appendChild(script);
    };

    const initAd = () => {
      try {
        // @ts-expect-error adsbygoogle is a global variable
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adLoadedRef.current = true;
      } catch {
        console.error('AdSense 초기화 실패');
      }
    };

    loadAdSenseScript();
  }, []);

  // 광고 비활성화
  if (!AD_CONFIG.enabled) {
    return null;
  }

  // 테스트 모드: 플레이스홀더 표시
  if (AD_CONFIG.testMode) {
    return (
      <div
        className={`${styles.bannerContainer} ${styles.testMode} ${className || ''}`}
        ref={containerRef}
      >
        <span className={styles.testLabel}>광고</span>
      </div>
    );
  }

  // 실제 모드: AdSense 광고
  return (
    <div className={`${styles.bannerContainer} ${className || ''}`} ref={containerRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CONFIG.publisherId}
        data-ad-slot={AD_CONFIG.slots.banner}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
