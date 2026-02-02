import { useState, useEffect, useRef, useCallback } from 'react';
import { ColoringCanvas } from './components/ColoringCanvas';
import { Palette } from './components/Palette';
import { Controls } from './components/Controls';
import { useImages } from './hooks/useImages';
import { useColoring } from './hooks/useColoring';
import { saveAsCalendar, saveAsWallpaper } from './utils/saveImage';
import { ImageInfo } from './types';
import './App.css';

export default function App() {
  const { images, isLoading: imagesLoading, error: imagesError } = useImages();
  const [currentImage, setCurrentImage] = useState<ImageInfo | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const {
    selectedColor,
    setSelectedColor,
    history,
    fillPath,
    undo,
    clearHistory,
    isBlackColor,
    canUndo
  } = useColoring();

  // 랜덤 이미지 선택
  useEffect(() => {
    if (images.length > 0 && !currentImage) {
      const randomIndex = Math.floor(Math.random() * images.length);
      setCurrentImage(images[randomIndex]);
    }
  }, [images, currentImage]);

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

  // 달력 저장 핸들러
  const handleSaveCalendar = useCallback(() => {
    if (svgRef.current && currentImage) {
      saveAsCalendar(svgRef.current, currentImage.name);
    } else {
      alert('저장할 이미지가 없습니다.');
    }
  }, [currentImage]);

  // 배경화면 저장 핸들러
  const handleSaveWallpaper = useCallback(() => {
    if (svgRef.current && currentImage) {
      saveAsWallpaper(svgRef.current, currentImage.name);
    } else {
      alert('저장할 이미지가 없습니다.');
    }
  }, [currentImage]);

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

  return (
    <main className="main-container">
      <ColoringCanvas
        image={currentImage}
        onPathClick={fillPath}
        isBlackColor={isBlackColor}
        svgRef={svgRef}
        selectedColorHex={selectedColor.hex}
      />

      <div className="right-panel">
        <Palette
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
        />

        <Controls
          canUndo={canUndo}
          historyCount={history.length}
          onUndo={undo}
          onReset={handleReset}
          onSaveCalendar={handleSaveCalendar}
          onSaveWallpaper={handleSaveWallpaper}
        />
      </div>
    </main>
  );
}
