import { useState, useEffect, useRef, useCallback } from 'react';
import { ColoringCanvas } from './components/ColoringCanvas';
import { Palette } from './components/Palette';
import { Controls } from './components/Controls';
import { ResultPage } from './components/ResultPage';
import { IntroPage } from './components/IntroPage';
import { useImages } from './hooks/useImages';
import { useColoring } from './hooks/useColoring';
import { saveAsImage, saveAsCalendar, saveAsWallpaper } from './utils/saveImage';
import { ImageInfo } from './types';
import './App.css';

export default function App() {
  const { images, isLoading: imagesLoading, error: imagesError } = useImages();
  const [currentImage, setCurrentImage] = useState<ImageInfo | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
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
    canRedo,
    setSvgContainer,
    setOnSvgSync
  } = useColoring();

  // 리셋 핸들러 - 현재 이미지의 색칠 초기화
  const handleReset = useCallback(() => {
    clearHistory();
    // 현재 이미지를 다시 로드하여 색칠 초기화
    const img = currentImage;
    setCurrentImage(null);
    setTimeout(() => setCurrentImage(img), 0);
  }, [currentImage, clearHistory]);

  // 완료 핸들러
  const handleComplete = useCallback(() => {
    setIsCompleted(true);
  }, []);

  // 이미지 저장 핸들러
  const handleSaveImage = useCallback(async () => {
    if (svgRef.current && currentImage) {
      await saveAsImage(svgRef.current, currentImage.name);
    }
  }, [currentImage]);

  // 달력 저장 핸들러
  const handleSaveCalendar = useCallback(async () => {
    if (svgRef.current && currentImage) {
      await saveAsCalendar(svgRef.current, currentImage.name);
    }
  }, [currentImage]);

  // 배경화면 저장 핸들러
  const handleSaveWallpaper = useCallback(async () => {
    if (svgRef.current && currentImage) {
      await saveAsWallpaper(svgRef.current, currentImage.name);
    }
  }, [currentImage]);

  // 새로 시작하기 핸들러
  const handleRestart = useCallback(() => {
    setIsCompleted(false);
    setIsStarted(false);
    clearHistory();
    setCurrentImage(null);
  }, [clearHistory]);

  // 인트로에서 시작하기 핸들러
  const handleStart = useCallback(() => {
    if (images.length > 0) {
      const randomIndex = Math.floor(Math.random() * images.length);
      setCurrentImage(images[randomIndex]);
      setIsStarted(true);
    }
  }, [images]);

  // 로딩 상태
  if (imagesLoading) {
    return (
      <main className="main-container">
        <div className="loading-state">이미지 목록 로딩 중...</div>
      </main>
    );
  }

  // 에러 상태
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

  // 이미지 없음
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

  // 인트로 화면
  if (!isStarted) {
    return (
      <main className="main-container">
        <IntroPage onStart={handleStart} />
      </main>
    );
  }

  // 완료 화면
  if (isCompleted) {
    return (
      <main className="main-container">
        <ResultPage
          svgRef={svgRef}
          onSaveImage={handleSaveImage}
          onSaveCalendar={handleSaveCalendar}
          onSaveWallpaper={handleSaveWallpaper}
          onRestart={handleRestart}
        />
      </main>
    );
  }

  return (
    <main className="main-container">
      <ColoringCanvas
        image={currentImage}
        onPathClick={fillPath}
        isBlackColor={isBlackColor}
        svgRef={svgRef}
        selectedColorHex={selectedColor.hex}
        onContainerReady={setSvgContainer}
        setOnSvgSync={setOnSvgSync}
      />

      <div className="right-panel">
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
      </div>
    </main>
  );
}
