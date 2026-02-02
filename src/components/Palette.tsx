import { ColorInfo } from '../types';
import { COLORS } from '../constants/colors';
import styles from './Palette.module.css';

interface PaletteProps {
  selectedColor: ColorInfo;
  onColorSelect: (color: ColorInfo) => void;
}

export function Palette({ selectedColor, onColorSelect }: PaletteProps) {
  return (
    <section className={styles.paletteSection}>
      <div className={styles.paletteHeader}>
        <span className={styles.paletteTitle}>🎨 색상 팔레트</span>
        <div className={styles.selectedColorDisplay}>
          <div
            className={styles.selectedColorPreview}
            style={{ backgroundColor: selectedColor.hex }}
          />
          <span className={styles.selectedColorText}>{selectedColor.name}</span>
        </div>
      </div>
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
