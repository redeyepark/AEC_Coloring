import { useEffect, useState, useCallback } from 'react';
import styles from './LoadingIcon.module.css';

// 그리드 설정
const GRID_SIZE = 3; // 3x3 그리드
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

// Loading.svg에서 추출한 컬러 팔레트 (무채색 제외)
const LOADING_COLORS = [
  '#FFFF00', // yellow
  '#FFB800', // orange-yellow
  '#FF9300', // orange
  '#CAEA00', // lime green
  '#E8BE00', // gold
  '#D68900', // dark orange
  '#C88131', // brown
  '#48B300', // green
  '#8F8400', // olive
  '#EC0000', // red
  '#0093D2', // cyan
  '#385DC5', // blue
  '#752C81', // purple
  '#B13885', // magenta
  '#0048FF', // bright blue
  '#4400AB', // dark purple
  '#9300B7', // violet
];

function getRandomColor(): string {
  const randomIndex = Math.floor(Math.random() * LOADING_COLORS.length);
  return LOADING_COLORS[randomIndex];
}

// 초기 그리드 색상 생성
function generateInitialColors(): string[] {
  return Array.from({ length: TOTAL_CELLS }, () => getRandomColor());
}

export function LoadingIcon() {
  const [cellColors, setCellColors] = useState<string[]>(generateInitialColors);

  // 랜덤 셀 색상 변경
  const updateRandomCells = useCallback(() => {
    // 1-3개의 랜덤한 셀 선택
    const cellsToUpdate = Math.floor(Math.random() * 3) + 1;
    const indices = new Set<number>();

    while (indices.size < cellsToUpdate) {
      indices.add(Math.floor(Math.random() * TOTAL_CELLS));
    }

    setCellColors(prev => {
      const newColors = [...prev];
      indices.forEach(index => {
        // 현재 색상과 다른 색상 선택
        let newColor = getRandomColor();
        while (newColor === prev[index]) {
          newColor = getRandomColor();
        }
        newColors[index] = newColor;
      });
      return newColors;
    });
  }, []);

  // 주기적 색상 변경 (200-500ms)
  useEffect(() => {
    const scheduleUpdate = () => {
      const delay = Math.floor(Math.random() * 300) + 200; // 200-500ms
      return setTimeout(() => {
        updateRandomCells();
        timerId = scheduleUpdate();
      }, delay);
    };

    let timerId = scheduleUpdate();

    return () => clearTimeout(timerId);
  }, [updateRandomCells]);

  return (
    <div className={styles.loadingGrid}>
      {cellColors.map((color, index) => (
        <div
          key={index}
          className={styles.cell}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
