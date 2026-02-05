import { ColorInfo } from '../types';
import { COLORS } from '../constants/colors';
import styles from './Palette.module.css';

interface PaletteProps {
  selectedColor: ColorInfo;
  onColorSelect: (color: ColorInfo) => void;
}

export function Palette({ selectedColor, onColorSelect }: PaletteProps) {
  return (
    // 'paletteSection' 클래스: App.css 그리드 배치용, styles.paletteSection: 스타일링용
    <section className={`paletteSection ${styles.paletteSection}`}>
      <div className={styles.colorPalette}>
        {COLORS.map((color) => (
          <button
            key={color.hex}
            className={`${styles.colorBtn} ${selectedColor.hex === color.hex ? styles.selected : ''}`}
            style={{ backgroundColor: color.hex }}
            onClick={() => onColorSelect(color)}
            title={color.name}
            data-color={color.hex}
          />
        ))}
      </div>
    </section>
  );
}
