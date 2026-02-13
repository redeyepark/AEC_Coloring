// 탭 타입
export type TabType = 'home' | 'gallery' | 'myworks' | 'more';

// 이미지 정보 타입
export interface ImageInfo {
  file: string;
  name: string;
}

// 색상 정보 타입
export interface ColorInfo {
  hex: string;
  name: string;
}

// 히스토리 항목 타입
export interface HistoryItem {
  element: SVGPathElement;
  previousColor: string;
}

// 앱 상태 타입
export interface AppState {
  selectedColor: ColorInfo;
  currentImageIndex: number;
  history: HistoryItem[];
  isLoading: boolean;
  images: ImageInfo[];
}

// 내 작품 아이템 타입
export interface MyWorkItem {
  file: string;
  path: string;
  title: string;
  artist: string;
}

// 디바이스 해상도 타입
export interface DeviceResolution {
  width: number;
  height: number;
  dpr: number;
}
