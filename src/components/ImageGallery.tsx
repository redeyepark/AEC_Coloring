import { ImageInfo } from '../types';
import styles from './ImageGallery.module.css';

interface ImageGalleryProps {
  images: ImageInfo[];
  isLoading: boolean;
  error: string | null;
  onImageSelect: (image: ImageInfo) => void;
}

export function ImageGallery({ images, isLoading, error, onImageSelect }: ImageGalleryProps) {
  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.stateMessage}>
          <span>이미지 로딩 중...</span>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={styles.container}>
        <div className={`${styles.stateMessage} ${styles.error}`}>
          <span>이미지를 불러올 수 없습니다</span>
          <span style={{ fontSize: '12px', color: '#B0B8C1' }}>{error}</span>
        </div>
      </div>
    );
  }

  // 빈 상태
  if (images.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.stateMessage}>
          <span>현재 사용 가능한 이미지가 없습니다</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>갤러리</div>
        <div className={styles.subtitle}>색칠할 이미지를 선택하세요</div>
      </div>
      <div className={styles.grid}>
        {images.map((image) => (
          <button
            key={image.file}
            className={styles.card}
            onClick={() => onImageSelect(image)}
            type="button"
            aria-label={`${image.name} 이미지 선택`}
          >
            <div className={styles.imageWrapper}>
              <img
                className={styles.image}
                src={image.file}
                alt={image.name}
                loading="lazy"
              />
            </div>
            <div className={styles.name}>{image.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
