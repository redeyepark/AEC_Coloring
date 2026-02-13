import { TabType } from '../types';
import styles from './BottomTabBar.module.css';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  visible: boolean;
}

// 홈 아이콘 (집 모양)
function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <polyline points="9 21 9 14 15 14 15 21" />
    </svg>
  );
}

// 갤러리 아이콘 (그리드 모양)
function GalleryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

// 트로피 아이콘 (명예의 전당)
function TrophyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

// 더보기 아이콘 (가로 점 3개)
function MoreIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 탭 정의
const tabs: { key: TabType; label: string; icon: React.ComponentType }[] = [
  { key: 'home', label: '홈', icon: HomeIcon },
  { key: 'gallery', label: '갤러리', icon: GalleryIcon },
  { key: 'myworks', label: '명예의 전당', icon: TrophyIcon },
  { key: 'more', label: '더보기', icon: MoreIcon },
];

export function BottomTabBar({ activeTab, onTabChange, visible }: BottomTabBarProps) {
  return (
    <nav
      className={`${styles.tabBar} ${!visible ? styles.hidden : ''}`}
      role="tablist"
      aria-label="하단 탭 메뉴"
    >
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          className={`${styles.tab} ${activeTab === key ? styles.active : ''}`}
          onClick={() => onTabChange(key)}
          role="tab"
          aria-selected={activeTab === key}
          aria-label={label}
        >
          <span className={styles.tabIcon}>
            <Icon />
          </span>
          <span className={styles.tabLabel}>{label}</span>
        </button>
      ))}
    </nav>
  );
}
