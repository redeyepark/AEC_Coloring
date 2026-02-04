import { useState, useCallback, useRef } from 'react';
import { ColorInfo } from '../types';
import { COLORS } from '../constants/colors';

const MAX_HISTORY = 50;

interface PathHistoryItem {
  pathId: string;
  previousColor: string;
}

export function useColoring() {
  const [selectedColor, setSelectedColor] = useState<ColorInfo>(COLORS[0]);
  const [history, setHistory] = useState<PathHistoryItem[]>([]);
  const svgContainerRef = useRef<HTMLElement | null>(null);

  const setSvgContainer = useCallback((container: HTMLElement | null) => {
    svgContainerRef.current = container;
  }, []);

  const isBlackColor = useCallback((color: string | null): boolean => {
    if (!color) return false;
    const c = color.toLowerCase().trim();
    if (c === 'black' || c === '#000000' || c === '#000') return true;
    const rgbMatch = c.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      return r === 0 && g === 0 && b === 0;
    }
    return false;
  }, []);

  const fillPath = useCallback((element: SVGPathElement) => {
    const currentFill = element.getAttribute('fill');

    if (isBlackColor(currentFill)) {
      return false;
    }

    if (currentFill === selectedColor.hex) {
      return false;
    }

    // path에 고유 ID 부여 (없으면 생성)
    let pathId = element.getAttribute('data-path-id');
    if (!pathId) {
      pathId = `path-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      element.setAttribute('data-path-id', pathId);
    }

    // 색상 변경
    element.setAttribute('fill', selectedColor.hex);
    element.style.fill = selectedColor.hex;

    // 히스토리에 저장 (pathId 사용)
    setHistory(prev => {
      const newHistory = [...prev, { pathId, previousColor: currentFill || '#FFFFFF' }];
      return newHistory.slice(-MAX_HISTORY);
    });

    return true;
  }, [selectedColor, isBlackColor]);

  const undo = useCallback(() => {
    if (history.length === 0) return false;

    const lastAction = history[history.length - 1];

    // svgContainer에서 pathId로 element 찾기
    if (svgContainerRef.current && lastAction) {
      const element = svgContainerRef.current.querySelector(`[data-path-id="${lastAction.pathId}"]`) as SVGPathElement;
      if (element) {
        element.setAttribute('fill', lastAction.previousColor);
        element.style.fill = lastAction.previousColor;
      }
    }

    setHistory(prev => prev.slice(0, -1));
    return true;
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    selectedColor,
    setSelectedColor,
    history,
    fillPath,
    undo,
    clearHistory,
    isBlackColor,
    canUndo: history.length > 0,
    setSvgContainer
  };
}
