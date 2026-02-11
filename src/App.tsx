import { useState, useEffect, useRef, useCallback } from 'react';
import { ColoringCanvas } from './components/ColoringCanvas';
import { Palette } from './components/Palette';
import { Controls } from './components/Controls';
import { IntroPage } from './components/IntroPage';
import { ResultPage } from './components/ResultPage';
import { AdminPage } from './components/AdminPage';
import { PrivacyPage } from './components/PrivacyPage';
import { ColorGuidePage } from './components/ColorGuidePage';
import { ColorStoryPage } from './components/ColorStoryPage';
import { AboutPage } from './components/AboutPage';
import { ArtistPage } from './components/ArtistPage';
import { BottomTabBar } from './components/BottomTabBar';
import { ImageGallery } from './components/ImageGallery';
import { MyWorksPage } from './components/MyWorksPage';
import { useImages } from './hooks/useImages';
import { useColoring } from './hooks/useColoring';
import { saveAsImage, saveAsCalendar, saveAsWallpaper, saveAsDiary } from './utils/saveImage';
import { ImageInfo, TabType } from './types';
import './App.css';

type AppPhase = 'intro' | 'gallery' | 'coloring' | 'result' | 'admin' | 'privacy' | 'colorguide' | 'colorstory' | 'about' | 'artist' | 'myworks';

export default function App() {
  const { images, isLoading: imagesLoading, error: imagesError } = useImages();
  const [currentImage, setCurrentImage] = useState<ImageInfo | null>(null);
  const [phase, setPhase] = useState<AppPhase>('intro');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // URL 파라미터로 관리 페이지 접근 확인
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setShowAdmin(true);
    }
  }, []);

  const {
    selectedColor,
    setSelectedColor,
    fillPath,
    undo,
    redo,
    clearHistory,
    isBlackColor,
    canUndo,
    canRedo,
    setSvgContainer
  } = useColoring();

  // 탭 변경 핸들러
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    switch (tab) {
      case 'home': setPhase('intro'); break;
      case 'gallery': setPhase('gallery'); break;
      case 'coloring':
        if (!currentImage) {
          setPhase('gallery');
          setActiveTab('gallery');
        } else {
          setPhase('coloring');
        }
        break;
      case 'myworks': setPhase('myworks'); break;
    }
  }, [currentImage]);

  // 갤러리에서 이미지 선택 핸들러
  const handleImageSelect = useCallback((image: ImageInfo) => {
    setCurrentImage(image);
    clearHistory();
    setPhase('coloring');
    setActiveTab('coloring');
  }, [clearHistory]);

  // 인트로 → 갤러리 전환
  const handleStart = useCallback(() => {
    setPhase('gallery');
    setActiveTab('gallery');
  }, []);

  // 인트로 → 개인정보처리방침 전환
  const handlePrivacy = useCallback(() => {
    setPhase('privacy');
  }, []);

  // 개인정보처리방침 → 인트로 전환
  const handlePrivacyBack = useCallback(() => {
    setPhase('intro');
  }, []);

  // 콘텐츠 페이지 네비게이션
  const handleColorGuide = useCallback(() => { setPhase('colorguide'); }, []);
  const handleColorStory = useCallback(() => { setPhase('colorstory'); }, []);
  const handleAbout = useCallback(() => { setPhase('about'); }, []);
  const handleArtist = useCallback(() => { setPhase('artist'); }, []);
  const handleContentBack = useCallback(() => { setPhase('intro'); }, []);

  // 색칠 완료 → 결과 전환
  const handleComplete = useCallback(() => {
    setPhase('result');
  }, []);

  // 새로 시작 (결과 → 인트로)
  const handleRestart = useCallback(() => {
    setPhase('intro');
    setActiveTab('home');
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

  // 일기장 저장 핸들러
  const handleSaveDiary = useCallback(async (text: string): Promise<void> => {
    if (svgRef.current && currentImage) {
      await saveAsDiary(svgRef.current, currentImage.name, text);
    } else {
      throw new Error('저장할 이미지가 없습니다.');
    }
  }, [currentImage]);

  // 관리 페이지 (오버레이)
  const adminOverlay = showAdmin ? (
    <AdminPage onClose={() => {
      setShowAdmin(false);
      // URL에서 admin 파라미터 제거
      window.history.replaceState({}, '', window.location.pathname);
    }} />
  ) : null;

  // 인트로 화면
  if (phase === 'intro') {
    return (
      <div className="page-transition" key="intro">
        <IntroPage
          onStart={handleStart}
          onAdminOpen={() => setShowAdmin(true)}
          onPrivacy={handlePrivacy}
          onColorGuide={handleColorGuide}
          onColorStory={handleColorStory}
          onAbout={handleAbout}
          onArtist={handleArtist}
        />
        <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} visible={true} />
        {adminOverlay}
      </div>
    );
  }

  // 갤러리 화면
  if (phase === 'gallery') {
    return (
      <div className="page-transition" key="gallery">
        <ImageGallery
          images={images}
          isLoading={imagesLoading}
          error={imagesError}
          onImageSelect={handleImageSelect}
        />
        <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} visible={true} />
        {adminOverlay}
      </div>
    );
  }

  // 내 작품 화면
  if (phase === 'myworks') {
    return (
      <div className="page-transition" key="myworks">
        <MyWorksPage />
        <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} visible={true} />
        {adminOverlay}
      </div>
    );
  }

  // 개인정보처리방침 화면
  if (phase === 'privacy') {
    return (
      <div className="page-transition" key="privacy">
        <PrivacyPage onBack={handlePrivacyBack} />
      </div>
    );
  }

  // 색칠 가이드 화면
  if (phase === 'colorguide') {
    return (
      <div className="page-transition" key="colorguide">
        <ColorGuidePage onBack={handleContentBack} />
      </div>
    );
  }

  // 색상 이야기 화면
  if (phase === 'colorstory') {
    return (
      <div className="page-transition" key="colorstory">
        <ColorStoryPage onBack={handleContentBack} />
      </div>
    );
  }

  // 앱 소개 화면
  if (phase === 'about') {
    return (
      <div className="page-transition" key="about">
        <AboutPage onBack={handleContentBack} />
      </div>
    );
  }

  // 작가 소개 화면
  if (phase === 'artist') {
    return (
      <div className="page-transition" key="artist">
        <ArtistPage onBack={handleContentBack} />
      </div>
    );
  }

  // 결과 화면
  if (phase === 'result') {
    return (
      <div className="page-transition" key="result">
        <ResultPage
          svgRef={svgRef}
          onSaveImage={handleSaveImage}
          onSaveCalendar={handleSaveCalendar}
          onSaveWallpaper={handleSaveWallpaper}
          onSaveDiary={handleSaveDiary}
          onRestart={handleRestart}
        />
      </div>
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
    <main className="main-container coloring-page page-transition" key="coloring">
      <ColoringCanvas
        image={currentImage}
        onPathClick={fillPath}
        isBlackColor={isBlackColor}
        svgRef={svgRef}
        selectedColorHex={selectedColor.hex}
        onContainerReady={setSvgContainer}
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
