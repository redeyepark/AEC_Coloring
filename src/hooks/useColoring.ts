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
  const [redoStack, setRedoStack] = useState<PathHistoryItem[]>([]);
  // 히스토리를 ref로도 저장하여 최신 상태 접근 보장
  const historyRef = useRef<PathHistoryItem[]>([]);
  const redoStackRef = useRef<PathHistoryItem[]>([]);
  const svgContainerRef = useRef<HTMLElement | null>(null);
  const onSvgSyncRef = useRef<((html: string) => void) | null>(null);

  const setSvgContainer = useCallback((container: HTMLElement | null) => {
    svgContainerRef.current = container;
    console.log('[useColoring] setSvgContainer:', container);
  }, []);

  const setOnSvgSync = useCallback((callback: ((html: string) => void) | null) => {
    onSvgSyncRef.current = callback;
    console.log('[useColoring] setOnSvgSync:', callback ? 'registered' : 'cleared');
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
    const newItem = { pathId, previousColor: currentFill || '#FFFFFF' };
    setHistory(prev => {
      const newHistory = [...prev, newItem];
      const sliced = newHistory.slice(-MAX_HISTORY);
      historyRef.current = sliced; // ref도 업데이트
      return sliced;
    });

    // 새로운 액션이 발생하면 redo 스택 초기화
    redoStackRef.current = [];
    setRedoStack([]);

    console.log('[fillPath] Added to history:', newItem);
    return true;
  }, [selectedColor, isBlackColor]);

  const undo = useCallback(() => {
    // ref에서 최신 히스토리 가져오기
    const currentHistory = historyRef.current;
    console.log('[undo] Current history length:', currentHistory.length);

    if (currentHistory.length === 0) {
      console.log('[undo] No history to undo');
      return false;
    }

    const lastAction = currentHistory[currentHistory.length - 1];
    console.log('[undo] Last action:', lastAction);

    // svgContainer에서 pathId로 element 찾기
    console.log('[undo] svgContainerRef.current:', svgContainerRef.current);

    if (!svgContainerRef.current) {
      console.error('[undo] svgContainerRef.current is null!');
      return false;
    }

    const element = svgContainerRef.current.querySelector(`[data-path-id="${lastAction.pathId}"]`) as SVGPathElement;
    console.log('[undo] Found element:', element);

    if (element) {
      const currentFill = element.getAttribute('fill') || '#FFFFFF';
      console.log('[undo] Changing fill from', currentFill, 'to', lastAction.previousColor);
      element.setAttribute('fill', lastAction.previousColor);
      element.style.fill = lastAction.previousColor;

      // Redo 스택에 추가 (현재 색상 저장)
      const redoItem = { pathId: lastAction.pathId, previousColor: currentFill };
      const newRedoStack = [...redoStackRef.current, redoItem];
      redoStackRef.current = newRedoStack;
      setRedoStack(newRedoStack);
      console.log('[undo] Added to redo stack:', redoItem);

      // SVG 상태 동기화 콜백 호출
      const svgElement = svgContainerRef.current.querySelector('svg');
      console.log('[undo] SVG element:', svgElement);
      console.log('[undo] onSvgSyncRef.current:', onSvgSyncRef.current ? 'exists' : 'null');

      if (svgElement && onSvgSyncRef.current) {
        const newHtml = svgElement.outerHTML;
        console.log('[undo] Calling sync callback');
        onSvgSyncRef.current(newHtml);
      }
    } else {
      console.error('[undo] Element not found with pathId:', lastAction.pathId);
    }

    // 히스토리 업데이트
    const newHistory = currentHistory.slice(0, -1);
    historyRef.current = newHistory;
    setHistory(newHistory);

    console.log('[undo] New history length:', newHistory.length);
    return true;
  }, []);

  const redo = useCallback(() => {
    // ref에서 최신 redo 스택 가져오기
    const currentRedoStack = redoStackRef.current;
    console.log('[redo] Current redo stack length:', currentRedoStack.length);

    if (currentRedoStack.length === 0) {
      console.log('[redo] No redo actions available');
      return false;
    }

    const lastRedo = currentRedoStack[currentRedoStack.length - 1];
    console.log('[redo] Last redo action:', lastRedo);

    if (!svgContainerRef.current) {
      console.error('[redo] svgContainerRef.current is null!');
      return false;
    }

    const element = svgContainerRef.current.querySelector(`[data-path-id="${lastRedo.pathId}"]`) as SVGPathElement;
    console.log('[redo] Found element:', element);

    if (element) {
      const currentFill = element.getAttribute('fill') || '#FFFFFF';
      console.log('[redo] Changing fill from', currentFill, 'to', lastRedo.previousColor);
      element.setAttribute('fill', lastRedo.previousColor);
      element.style.fill = lastRedo.previousColor;

      // 히스토리에 다시 추가 (현재 색상 저장)
      const historyItem = { pathId: lastRedo.pathId, previousColor: currentFill };
      const newHistory = [...historyRef.current, historyItem];
      historyRef.current = newHistory;
      setHistory(newHistory);
      console.log('[redo] Added back to history:', historyItem);

      // SVG 상태 동기화 콜백 호출
      const svgElement = svgContainerRef.current.querySelector('svg');
      if (svgElement && onSvgSyncRef.current) {
        const newHtml = svgElement.outerHTML;
        console.log('[redo] Calling sync callback');
        onSvgSyncRef.current(newHtml);
      }
    } else {
      console.error('[redo] Element not found with pathId:', lastRedo.pathId);
    }

    // Redo 스택 업데이트
    const newRedoStack = currentRedoStack.slice(0, -1);
    redoStackRef.current = newRedoStack;
    setRedoStack(newRedoStack);

    console.log('[redo] New redo stack length:', newRedoStack.length);
    return true;
  }, []);

  const clearHistory = useCallback(() => {
    historyRef.current = [];
    redoStackRef.current = [];
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
    setSvgContainer,
    setOnSvgSync
  };
}
