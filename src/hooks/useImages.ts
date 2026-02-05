import { useState, useEffect } from 'react';
import { ImageInfo } from '../types';
import { listImages } from '../lib/supabase';
import { isImageVisibleByFilename, getCleanFilename } from '../utils/scheduleUtils';

// localStorage 키
const DISABLED_IMAGES_KEY = 'aec-disabled-images';

// 비활성화된 이미지 목록 가져오기
function getDisabledImages(): string[] {
  const stored = localStorage.getItem(DISABLED_IMAGES_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Supabase Storage에서만 이미지를 로드하는 훅
// 비활성화된 이미지 및 노출 기간이 아닌 이미지는 필터링하여 제외
export function useImages() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadImages() {
      try {
        // Supabase에서 SVG 이미지 목록 가져오기
        const supabaseImages = await listImages('svg');

        // Supabase 이미지가 없으면 빈 상태로 설정
        if (supabaseImages.length === 0) {
          setImages([]);
          return;
        }

        // 비활성화된 이미지 목록 가져오기
        const disabledImages = getDisabledImages();

        // 활성화된 이미지 및 노출 기간 내 이미지만 필터링하여 ImageInfo 형식으로 변환
        const imageInfos: ImageInfo[] = supabaseImages
          .filter(img => {
            // 비활성화된 이미지 제외
            if (disabledImages.includes(img.path)) return false;

            // 파일명 기반 노출 기간 확인
            return isImageVisibleByFilename(img.name);
          })
          .map(img => ({
            name: getCleanFilename(img.name).replace('.svg', ''), // 스케줄 정보 및 확장자 제거
            file: img.url, // Supabase 전체 URL 사용
            artist: 'Uploaded'
          }));

        setImages(imageInfos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Supabase 이미지 로드 실패');
      } finally {
        setIsLoading(false);
      }
    }
    loadImages();
  }, []);

  return { images, isLoading, error };
}
