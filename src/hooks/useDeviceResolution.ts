import { DeviceResolution } from '../types';

export function getDeviceResolution(): DeviceResolution {
  const dpr = window.devicePixelRatio || 1;
  const screenWidth = window.screen.width * dpr;
  const screenHeight = window.screen.height * dpr;

  // 세로 모드 기준으로 정렬 (width < height)
  const width = Math.min(screenWidth, screenHeight);
  const height = Math.max(screenWidth, screenHeight);

  // 최소/최대 해상도 제한 (품질 보장)
  const minWidth = 720;
  const maxWidth = 1440;
  const finalWidth = Math.max(minWidth, Math.min(maxWidth, width));
  const aspectRatio = height / width;
  const finalHeight = Math.round(finalWidth * aspectRatio);

  return { width: finalWidth, height: finalHeight, dpr };
}
