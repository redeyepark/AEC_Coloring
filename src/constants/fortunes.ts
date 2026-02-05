// 포춘쿠키 메시지 - 5개 카테고리, 총 50개

export interface Fortune {
  message: string;
  category: 'daily' | 'motivation' | 'healing' | 'luck' | 'self-love';
}

export const FORTUNES: Fortune[] = [
  // 일상 응원 (10개)
  { message: '오늘 하루도 당신답게 빛나세요.', category: 'daily' },
  { message: '작은 것에서 큰 행복을 찾을 수 있어요.', category: 'daily' },
  { message: '당신의 미소가 누군가에게 희망이 됩니다.', category: 'daily' },
  { message: '오늘의 작은 노력이 내일의 큰 변화가 되어요.', category: 'daily' },
  { message: '당신이 있어 세상이 더 따뜻해집니다.', category: 'daily' },
  { message: '지금 이 순간을 즐겨보세요.', category: 'daily' },
  { message: '오늘 만나는 모든 인연이 소중해요.', category: 'daily' },
  { message: '당신의 하루가 색으로 가득 차길 바라요.', category: 'daily' },
  { message: '평범한 하루도 당신에겐 특별한 선물이에요.', category: 'daily' },
  { message: '오늘도 당신은 충분히 잘하고 있어요.', category: 'daily' },

  // 동기부여 (10개)
  { message: '할 수 있다고 믿으면 이미 반은 성공한 거예요.', category: 'motivation' },
  { message: '포기하지 않는 한 실패는 없어요.', category: 'motivation' },
  { message: '당신의 가능성은 무한합니다.', category: 'motivation' },
  { message: '한 걸음씩 나아가면 어느새 목표에 도달해요.', category: 'motivation' },
  { message: '어제보다 나은 오늘의 내가 되어보세요.', category: 'motivation' },
  { message: '도전하는 당신이 가장 멋져요.', category: 'motivation' },
  { message: '실패는 성공으로 가는 디딤돌이에요.', category: 'motivation' },
  { message: '꿈을 향해 달려가는 당신을 응원해요.', category: 'motivation' },
  { message: '지금 시작해도 결코 늦지 않았어요.', category: 'motivation' },
  { message: '당신의 노력은 반드시 빛을 발할 거예요.', category: 'motivation' },

  // 위로와 힐링 (10개)
  { message: '지친 마음에 따뜻한 위로를 보내요.', category: 'healing' },
  { message: '힘들었던 시간도 지나가요. 괜찮아질 거예요.', category: 'healing' },
  { message: '당신의 감정은 모두 소중해요.', category: 'healing' },
  { message: '잠시 쉬어가도 괜찮아요.', category: 'healing' },
  { message: '오늘 하루 수고 많았어요.', category: 'healing' },
  { message: '울고 싶을 땐 울어도 돼요.', category: 'healing' },
  { message: '당신은 혼자가 아니에요.', category: 'healing' },
  { message: '지금 이 순간, 깊게 숨을 쉬어보세요.', category: 'healing' },
  { message: '힘든 날도 결국 지나간답니다.', category: 'healing' },
  { message: '당신의 마음이 평온해지길 바라요.', category: 'healing' },

  // 행운과 축복 (10개)
  { message: '오늘 좋은 일이 일어날 거예요.', category: 'luck' },
  { message: '행운이 당신을 따를 거예요.', category: 'luck' },
  { message: '기대하지 않은 좋은 소식이 찾아올 거예요.', category: 'luck' },
  { message: '당신에게 풍요로운 하루가 되길 바라요.', category: 'luck' },
  { message: '오늘은 특별한 인연을 만날 수도 있어요.', category: 'luck' },
  { message: '당신의 바람이 이루어지길 빌어요.', category: 'luck' },
  { message: '좋은 기운이 당신을 감싸고 있어요.', category: 'luck' },
  { message: '뜻밖의 행복이 찾아올 거예요.', category: 'luck' },
  { message: '당신에게 축복이 가득하길 바라요.', category: 'luck' },
  { message: '행복한 순간들이 연이어 찾아올 거예요.', category: 'luck' },

  // 자기 사랑 (10개)
  { message: '당신은 있는 그대로 사랑받을 자격이 있어요.', category: 'self-love' },
  { message: '스스로를 먼저 안아주세요.', category: 'self-love' },
  { message: '당신은 세상에서 유일하고 소중한 존재예요.', category: 'self-love' },
  { message: '자신을 사랑하는 것이 가장 큰 용기예요.', category: 'self-love' },
  { message: '당신의 존재 자체가 선물이에요.', category: 'self-love' },
  { message: '완벽하지 않아도 괜찮아요, 당신은 충분해요.', category: 'self-love' },
  { message: '당신만의 속도로 가도 돼요.', category: 'self-love' },
  { message: '자신에게 친절해지세요.', category: 'self-love' },
  { message: '당신은 사랑받기 위해 태어났어요.', category: 'self-love' },
  { message: '오늘 하루, 자신을 칭찬해주세요.', category: 'self-love' },
];

/**
 * 랜덤 포춘 메시지를 반환합니다.
 * @param previousIndex - 제외할 이전 인덱스 (중복 방지)
 * @returns { message: string; index: number }
 */
export function getRandomFortune(previousIndex?: number): { message: string; index: number } {
  let randomIndex: number;

  if (previousIndex !== undefined && FORTUNES.length > 1) {
    // 이전 인덱스를 제외하고 선택
    do {
      randomIndex = Math.floor(Math.random() * FORTUNES.length);
    } while (randomIndex === previousIndex);
  } else {
    randomIndex = Math.floor(Math.random() * FORTUNES.length);
  }

  return {
    message: FORTUNES[randomIndex].message,
    index: randomIndex,
  };
}
