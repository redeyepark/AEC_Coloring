import { useEffect, useCallback } from 'react';
import styles from './FullscreenViewer.module.css';

interface FullscreenViewerProps {
  imageUrl: string;
  title: string;
  artist: string;
  onClose: () => void;
}

export function FullscreenViewer({ imageUrl, title, artist, onClose }: FullscreenViewerProps) {
  // ESC 키로 닫기
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    // ESC 키 리스너 등록
    document.addEventListener('keydown', handleKeyDown);
    // body 스크롤 잠금
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleKeyDown]);

  // 배경 클릭 시 닫기 (이미지 영역 제외)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      {/* 닫기 버튼 */}
      <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* 콘텐츠 영역 */}
      <div className={styles.content} onClick={handleOverlayClick}>
        <img
          className={styles.image}
          src={imageUrl}
          alt={`${title} - ${artist}`}
        />
        <div className={styles.info}>
          <div className={styles.title}>{title}</div>
          <div className={styles.artist}>{artist}</div>
        </div>
      </div>
    </div>
  );
}
