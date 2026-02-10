import { BannerAd } from './ads/BannerAd';
import styles from './ArtistPage.module.css';

interface ArtistPageProps {
  onBack: () => void;
}

export function ArtistPage({ onBack }: ArtistPageProps) {
  // 뒤로가기 버튼 클릭 (이벤트 전파 방지)
  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBack();
  };

  return (
    <div className={styles.artistPage}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={handleBackClick} title="뒤로 가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>뒤로</span>
        </button>
        <h1 className={styles.title}>작가 소개</h1>
        <div className={styles.spacer} />
      </header>

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <main className={styles.content}>
        {/* 작가 소개 배너 */}
        <div className={styles.introBanner}>
          <div className={styles.introEmoji} role="img" aria-label="붓">🖌️</div>
          <h2 className={styles.introTitle}>박종우 (redeyepark)</h2>
          <p className={styles.introDesc}>
            그림으로 교류하고 있습니다
          </p>
        </div>

        {/* 작가 소개 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.sectionIcon} ${styles.sectionIconBlue}`} role="img" aria-label="사람">🧑‍🎨</div>
            <h2>작가 소개</h2>
          </div>
          <p>
            박종우 작가는 프로그래밍 개발자로 커리어를 시작하여,
            현재 모바일 분야 엔터프라이즈 B2B 비즈니스 개발에 종사하고 있습니다.
            디지털 제품을 기획하는 과정에서 우연히 디지털 드로잉을 접하게 되었고,
            SNS에서 사람들의 프로필을 캐릭터에 맞게 그려주며 본격적인 활동을 시작하였습니다.
          </p>
          <p>
            &quot;나만의 아이콘&quot; 프로젝트를 통해 사람들의 개성을 담은 프로필 캐릭터를 제작하며,
            그림을 매개로 사람들과 교류하고 있습니다.
            개발자의 시선으로 바라본 디지털 드로잉은 기술과 감성이 만나는 지점에서
            새로운 형태의 소통을 만들어 가고 있습니다.
          </p>
        </section>

        <hr className={styles.divider} />

        {/* 작업 철학 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.sectionIcon} ${styles.sectionIconGreen}`} role="img" aria-label="잎">🌿</div>
            <h2>작업 철학</h2>
          </div>
          <p>
            박종우 작가는 그림을 그릴 때 세 가지 원칙을 중요하게 생각합니다.
            이 원칙들은 작가의 모든 작업에 일관되게 적용되며,
            오늘의 컬러링 도안에도 그 철학이 담겨 있습니다.
          </p>

          <div className={styles.highlightBox}>
            <p>
              <strong>첫째, 웃는 얼굴을 단순하게 표현합니다.</strong><br />
              복잡한 표현보다 단순한 선 안에 담긴 따뜻한 미소가
              보는 이에게 더 큰 위로를 전한다고 믿습니다.
            </p>
          </div>

          <div className={styles.highlightBox}>
            <p>
              <strong>둘째, 개인의 고유한 색을 찾되, 제한된 색상을 사용합니다.</strong><br />
              모든 사람에게는 자신만의 색이 있습니다.
              그 색을 최소한의 팔레트로 표현함으로써
              오히려 개인의 특별함이 더욱 뚜렷하게 드러납니다.
            </p>
          </div>

          <div className={styles.highlightBox}>
            <p>
              <strong>셋째, 프로필 자유 사용을 위해 작가 서명을 표기하지 않습니다.</strong><br />
              그림은 그려진 순간부터 그 사람의 것이라는 생각으로,
              누구나 부담 없이 자신의 프로필로 사용할 수 있도록 서명을 넣지 않습니다.
            </p>
          </div>
        </section>

        <hr className={styles.divider} />

        {/* 오늘의 컬러링과 함께 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.sectionIcon} ${styles.sectionIconPurple}`} role="img" aria-label="팔레트">🎨</div>
            <h2>&apos;오늘의 컬러링&apos;과 함께</h2>
          </div>
          <p>
            박종우 작가는 오늘의 컬러링 앱의 컬러링 도안 콘텐츠를 제공하는 작가입니다.
            단순하면서도 따뜻한 선으로 이루어진 도안들은
            색을 채워 넣는 사람의 감성과 개성이 온전히 드러나도록 설계되었습니다.
          </p>
          <p>
            작가의 &quot;웃는 얼굴을 단순하게&quot;라는 철학은 컬러링 도안에도 그대로 반영되어 있습니다.
            복잡하지 않은 선 안에서 색칠하는 이가 자유롭게 자신만의 색을 찾아갈 수 있도록,
            여백과 단순함을 소중히 여기는 도안을 제공합니다.
            제한된 선 안에서 무한한 색의 가능성을 발견하는 즐거움,
            그것이 작가가 오늘의 컬러링을 통해 전하고자 하는 가치입니다.
          </p>
        </section>

        <hr className={styles.divider} />

        {/* 참여 문의 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.sectionIcon} ${styles.sectionIconOrange}`} role="img" aria-label="편지">✉️</div>
            <h2>참여 문의</h2>
          </div>
          <div className={styles.contactSection}>
            <p>
              스케치로 남기고 싶은 추억이 있으신가요?<br />
              사연과 사진(그림)을 메일로 보내주세요.
            </p>
            <a
              className={styles.emailLink}
              href="mailto:redeyepark@naver.com"
              aria-label="사연 보내기 이메일"
            >
              redeyepark@naver.com
            </a>
            <p>
              소중한 추억을 작가가 따뜻한 스케치로 담아드립니다.
              여러분의 이야기가 세상에 하나뿐인 그림이 됩니다.
            </p>
          </div>
        </section>

        {/* 하단 배너 광고 */}
        <div className={styles.adSection}>
          <BannerAd />
        </div>
      </main>
    </div>
  );
}
