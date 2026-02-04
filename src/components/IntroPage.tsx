import { useState, useEffect } from 'react';
import styles from './IntroPage.module.css';

// gallery 폴더의 이미지 목록
const GALLERY_IMAGES = [
  '/gallery/20260202_02.png',
  '/gallery/20260202_03.jpg',
  '/gallery/20260202_04.jpeg',
  '/gallery/20260202_06.jpeg',
];

interface IntroPageProps {
  onStart: () => void;
}

export function IntroPage({ onStart }: IntroPageProps) {
  const [currentImage, setCurrentImage] = useState('');

  useEffect(() => {
    // 랜덤 이미지 선택
    const randomIndex = Math.floor(Math.random() * GALLERY_IMAGES.length);
    setCurrentImage(GALLERY_IMAGES[randomIndex]);
  }, []);

  return (
    <div className={styles.introPage} onClick={onStart}>
      <div className={styles.imageContainer}>
        {currentImage && (
          <img
            src={currentImage}
            alt="컬러링 예시"
            className={styles.galleryImage}
          />
        )}
      </div>
      <div className={styles.startHint}>
        <span className={styles.hintText}>화면을 터치하여 시작</span>
      </div>
    </div>
  );
}
