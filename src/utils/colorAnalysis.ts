// 색상 심리 분석 유틸리티
// SVG에서 사용된 색상을 추출하고 심리학적 해석을 제공

// 색상 분석 결과 타입
export interface ColorAnalysisResult {
  dominantCategory: 'warm' | 'cool' | 'neutral' | 'mixed';
  brightness: 'bright' | 'dark' | 'balanced';
  variety: 'monotone' | 'moderate' | 'diverse';
  message: string;
  emoji: string;
  stats: {
    warmPercent: number;
    coolPercent: number;
    neutralPercent: number;
    totalColors: number;
  };
}

// HSL 색상 타입
interface HSL {
  h: number;
  s: number;
  l: number;
}

// Hex 색상을 HSL로 변환
function hexToHSL(hex: string): HSL {
  // # 제거
  hex = hex.replace('#', '');

  // 3자리 hex를 6자리로 확장
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// 색상 온도 분류 (따뜻한 색/차가운 색/무채색)
function classifyColorTemperature(hsl: HSL): 'warm' | 'cool' | 'neutral' {
  const { h, s, l } = hsl;

  // 무채색 판단: 채도가 매우 낮거나 밝기가 극단적
  if (s < 10 || l < 10 || l > 95) {
    return 'neutral';
  }

  // 따뜻한 색: 빨강, 주황, 노랑, 분홍 (0-60도, 300-360도)
  if ((h >= 0 && h <= 60) || (h >= 300 && h <= 360)) {
    return 'warm';
  }

  // 차가운 색: 초록, 청록, 파랑, 보라 (120-270도)
  if (h >= 120 && h <= 270) {
    return 'cool';
  }

  // 중간 영역 (60-120도: 연두, 270-300도: 자주)
  if (h > 60 && h < 120) {
    return h < 90 ? 'warm' : 'cool';
  }

  return 'warm'; // 자주색 계열은 따뜻한 느낌이 더 강함
}

// SVG에서 사용된 색상 추출
export function extractColorsFromSvg(svg: SVGSVGElement): string[] {
  const colors = new Set<string>();

  // 모든 요소의 fill 속성 확인
  const allElements = svg.querySelectorAll('*');

  allElements.forEach(element => {
    // fill 속성
    const fill = element.getAttribute('fill');
    if (fill && fill !== 'none' && fill !== 'transparent' && !fill.startsWith('url')) {
      const normalizedColor = normalizeColor(fill);
      if (normalizedColor) {
        colors.add(normalizedColor);
      }
    }

    // stroke 속성
    const stroke = element.getAttribute('stroke');
    if (stroke && stroke !== 'none' && stroke !== 'transparent' && !stroke.startsWith('url')) {
      const normalizedColor = normalizeColor(stroke);
      if (normalizedColor) {
        colors.add(normalizedColor);
      }
    }

    // style 속성에서 fill/stroke 추출
    const style = element.getAttribute('style');
    if (style) {
      const fillMatch = style.match(/fill:\s*([^;]+)/);
      if (fillMatch) {
        const normalizedColor = normalizeColor(fillMatch[1].trim());
        if (normalizedColor) {
          colors.add(normalizedColor);
        }
      }

      const strokeMatch = style.match(/stroke:\s*([^;]+)/);
      if (strokeMatch) {
        const normalizedColor = normalizeColor(strokeMatch[1].trim());
        if (normalizedColor) {
          colors.add(normalizedColor);
        }
      }
    }
  });

  // 기본 배경색(흰색) 제외
  colors.delete('#FFFFFF');
  colors.delete('#ffffff');
  colors.delete('#FFF');
  colors.delete('#fff');

  return Array.from(colors);
}

// 색상 정규화 (다양한 형식을 hex로 변환)
function normalizeColor(color: string): string | null {
  color = color.trim().toLowerCase();

  // 이미 hex 형식인 경우
  if (color.startsWith('#')) {
    return color.toUpperCase();
  }

  // rgb() 형식 처리
  const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
  }

  // 기본 색상 이름 처리
  const colorNames: Record<string, string> = {
    'white': '#FFFFFF',
    'black': '#000000',
    'red': '#FF0000',
    'green': '#008000',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
    'pink': '#FFC0CB',
    'purple': '#800080',
    'gray': '#808080',
    'grey': '#808080'
  };

  return colorNames[color] || null;
}

// 심리학적 메시지 데이터
const PSYCHOLOGY_MESSAGES = {
  warmBright: [
    { message: '오늘 당신은 에너지가 넘치고 열정적인 상태입니다! 새로운 도전을 시작하기 좋은 날이에요.', emoji: '🔥' },
    { message: '따뜻한 에너지가 가득한 하루! 주변 사람들에게 긍정적인 영향을 줄 수 있어요.', emoji: '☀️' },
    { message: '활력과 자신감이 느껴지는 색 선택이에요. 오늘 하루가 빛나는 날이 될 거예요!', emoji: '✨' }
  ],
  warmDark: [
    { message: '깊이 있는 따뜻함이 느껴집니다. 내면의 열정을 간직하고 있는 상태예요.', emoji: '🍂' },
    { message: '차분하지만 따뜻한 마음을 가진 오늘, 소중한 사람들과 시간을 보내보세요.', emoji: '🌅' },
    { message: '진중하고 안정적인 에너지가 느껴져요. 중요한 일에 집중하기 좋은 때입니다.', emoji: '🏡' }
  ],
  warmBalanced: [
    { message: '균형 잡힌 따뜻한 에너지! 오늘은 일과 휴식의 조화가 좋은 하루가 될 거예요.', emoji: '🌻' },
    { message: '따뜻하면서도 안정적인 마음 상태입니다. 새로운 인연을 만나기 좋은 날이에요.', emoji: '💫' }
  ],
  coolBright: [
    { message: '맑고 청량한 에너지가 느껴집니다! 창의적인 아이디어가 떠오를 수 있어요.', emoji: '💎' },
    { message: '상쾌하고 시원한 기운이 가득해요. 머리가 맑아지는 하루가 될 거예요.', emoji: '🌊' },
    { message: '밝은 차가운 색은 명료함을 상징해요. 중요한 결정을 내리기 좋은 컨디션이에요.', emoji: '❄️' }
  ],
  coolDark: [
    { message: '깊이 있는 사색의 시간이 필요할 수 있어요. 조용한 휴식을 취해보세요.', emoji: '🌙' },
    { message: '신비롭고 깊은 감성이 느껴집니다. 예술적 영감이 떠오를 수 있는 날이에요.', emoji: '🔮' },
    { message: '차분하고 깊이 있는 마음 상태입니다. 명상이나 독서를 추천해요.', emoji: '📚' }
  ],
  coolBalanced: [
    { message: '평온하고 안정적인 마음 상태입니다. 깊은 사색과 휴식이 필요한 때일 수 있어요.', emoji: '🍃' },
    { message: '차분한 에너지가 느껴집니다. 중요한 결정을 내리기에 좋은 컨디션이에요.', emoji: '💙' }
  ],
  neutral: [
    { message: '차분하고 균형 잡힌 마음 상태입니다. 객관적인 시각으로 상황을 바라볼 수 있어요.', emoji: '⚪' },
    { message: '중립적인 색 선택은 안정과 평화를 추구하는 마음을 나타내요.', emoji: '🖤' },
    { message: '미니멀한 색 선택! 단순함 속에서 명확함을 찾는 오늘이에요.', emoji: '🤍' }
  ],
  mixed: [
    { message: '다채로운 색상 선택은 풍부한 감성과 창의성을 보여줍니다!', emoji: '🌈' },
    { message: '여러 감정이 조화를 이루는 날이에요. 다양한 경험에 열려있는 상태입니다.', emoji: '🎨' },
    { message: '복합적인 색상은 당신의 다면적인 매력을 보여줘요. 오늘은 특별한 날이 될 거예요!', emoji: '🦋' }
  ],
  diverse: [
    { message: '다양한 색상 선택은 풍부한 창의성을 나타냅니다! 오늘 새로운 아이디어가 떠오를 수 있어요.', emoji: '🎭' },
    { message: '컬러풀한 선택! 당신의 상상력과 표현력이 빛나는 하루예요.', emoji: '🎪' },
    { message: '무한한 가능성을 품은 색상들! 오늘은 어떤 일이든 해낼 수 있어요.', emoji: '🚀' }
  ],
  monotone: [
    { message: '집중력 있는 색상 선택이에요. 한 가지에 몰입하는 힘이 있는 오늘입니다.', emoji: '🎯' },
    { message: '일관된 색 선택은 명확한 목표 의식을 보여줘요. 오늘 하루 화이팅!', emoji: '💪' }
  ]
};

// 랜덤 메시지 선택 함수
function getRandomMessage(messages: Array<{ message: string; emoji: string }>) {
  return messages[Math.floor(Math.random() * messages.length)];
}

// 색상 분석 메인 함수
export function analyzeColors(colors: string[]): ColorAnalysisResult {
  if (colors.length === 0) {
    return {
      dominantCategory: 'neutral',
      brightness: 'balanced',
      variety: 'monotone',
      message: '색상을 선택하지 않았어요. 어떤 마음 상태인지 색칠을 통해 표현해보세요!',
      emoji: '🎨',
      stats: {
        warmPercent: 0,
        coolPercent: 0,
        neutralPercent: 100,
        totalColors: 0
      }
    };
  }

  // 색상별 온도 분류
  let warmCount = 0;
  let coolCount = 0;
  let neutralCount = 0;
  let totalLightness = 0;

  colors.forEach(color => {
    const hsl = hexToHSL(color);
    const temperature = classifyColorTemperature(hsl);

    if (temperature === 'warm') warmCount++;
    else if (temperature === 'cool') coolCount++;
    else neutralCount++;

    totalLightness += hsl.l;
  });

  const totalColors = colors.length;
  const avgLightness = totalLightness / totalColors;

  // 통계 계산
  const warmPercent = Math.round((warmCount / totalColors) * 100);
  const coolPercent = Math.round((coolCount / totalColors) * 100);
  const neutralPercent = Math.round((neutralCount / totalColors) * 100);

  // 주요 색상 카테고리 결정
  let dominantCategory: 'warm' | 'cool' | 'neutral' | 'mixed';
  if (warmCount > coolCount && warmCount > neutralCount) {
    dominantCategory = warmPercent > 60 ? 'warm' : 'mixed';
  } else if (coolCount > warmCount && coolCount > neutralCount) {
    dominantCategory = coolPercent > 60 ? 'cool' : 'mixed';
  } else if (neutralCount > warmCount && neutralCount > coolCount) {
    dominantCategory = 'neutral';
  } else {
    dominantCategory = 'mixed';
  }

  // 밝기 결정
  let brightness: 'bright' | 'dark' | 'balanced';
  if (avgLightness > 60) {
    brightness = 'bright';
  } else if (avgLightness < 40) {
    brightness = 'dark';
  } else {
    brightness = 'balanced';
  }

  // 다양성 결정
  let variety: 'monotone' | 'moderate' | 'diverse';
  if (totalColors <= 3) {
    variety = 'monotone';
  } else if (totalColors <= 7) {
    variety = 'moderate';
  } else {
    variety = 'diverse';
  }

  // 메시지 선택
  let selectedMessage: { message: string; emoji: string };

  // 다양성이 높으면 다양성 메시지 우선
  if (variety === 'diverse') {
    selectedMessage = getRandomMessage(PSYCHOLOGY_MESSAGES.diverse);
  } else if (variety === 'monotone' && totalColors > 0) {
    // 단조로운 경우 해당 메시지 50% 확률
    if (Math.random() < 0.5) {
      selectedMessage = getRandomMessage(PSYCHOLOGY_MESSAGES.monotone);
    } else {
      selectedMessage = selectByTemperatureAndBrightness(dominantCategory, brightness);
    }
  } else {
    selectedMessage = selectByTemperatureAndBrightness(dominantCategory, brightness);
  }

  return {
    dominantCategory,
    brightness,
    variety,
    message: selectedMessage.message,
    emoji: selectedMessage.emoji,
    stats: {
      warmPercent,
      coolPercent,
      neutralPercent,
      totalColors
    }
  };
}

// 온도와 밝기에 따른 메시지 선택
function selectByTemperatureAndBrightness(
  category: 'warm' | 'cool' | 'neutral' | 'mixed',
  brightness: 'bright' | 'dark' | 'balanced'
): { message: string; emoji: string } {
  if (category === 'warm') {
    if (brightness === 'bright') return getRandomMessage(PSYCHOLOGY_MESSAGES.warmBright);
    if (brightness === 'dark') return getRandomMessage(PSYCHOLOGY_MESSAGES.warmDark);
    return getRandomMessage(PSYCHOLOGY_MESSAGES.warmBalanced);
  }

  if (category === 'cool') {
    if (brightness === 'bright') return getRandomMessage(PSYCHOLOGY_MESSAGES.coolBright);
    if (brightness === 'dark') return getRandomMessage(PSYCHOLOGY_MESSAGES.coolDark);
    return getRandomMessage(PSYCHOLOGY_MESSAGES.coolBalanced);
  }

  if (category === 'neutral') {
    return getRandomMessage(PSYCHOLOGY_MESSAGES.neutral);
  }

  // mixed
  return getRandomMessage(PSYCHOLOGY_MESSAGES.mixed);
}

// 밝기 레이블 반환 (한국어)
export function getBrightnessLabel(brightness: 'bright' | 'dark' | 'balanced'): string {
  const labels = {
    bright: '밝은 톤',
    dark: '어두운 톤',
    balanced: '중간 톤'
  };
  return labels[brightness];
}

// 온도 레이블 반환 (한국어)
export function getTemperatureLabel(category: 'warm' | 'cool' | 'neutral' | 'mixed'): string {
  const labels = {
    warm: '따뜻한 색',
    cool: '차가운 색',
    neutral: '무채색',
    mixed: '혼합 색상'
  };
  return labels[category];
}
