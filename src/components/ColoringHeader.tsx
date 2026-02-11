import styles from './ColoringHeader.module.css';

interface ColoringHeaderProps {
  title: string;
  onBack: () => void;
  onComplete: () => void;
}

// 색칠 화면 상단 네비게이션 바
export function ColoringHeader({ title, onBack, onComplete }: ColoringHeaderProps) {
  return (
    <header className={styles.header}>
      <button
        className={styles.backBtn}
        onClick={onBack}
        aria-label="갤러리로 돌아가기"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15 18L9 12L15 6"
            stroke="var(--tds-text-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <span className={styles.title}>{title}</span>
      <button
        className={styles.completeBtn}
        onClick={onComplete}
      >
        완료
      </button>
    </header>
  );
}
