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

// 디바이스 해상도 타입
export interface DeviceResolution {
  width: number;
  height: number;
  dpr: number;
}
