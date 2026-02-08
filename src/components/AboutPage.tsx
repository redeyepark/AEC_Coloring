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
            매일 새로운 그림과 함께하는 어린이 색칠 앱입니다.
            아이들의 창의력과 상상력을 키워주는 다양한 도안을 만나보세요.
          </p>
        </div>

        {/* 앱 소개 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.sectionIcon} ${styles.sectionIconBlue}`} role="img" aria-label="별">✨</div>
            <h2>오늘의 컬러링을 소개합니다</h2>
          </div>
          <p>
            오늘의 컬러링은 매일 새로운 색칠 도안을 제공하는 어린이 전용 색칠 앱입니다.
            동물, 자연, 탈것, 음식 등 아이들이 좋아하는 다양한 주제의 그림을 엄선하여 매일 한 장씩 새롭게 선보입니다.
            부모님과 아이가 함께 즐길 수 있도록 직관적이고 사용하기 쉬운 인터페이스를 제공하며,
            별도의 회원가입이나 복잡한 설정 없이 바로 색칠을 시작할 수 있습니다.
          </p>
          <p>
            터치 한 번으로 원하는 색을 선택하고, 그림의 원하는 영역을 터치하면 색이 채워집니다.
            완성한 작품은 기기에 저장하여 언제든지 다시 감상할 수 있으며,
            가족이나 친구와 공유할 수도 있습니다. 매일 달라지는 그림은 아이들에게 꾸준한 흥미를 유발하고,
            매일의 색칠 활동이 즐거운 일상 습관으로 자리 잡을 수 있도록 도와줍니다.
          </p>
        </section>

        <hr className={styles.divider} />

        {/* 색칠하기의 교육적 가치 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.sectionIcon} ${styles.sectionIconGreen}`} role="img" aria-label="책">📚</div>
            <h2>색칠하기의 교육적 가치</h2>
          </div>
          <p>
            색칠하기는 단순한 놀이를 넘어 어린이 발달에 매우 중요한 교육적 활동입니다.
            전문가들은 규칙적인 색칠 활동이 아이의 인지 발달, 정서 발달, 신체 발달 등
            다양한 영역에 긍정적인 영향을 미친다고 강조합니다.
            특히 유아기와 초등학교 저학년 시기에 색칠하기는 학습의 기초가 되는 핵심 능력을 길러줍니다.
          </p>

          <div className={styles.benefitCards}>
            <div className={styles.benefitCard}>
              <div className={styles.benefitCardIcon} role="img" aria-label="손">🤲</div>
              <p className={styles.benefitCardTitle}>소근육 발달</p>
              <p className={styles.benefitCardDesc}>
                색연필이나 크레용을 쥐고 선 안에 색칠하는 과정에서 손과 손가락의 소근육이 발달합니다.
                이는 글씨 쓰기, 젓가락 사용 등 정교한 손동작의 기초가 됩니다.
              </p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitCardIcon} role="img" aria-label="표적">🎯</div>
              <p className={styles.benefitCardTitle}>집중력 향상</p>
              <p className={styles.benefitCardDesc}>
                하나의 그림을 완성하기 위해 일정 시간 동안 집중하는 연습을 하게 됩니다.
                이렇게 길러진 집중력은 학교 수업과 학습 전반에 큰 도움이 됩니다.
              </p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitCardIcon} role="img" aria-label="무지개">🌈</div>
              <p className={styles.benefitCardTitle}>창의력 증진</p>
              <p className={styles.benefitCardDesc}>
                어떤 색을 사용할지 스스로 결정하면서 창의적 사고력과 심미안이 발달합니다.
                정해진 답이 없는 활동이기에 자유로운 표현력을 키워줍니다.
              </p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitCardIcon} role="img" aria-label="하트">💚</div>
              <p className={styles.benefitCardTitle}>정서적 안정</p>
              <p className={styles.benefitCardDesc}>
                반복적으로 색을 채워가는 과정은 마음의 안정감을 줍니다.
                불안하거나 산만한 아이들에게 정서적 안정을 찾는 데 효과적인 활동입니다.
              </p>
            </div>
          </div>
        </section>

        <hr className={styles.divider} />

        {/* 어린이 발달과 미술활동 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.sectionIcon} ${styles.sectionIconPurple}`} role="img" aria-label="아이">👧</div>
            <h2>어린이 발달과 미술활동</h2>
          </div>
          <p>
            아동 발달 전문가들은 미술활동이 어린이의 전인적 성장에 필수적이라고 말합니다.
            색칠하기를 포함한 미술활동은 아이들이 자신의 감정과 생각을 시각적으로 표현하는 방법을 배우는 과정입니다.
            언어로 표현하기 어려운 내면의 감정을 그림과 색을 통해 자연스럽게 드러낼 수 있습니다.
          </p>
          <p>
            또한 색칠하기는 색상 인지 능력과 공간 지각력을 키워줍니다.
            다양한 색을 구분하고, 그림의 영역과 경계를 인식하며, 전체적인 조화를 고려하는 과정에서
            시각적 인지 능력이 자연스럽게 발달합니다. 이러한 능력은 수학적 사고나 과학적 관찰 등
            다른 학문 영역의 학습에도 긍정적인 영향을 미칩니다.
          </p>
          <div className={styles.highlightBox}>
            <p>
              연구에 따르면 주 3회 이상 규칙적으로 미술활동에 참여하는 어린이는
              그렇지 않은 어린이에 비해 문제 해결 능력과 자기 표현력이 더 높은 것으로 나타났습니다.
              매일 짧은 시간이라도 색칠하기를 즐기는 것이 아이의 성장에 큰 도움이 됩니다.
            </p>
          </div>
        </section>

        <hr className={styles.divider} />

        {/* 색칠하기가 스트레스 해소에 좋은 이유 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.sectionIcon} ${styles.sectionIconOrange}`} role="img" aria-label="해">☀️</div>
            <h2>색칠하기가 스트레스 해소에 좋은 이유</h2>
          </div>
          <p>
            색칠하기는 어린이뿐만 아니라 모든 연령대에서 스트레스를 해소하는 데 효과적인 활동으로
            알려져 있습니다. 일정한 패턴 안에서 색을 채워나가는 반복적인 동작은
            마음을 차분하게 만들고 현재 순간에 집중하게 하는 마음챙김(마인드풀니스) 효과를 제공합니다.
          </p>
          <p>
            특히 어린이들은 학교생활, 또래 관계, 학습 부담 등으로 스트레스를 느낄 수 있는데,
            이때 색칠하기를 통해 긴장을 풀고 마음의 여유를 찾을 수 있습니다.
            색칠하기는 경쟁이나 평가의 부담이 없는 자유로운 활동이기 때문에,
            아이들이 심리적 압박 없이 순수하게 즐길 수 있습니다.
            완성된 작품을 보며 느끼는 성취감은 자존감 향상에도 도움이 됩니다.
          </p>
          <ul>
            <li>반복적인 색칠 동작이 심박수를 안정시키고 긴장을 이완시킵니다</li>
            <li>색을 선택하고 칠하는 과정에서 부정적인 생각에서 벗어날 수 있습니다</li>
            <li>작품을 완성하는 과정에서 성취감과 자신감을 느낍니다</li>
            <li>가족과 함께 하는 색칠 시간은 유대감 형성에 도움이 됩니다</li>
          </ul>
        </section>

        <hr className={styles.divider} />

        {/* 부모님을 위한 안내 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.sectionIcon} ${styles.sectionIconPink}`} role="img" aria-label="가족">👨‍👩‍👧</div>
            <h2>부모님을 위한 안내</h2>
          </div>
          <p>
            아이와 함께 색칠하기를 즐기는 시간은 단순한 놀이 이상의 의미가 있습니다.
            함께 색을 고르고, 그림에 대해 이야기를 나누며, 완성된 작품을 함께 감상하는 과정은
            부모와 아이 사이의 소통과 유대감을 깊게 해줍니다.
          </p>

          <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--tds-text-primary)', margin: '12px 0 8px 0' }}>
            아이와 함께 색칠하기를 즐기는 방법
          </h3>
          <ul>
            <li>아이가 스스로 색을 선택하도록 기다려주세요. 자율성이 창의력의 시작입니다.</li>
            <li>완벽한 결과보다 색칠하는 과정 자체를 함께 즐겨주세요.</li>
            <li>아이가 선택한 색에 대해 대화를 나눠보세요. &quot;왜 하늘을 보라색으로 칠했어?&quot; 같은 질문은 상상력을 자극합니다.</li>
            <li>매일 정해진 시간에 함께 색칠하는 루틴을 만들어보세요. 안정적인 일상 습관이 됩니다.</li>
            <li>완성한 작품을 냉장고나 벽에 붙여두면 아이의 자존감이 높아집니다.</li>
          </ul>

          <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--tds-text-primary)', margin: '16px 0 8px 0' }}>
            칭찬과 격려의 중요성
          </h3>
          <p>
            아이가 색칠을 할 때 결과물의 완성도를 평가하기보다는 노력한 과정을 칭찬해주세요.
            &quot;색을 정말 꼼꼼하게 칠했구나!&quot;, &quot;이 색 조합이 정말 예쁘다!&quot; 같은 구체적인 칭찬은
            아이에게 큰 동기부여가 됩니다. 반대로 &quot;선 밖으로 나갔네&quot;와 같은 지적은
            아이의 흥미를 떨어뜨릴 수 있으므로 피하는 것이 좋습니다.
          </p>
          <p>
            아이가 색칠을 어려워하거나 흥미를 잃었을 때는 억지로 시키기보다
            잠시 쉬었다가 다시 하도록 격려해주세요. 색칠하기는 즐거운 활동이 되어야
            지속적인 효과를 기대할 수 있습니다. 무엇보다 아이와 함께하는 시간 자체가
            가장 소중한 선물이라는 것을 기억해주세요.
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
