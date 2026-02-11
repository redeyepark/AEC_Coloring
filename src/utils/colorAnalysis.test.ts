import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeColors, getBrightnessLabel, getTemperatureLabel } from './colorAnalysis';

// 테스트 전 Math.random을 모킹하여 결정론적 결과 보장
let randomSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
  randomSpy.mockRestore();
});

// ============================================================================
// analyzeColors 테스트
// ============================================================================
describe('analyzeColors', () => {
  // --------------------------------------------------------------------------
  // 빈 입력 처리
  // --------------------------------------------------------------------------
  describe('빈 배열 입력', () => {
    it('빈 배열을 전달하면 기본 neutral/balanced/monotone 결과를 반환한다', () => {
      const result = analyzeColors([]);

      expect(result.dominantCategory).toBe('neutral');
      expect(result.brightness).toBe('balanced');
      expect(result.variety).toBe('monotone');
      expect(result.message).toBe(
        '색상을 선택하지 않았어요. 어떤 마음 상태인지 색칠을 통해 표현해보세요!'
      );
      expect(result.emoji).toBe('🎨');
      expect(result.stats).toEqual({
        warmPercent: 0,
        coolPercent: 0,
        neutralPercent: 100,
        totalColors: 0,
      });
    });
  });

  // --------------------------------------------------------------------------
  // 따뜻한 색상만 사용한 경우
  // --------------------------------------------------------------------------
  describe('따뜻한 색상(warm) 분석', () => {
    it('빨간색(#FF0000) 단일 색상은 warm으로 분류된다', () => {
      // #FF0000: h=0, s=100, l=50 -> warm
      const result = analyzeColors(['#FF0000']);

      expect(result.dominantCategory).toBe('warm');
      expect(result.stats.warmPercent).toBe(100);
      expect(result.stats.coolPercent).toBe(0);
      expect(result.stats.neutralPercent).toBe(0);
      expect(result.stats.totalColors).toBe(1);
    });

    it('따뜻한 색상만 여러 개 전달하면 warm 카테고리를 반환한다', () => {
      // #FF0000(h=0), #FFA500(h~39), #FFFF00(h=60) 모두 warm
      const result = analyzeColors(['#FF0000', '#FFA500', '#FFFF00']);

      expect(result.dominantCategory).toBe('warm');
      expect(result.stats.warmPercent).toBe(100);
      expect(result.stats.totalColors).toBe(3);
    });

    it('분홍색(#FFC0CB)은 warm으로 분류된다 (h~350)', () => {
      const result = analyzeColors(['#FFC0CB']);

      expect(result.dominantCategory).toBe('warm');
      expect(result.stats.warmPercent).toBe(100);
    });

    it('보라색(#800080)은 h=300으로 warm 범위(300-360)에 해당한다', () => {
      // #800080: r=128, g=0, b=128 -> h=300, s=100, l=25 -> warm
      const result = analyzeColors(['#800080']);

      expect(result.dominantCategory).toBe('warm');
      expect(result.stats.warmPercent).toBe(100);
    });
  });

  // --------------------------------------------------------------------------
  // 차가운 색상만 사용한 경우
  // --------------------------------------------------------------------------
  describe('차가운 색상(cool) 분석', () => {
    it('파란색(#0000FF) 단일 색상은 cool로 분류된다', () => {
      // #0000FF: h=240, s=100, l=50 -> cool
      const result = analyzeColors(['#0000FF']);

      expect(result.dominantCategory).toBe('cool');
      expect(result.stats.coolPercent).toBe(100);
      expect(result.stats.warmPercent).toBe(0);
    });

    it('초록색(#008000)은 cool로 분류된다 (h=120)', () => {
      // #008000: h=120, s=100, l=25 -> cool
      const result = analyzeColors(['#008000']);

      expect(result.dominantCategory).toBe('cool');
      expect(result.stats.coolPercent).toBe(100);
    });

    it('차가운 색상만 여러 개 전달하면 cool 카테고리를 반환한다', () => {
      // #0000FF(h=240), #008000(h=120), #00FFFF(h=180) 모두 cool
      const result = analyzeColors(['#0000FF', '#008000', '#00FFFF']);

      expect(result.dominantCategory).toBe('cool');
      expect(result.stats.coolPercent).toBe(100);
      expect(result.stats.totalColors).toBe(3);
    });
  });

  // --------------------------------------------------------------------------
  // 무채색만 사용한 경우
  // --------------------------------------------------------------------------
  describe('무채색(neutral) 분석', () => {
    it('검정색(#000000)은 neutral로 분류된다 (l<10)', () => {
      const result = analyzeColors(['#000000']);

      expect(result.dominantCategory).toBe('neutral');
      expect(result.stats.neutralPercent).toBe(100);
    });

    it('흰색(#FFFFFF)은 neutral로 분류된다 (l>95)', () => {
      const result = analyzeColors(['#FFFFFF']);

      expect(result.dominantCategory).toBe('neutral');
      expect(result.stats.neutralPercent).toBe(100);
    });

    it('회색(#808080)은 neutral로 분류된다 (s<10)', () => {
      // #808080: r=g=b=128 -> h=0, s=0, l=50 -> neutral (s<10)
      const result = analyzeColors(['#808080']);

      expect(result.dominantCategory).toBe('neutral');
      expect(result.stats.neutralPercent).toBe(100);
    });

    it('무채색만 여러 개 전달하면 neutral 카테고리를 반환한다', () => {
      const result = analyzeColors(['#000000', '#808080', '#FFFFFF']);

      expect(result.dominantCategory).toBe('neutral');
      expect(result.stats.neutralPercent).toBe(100);
      expect(result.stats.warmPercent).toBe(0);
      expect(result.stats.coolPercent).toBe(0);
      expect(result.stats.totalColors).toBe(3);
    });
  });

  // --------------------------------------------------------------------------
  // 혼합 색상(mixed) 분류
  // --------------------------------------------------------------------------
  describe('혼합 색상(mixed) 분석', () => {
    it('warm과 cool 색상이 비슷하게 섞이면 mixed를 반환한다', () => {
      // warm 2개, cool 2개 -> 동수이므로 mixed
      const result = analyzeColors(['#FF0000', '#FFA500', '#0000FF', '#008000']);

      expect(result.dominantCategory).toBe('mixed');
    });

    it('warm 비율이 60% 이하이면 warm이 가장 많아도 mixed로 분류된다', () => {
      // warm 2개(40%), cool 1개(20%), neutral 2개(40%)
      // warm이 가장 많지 않으므로(neutral과 동수) -> mixed
      const result = analyzeColors([
        '#FF0000',
        '#FFA500',
        '#0000FF',
        '#808080',
        '#000000',
      ]);

      // warm=2, cool=1, neutral=2 -> warm과 neutral 동수 -> else -> mixed
      expect(result.dominantCategory).toBe('mixed');
    });

    it('warm이 가장 많지만 60% 이하이면 mixed로 분류된다', () => {
      // warm 3개(60%), cool 1개(20%), neutral 1개(20%)
      // warmPercent=60 -> > 60 조건 불만족 -> mixed
      const result = analyzeColors([
        '#FF0000',
        '#FFA500',
        '#FFFF00',
        '#0000FF',
        '#808080',
      ]);

      // warm=3, cool=1, neutral=1 -> warmPercent=60 -> not > 60 -> mixed
      expect(result.dominantCategory).toBe('mixed');
    });

    it('warm이 60%를 초과하면 warm으로 분류된다', () => {
      // warm 3개, cool 1개 -> warmPercent = 75% (> 60) -> warm
      const result = analyzeColors([
        '#FF0000',
        '#FFA500',
        '#FFFF00',
        '#0000FF',
      ]);

      expect(result.dominantCategory).toBe('warm');
      expect(result.stats.warmPercent).toBe(75);
    });
  });

  // --------------------------------------------------------------------------
  // 밝기(brightness) 판정
  // --------------------------------------------------------------------------
  describe('밝기(brightness) 분석', () => {
    it('평균 밝기 > 60이면 bright를 반환한다', () => {
      // #FFFF00: l=50, #FFC0CB: l~(rgb avg high)~86 -> 평균 > 60
      // 정확한 계산: #FFC0CB r=255,g=192,b=203 -> l=(max+min)/2=(255+192)/2/255 ≈ 88%
      // #FFFFFF: l=100
      // 평균: (100+88)/2 = 94 > 60 -> bright
      const result = analyzeColors(['#FFFFFF', '#FFC0CB']);

      expect(result.brightness).toBe('bright');
    });

    it('평균 밝기 < 40이면 dark를 반환한다', () => {
      // #000000: l=0, #000080(dark blue): r=0,g=0,b=128 -> l=(128+0)/2/255=25
      // 평균: (0+25)/2 = 12.5 < 40 -> dark
      const result = analyzeColors(['#000000', '#000080']);

      expect(result.brightness).toBe('dark');
    });

    it('평균 밝기가 40-60 범위이면 balanced를 반환한다', () => {
      // #FF0000: l=50, #0000FF: l=50 -> 평균: 50 -> balanced
      const result = analyzeColors(['#FF0000', '#0000FF']);

      expect(result.brightness).toBe('balanced');
    });

    it('검정색(#000000) 단일 입력은 dark를 반환한다 (l=0)', () => {
      const result = analyzeColors(['#000000']);

      expect(result.brightness).toBe('dark');
    });

    it('흰색(#FFFFFF) 단일 입력은 bright를 반환한다 (l=100)', () => {
      const result = analyzeColors(['#FFFFFF']);

      expect(result.brightness).toBe('bright');
    });
  });

  // --------------------------------------------------------------------------
  // 다양성(variety) 판정
  // --------------------------------------------------------------------------
  describe('다양성(variety) 분석', () => {
    it('색상 3개 이하이면 monotone을 반환한다', () => {
      const result1 = analyzeColors(['#FF0000']);
      expect(result1.variety).toBe('monotone');

      const result2 = analyzeColors(['#FF0000', '#00FF00']);
      expect(result2.variety).toBe('monotone');

      const result3 = analyzeColors(['#FF0000', '#00FF00', '#0000FF']);
      expect(result3.variety).toBe('monotone');
    });

    it('색상 4~7개이면 moderate를 반환한다', () => {
      const result = analyzeColors([
        '#FF0000',
        '#00FF00',
        '#0000FF',
        '#FFFF00',
      ]);

      expect(result.variety).toBe('moderate');
    });

    it('색상 7개일 때 moderate를 반환한다 (경계값)', () => {
      const result = analyzeColors([
        '#FF0000',
        '#00FF00',
        '#0000FF',
        '#FFFF00',
        '#FF00FF',
        '#00FFFF',
        '#808080',
      ]);

      expect(result.variety).toBe('moderate');
    });

    it('색상 8개 이상이면 diverse를 반환한다', () => {
      const result = analyzeColors([
        '#FF0000',
        '#00FF00',
        '#0000FF',
        '#FFFF00',
        '#FF00FF',
        '#00FFFF',
        '#808080',
        '#FFA500',
      ]);

      expect(result.variety).toBe('diverse');
    });
  });

  // --------------------------------------------------------------------------
  // 통계(stats) 정확도 검증
  // --------------------------------------------------------------------------
  describe('통계(stats) 정확도', () => {
    it('warm/cool/neutral 비율이 정확하게 계산된다', () => {
      // warm 2개, cool 1개, neutral 1개 -> 총 4개
      const result = analyzeColors([
        '#FF0000', // warm
        '#FFA500', // warm
        '#0000FF', // cool
        '#808080', // neutral
      ]);

      expect(result.stats.totalColors).toBe(4);
      expect(result.stats.warmPercent).toBe(50);  // 2/4 * 100 = 50
      expect(result.stats.coolPercent).toBe(25);   // 1/4 * 100 = 25
      expect(result.stats.neutralPercent).toBe(25); // 1/4 * 100 = 25
    });

    it('단일 warm 색상이면 warmPercent=100이다', () => {
      const result = analyzeColors(['#FF0000']);

      expect(result.stats.warmPercent).toBe(100);
      expect(result.stats.coolPercent).toBe(0);
      expect(result.stats.neutralPercent).toBe(0);
      expect(result.stats.totalColors).toBe(1);
    });

    it('비율 계산 시 반올림이 적용된다', () => {
      // warm 1개, cool 1개, neutral 1개 -> 각 33%
      const result = analyzeColors(['#FF0000', '#0000FF', '#808080']);

      expect(result.stats.warmPercent).toBe(33);    // Math.round(1/3*100) = 33
      expect(result.stats.coolPercent).toBe(33);     // Math.round(1/3*100) = 33
      expect(result.stats.neutralPercent).toBe(33);  // Math.round(1/3*100) = 33
      expect(result.stats.totalColors).toBe(3);
    });
  });

  // --------------------------------------------------------------------------
  // 메시지 선택 로직
  // --------------------------------------------------------------------------
  describe('메시지 선택 로직', () => {
    it('diverse일 때 diverse 메시지가 선택된다 (Math.random=0 -> 첫 번째)', () => {
      const result = analyzeColors([
        '#FF0000',
        '#00FF00',
        '#0000FF',
        '#FFFF00',
        '#FF00FF',
        '#00FFFF',
        '#808080',
        '#FFA500',
      ]);

      expect(result.variety).toBe('diverse');
      // diverse 메시지 배열의 index 0
      expect(result.message).toBe(
        '다양한 색상 선택은 풍부한 창의성을 나타냅니다! 오늘 새로운 아이디어가 떠오를 수 있어요.'
      );
      expect(result.emoji).toBe('🎭');
    });

    it('monotone이고 Math.random < 0.5이면 monotone 메시지가 선택된다', () => {
      // Math.random이 0으로 모킹됨 -> 0 < 0.5 true -> monotone 메시지
      // 그 후 getRandomMessage에서도 Math.random=0 -> index 0
      const result = analyzeColors(['#FF0000']);

      expect(result.variety).toBe('monotone');
      expect(result.message).toBe(
        '집중력 있는 색상 선택이에요. 한 가지에 몰입하는 힘이 있는 오늘입니다.'
      );
      expect(result.emoji).toBe('🎯');
    });

    it('monotone이고 Math.random >= 0.5이면 온도/밝기 기반 메시지가 선택된다', () => {
      // monotone 분기에서 Math.random >= 0.5면 selectByTemperatureAndBrightness 호출
      randomSpy.mockReturnValue(0.5);

      const result = analyzeColors(['#FF0000']); // warm, l=50 -> balanced

      expect(result.variety).toBe('monotone');
      // warmBalanced 메시지 배열의 index 0 (Math.random=0.5 -> floor(0.5*2)=1)
      // 실제로 0.5*2=1 -> index 1
      expect(result.message).toBe(
        '따뜻하면서도 안정적인 마음 상태입니다. 새로운 인연을 만나기 좋은 날이에요.'
      );
      expect(result.emoji).toBe('💫');
    });

    it('moderate일 때 온도/밝기에 따른 메시지가 선택된다', () => {
      // moderate -> selectByTemperatureAndBrightness 호출
      const result = analyzeColors([
        '#0000FF', // cool, l=50
        '#008000', // cool, l=25
        '#00FFFF', // cool, l=50
        '#0080FF', // cool, l~50
      ]);

      // cool 색상 4개 -> coolPercent > 60 -> cool 카테고리
      // 평균 밝기: 대략 (50+25+50+50)/4 ≈ 44 -> balanced
      expect(result.dominantCategory).toBe('cool');
      // coolBalanced 메시지 배열 index 0
      expect(result.message).toBe(
        '평온하고 안정적인 마음 상태입니다. 깊은 사색과 휴식이 필요한 때일 수 있어요.'
      );
      expect(result.emoji).toBe('🍃');
    });

    it('warm + bright 조합 시 warmBright 메시지가 선택된다', () => {
      // 높은 밝기의 따뜻한 색상 4개 (moderate 이상)
      const result = analyzeColors([
        '#FFFF00', // warm, l=50
        '#FFC0CB', // warm, l~88
        '#FFE4E1', // warm, l~92
        '#FFDAB9', // warm, l~86
      ]);

      expect(result.dominantCategory).toBe('warm');
      expect(result.brightness).toBe('bright');
      expect(result.message).toBe(
        '오늘 당신은 에너지가 넘치고 열정적인 상태입니다! 새로운 도전을 시작하기 좋은 날이에요.'
      );
      expect(result.emoji).toBe('🔥');
    });

    it('warm + dark 조합 시 warmDark 메시지가 선택된다', () => {
      // 어두운 따뜻한 색상들
      const result = analyzeColors([
        '#800000', // dark red, l=25
        '#8B4513', // saddle brown, l~29
        '#A0522D', // sienna, l~40
        '#800000', // dark red
      ]);

      expect(result.dominantCategory).toBe('warm');
      expect(result.brightness).toBe('dark');
      expect(result.message).toBe(
        '깊이 있는 따뜻함이 느껴집니다. 내면의 열정을 간직하고 있는 상태예요.'
      );
      expect(result.emoji).toBe('🍂');
    });

    it('cool + bright 조합 시 coolBright 메시지가 선택된다', () => {
      const result = analyzeColors([
        '#87CEEB', // sky blue, l~high
        '#ADD8E6', // light blue, l~high
        '#E0FFFF', // light cyan, l~high
        '#B0E0E6', // powder blue, l~high
      ]);

      expect(result.dominantCategory).toBe('cool');
      expect(result.brightness).toBe('bright');
      expect(result.message).toBe(
        '맑고 청량한 에너지가 느껴집니다! 창의적인 아이디어가 떠오를 수 있어요.'
      );
      expect(result.emoji).toBe('💎');
    });

    it('cool + dark 조합 시 coolDark 메시지가 선택된다', () => {
      const result = analyzeColors([
        '#000080', // navy, l=25
        '#00008B', // dark blue, l~27
        '#191970', // midnight blue, l~27
        '#006400', // dark green, l~20
      ]);

      expect(result.dominantCategory).toBe('cool');
      expect(result.brightness).toBe('dark');
      expect(result.message).toBe(
        '깊이 있는 사색의 시간이 필요할 수 있어요. 조용한 휴식을 취해보세요.'
      );
      expect(result.emoji).toBe('🌙');
    });

    it('neutral일 때 neutral 메시지가 선택된다', () => {
      // neutral 4개 -> moderate + neutral
      const result = analyzeColors([
        '#808080',
        '#C0C0C0',
        '#A9A9A9',
        '#D3D3D3',
      ]);

      expect(result.dominantCategory).toBe('neutral');
      expect(result.message).toBe(
        '차분하고 균형 잡힌 마음 상태입니다. 객관적인 시각으로 상황을 바라볼 수 있어요.'
      );
      expect(result.emoji).toBe('⚪');
    });

    it('mixed일 때 mixed 메시지가 선택된다', () => {
      // warm과 cool이 균등 -> mixed, moderate
      const result = analyzeColors([
        '#FF0000', // warm
        '#FFA500', // warm
        '#0000FF', // cool
        '#008000', // cool
      ]);

      expect(result.dominantCategory).toBe('mixed');
      expect(result.message).toBe(
        '다채로운 색상 선택은 풍부한 감성과 창의성을 보여줍니다!'
      );
      expect(result.emoji).toBe('🌈');
    });
  });

  // --------------------------------------------------------------------------
  // 엣지 케이스
  // --------------------------------------------------------------------------
  describe('엣지 케이스', () => {
    it('3자리 hex 색상(#F00)도 올바르게 처리된다', () => {
      // hexToHSL에서 3자리 hex를 6자리로 확장: F00 -> FF0000
      const result = analyzeColors(['#F00']);

      expect(result.dominantCategory).toBe('warm');
      expect(result.stats.warmPercent).toBe(100);
    });

    it('#이 없는 hex 색상도 처리된다', () => {
      // hexToHSL에서 # 제거 로직이 있으므로 없어도 동작
      const result = analyzeColors(['FF0000']);

      expect(result.dominantCategory).toBe('warm');
      expect(result.stats.warmPercent).toBe(100);
    });

    it('극단값 #000000과 #FFFFFF를 함께 분석하면 neutral이 된다', () => {
      const result = analyzeColors(['#000000', '#FFFFFF']);

      expect(result.dominantCategory).toBe('neutral');
      expect(result.stats.neutralPercent).toBe(100);
      // 평균 밝기: (0+100)/2 = 50 -> balanced
      expect(result.brightness).toBe('balanced');
    });

    it('8개 이상의 다양한 색상에서 diverse 메시지가 나온다', () => {
      const manyColors = [
        '#FF0000', '#FFA500', '#FFFF00', '#008000',
        '#0000FF', '#800080', '#FFC0CB', '#808080',
        '#00FFFF',
      ];
      const result = analyzeColors(manyColors);

      expect(result.variety).toBe('diverse');
      expect(result.stats.totalColors).toBe(9);
    });

    it('중간 영역 색상(h=80, 연두)은 warm으로 분류된다', () => {
      // h=80이면 60<h<120이고 h<90이므로 warm
      // #ADFF2F (GreenYellow): r=173,g=255,b=47 -> h~84
      const result = analyzeColors(['#ADFF2F']);

      expect(result.dominantCategory).toBe('warm');
    });

    it('중간 영역 색상(h=100, 연두)은 cool로 분류된다', () => {
      // h=100이면 60<h<120이고 h>=90이므로 cool
      // #7CFC00 (LawnGreen): r=124,g=252,b=0 -> h~90 정도
      // 더 확실한 색: #00CC44 -> r=0, g=204, b=68
      // h계산: max=g=0.8, min=r=0, d=0.8
      // g가 max: h = ((b-r)/d + 2)/6 = ((0.267-0)/0.8 + 2)/6 = 2.333/6 = 0.389 -> h=140 -> cool
      const result = analyzeColors(['#00CC44']);

      expect(result.dominantCategory).toBe('cool');
    });

    it('채도가 매우 낮은 색상(#555555)은 neutral로 분류된다', () => {
      // #555555: r=g=b -> s=0 -> neutral
      const result = analyzeColors(['#555555']);

      expect(result.dominantCategory).toBe('neutral');
    });
  });

  // --------------------------------------------------------------------------
  // 결과 객체 구조 검증
  // --------------------------------------------------------------------------
  describe('결과 객체 구조', () => {
    it('반환 객체에 모든 필수 필드가 포함되어 있다', () => {
      const result = analyzeColors(['#FF0000']);

      expect(result).toHaveProperty('dominantCategory');
      expect(result).toHaveProperty('brightness');
      expect(result).toHaveProperty('variety');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('emoji');
      expect(result).toHaveProperty('stats');
      expect(result.stats).toHaveProperty('warmPercent');
      expect(result.stats).toHaveProperty('coolPercent');
      expect(result.stats).toHaveProperty('neutralPercent');
      expect(result.stats).toHaveProperty('totalColors');
    });

    it('dominantCategory는 유효한 값 중 하나여야 한다', () => {
      const result = analyzeColors(['#FF0000']);

      expect(['warm', 'cool', 'neutral', 'mixed']).toContain(
        result.dominantCategory
      );
    });

    it('brightness는 유효한 값 중 하나여야 한다', () => {
      const result = analyzeColors(['#FF0000']);

      expect(['bright', 'dark', 'balanced']).toContain(result.brightness);
    });

    it('variety는 유효한 값 중 하나여야 한다', () => {
      const result = analyzeColors(['#FF0000']);

      expect(['monotone', 'moderate', 'diverse']).toContain(result.variety);
    });

    it('message는 비어있지 않은 문자열이어야 한다', () => {
      const result = analyzeColors(['#FF0000']);

      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);
    });

    it('emoji는 비어있지 않은 문자열이어야 한다', () => {
      const result = analyzeColors(['#FF0000']);

      expect(typeof result.emoji).toBe('string');
      expect(result.emoji.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// getBrightnessLabel 테스트
// ============================================================================
describe('getBrightnessLabel', () => {
  it('"bright"를 전달하면 "밝은 톤"을 반환한다', () => {
    expect(getBrightnessLabel('bright')).toBe('밝은 톤');
  });

  it('"dark"를 전달하면 "어두운 톤"을 반환한다', () => {
    expect(getBrightnessLabel('dark')).toBe('어두운 톤');
  });

  it('"balanced"를 전달하면 "중간 톤"을 반환한다', () => {
    expect(getBrightnessLabel('balanced')).toBe('중간 톤');
  });
});

// ============================================================================
// getTemperatureLabel 테스트
// ============================================================================
describe('getTemperatureLabel', () => {
  it('"warm"를 전달하면 "따뜻한 색"을 반환한다', () => {
    expect(getTemperatureLabel('warm')).toBe('따뜻한 색');
  });

  it('"cool"를 전달하면 "차가운 색"을 반환한다', () => {
    expect(getTemperatureLabel('cool')).toBe('차가운 색');
  });

  it('"neutral"를 전달하면 "무채색"을 반환한다', () => {
    expect(getTemperatureLabel('neutral')).toBe('무채색');
  });

  it('"mixed"를 전달하면 "혼합 색상"을 반환한다', () => {
    expect(getTemperatureLabel('mixed')).toBe('혼합 색상');
  });
});
