import { useState } from 'react';
import styles from './ResultPage.module.css';

interface ResultPageProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  onSaveImage: () => Promise<void>;
  onSaveCalendar: () => Promise<void>;
  onSaveWallpaper: () => Promise<void>;
  onRestart: () => void;
}

export function ResultPage({
  svgRef,
  onSaveImage,
  onSaveCalendar,
  onSaveWallpaper,
  onRestart
}: ResultPageProps) {
  const [savedImage, setSavedImage] = useState(false);
  const [savedCalendar, setSavedCalendar] = useState(false);
  const [savedWallpaper, setSavedWallpaper] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 2000);
  };

  const handleSaveImage = async () => {
    if (savedImage) return;
    try {
      await onSaveImage();
      setSavedImage(true);
      showMessage('갤러리에 저장해주세요!');
    } catch {
      showMessage('저장 실패. 다시 시도해주세요.');
    }
  };

  const handleSaveCalendar = async () => {
    if (savedCalendar) return;
    try {
      await onSaveCalendar();
      setSavedCalendar(true);
      showMessage('갤러리에 저장해주세요!');
    } catch {
      showMessage('저장 실패. 다시 시도해주세요.');
    }
  };

  const handleSaveWallpaper = async () => {
    if (savedWallpaper) return;
    try {
      await onSaveWallpaper();
      setSavedWallpaper(true);
      showMessage('갤러리에 저장해주세요!');
    } catch {
      showMessage('저장 실패. 다시 시도해주세요.');
    }
  };

  return (
    <div className={styles.resultPage}>
      {message && <div className={styles.toast}>{message}</div>}

      <div className={styles.previewArea}>
        <div className={styles.svgPreview}>
          {svgRef.current && (
            <div
              className={styles.svgContainer}
              dangerouslySetInnerHTML={{
                __html: new XMLSerializer().serializeToString(svgRef.current)
              }}
            />
          )}
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button
          className={`${styles.saveBtn} ${savedImage ? styles.saved : ''}`}
          onClick={handleSaveImage}
          disabled={savedImage}
        >
          {savedImage ? '이미지 저장됨' : '이미지 저장'}
        </button>
        <button
          className={`${styles.saveBtn} ${savedCalendar ? styles.saved : ''}`}
          onClick={handleSaveCalendar}
          disabled={savedCalendar}
        >
          {savedCalendar ? '달력 저장됨' : '달력으로 저장'}
        </button>
        <button
          className={`${styles.saveBtn} ${savedWallpaper ? styles.saved : ''}`}
          onClick={handleSaveWallpaper}
          disabled={savedWallpaper}
        >
          {savedWallpaper ? '배경화면 저장됨' : '배경화면으로 저장'}
        </button>
        <button
          className={styles.restartBtn}
          onClick={onRestart}
        >
          새로 시작하기
        </button>
      </div>
    </div>
  );
}
