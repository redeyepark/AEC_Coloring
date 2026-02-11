import styles from './MyWorksPage.module.css';

interface MyWorksPageProps {
  onBack?: () => void;
}

export function MyWorksPage({ onBack }: MyWorksPageProps) {
  return (
    <div className={styles.container}>
      {/* 뒤로가기 버튼 */}
      {onBack && (
        <button className={styles.backBtn} onClick={onBack} aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      {/* 별 아이콘 */}
      <svg
        className={styles.icon}
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <div className={styles.title}>내 작품</div>
      <div className={styles.subtitle}>준비 중입니다</div>
    </div>
  );
}
