import { useState, useCallback, useRef } from 'react';
import { ColorInfo } from '../types';
import { COLORS } from '../constants/colors';

const MAX_HISTORY = 50;

// 히스토리 아이템 (인덱스 기반)
interface HistoryItemIndex {
  pathIndex: number;
  previousColor: string;
  newColor: string;
}

// Redo 스택용 타입
interface RedoItem {
  pathIndex: number;
  color: string;
  previousColor: string;
}

export function useColoring() {
  const [selectedColor, setSelectedColor] = useState<ColorInfo>(COLORS[0]);
  const [history, setHistory] = useState<HistoryItemIndex[]>([]);
  const [redoStack, setRedoStack] = useState<RedoItem[]>([]);
  // SVG 컨테이너 참조
  const svgContainerRef = useRef<HTMLElement | null>(null);

  // SVG 컨테이너 설정
  const setSvgContainer = useCallback((container: HTMLElement | null) => {
    svgContainerRef.current = container;
  }, []);

  // path 인덱스로 element 찾기
  const getPathByIndex = useCallback((index: number): SVGPathElement | null => {
    if (!svgContainerRef.current) return null;
    const paths = svgContainerRef.current.querySelectorAll('svg path');
    return paths[index] as SVGPathElement || null;
  }, []);

  // element의 인덱스 찾기
  const getPathIndex = useCallback((element: SVGPathElement): number => {
    if (!svgContainerRef.current) return -1;
    const paths = svgContainerRef.current.querySelectorAll('svg path');
    return Array.from(paths).indexOf(element);
  }, []);

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

    // path 인덱스 저장
    const pathIndex = getPathIndex(element);
    if (pathIndex === -1) {
      console.warn('Path index not found');
      return false;
    }

    // 색상 변경 (속성과 스타일 모두 설정)
    element.setAttribute('fill', selectedColor.hex);
    element.style.fill = selectedColor.hex;

    // 새 액션 시 redo 스택 초기화
    setRedoStack([]);

    // 히스토리에 저장 (인덱스 기반)
    setHistory(prev => {
      const newHistory = [...prev, {
        pathIndex,
        previousColor: currentFill || '#FFFFFF',
        newColor: selectedColor.hex
      }];
      return newHistory.slice(-MAX_HISTORY);
    });

    return true;
  }, [selectedColor, isBlackColor, getPathIndex]);

  const undo = useCallback(() => {
    if (history.length === 0) return false;

    const lastAction = history[history.length - 1];
    const element = getPathByIndex(lastAction.pathIndex);

    if (element) {
      // redo 스택에 추가
      setRedoStack(redoPrev => [...redoPrev, {
        pathIndex: lastAction.pathIndex,
        color: lastAction.newColor,
        previousColor: lastAction.previousColor
      }]);
      // 이전 색상으로 복원
      element.setAttribute('fill', lastAction.previousColor);
      element.style.fill = lastAction.previousColor;
    }

    setHistory(prev => prev.slice(0, -1));
    return true;
  }, [history, getPathByIndex]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return false;

    const lastRedo = redoStack[redoStack.length - 1];
    const element = getPathByIndex(lastRedo.pathIndex);

    if (element) {
      // 히스토리에 추가
      setHistory(historyPrev => [...historyPrev, {
        pathIndex: lastRedo.pathIndex,
        previousColor: lastRedo.previousColor,
        newColor: lastRedo.color
      }]);
      // 색상 복원
      element.setAttribute('fill', lastRedo.color);
      element.style.fill = lastRedo.color;
    }

    setRedoStack(prev => prev.slice(0, -1));
    return true;
  }, [redoStack, getPathByIndex]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setRedoStack([]);
  }, []);

  return {
    selectedColor,
    setSelectedColor,
    history,
    fillPath,
    undo,
    redo,
    clearHistory,
    isBlackColor,
    canUndo: history.length > 0,
    canRedo: redoStack.length > 0,
    setSvgContainer
  };
}
