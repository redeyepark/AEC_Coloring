import styles from './Controls.module.css';

interface ControlsProps {
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  onComplete: () => void;
}

// 되돌리기 아이콘 (화살표)
function UndoIcon({ disabled }: { disabled: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 11L12 6M7 11L12 16M7 11H17"
        stroke={disabled ? "#B0B8C1" : "#3182F6"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 새로고침 아이콘
function RefreshIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 12C4 7.58172 7.58172 4 12 4C15.0736 4 17.7555 5.80151 19 8.5M20 12C20 16.4183 16.4183 20 12 20C8.92638 20 6.24447 18.1985 5 15.5"
        stroke="#3182F6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M19 4V8.5H14.5"
        stroke="#3182F6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 20V15.5H9.5"
        stroke="#3182F6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Controls({
  canUndo,
  onUndo,
  onReset,
  onComplete
}: ControlsProps) {
  return (
    <div className={styles.controls}>
      <button
        className={`${styles.iconBtn} ${!canUndo ? styles.disabled : ''}`}
        onClick={() => canUndo && onUndo()}
        disabled={!canUndo}
        title="되돌리기"
      >
        <UndoIcon disabled={!canUndo} />
      </button>
      <button
        className={styles.iconBtn}
        onClick={onReset}
        title="처음으로"
      >
        <RefreshIcon />
      </button>
      <button
        className={styles.completeBtn}
        onClick={onComplete}
      >
        완료
      </button>
    </div>
  );
}
