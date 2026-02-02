import { Button } from '@toss/tds-mobile';
import styles from './Controls.module.css';

interface ControlsProps {
  canUndo: boolean;
  historyCount: number;
  onUndo: () => void;
  onReset: () => void;
  onSaveCalendar: () => void;
  onSaveWallpaper: () => void;
}

export function Controls({
  canUndo,
  historyCount,
  onUndo,
  onReset,
  onSaveCalendar,
  onSaveWallpaper
}: ControlsProps) {
  return (
    <div className={styles.controls}>
      <Button
        color="primary"
        variant="fill"
        size="medium"
        display="block"
        onClick={onUndo}
        disabled={!canUndo}
      >
        되돌리기 {canUndo && `(${historyCount})`}
      </Button>
      <Button
        color="light"
        variant="weak"
        size="medium"
        display="block"
        onClick={onReset}
      >
        처음으로
      </Button>
      <Button
        color="dark"
        variant="fill"
        size="medium"
        display="block"
        onClick={onSaveCalendar}
      >
        달력 저장
      </Button>
      <Button
        color="dark"
        variant="fill"
        size="medium"
        display="block"
        onClick={onSaveWallpaper}
      >
        배경 저장
      </Button>
    </div>
  );
}
