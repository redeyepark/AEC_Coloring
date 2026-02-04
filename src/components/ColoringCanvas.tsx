import { useEffect, useRef, useState, useCallback } from 'react';
import { ImageInfo } from '../types';
import styles from './ColoringCanvas.module.css';

interface ColoringCanvasProps {
  image: ImageInfo | null;
  onPathClick: (element: SVGPathElement) => boolean;
  isBlackColor: (color: string | null) => boolean;
  svgRef: React.RefObject<SVGSVGElement | null>;
  selectedColorHex: string;
  onContainerReady?: (container: HTMLElement | null) => void;
}

export function ColoringCanvas({ image, onPathClick, isBlackColor, svgRef, selectedColorHex, onContainerReady }: ColoringCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const originalSvgRef = useRef<string>('');
  // 이벤트 핸들러와 SVG 요소를 ref로 저장
  const clickHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const svgElementRef = useRef<SVGSVGElement | null>(null);
  // 선택된 색상을 ref로 저장하여 항상 최신 값 참조
  const selectedColorRef = useRef<string>(selectedColorHex);

  // 선택된 색상이 변경될 때마다 ref 업데이트
  useEffect(() => {
    selectedColorRef.current = selectedColorHex;
  }, [selectedColorHex]);

  // container가 준비되면 알림
  useEffect(() => {
    if (containerRef.current && onContainerReady) {
      onContainerReady(containerRef.current);
    }
  }, [onContainerReady]);

  // SVG 로드
  useEffect(() => {
    if (!image) return;

    setIsLoading(true);
    setError(null);

    fetch(`/_AEC/${image.file}`)
      .then(response => {
        if (!response.ok) throw new Error('SVG 파일을 찾을 수 없습니다.');
        return response.text();
      })
      .then(text => {
        setSvgContent(text);
        originalSvgRef.current = text;
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [image]);

  // SVG 클릭 핸들러 설정
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!svgContent) return;

    // 이전 이벤트 리스너 제거
    if (svgElementRef.current && clickHandlerRef.current) {
      svgElementRef.current.removeEventListener('click', clickHandlerRef.current);
    }

    // DOM 업데이트 후 실행을 보장하기 위해 requestAnimationFrame 사용
    const rafId = requestAnimationFrame(() => {
      const svg = container.querySelector('svg');
      if (!svg) return;

      // SVG 스타일 설정
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.pointerEvents = 'all';

      // svgRef 연결
      if (svgRef) {
        (svgRef as React.MutableRefObject<SVGSVGElement | null>).current = svg;
      }

      // SVG의 기본 fill="none" 제거 (상속 방지)
      svg.removeAttribute('fill');

      // 모든 g 요소의 pointer-events 활성화
      svg.querySelectorAll('g').forEach(g => {
        g.style.pointerEvents = 'all';
      });

      // path 설정
      const paths = svg.querySelectorAll('path');

      paths.forEach((path) => {
        const currentFill = path.getAttribute('fill');
        // 계산된 스타일도 확인
        const computedFill = window.getComputedStyle(path).fill;

        // 검정색이면 색칠 불가
        if (isBlackColor(currentFill) || isBlackColor(computedFill)) {
          path.style.cursor = 'not-allowed';
          path.style.pointerEvents = 'none';
          path.dataset.colorable = 'false';
        } else {
          path.style.cursor = 'pointer';
          path.style.pointerEvents = 'all';
          path.dataset.colorable = 'true';

          // fill이 없거나 none이거나 투명이면 흰색으로 설정
          if (!currentFill || currentFill === 'none' || currentFill === 'transparent' ||
              computedFill === 'none' || computedFill === 'rgba(0, 0, 0, 0)') {
            path.setAttribute('fill', '#FFFFFF');
          }
        }
      });

      // 클릭 핸들러 정의
      const handleClick = (e: MouseEvent) => {
        const target = e.target as Element;

        if (target.tagName.toLowerCase() !== 'path') return;

        const pathElement = target as SVGPathElement;
        const currentFill = pathElement.getAttribute('fill');
        const currentColor = selectedColorRef.current;

        if (isBlackColor(currentFill)) return;

        e.preventDefault();
        e.stopPropagation();

        // 직접 색상 변경 (ref에서 최신 색상 사용)
        pathElement.setAttribute('fill', currentColor);
        pathElement.style.fill = currentColor;

        // svgContent 상태 업데이트 (React와 동기화)
        const svgElement = container.querySelector('svg');
        if (svgElement) {
          setSvgContent(svgElement.outerHTML);
        }

        onPathClick(pathElement);
      };

      // ref에 저장
      svgElementRef.current = svg;
      clickHandlerRef.current = handleClick;

      svg.addEventListener('click', handleClick);
    });

    return () => {
      cancelAnimationFrame(rafId);
      // ref를 통해 실제 핸들러 제거
      if (svgElementRef.current && clickHandlerRef.current) {
        svgElementRef.current.removeEventListener('click', clickHandlerRef.current);
      }
    };
  }, [svgContent, onPathClick, isBlackColor, svgRef]);

  // 리셋 함수 (외부에서 호출 가능하도록)
  const reset = useCallback(() => {
    if (originalSvgRef.current) {
      setSvgContent(originalSvgRef.current);
    }
  }, []);

  // reset 함수를 window에 노출 (임시 방법)
  useEffect(() => {
    (window as unknown as { resetColoring?: () => void }).resetColoring = reset;
    return () => {
      delete (window as unknown as { resetColoring?: () => void }).resetColoring;
    };
  }, [reset]);

  if (isLoading) {
    return (
      <div className={styles.svgContainer}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.svgContainer}>
        <div className={styles.error}>
          <p>SVG 파일 로드 실패</p>
          <small>{error}</small>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className={styles.svgContainer}>
        <div className={styles.empty}>이미지를 선택해주세요</div>
      </div>
    );
  }

  // 컨테이너 클릭 핸들러
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as Element;

    if (target.tagName.toLowerCase() === 'path') {
      const pathElement = target as SVGPathElement;
      const currentFill = pathElement.getAttribute('fill');
      const currentColor = selectedColorRef.current;

      if (!isBlackColor(currentFill)) {
        // 직접 색상 변경 (ref에서 최신 색상 사용)
        pathElement.setAttribute('fill', currentColor);
        pathElement.style.fill = currentColor;

        // svgContent 상태 업데이트
        const container = containerRef.current;
        const svgElement = container?.querySelector('svg');
        if (svgElement) {
          setSvgContent(svgElement.outerHTML);
        }

        onPathClick(pathElement);
      }
    }
  };

  return (
    <div className={styles.svgContainer}>
      <div className={styles.polaroidFrame}>
        <div
          ref={containerRef}
          className={styles.coloringSvg}
          onClick={handleContainerClick}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>
    </div>
  );
}
