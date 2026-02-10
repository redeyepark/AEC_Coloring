import { BannerAd } from './ads/BannerAd';
import styles from './AboutPage.module.css';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
  // 뒤로가기 버튼 클릭 (이벤트 전파 방지)
  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBack();
  };

  return (
    <div className={styles.aboutPage}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={handleBackClick} title="뒤로 가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>뒤로</span>
        </button>
        <h1 className={styles.title}>앱 소개</h1>
        <div className={styles.spacer} />
      </header>

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <main className={styles.content}>
        {/* 앱 소개 배너 */}
        <div className={styles.introBanner}>
          <div className={styles.introEmoji} role="img" aria-label="팔레트">🎨</div>
          <h2 className={styles.introTitle}>오늘의 컬러링</h2>
          <p className={styles.introDesc}>
            하루 10분, 색칠로 찾는 나만의 힐링 시간.
            바쁜 일상 속 휴식과 치유를 위한 컬러링 앱입니다.
          </p>
        </div>

        {/* 앱 소개 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.sectionIcon} ${styles.sectionIconBlue}`} role="img" aria-label="별">✨</div>
            <h2>오늘의 컬러링을 소개합니다</h2>
          </div>
          <p>
            오늘의 컬러링은 바쁜 직장인들의 휴식과 힐링을 위한 컬러링 앱입니다.
            자연, 만다라, 패턴, 풍경 등 마음을 편안하게 해주는 다양한 도안을 매일 한 장씩 새롭게 선보입니다.
            퇴근 후의 짧은 여유 시간, 점심시간의 잠깐의 휴식, 주말 아침의 고요한 시간에
            색칠 한 장으로 일상의 피로를 내려놓아 보세요.
            아이들과 함께 즐길 수도 있어 온 가족의 힐링 시간이 됩니다.
          </p>
          <p>
            터치 한 번으로 원하는 색을 선택하고, 그림의 원하는 영역을 터치하면 색이 채워집니다.
            별도의 회원가입이나 복잡한 설정 없이 바로 시작할 수 있으며,
            완성한 작품은 기기에 저장하여 언제든지 다시 감상할 수 있습니다.
            매일 달라지는 도안은 컬러링을 꾸준한 힐링 루틴으로 만들어 드립니다.
            하루 10분, 나만의 색칠 시간이 당신의 하루를 바꿔줄 것입니다.
          </p>
        </section>

        <hr className={styles.divider} />

        {/* 컬러링의 치유 효과 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.sectionIcon} ${styles.sectionIconGreen}`} role="img" aria-label="잎">🌿</div>
            <h2>컬러링의 치유 효과</h2>
          </div>
          <p>
            컬러링은 단순한 취미를 넘어 현대인의 마음 건강을 돌보는 효과적인 활동입니다.
            심리학자들은 규칙적인 컬러링 활동이 정서 안정, 스트레스 감소, 집중력 회복 등
            다양한 영역에 긍정적인 영향을 미친다고 강조합니다.
            특히 업무와 일상에 지친 직장인들에게 짧은 컬러링 시간은 마음의 재충전 기회가 됩니다.
          </p>

          <div className={styles.benefitCards}>
            <div className={styles.benefitCard}>
              <div className={styles.benefitCardIcon} role="img" aria-label="바람">🍃</div>
              <p className={styles.benefitCardTitle}>스트레스 해소</p>
              <p className={styles.benefitCardDesc}>
                색을 채워나가는 반복적인 동작은 긴장된 마음과 몸을 이완시켜 줍니다.
                하루의 피로와 스트레스를 자연스럽게 내려놓을 수 있는 시간이 됩니다.
              </p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitCardIcon} role="img" aria-label="명상">🧘</div>
              <p className={styles.benefitCardTitle}>마음챙김</p>
              <p className={styles.benefitCardDesc}>
                색칠에 집중하는 동안 복잡한 생각과 걱정에서 벗어나 현재에 머물게 됩니다.
                컬러링은 누구나 쉽게 실천할 수 있는 마인드풀니스 활동입니다.
              </p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitCardIcon} role="img" aria-label="전구">💡</div>
              <p className={styles.benefitCardTitle}>창의력 회복</p>
              <p className={styles.benefitCardDesc}>
                색을 선택하고 조합하는 과정에서 잠들어 있던 창의적 감각이 깨어납니다.
                업무에 지친 뇌에 새로운 자극을 주어 창의력을 회복하는 데 도움이 됩니다.
              </p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitCardIcon} role="img" aria-label="하트">💛</div>
              <p className={styles.benefitCardTitle}>가족 유대감</p>
              <p className={styles.benefitCardDesc}>
                가족과 함께 색칠하는 시간은 대화와 교감의 기회가 됩니다.
                아이와 부모가 나란히 앉아 같은 그림을 색칠하며 소중한 추억을 만들어 보세요.
              </p>
            </div>
          </div>
        </section>

        <hr className={styles.divider} />

        {/* 컬러링과 마음 건강 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.sectionIcon} ${styles.sectionIconPurple}`} role="img" aria-label="마음">🫶</div>
            <h2>컬러링과 마음 건강</h2>
          </div>
          <p>
            심리학 연구에 따르면, 컬러링은 성인의 불안 수준을 효과적으로 낮추는 활동으로 주목받고 있습니다.
            색을 채워나가는 과정에서 뇌의 편도체 활동이 줄어들고, 이는 스트레스 반응의 감소로 이어집니다.
            특히 만다라나 기하학적 패턴을 색칠하는 활동은 명상과 유사한 효과를 가져다주는 것으로 알려져 있습니다.
          </p>
          <p>
            직장에서의 업무 스트레스, 대인관계의 피로, 육아의 부담 등
            현대인이 겪는 다양한 심리적 압박을 컬러링을 통해 자연스럽게 해소할 수 있습니다.
            색을 고르고 칠하는 단순한 행위에 집중하는 동안 복잡한 생각들이 정리되고,
            마음이 차분해지는 것을 경험하실 수 있습니다.
            컬러링은 미술 실력과 무관하게 누구나 즐길 수 있는 마음 건강 관리법입니다.
          </p>
          <div className={styles.highlightBox}>
            <p>
              연구에 따르면 하루 10~20분의 규칙적인 컬러링 활동을 실천하는 성인은
              그렇지 않은 그룹에 비해 스트레스 호르몬(코르티솔) 수치가 낮고,
              수면의 질과 전반적인 생활 만족도가 더 높은 것으로 나타났습니다.
              매일 짧은 시간이라도 색칠하는 습관이 마음 건강에 큰 변화를 가져다줍니다.
            </p>
          </div>
        </section>

        <hr className={styles.divider} />

        {/* 직장인을 위한 컬러링 테라피 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.sectionIcon} ${styles.sectionIconOrange}`} role="img" aria-label="해">☀️</div>
            <h2>직장인을 위한 컬러링 테라피</h2>
          </div>
          <p>
            하루 종일 모니터 앞에서 일하고, 회의와 업무에 쫓기는 직장인들에게
            컬러링은 디지털 피로를 해소하는 아날로그 감성의 휴식입니다.
            일정한 패턴 안에서 색을 채워나가는 반복적인 동작은
            마음을 차분하게 만들고 현재 순간에 집중하게 하는 마음챙김(마인드풀니스) 효과를 제공합니다.
          </p>
          <p>
            퇴근 후 소파에 앉아, 혹은 잠들기 전 침대에서 10분간의 색칠 시간은
            하루를 마무리하는 가장 평온한 방법이 됩니다.
            컬러링은 경쟁이나 평가의 부담이 없는 자유로운 활동이기 때문에,
            누구나 심리적 압박 없이 순수하게 즐길 수 있습니다.
            완성된 작품을 보며 느끼는 작은 성취감은 지친 하루에 위로가 됩니다.
          </p>
          <ul>
            <li>반복적인 색칠 동작이 심박수를 안정시키고 업무 긴장을 이완시킵니다</li>
            <li>색을 선택하고 칠하는 과정에서 업무 걱정과 부정적인 생각에서 벗어날 수 있습니다</li>
            <li>작품을 완성하는 과정에서 업무 외적인 성취감과 만족감을 느낍니다</li>
            <li>가족이나 연인과 함께 하는 색칠 시간은 소중한 교감의 기회가 됩니다</li>
          </ul>
        </section>

        <hr className={styles.divider} />

        {/* 함께하는 컬러링 가이드 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.sectionIcon} ${styles.sectionIconPink}`} role="img" aria-label="가족">👨‍👩‍👧</div>
            <h2>함께하는 컬러링 가이드</h2>
          </div>
          <p>
            컬러링은 혼자서도, 함께해도 좋은 활동입니다.
            연인과 나란히 앉아 같은 그림을 다른 색으로 채워보거나,
            아이와 함께 색을 고르며 이야기를 나누는 시간은
            일상에서 쉽게 만들 수 있는 소중한 교감의 순간이 됩니다.
          </p>

          <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--tds-text-primary)', margin: '12px 0 8px 0' }}>
            나만의 힐링 루틴 만들기
          </h3>
          <ul>
            <li>매일 같은 시간에 10분씩 색칠하는 루틴을 만들어 보세요. 작은 습관이 큰 변화를 가져옵니다.</li>
            <li>완벽한 결과보다 색칠하는 과정 자체에 집중해 보세요. 과정이 곧 휴식입니다.</li>
            <li>좋아하는 음악이나 차 한 잔과 함께하면 컬러링의 힐링 효과가 더욱 커집니다.</li>
            <li>완성한 작품을 저장하고 모아두세요. 나만의 컬러링 일기가 됩니다.</li>
            <li>가족이나 친구와 함께 색칠하며 서로의 색 선택에 대해 이야기를 나눠보세요.</li>
          </ul>

          <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--tds-text-primary)', margin: '16px 0 8px 0' }}>
            가족과 함께하는 컬러링 시간
          </h3>
          <p>
            아이와 함께 색칠하는 시간은 단순한 놀이 이상의 의미가 있습니다.
            같은 그림을 각자의 색으로 채워보고, 서로의 작품을 감상하며 대화를 나눠보세요.
            &quot;이 색 조합이 정말 예쁘다!&quot;, &quot;왜 이 색을 골랐어?&quot; 같은 대화는
            가족 간의 이해와 유대감을 깊게 해줍니다.
          </p>
          <p>
            바쁜 일상 속에서 가족이 함께 모여 색칠하는 짧은 시간이
            서로에게 가장 따뜻한 선물이 됩니다.
            컬러링은 세대를 넘어 모두가 함께 즐길 수 있는 활동이기에,
            아이부터 어르신까지 온 가족의 공통 취미로 자리 잡을 수 있습니다.
          </p>
        </section>

        {/* 하단 배너 광고 */}
        <div className={styles.adSection}>
          <BannerAd />
        </div>
      </main>
    </div>
  );
}
