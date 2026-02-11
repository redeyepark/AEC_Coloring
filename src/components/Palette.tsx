import { useState, useRef, useEffect } from 'react';
import { ColorInfo } from '../types';
import { COLORS } from '../constants/colors';
import styles from './Palette.module.css';

interface PaletteProps {
  selectedColor: ColorInfo;
  onColorSelect: (color: ColorInfo) => void;
}

// 카테고리 정의 (colors.ts의 그룹 순서에 맞춤)
interface ColorCategory {
  name: string;
  representative: string; // 대표 색상 (탭 아이콘용)
  startIndex: number;
  count: number;
}

const CATEGORIES: ColorCategory[] = [
  { name: '빨강', representative: '#EF5350', startIndex: 0, count: 5 },
  { name: '주황', representative: '#FFA726', startIndex: 5, count: 5 },
  { name: '노랑', representative: '#FFEB3B', startIndex: 10, count: 6 },
  { name: '초록', representative: '#66BB6A', startIndex: 16, count: 5 },
  { name: '시안', representative: '#26C6DA', startIndex: 21, count: 4 },
  { name: '파랑', representative: '#42A5F5', startIndex: 25, count: 5 },
  { name: '보라', representative: '#AB47BC', startIndex: 30, count: 5 },
  { name: '핑크', representative: '#EC407A', startIndex: 35, count: 5 },
  { name: '갈색', representative: '#8D6E63', startIndex: 40, count: 7 },
  { name: '피부', representative: '#E8C4B8', startIndex: 47, count: 4 },
  { name: '머터리얼', representative: '#E53935', startIndex: 51, count: 8 },
  { name: '무채색', representative: '#9E9E9E', startIndex: 59, count: 6 },
];

// 색상 hex로 해당 카테고리 인덱스 찾기
function findCategoryIndex(colorHex: string): number {
  const colorIndex = COLORS.findIndex(c => c.hex === colorHex);
  if (colorIndex === -1) return 0;

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    if (colorIndex >= cat.startIndex && colorIndex < cat.startIndex + cat.count) {
      return i;
    }
  }
  return 0;
}

export function Palette({ selectedColor, onColorSelect }: PaletteProps) {
  // 현재 선택된 색상의 카테고리로 초기화
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>(
    () => findCategoryIndex(selectedColor.hex)
  );

  // 탭 스크롤 컨테이너 ref
  const tabsRef = useRef<HTMLDivElement>(null);
  // 활성 탭 ref (스크롤 위치 조정용)
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // 선택된 카테고리의 색상 목록
  const currentCategory = CATEGORIES[selectedCategoryIndex];
  const categoryColors = COLORS.slice(
    currentCategory.startIndex,
    currentCategory.startIndex + currentCategory.count
  );

  // 활성 탭이 보이도록 스크롤 조정
  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const tab = activeTabRef.current;
      const container = tabsRef.current;
      const tabLeft = tab.offsetLeft;
      const tabWidth = tab.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = container.scrollLeft;

      // 탭이 보이지 않으면 스크롤
      if (tabLeft < scrollLeft) {
        container.scrollTo({ left: tabLeft - 8, behavior: 'smooth' });
      } else if (tabLeft + tabWidth > scrollLeft + containerWidth) {
        container.scrollTo({ left: tabLeft + tabWidth - containerWidth + 8, behavior: 'smooth' });
      }
    }
  }, [selectedCategoryIndex]);

  return (
    // 'paletteSection' 클래스: App.css 그리드 배치용, styles.paletteSection: 스타일링용
    <section className={`paletteSection ${styles.paletteSection}`}>
      {/* 카테고리 탭 행 */}
      <div className={styles.categoryTabs} ref={tabsRef}>
        {CATEGORIES.map((cat, index) => (
          <button
            key={cat.name}
            ref={index === selectedCategoryIndex ? activeTabRef : null}
            className={`${styles.categoryTab} ${index === selectedCategoryIndex ? styles.activeTab : ''}`}
            onClick={() => setSelectedCategoryIndex(index)}
            aria-label={`${cat.name} 계열 색상`}
            aria-pressed={index === selectedCategoryIndex}
          >
            <span
              className={styles.tabSwatch}
              style={{ backgroundColor: cat.representative }}
            />
            <span className={styles.tabName}>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* 선택된 카테고리의 색상 버튼 */}
      <div className={styles.colorRow}>
        {categoryColors.map((color) => (
          <button
            key={color.hex}
            className={`${styles.colorBtn} ${selectedColor.hex === color.hex ? styles.selected : ''}`}
            style={{ backgroundColor: color.hex }}
            onClick={() => onColorSelect(color)}
            title={color.name}
            aria-label={color.name}
            data-color={color.hex}
          />
        ))}
      </div>
    </section>
  );
}
