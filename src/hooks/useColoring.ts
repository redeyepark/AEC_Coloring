import { useState, useCallback } from 'react';
import { ColorInfo, HistoryItem } from '../types';
import { COLORS } from '../constants/colors';

const MAX_HISTORY = 50;

export function useColoring() {
  const [selectedColor, setSelectedColor] = useState<ColorInfo>(COLORS[0]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const isBlackColor = useCallback((color: string | null): boolean => {
    if (!color) return false;
    const c = color.toLowerCase().trim();
    // 정확히 #000000만 색칠 불가 (어두운 색상도 색칠 가능하도록)
    if (c === 'black' || c === '#000000' || c === '#000') return true;
    // rgb(0,0,0)만 검정색으로 판별
    const rgbMatch = c.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      // 정확히 rgb(0,0,0)만 검정색
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

    // 색상 변경 (속성과 스타일 모두 설정)
    element.setAttribute('fill', selectedColor.hex);
    element.style.fill = selectedColor.hex;

    // 히스토리에 저장
    setTimeout(() => {
      setHistory(prev => {
        const newHistory = [...prev, { element, previousColor: currentFill || '#FFFFFF' }];
        return newHistory.slice(-MAX_HISTORY);
      });
    }, 0);

    return true;
  }, [selectedColor, isBlackColor]);

  const undo = useCallback(() => {
    if (history.length === 0) return false;

    setHistory(prev => {
      const newHistory = [...prev];
      const lastAction = newHistory.pop();
      if (lastAction?.element?.parentNode) {
        lastAction.element.setAttribute('fill', lastAction.previousColor);
      }
      return newHistory;
    });
    return true;
  }, [history.length]);

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
    canUndo: history.length > 0
  };
}
