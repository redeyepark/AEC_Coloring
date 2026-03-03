import { useState, useMemo } from 'react';
import styles from './ResultPage.module.css';
import {
  extractColorsFromSvg,
  analyzeColors,
  type ColorAnalysisResult
} from '../utils/colorAnalysis';
import { useAds } from '../hooks/useAds';
import { BannerAd } from './ads/BannerAd';
import { InterstitialAd } from './ads/InterstitialAd';

interface ResultPageProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  onSaveImage: () => Promise<void>;
  onSaveCalendar: () => Promise<void>;
  onSaveWallpaper: () => Promise<void>;
  onSavePcCalendar: () => Promise<void>;
  onSaveDiary: (text: string) => Promise<void>;
  onRestart: () => void;
}

export function ResultPage({
  svgRef,
  onSaveImage,
  onSaveCalendar,
  onSaveWallpaper,
  onSavePcCalendar,
  onSaveDiary,
  onRestart
}: ResultPageProps) {
  const [savedImage, setSavedImage] = useState(false);
  const [savedCalendar, setSavedCalendar] = useState(false);
  const [savedWallpaper, setSavedWallpaper] = useState(false);
  const [savedDiary, setSavedDiary] = useState(false);
  const [savedPcCalendar, setSavedPcCalendar] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 그림일기 모달 상태
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [diaryText, setDiaryText] = useState('');
  const MAX_DIARY_CHARS = 98;

  // 광고 상태
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [pendingRestart, setPendingRestart] = useState(false);
  const { canShowInterstitial, recordInterstitialShown } = useAds();

  // 색상 분석 결과 (SVG가 있을 때만 분석)
  const colorAnalysis: ColorAnalysisResult | null = useMemo(() => {
    if (!svgRef.current) return null;
    const colors = extractColorsFromSvg(svgRef.current);
    return analyzeColors(colors);
  }, [svgRef.current]);

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 2000);
  };

  // 저장 성공 후 광고 표시 (조건 충족 시)
  const showAdAfterSave = () => {
    if (canShowInterstitial()) {
      setShowInterstitial(true);
      recordInterstitialShown();
    }
  };

  const handleSaveImage = async () => {
    if (savedImage) return;
    try {
      await onSaveImage();
      setSavedImage(true);
      showMessage('갤러리에 저장해주세요!');
      // 저장 성공 후 광고 표시
      showAdAfterSave();
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
      // 저장 성공 후 광고 표시
      showAdAfterSave();
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
      // 저장 성공 후 광고 표시
      showAdAfterSave();
    } catch {
      showMessage('저장 실패. 다시 시도해주세요.');
    }
  };

  const handleSavePcCalendar = async () => {
    if (savedPcCalendar) return;
    try {
      await onSavePcCalendar();
      setSavedPcCalendar(true);
      showMessage('갤러리에 저장해주세요!');
      // 저장 성공 후 광고 표시
      showAdAfterSave();
    } catch {
      showMessage('저장 실패. 다시 시도해주세요.');
    }
  };

  // 그림일기 버튼 클릭 - 모달 열기
  const handleDiaryClick = () => {
    if (savedDiary) return;
    // 기본 텍스트로 색상 분석 메시지 설정
    setDiaryText(colorAnalysis?.message || '');
    setShowDiaryModal(true);
  };

  // 그림일기 저장 실행
  const handleSaveDiary = async () => {
    try {
      await onSaveDiary(diaryText);
      setSavedDiary(true);
      setShowDiaryModal(false);
      showMessage('갤러리에 저장해주세요!');
    } catch {
      showMessage('저장 실패. 다시 시도해주세요.');
    }
  };

  // 텍스트 입력 핸들러 (98자 제한)
  const handleDiaryTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_DIARY_CHARS) {
      setDiaryText(text);
    }
  };

  // 새로 시작하기 핸들러 (광고 표시 후 재시작)
  const handleRestart = () => {
    if (canShowInterstitial()) {
      setPendingRestart(true);
      setShowInterstitial(true);
      recordInterstitialShown();
    } else {
      onRestart();
    }
  };

  // 전면 광고 닫힘 핸들러
  const handleInterstitialClose = () => {
    setShowInterstitial(false);
    if (pendingRestart) {
      setPendingRestart(false);
      onRestart();
    }
  };

  return (
    <div className={styles.resultPage}>
      {message && <div className={styles.toast}>{message}</div>}

      {/* 그림일기 텍스트 입력 모달 */}
      {showDiaryModal && (
        <div className={styles.diaryModal}>
          <div className={styles.diaryModalContent}>
            <h3 className={styles.diaryModalTitle}>그림일기 내용 입력</h3>
            <p className={styles.diaryModalHint}>오늘의 기분이나 하고 싶은 말을 적어보세요</p>
            <textarea
              className={styles.diaryTextarea}
              value={diaryText}
              onChange={handleDiaryTextChange}
              placeholder="내용을 입력하세요..."
              rows={5}
              autoFocus
            />
            <div className={styles.diaryCharCount}>
              {diaryText.length} / {MAX_DIARY_CHARS}자
            </div>
            <div className={styles.diaryModalButtons}>
              <button
                className={styles.diaryModalCancel}
                onClick={() => setShowDiaryModal(false)}
              >
                취소
              </button>
              <button
                className={styles.diaryModalSave}
                onClick={handleSaveDiary}
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* 오른쪽 섹션: 색상 분석 + 버튼 (가로모드에서 사용) */}
      <div className={styles.rightSection}>
        {/* 색상 심리 분석 섹션 */}
        {colorAnalysis && (
          <div className={styles.colorAnalysis}>
            <p className={styles.analysisMessage}>
              "{colorAnalysis.message}"
            </p>
          </div>
        )}

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
            className={`${styles.saveBtn} ${savedPcCalendar ? styles.saved : ''}`}
            onClick={handleSavePcCalendar}
            disabled={savedPcCalendar}
          >
            {savedPcCalendar ? 'PC 달력 저장됨' : 'PC 달력 배경화면'}
          </button>
          <button
            className={`${styles.saveBtn} ${savedDiary ? styles.saved : ''}`}
            onClick={handleDiaryClick}
            disabled={savedDiary}
          >
            {savedDiary ? '그림일기 저장됨' : '그림일기 저장'}
          </button>
          <button
            className={styles.restartBtn}
            onClick={handleRestart}
          >
            새로 시작하기
          </button>
        </div>

        {/* 배너 광고 */}
        <BannerAd />
      </div>

      {/* 전면 광고 */}
      <InterstitialAd
        isOpen={showInterstitial}
        onClose={handleInterstitialClose}
      />
    </div>
  );
}
