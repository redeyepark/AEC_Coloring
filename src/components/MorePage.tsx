import styles from './MorePage.module.css';

// 앱 버전 정보
const APP_VERSION = '1.0.7';

interface MorePageProps {
  onMyWorks: () => void;
  onColorGuide: () => void;
  onColorStory: () => void;
  onAbout: () => void;
  onArtist: () => void;
  onPrivacy: () => void;
}

// 별 아이콘 (명예의 전당)
function StarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// 팔레트 아이콘 (색칠 가이드)
function PaletteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="2" />
      <circle cx="17.5" cy="10.5" r="2" />
      <circle cx="8.5" cy="7.5" r="2" />
      <circle cx="6.5" cy="12.5" r="2" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.7 1.7-1.5 0-.4-.1-.7-.4-1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.7 1.7-1.7H16c3.3 0 6-2.7 6-6 0-5.5-4.5-9.8-10-9.8z" />
    </svg>
  );
}

// 책 아이콘 (색상 이야기)
function BookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

// 정보 아이콘 (앱 소개)
function InfoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

// 사람 아이콘 (작가 소개)
function PersonIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// 방패 아이콘 (개인정보처리방침)
function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// 더보기 페이지 컴포넌트
export function MorePage({ onMyWorks, onColorGuide, onColorStory, onAbout, onArtist, onPrivacy }: MorePageProps) {
  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>더보기</h1>
      </header>

      {/* 메인 메뉴 목록 */}
      <div className={styles.menuList}>
        <button className={styles.menuItem} onClick={onMyWorks}>
          <span className={styles.menuIcon}><StarIcon /></span>
          <span className={styles.menuLabel}>명예의 전당</span>
        </button>
        <button className={styles.menuItem} onClick={onColorGuide}>
          <span className={styles.menuIcon}><PaletteIcon /></span>
          <span className={styles.menuLabel}>색칠 가이드</span>
        </button>
        <button className={styles.menuItem} onClick={onColorStory}>
          <span className={styles.menuIcon}><BookIcon /></span>
          <span className={styles.menuLabel}>색상 이야기</span>
        </button>
        <button className={styles.menuItem} onClick={onAbout}>
          <span className={styles.menuIcon}><InfoIcon /></span>
          <span className={styles.menuLabel}>앱 소개</span>
        </button>
        <button className={styles.menuItem} onClick={onArtist}>
          <span className={styles.menuIcon}><PersonIcon /></span>
          <span className={styles.menuLabel}>작가 소개</span>
        </button>
      </div>

      {/* 구분선 */}
      <div className={styles.divider} />

      {/* 법적 정보 섹션 */}
      <div className={styles.menuList}>
        <button className={styles.menuItem} onClick={onPrivacy}>
          <span className={styles.menuIcon}><ShieldIcon /></span>
          <span className={styles.menuLabel}>개인정보처리방침</span>
        </button>
      </div>

      {/* 버전 정보 */}
      <div className={styles.versionInfo}>v{APP_VERSION}</div>
    </div>
  );
}
