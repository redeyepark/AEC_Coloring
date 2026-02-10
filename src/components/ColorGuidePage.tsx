import { BannerAd } from './ads/BannerAd';
import styles from './ColorGuidePage.module.css';

interface ColorGuidePageProps {
  onBack: () => void;
}

export function ColorGuidePage({ onBack }: ColorGuidePageProps) {
  // 뒤로가기 버튼 클릭 (이벤트 전파 방지)
  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBack();
  };

  return (
    <div className={styles.guidePage}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={handleBackClick} title="뒤로 가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>뒤로</span>
        </button>
        <h1 className={styles.title}>색칠 가이드</h1>
        <div className={styles.spacer} />
      </header>

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <main className={styles.content}>
        <p className={styles.intro}>
          바쁜 일상에서 벗어나 색칠로 힐링하세요.
          색칠은 단순한 취미를 넘어, 마음의 안정과 창의력 회복을 도와주는
          효과적인 심리 치유 활동입니다. 하루의 피로를 내려놓고 색연필을 손에 쥐는 순간,
          복잡했던 생각들이 정리되고 마음이 고요해지는 것을 느끼실 수 있습니다.
          이 가이드에서는 색칠의 치유 효과부터 기본 기법, 그리고 가족과 함께 즐기는 방법까지
          폭넓게 안내해 드립니다.
        </p>

        {/* 색칠의 힐링 효과 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>색칠로 찾는 일상의 힐링</h2>
          <p>
            색칠은 전 세계적으로 성인들 사이에서 대표적인 스트레스 해소 활동으로 자리잡았습니다.
            반복적인 색칠 동작은 명상과 유사한 효과를 가져오며,
            뇌의 편도체 활동을 줄여 불안감을 완화시키는 데 도움이 됩니다.
            업무와 일상에 지친 마음을 달래기에 이보다 좋은 방법은 없습니다.
          </p>
          <p>
            색칠에 집중하는 동안 우리의 뇌는 '몰입' 상태에 들어갑니다.
            이 상태에서는 과거의 후회나 미래의 걱정에서 벗어나 오직 지금 이 순간에만 집중하게 됩니다.
            마치 마음챙김(mindfulness) 명상을 하는 것과 같은 효과를 경험하실 수 있습니다.
            하루 15~20분의 색칠만으로도 심박수가 안정되고 마음이 편안해지는 변화를 느낄 수 있습니다.
          </p>
          <ul>
            <li>스트레스 호르몬인 코르티솔 수치를 낮추는 데 도움이 됩니다</li>
            <li>디지털 기기에서 벗어나 아날로그적 휴식을 취할 수 있습니다</li>
            <li>반복적인 색칠 동작이 마음의 안정과 집중력 향상을 가져옵니다</li>
          </ul>
        </section>

        {/* 색상 심리와 조합 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>나를 위한 색상 심리학</h2>
          <p>
            색상은 우리의 감정과 깊이 연결되어 있습니다.
            오늘 마음이 끌리는 색을 자유롭게 선택해 보세요.
            파란색과 초록색 계열은 마음을 차분하게 가라앉혀 주고,
            노란색과 주황색 계열은 활력과 긍정적인 에너지를 불어넣어 줍니다.
          </p>
          <p>
            비슷한 계열의 색을 함께 사용하면 부드럽고 편안한 분위기를 연출할 수 있습니다.
            보라색과 분홍색, 하늘색과 연두색처럼 가까운 색끼리 배치하면
            자연스러운 조화를 이루며 안정감을 줍니다.
            반대로 보색 관계의 색(빨강과 초록, 파랑과 주황)을 포인트로 활용하면
            작품에 생동감과 활기를 더할 수 있습니다.
          </p>
          <div className={styles.tipBox}>
            <p>
              <span className={styles.tipLabel}>Tip: </span>
              지친 하루 끝에는 파랑, 보라, 초록 같은 차분한 색을 선택해 보세요.
              에너지가 필요한 아침에는 노랑, 주황, 빨강 같은 따뜻한 색이 활력을 줍니다.
              그날의 기분에 따라 색을 고르는 것 자체가 자신의 감정을 돌아보는 시간이 됩니다.
            </p>
          </div>
        </section>

        {/* 기본 색칠 기법 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>기본 색칠 기법 익히기</h2>
          <p>
            색칠의 기본은 한 방향으로 일정하게 칠하는 것입니다.
            색연필을 같은 방향으로 부드럽게 움직이면 색이 고르게 칠해지며,
            그 자체로 리듬감 있는 동작이 마음을 안정시켜 줍니다.
            처음에는 가볍게 칠한 뒤 점차 힘을 주어 색을 진하게 만드는 레이어링 기법을 추천합니다.
          </p>
          <p>
            넓은 면적을 칠할 때는 배경이나 큰 영역을 먼저 완성하고,
            세밀한 부분은 나중에 칠하는 것이 좋습니다.
            배경을 먼저 칠하면 전체적인 분위기를 잡을 수 있고,
            작은 요소들을 칠할 때 색상 균형을 맞추기가 더 수월해집니다.
            경계선을 먼저 따라 칠한 뒤 안쪽을 채우면 깔끔한 결과물을 얻을 수 있습니다.
          </p>
          <ul>
            <li>색연필을 살짝 눕혀서 넓은 면을 칠하면 더 부드러운 질감이 표현됩니다</li>
            <li>세밀한 부분은 색연필 끝을 세워서 정교하게 칠합니다</li>
            <li>둥근 형태는 작은 원을 그리듯이 칠하면 자연스러운 표현이 가능합니다</li>
          </ul>
        </section>

        {/* 그라데이션 효과 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>그라데이션으로 표현하는 깊이</h2>
          <p>
            그라데이션은 한 색에서 다른 색으로 자연스럽게 변하는 효과입니다.
            이 기법을 활용하면 작품에 입체감과 깊이를 더할 수 있으며,
            색이 부드럽게 번져가는 과정 자체가 깊은 몰입감을 선사합니다.
            가장 쉬운 방법은 같은 색의 밝은 톤과 어두운 톤을 사용하는 것입니다.
          </p>
          <p>
            예를 들어 하늘을 칠할 때 위쪽은 진한 파란색, 아래쪽은 연한 하늘색으로 칠하면
            실제 하늘처럼 아름다운 효과를 낼 수 있습니다.
            사과를 칠할 때는 빛이 닿는 부분을 밝게, 그림자 부분을 진하게 표현합니다.
            두 색이 만나는 경계 부분을 부드럽게 문질러주면 자연스러운 그라데이션이 완성됩니다.
          </p>
          <div className={styles.tipBox}>
            <p>
              <span className={styles.tipLabel}>Tip: </span>
              그라데이션을 연습할 때는 종이 한 구석에 먼저 시도해 보세요.
              밝은 색을 먼저 칠하고 그 위에 어두운 색을 살짝 겹쳐 칠하면
              더 자연스러운 효과를 얻을 수 있습니다. 이 과정 자체를 천천히 즐겨 보세요.
            </p>
          </div>
        </section>

        {/* 빛과 그림자의 조화 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>빛과 그림자로 완성하는 표현력</h2>
          <p>
            작품에 생동감을 더하려면 어두운 색과 밝은 색을 적절히 조합하는 것이 중요합니다.
            밝은 색만 사용하면 평면적으로 보이고, 어두운 색만 사용하면 답답한 인상을 줄 수 있습니다.
            빛이 닿는 부분은 밝은 색으로, 그림자 부분은 어두운 색으로 표현하면
            대상이 입체적으로 살아나는 효과를 경험하실 수 있습니다.
          </p>
          <p>
            예를 들어 둥근 형태를 칠할 때, 빛이 오는 방향의 윗부분은 밝게 칠하고
            아랫부분으로 갈수록 진한 색을 입혀주면 입체감이 살아납니다.
            물체 아래에 짧은 그림자를 어두운 회색으로 살짝 표현하면
            바닥에 놓여 있는 듯한 사실적인 느낌까지 더할 수 있습니다.
            이처럼 빛과 그림자를 의식하며 칠하다 보면 관찰력도 함께 향상됩니다.
          </p>
          <ul>
            <li>밝은 부분: 노랑, 흰색, 연한 색 계열로 하이라이트를 표현합니다</li>
            <li>중간 톤: 대상의 기본 색상으로 전체적인 면적을 채웁니다</li>
            <li>어두운 부분: 진한 색이나 갈색 계열로 그림자와 깊이를 표현합니다</li>
          </ul>
        </section>

        {/* 가족과 함께하는 색칠 시간 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>가족과 함께하는 색칠 시간</h2>
          <p>
            색칠은 혼자서도 좋지만, 가족과 함께하면 더욱 특별한 시간이 됩니다.
            같은 그림을 나누어 칠하거나, 각자 다른 그림을 칠하며 옆에 앉아 있는 것만으로도
            자연스러운 대화가 이어지고 서로의 마음을 이해하는 소중한 시간을 만들 수 있습니다.
            스마트폰 대신 색연필을 함께 잡아 보세요.
          </p>
          <p>
            자녀와 함께 색칠할 때는 "잘 칠해야 해"라는 부담 대신
            서로의 색 선택과 표현 방식을 존중해 주세요.
            부모와 자녀가 같은 눈높이에서 창작 활동을 함께하는 경험은
            가족 간의 유대감을 깊게 해주는 소중한 추억이 됩니다.
            완성된 작품을 함께 감상하며 이야기를 나누는 것도 좋은 소통 방법입니다.
          </p>
          <div className={styles.tipBox}>
            <p>
              <span className={styles.tipLabel}>Tip: </span>
              색칠을 시작하기 전에 오늘의 기분에 맞는 색을 3~5가지 골라보세요.
              가족 각자가 고른 색을 비교하며 이야기를 나누면
              서로의 하루를 자연스럽게 공유하는 시간이 됩니다.
              완벽한 작품보다 함께하는 과정 자체를 즐기는 것이 가장 중요합니다.
            </p>
          </div>
        </section>
      </main>

      {/* 하단 배너 광고 */}
      <div className={styles.adSection}>
        <BannerAd />
      </div>
    </div>
  );
}
