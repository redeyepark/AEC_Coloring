import { useState, useEffect } from 'react';
import { ImageInfo } from '../types';

export function useImages() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadImages() {
      try {
        const response = await fetch(`/_AEC/images.json?t=${Date.now()}`);
        if (!response.ok) {
          throw new Error('images.json을 찾을 수 없습니다.');
        }
        const data = await response.json();
        setImages(data.images || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '이미지 로드 실패');
      } finally {
        setIsLoading(false);
      }
    }
    loadImages();
  }, []);

  return { images, isLoading, error };
}
