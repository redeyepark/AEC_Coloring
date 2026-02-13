import { useState, useEffect } from 'react';
import { listImages } from '../lib/supabase';
import { parseMyWorkFilename } from '../utils/myworksUtils';
import { MyWorkItem } from '../types';
import { FullscreenViewer } from './FullscreenViewer';
import styles from './MyWorksPage.module.css';

interface MyWorksPageProps {
  onBack?: () => void;
}

export function MyWorksPage({ onBack }: MyWorksPageProps) {
  const [works, setWorks] = useState<MyWorkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWork, setSelectedWork] = useState<MyWorkItem | null>(null);

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await listImages('myworks');
      const parsed: MyWorkItem[] = list.map(item => ({
        file: item.url,
        path: item.path,
        ...parseMyWorkFilename(item.name),
      }));
      setWorks(parsed);
    } catch (err) {
      setError('작품을 불러올 수 없습니다');
      console.error('MyWorks load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.container}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack} aria-label="뒤로가기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <div className={styles.stateMessage}>
          <span>작품을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={styles.container}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack} aria-label="뒤로가기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <div className={`${styles.stateMessage} ${styles.error}`}>
          <span>{error}</span>
          <button className={styles.retryBtn} onClick={loadWorks}>다시 시도</button>
        </div>
      </div>
    );
  }

  // 빈 상태
  if (works.length === 0) {
    return (
      <div className={styles.container}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack} aria-label="뒤로가기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <div className={styles.stateMessage}>
          <svg className={styles.emptyIcon} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>아직 등록된 작품이 없습니다</span>
        </div>
      </div>
    );
  }

  // 정상 상태 - 갤러리
  return (
    <div className={styles.container}>
      {onBack && (
        <button className={styles.backBtn} onClick={onBack} aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      <div className={styles.header}>
        <div className={styles.headerTitle}>내 작품</div>
        <div className={styles.headerSubtitle}>멋진 작품들을 감상해보세요</div>
      </div>
      <div className={styles.grid}>
        {works.map((work) => (
          <button
            key={work.path}
            className={styles.card}
            onClick={() => setSelectedWork(work)}
            type="button"
            aria-label={`${work.title} by ${work.artist}`}
          >
            <div className={styles.imageWrapper}>
              <img
                className={styles.image}
                src={work.file}
                alt={`${work.title} - ${work.artist}`}
                loading="lazy"
              />
            </div>
            <div className={styles.cardInfo}>
              <div className={styles.cardTitle}>{work.title}</div>
              <div className={styles.cardArtist}>{work.artist}</div>
            </div>
          </button>
        ))}
      </div>

      {selectedWork && (
        <FullscreenViewer
          imageUrl={selectedWork.file}
          title={selectedWork.title}
          artist={selectedWork.artist}
          onClose={() => setSelectedWork(null)}
        />
      )}
    </div>
  );
}
