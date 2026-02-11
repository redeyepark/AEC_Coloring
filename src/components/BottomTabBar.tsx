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

// 색칠하기 아이콘 (붓 모양)
function ColoringIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.37 2.63a1.5 1.5 0 0 1 2.12 0l.88.88a1.5 1.5 0 0 1 0 2.12L9.41 17.59a2 2 0 0 1-.95.53l-3.54.88.88-3.54a2 2 0 0 1 .53-.95L18.37 2.63z" />
      <path d="M2 22c1.5-1 3-2 4-3" />
    </svg>
  );
}

// 내 작품 아이콘 (별 모양)
function MyWorksIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// 탭 정의
const tabs: { key: TabType; label: string; icon: React.ComponentType }[] = [
  { key: 'home', label: '홈', icon: HomeIcon },
  { key: 'gallery', label: '갤러리', icon: GalleryIcon },
  { key: 'coloring', label: '색칠하기', icon: ColoringIcon },
  { key: 'myworks', label: '내 작품', icon: MyWorksIcon },
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
