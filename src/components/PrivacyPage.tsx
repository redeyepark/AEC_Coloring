import styles from './PrivacyPage.module.css';

interface PrivacyPageProps {
  onBack: () => void;
}

export function PrivacyPage({ onBack }: PrivacyPageProps) {
  // 뒤로가기 버튼 클릭 (이벤트 전파 방지)
  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBack();
  };

  return (
    <div className={styles.privacyPage}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={handleBackClick} title="뒤로 가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>뒤로</span>
        </button>
        <h1 className={styles.title}>개인정보처리방침</h1>
        <div className={styles.spacer} />
      </header>

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <main className={styles.content}>
        <p className={styles.lastUpdated}>최종 수정일: 2026년 2월</p>

        <section className={styles.section}>
          <h2>1. 개요</h2>
          <p>
            오늘의 컬러링(이하 "서비스")은 사용자의 개인정보를 소중히 여기며, 관련 법규를 준수합니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. 수집하는 정보</h2>
          <p>본 서비스는 사용자로부터 개인정보를 직접 수집하지 않습니다.</p>
          <p>
            다만, 광고 서비스 제공을 위해 제3자(Google AdSense)가 다음 정보를 자동으로 수집할 수 있습니다:
          </p>
          <ul>
            <li>기기 정보 (브라우저 유형, 운영체제)</li>
            <li>IP 주소</li>
            <li>쿠키 및 유사 기술을 통한 정보</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. 광고 및 쿠키</h2>
          <p>본 서비스는 Google AdSense를 통해 광고를 제공합니다.</p>
          <p>
            Google은 쿠키를 사용하여 사용자의 관심사에 맞는 광고를 게재할 수 있습니다.
            사용자는{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Google 광고 설정
            </a>
            에서 맞춤 광고를 비활성화할 수 있습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. 어린이 개인정보 보호</h2>
          <p>
            본 서비스는 어린이 대상 콘텐츠를 포함하며, COPPA(아동 온라인 개인정보 보호법)를 준수합니다.
            어린이 사용자에게는 맞춤형 광고가 제공되지 않습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. 데이터 저장</h2>
          <p>
            색칠 작업은 사용자 기기에서만 처리되며, 서버에 저장되지 않습니다.
            이미지 활성화 설정만 브라우저 localStorage에 저장됩니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. 연락처</h2>
          <p>서비스 관련 문의: support@todaycoloring.com</p>
        </section>

        <section className={styles.section}>
          <h2>7. 변경 사항</h2>
          <p>개인정보처리방침이 변경될 경우, 이 페이지에 업데이트됩니다.</p>
        </section>
      </main>
    </div>
  );
}
