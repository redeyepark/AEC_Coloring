import { describe, it, expect, vi, afterEach } from 'vitest';
import { FORTUNES, getRandomFortune, type Fortune } from './fortunes';

// 유효한 카테고리 목록
const VALID_CATEGORIES: Fortune['category'][] = [
  'daily',
  'motivation',
  'healing',
  'luck',
  'self-love',
];

describe('FORTUNES 데이터 구조 검증', () => {
  it('총 50개의 포춘 메시지가 존재해야 한다', () => {
    expect(FORTUNES).toHaveLength(50);
  });

  it('모든 항목이 message와 category 속성을 가져야 한다', () => {
    for (const fortune of FORTUNES) {
      expect(fortune).toHaveProperty('message');
      expect(fortune).toHaveProperty('category');
    }
  });

  it('모든 message는 빈 문자열이 아닌 string이어야 한다', () => {
    for (const fortune of FORTUNES) {
      expect(typeof fortune.message).toBe('string');
      expect(fortune.message.length).toBeGreaterThan(0);
      expect(fortune.message.trim()).not.toBe('');
    }
  });

  it('모든 category는 5개의 유효한 값 중 하나여야 한다', () => {
    for (const fortune of FORTUNES) {
      expect(VALID_CATEGORIES).toContain(fortune.category);
    }
  });

  it.each(VALID_CATEGORIES)(
    '카테고리 "%s"에 정확히 10개의 항목이 있어야 한다',
    (category) => {
      const count = FORTUNES.filter((f) => f.category === category).length;
      expect(count).toBe(10);
    },
  );

  it('중복된 메시지가 없어야 한다', () => {
    const messages = FORTUNES.map((f) => f.message);
    const uniqueMessages = new Set(messages);
    expect(uniqueMessages.size).toBe(messages.length);
  });
});

describe('getRandomFortune 함수 테스트', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('{ message, index } 형태의 객체를 반환해야 한다', () => {
    const result = getRandomFortune();
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('index');
    expect(typeof result.message).toBe('string');
    expect(typeof result.index).toBe('number');
  });

  it('반환된 index가 유효한 범위(0~49) 내에 있어야 한다', () => {
    // 여러 번 호출하여 범위 검증
    for (let i = 0; i < 20; i++) {
      const result = getRandomFortune();
      expect(result.index).toBeGreaterThanOrEqual(0);
      expect(result.index).toBeLessThan(FORTUNES.length);
    }
  });

  it('반환된 message가 FORTUNES[index].message와 일치해야 한다', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = getRandomFortune();
    expect(result.message).toBe(FORTUNES[result.index].message);
  });

  it('previousIndex 없이 호출하면 유효한 포춘을 반환해야 한다', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // 첫 번째 항목 선택
    const result = getRandomFortune();
    expect(result.index).toBe(0);
    expect(result.message).toBe(FORTUNES[0].message);
  });

  it('Math.random이 0일 때 인덱스 0을 반환해야 한다', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = getRandomFortune();
    expect(result.index).toBe(0);
  });

  it('Math.random이 0.999...일 때 마지막 인덱스를 반환해야 한다', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const result = getRandomFortune();
    expect(result.index).toBe(FORTUNES.length - 1);
  });

  describe('previousIndex를 전달하면 다른 인덱스를 반환해야 한다', () => {
    it('previousIndex=0일 때 0이 아닌 인덱스를 반환해야 한다', () => {
      // 첫 번째 호출: Math.random()이 0을 반환 -> index 0 (previousIndex와 동일하므로 재시도)
      // 두 번째 호출: Math.random()이 0.5를 반환 -> index 25 (다른 값이므로 선택)
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0) // index 0 -> previousIndex와 같음, 재시도
        .mockReturnValueOnce(0.5); // index 25 -> 다른 값, 선택

      const result = getRandomFortune(0);
      expect(result.index).not.toBe(0);
      expect(result.index).toBe(25);
    });

    it('previousIndex=49일 때 49가 아닌 인덱스를 반환해야 한다', () => {
      // 첫 번째 호출: Math.random()이 0.99를 반환 -> index 49 (previousIndex와 동일하므로 재시도)
      // 두 번째 호출: Math.random()이 0.1을 반환 -> index 5 (다른 값이므로 선택)
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.99) // index 49 -> previousIndex와 같음, 재시도
        .mockReturnValueOnce(0.1); // index 5 -> 다른 값, 선택

      const result = getRandomFortune(49);
      expect(result.index).not.toBe(49);
      expect(result.index).toBe(5);
    });

    it('previousIndex=25(중간값)일 때 25가 아닌 인덱스를 반환해야 한다', () => {
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.5) // index 25 -> previousIndex와 같음, 재시도
        .mockReturnValueOnce(0.0); // index 0 -> 다른 값, 선택

      const result = getRandomFortune(25);
      expect(result.index).not.toBe(25);
      expect(result.index).toBe(0);
    });

    it('첫 번째 시도에서 다른 값이 나오면 즉시 반환해야 한다', () => {
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.3); // index 15

      const result = getRandomFortune(0); // previousIndex=0, 결과=15이므로 즉시 반환
      expect(result.index).toBe(15);
      expect(randomSpy).toHaveBeenCalledTimes(1); // 한 번만 호출
    });
  });

  it('여러 번 호출해도 무한 루프 없이 결과를 반환해야 한다', () => {
    for (let i = 0; i < 100; i++) {
      const result = getRandomFortune(i % FORTUNES.length);
      expect(result).toBeDefined();
      expect(result.message).toBeDefined();
      expect(result.index).toBeDefined();
    }
  });
});

describe('엣지 케이스', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('previousIndex=undefined는 인자 없이 호출한 것과 동일하게 동작해야 한다', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.2);

    const resultWithUndefined = getRandomFortune(undefined);
    vi.spyOn(Math, 'random').mockReturnValue(0.2);
    const resultWithoutArg = getRandomFortune();

    expect(resultWithUndefined.index).toBe(resultWithoutArg.index);
    expect(resultWithUndefined.message).toBe(resultWithoutArg.message);
  });

  it('반환된 모든 message는 빈 문자열이 아닌 string이어야 한다', () => {
    for (let i = 0; i < FORTUNES.length; i++) {
      vi.spyOn(Math, 'random').mockReturnValue(i / FORTUNES.length);
      const result = getRandomFortune();
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);
      vi.restoreAllMocks();
    }
  });

  it('반환된 모든 index는 정수여야 한다', () => {
    const testValues = [0, 0.1, 0.25, 0.5, 0.75, 0.99];
    for (const val of testValues) {
      vi.spyOn(Math, 'random').mockReturnValue(val);
      const result = getRandomFortune();
      expect(Number.isInteger(result.index)).toBe(true);
      vi.restoreAllMocks();
    }
  });

  it('previousIndex로 현재 인덱스와 같은 값이 반복 생성되어도 결국 다른 값을 반환해야 한다', () => {
    // 3번 연속 같은 값이 나온 후 다른 값이 나오는 시나리오
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.2) // index 10 -> previousIndex와 같음
      .mockReturnValueOnce(0.2) // index 10 -> previousIndex와 같음
      .mockReturnValueOnce(0.2) // index 10 -> previousIndex와 같음
      .mockReturnValueOnce(0.6); // index 30 -> 다른 값, 선택

    const result = getRandomFortune(10);
    expect(result.index).not.toBe(10);
    expect(result.index).toBe(30);
  });
});
