import { useState, useEffect, useRef, useCallback } from 'react';
import { ColoringCanvas } from './components/ColoringCanvas';
import { Palette } from './components/Palette';
import { Controls } from './components/Controls';
import { IntroPage } from './components/IntroPage';
import { ResultPage } from './components/ResultPage';
import { useImages } from './hooks/useImages';
import { useColoring } from './hooks/useColoring';
import { saveAsImage, saveAsCalendar, saveAsWallpaper } from './utils/saveImage';
import { ImageInfo } from './types';
import './App.css';

type AppPhase = 'intro' | 'coloring' | 'result';

export default function App() {
  const { images, isLoading: imagesLoading, error: imagesError } = useImages();
  const [currentImage, setCurrentImage] = useState<ImageInfo | null>(null);
  const [phase, setPhase] = useState<AppPhase>('intro');
  const svgRef = useRef<SVGSVGElement | null>(null);

  const {
    selectedColor,
    setSelectedColor,
    history,
    fillPath,
    undo,
    redo,
    clearHistory,
    isBlackColor,
    canUndo,
    canRedo
  } = useColoring();

  // 랜덤 이미지 선택 (색칠 화면 진입 시)
  useEffect(() => {
    if (images.length > 0 && !currentImage && phase === 'coloring') {
      const randomIndex = Math.floor(Math.random() * images.length);
      setCurrentImage(images[randomIndex]);
    }
  }, [images, currentImage, phase]);

  // 인트로 → 색칠 전환
  const handleStart = useCallback(() => {
    setPhase('coloring');
  }, []);

  // 색칠 완료 → 결과 전환
  const handleComplete = useCallback(() => {
    setPhase('result');
  }, []);

  // 새로 시작 (결과 → 인트로)
  const handleRestart = useCallback(() => {
    setPhase('intro');
    setCurrentImage(null);
    clearHistory();
  }, [clearHistory]);

  // 리셋 핸들러
  const handleReset = useCallback(() => {
    clearHistory();
    // SVG 리로드를 위해 currentImage를 다시 설정
    if (currentImage) {
      const temp = currentImage;
      setCurrentImage(null);
      setTimeout(() => setCurrentImage(temp), 0);
    }
  }, [currentImage, clearHistory]);

  // 이미지 저장 핸들러
  const handleSaveImage = useCallback(async (): Promise<void> => {
    if (svgRef.current && currentImage) {
      await saveAsImage(svgRef.current, currentImage.name);
    } else {
      throw new Error('저장할 이미지가 없습니다.');
    }
  }, [currentImage]);

  // 달력 저장 핸들러
  const handleSaveCalendar = useCallback(async (): Promise<void> => {
    if (svgRef.current && currentImage) {
      await saveAsCalendar(svgRef.current, currentImage.name);
    } else {
      throw new Error('저장할 이미지가 없습니다.');
    }
  }, [currentImage]);

  // 배경화면 저장 핸들러
  const handleSaveWallpaper = useCallback(async (): Promise<void> => {
    if (svgRef.current && currentImage) {
      await saveAsWallpaper(svgRef.current, currentImage.name);
    } else {
      throw new Error('저장할 이미지가 없습니다.');
    }
  }, [currentImage]);

  // 인트로 화면
  if (phase === 'intro') {
    return <IntroPage onStart={handleStart} />;
  }

  // 결과 화면
  if (phase === 'result') {
    return (
      <ResultPage
        svgRef={svgRef}
        onSaveImage={handleSaveImage}
        onSaveCalendar={handleSaveCalendar}
        onSaveWallpaper={handleSaveWallpaper}
        onRestart={handleRestart}
      />
    );
  }

  // 색칠 화면 - 로딩 상태
  if (imagesLoading) {
    return (
      <main className="main-container">
        <div className="loading-state">이미지 목록 로딩 중...</div>
      </main>
    );
  }

  // 색칠 화면 - 에러 상태
  if (imagesError) {
    return (
      <main className="main-container">
        <div className="error-state">
          <p>이미지 목록을 로드할 수 없습니다.</p>
          <small>{imagesError}</small>
        </div>
      </main>
    );
  }

  // 색칠 화면 - 이미지 없음
  if (images.length === 0) {
    return (
      <main className="main-container">
        <div className="empty-state">
          <p>_AEC 폴더에 이미지가 없습니다.</p>
          <small>images.json에 이미지를 추가하세요.</small>
        </div>
      </main>
    );
  }

  // 색칠 화면
  return (
    <main className="main-container coloring-page">
      <ColoringCanvas
        image={currentImage}
        onPathClick={fillPath}
        isBlackColor={isBlackColor}
        svgRef={svgRef}
        selectedColorHex={selectedColor.hex}
      />

      <Palette
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
      />

      <Controls
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={handleReset}
        onComplete={handleComplete}
      />
    </main>
  );
}
