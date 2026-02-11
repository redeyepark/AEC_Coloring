import { useState } from 'react';
import { ColorInfo } from '../types';
import { COLORS } from '../constants/colors';
import styles from './Palette.module.css';

interface PaletteProps {
  selectedColor: ColorInfo;
  onColorSelect: (color: ColorInfo) => void;
}

// 4개 대그룹 정의 (12개 카테고리를 병합)
interface ColorGroup {
  name: string;
  representative: string; // 대표 색상 (탭 아이콘용)
  indices: number[]; // COLORS 배열 내 인덱스 목록
}

// 연속 인덱스 범위를 배열로 생성
function range(start: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => start + i);
}

const GROUPS: ColorGroup[] = [
  {
    name: '따뜻한 색',
    representative: '#EF5350',
    indices: [
      ...range(0, 5),   // 빨강
      ...range(5, 5),   // 주황
      ...range(10, 6),  // 노랑
      ...range(37, 5),  // 핑크
    ],
  },
  {
    name: '차가운 색',
    representative: '#42A5F5',
    indices: [
      ...range(16, 6),  // 초록
      ...range(22, 5),  // 시안
      ...range(27, 5),  // 파랑
      ...range(32, 5),  // 보라
    ],
  },
  {
    name: '자연색',
    representative: '#8D6E63',
    indices: [
      ...range(42, 7),  // 갈색
      ...range(49, 6),  // 피부
      ...range(76, 8),  // 무채색
    ],
  },
  {
    name: '비비드',
    representative: '#E53935',
    indices: [...range(55, 21)], // 머터리얼
  },
];

// 색상 hex로 해당 그룹 인덱스 찾기
function findGroupIndex(colorHex: string): number {
  const colorIndex = COLORS.findIndex(c => c.hex === colorHex);
  if (colorIndex === -1) return 0;

  for (let i = 0; i < GROUPS.length; i++) {
    if (GROUPS[i].indices.includes(colorIndex)) {
      return i;
    }
  }
  return 0;
}

export function Palette({ selectedColor, onColorSelect }: PaletteProps) {
  // 현재 선택된 색상의 그룹으로 초기화
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(
    () => findGroupIndex(selectedColor.hex)
  );

  // 선택된 그룹의 색상 목록
  const currentGroup = GROUPS[selectedGroupIndex];
  const groupColors = currentGroup.indices.map(i => COLORS[i]);

  return (
    // 'paletteSection' 클래스: App.css 그리드 배치용, styles.paletteSection: 스타일링용
    <section className={`paletteSection ${styles.paletteSection}`}>
      {/* 그룹 탭 행 (4개 → 스크롤 불필요) */}
      <div className={styles.categoryTabs}>
        {GROUPS.map((group, index) => (
          <button
            key={group.name}
            className={`${styles.categoryTab} ${index === selectedGroupIndex ? styles.activeTab : ''}`}
            onClick={() => setSelectedGroupIndex(index)}
            aria-label={`${group.name} 계열 색상`}
            aria-pressed={index === selectedGroupIndex}
          >
            <span
              className={styles.tabSwatch}
              style={{ backgroundColor: group.representative }}
            />
            <span className={styles.tabName}>{group.name}</span>
          </button>
        ))}
      </div>

      {/* 선택된 그룹의 색상 버튼 (그리드 ~3행) */}
      <div className={styles.colorGrid}>
        {groupColors.map((color) => (
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
