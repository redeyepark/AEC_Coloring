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
          색칠하기는 아이들의 창의력과 집중력을 키워주는 훌륭한 활동입니다.
          올바른 색칠 기법을 익히면 더욱 아름다운 작품을 완성할 수 있습니다.
          이 가이드에서는 기본적인 색칠 기법부터 색상 조합, 그라데이션 효과까지
          다양한 색칠 노하우를 알려드립니다. 처음 색칠을 시작하는 어린이부터
          좀 더 멋진 작품을 만들고 싶은 친구들까지 모두에게 도움이 될 것입니다.
        </p>

        {/* 기본 기법 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>색칠하기의 기본 기법</h2>
          <p>
            색칠을 시작할 때 가장 중요한 것은 한 방향으로 일정하게 칠하는 것입니다.
            크레용이나 색연필을 사용할 때 같은 방향으로 부드럽게 움직이면 색이 고르게 칠해집니다.
            왔다 갔다 방향을 바꾸면서 칠하면 색이 얼룩덜룩해질 수 있으니 주의하세요.
          </p>
          <p>
            또한 처음에는 가볍게 칠한 뒤, 점차 힘을 주어 색을 진하게 만드는 방법이 좋습니다.
            처음부터 너무 세게 누르면 종이가 손상되거나 색을 수정하기 어려워집니다.
            가벼운 터치로 전체적인 색감을 잡은 후에 원하는 부분을 더 진하게 표현해 보세요.
          </p>
          <ul>
            <li>색연필은 살짝 눕혀서 넓은 면을 칠하면 더 부드러운 느낌이 납니다</li>
            <li>작은 부분은 색연필 끝을 세워서 정교하게 칠합니다</li>
            <li>둥근 형태를 칠할 때는 작은 원을 그리듯이 칠하면 자연스럽습니다</li>
          </ul>
        </section>

        {/* 색상 조합 팁 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>색상 조합 팁</h2>
          <p>
            예쁜 그림을 완성하려면 색상 조합이 매우 중요합니다.
            비슷한 계열의 색을 함께 사용하면 부드럽고 편안한 느낌을 줄 수 있습니다.
            예를 들어 파란색과 보라색, 초록색과 연두색처럼 가까운 색끼리 배치하면
            자연스러운 조화를 이룰 수 있습니다.
          </p>
          <p>
            반대로 보색 관계의 색을 사용하면 강렬하고 눈에 띄는 효과를 만들 수 있습니다.
            빨간색과 초록색, 파란색과 주황색, 노란색과 보라색이 대표적인 보색 관계입니다.
            보색을 함께 사용할 때는 한쪽을 주된 색으로, 다른 한쪽은 포인트로 소량 사용하는 것이 좋습니다.
          </p>
          <div className={styles.tipBox}>
            <p>
              <span className={styles.tipLabel}>Tip: </span>
              따뜻한 느낌을 주고 싶으면 빨강, 주황, 노랑 계열을 사용하고,
              시원한 느낌을 주고 싶으면 파랑, 초록, 보라 계열을 선택해 보세요.
              계절이나 분위기에 맞는 색을 고르면 그림이 더욱 생동감 있어집니다.
            </p>
          </div>
        </section>

        {/* 배경부터 칠하는 법 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>배경부터 칠하는 법</h2>
          <p>
            색칠 순서도 완성도에 큰 영향을 줍니다.
            일반적으로 배경이나 넓은 면적을 먼저 칠하고, 세밀한 부분을 나중에 칠하는 것이 좋습니다.
            배경을 먼저 칠하면 전체적인 분위기를 잡을 수 있고,
            나중에 작은 요소들을 칠할 때 색상 균형을 맞추기가 더 쉬워집니다.
          </p>
          <p>
            하늘이나 잔디처럼 넓은 면적의 배경을 칠할 때는 한쪽 끝에서 시작하여
            반대쪽으로 일정하게 진행하세요. 중간부터 시작하면 연결 부분이 어색해질 수 있습니다.
            배경을 칠한 뒤 건물, 나무, 사람 같은 주요 요소를 칠하고,
            마지막으로 눈, 단추, 꽃잎 같은 작은 디테일을 완성합니다.
          </p>
          <ul>
            <li>넓은 면적: 배경, 하늘, 바다, 잔디밭 등을 가장 먼저 칠합니다</li>
            <li>중간 크기: 건물, 나무, 동물, 사람 등 주요 대상을 다음에 칠합니다</li>
            <li>작은 디테일: 눈, 입, 무늬, 장식 등을 마지막에 칠합니다</li>
          </ul>
        </section>

        {/* 그라데이션 효과 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>그라데이션 효과 내기</h2>
          <p>
            그라데이션은 한 색에서 다른 색으로 자연스럽게 변하는 효과를 말합니다.
            이 기법을 사용하면 그림에 입체감과 깊이를 더할 수 있습니다.
            가장 쉬운 방법은 같은 색의 밝은 톤과 어두운 톤을 사용하는 것입니다.
          </p>
          <p>
            예를 들어 사과를 칠할 때, 빛이 닿는 부분은 밝은 빨간색으로 칠하고
            그림자가 지는 부분은 진한 빨간색이나 갈색을 섞어 칠합니다.
            두 색이 만나는 경계 부분을 부드럽게 문질러주면 자연스러운 그라데이션이 완성됩니다.
            하늘을 칠할 때도 위쪽은 진한 파란색, 아래쪽은 연한 하늘색으로 칠하면
            실제 하늘처럼 아름다운 효과를 낼 수 있습니다.
          </p>
          <div className={styles.tipBox}>
            <p>
              <span className={styles.tipLabel}>Tip: </span>
              그라데이션을 연습할 때는 종이 한 구석에 먼저 시도해 보세요.
              밝은 색을 먼저 칠하고 그 위에 어두운 색을 살짝 겹쳐 칠하면
              더 자연스러운 효과를 얻을 수 있습니다.
            </p>
          </div>
        </section>

        {/* 어두운 색과 밝은 색의 조화 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>어두운 색과 밝은 색의 조화</h2>
          <p>
            그림에 생동감을 더하려면 어두운 색과 밝은 색을 적절히 섞어 사용하는 것이 중요합니다.
            밝은 색만 사용하면 그림이 밋밋해 보이고, 어두운 색만 사용하면 답답한 느낌이 들 수 있습니다.
            빛이 닿는 부분은 밝은 색으로, 그림자 부분은 어두운 색으로 표현하면
            대상이 입체적으로 보이는 효과를 줄 수 있습니다.
          </p>
          <p>
            공 모양을 칠할 때를 예로 들면, 빛이 오는 방향의 윗부분은 노란색이나 흰색을 가볍게 칠하고,
            아랫부분으로 갈수록 진한 색을 입혀주면 둥근 느낌이 살아납니다.
            또한 물체 아래에 짧은 그림자를 어두운 회색이나 갈색으로 살짝 표현하면
            물체가 바닥에 놓여 있는 듯한 사실적인 느낌을 줄 수 있습니다.
          </p>
          <ul>
            <li>밝은 부분: 노랑, 흰색, 연한 색 계열로 하이라이트를 표현합니다</li>
            <li>중간 톤: 대상의 기본 색상으로 전체적인 면적을 채웁니다</li>
            <li>어두운 부분: 진한 색이나 갈색 계열로 그림자와 깊이를 표현합니다</li>
          </ul>
        </section>

        {/* 주의할 점 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>색칠할 때 주의할 점</h2>
          <p>
            즐거운 색칠 시간을 위해 몇 가지 주의할 점을 기억해 두세요.
            먼저, 손에 힘을 너무 많이 주지 마세요. 너무 세게 누르면 색연필 심이 부러지거나
            종이가 찢어질 수 있습니다. 편안한 자세로 가볍게 잡고 칠하는 습관을 들이면
            오랜 시간 즐겁게 색칠할 수 있습니다.
          </p>
          <p>
            선 바깥으로 삐져나가지 않도록 천천히 칠하는 것도 중요합니다.
            특히 경계선 근처에서는 속도를 줄이고 조심스럽게 칠하세요.
            경계선을 먼저 따라 칠한 뒤 안쪽을 채우는 방법을 사용하면
            깔끔한 결과물을 얻을 수 있습니다.
          </p>
          <p>
            마지막으로, 완벽하게 칠하려고 스트레스 받지 마세요.
            색칠하기는 무엇보다 즐기는 것이 가장 중요합니다.
            실수하더라도 그것이 오히려 독특한 개성이 될 수 있습니다.
            자유롭게 자신만의 색을 선택하고, 창의적으로 표현하는 과정 자체를 즐겨보세요.
            꾸준히 연습하다 보면 어느새 색칠 실력이 쑥쑥 늘어 있을 것입니다.
          </p>
          <div className={styles.tipBox}>
            <p>
              <span className={styles.tipLabel}>Tip: </span>
              색칠을 시작하기 전에 어떤 색을 사용할지 미리 계획을 세워보세요.
              사용할 색을 3~5가지 정도로 정해두면 전체적으로 통일감 있는
              멋진 작품을 만들 수 있습니다.
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
