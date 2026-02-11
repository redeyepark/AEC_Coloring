import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getSeoulWeather,
  getWeatherEmoji,
  ALL_WEATHER_TYPES,
} from './weather';

// ============================================================
// getWeatherEmoji 테스트
// ============================================================
describe('getWeatherEmoji', () => {
  it('sunny 타입은 해 이모지를 반환한다', () => {
    expect(getWeatherEmoji('sunny')).toBe('☀️');
  });

  it('cloudy 타입은 구름 이모지를 반환한다', () => {
    expect(getWeatherEmoji('cloudy')).toBe('☁️');
  });

  it('rainy 타입은 비 이모지를 반환한다', () => {
    expect(getWeatherEmoji('rainy')).toBe('🌧️');
  });

  it('snowy 타입은 눈 이모지를 반환한다', () => {
    expect(getWeatherEmoji('snowy')).toBe('❄️');
  });
});

// ============================================================
// ALL_WEATHER_TYPES 테스트
// ============================================================
describe('ALL_WEATHER_TYPES', () => {
  it('4개의 날씨 타입을 포함한다', () => {
    expect(ALL_WEATHER_TYPES).toHaveLength(4);
  });

  it('올바른 순서로 날씨 타입이 정의되어 있다', () => {
    expect(ALL_WEATHER_TYPES).toEqual(['sunny', 'cloudy', 'rainy', 'snowy']);
  });
});

// ============================================================
// getSeoulWeather 테스트
// ============================================================
describe('getSeoulWeather', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  // ----------------------------------------------------------
  // API 호출 성공 시 WMO 날씨 코드 변환 테스트
  // ----------------------------------------------------------
  describe('API 호출 성공 시 WMO 코드 변환', () => {
    // 맑음 (sunny)
    it('WMO 코드 0은 sunny를 반환한다 (맑음)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 0 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'sunny', code: 0, description: '맑음' });
    });

    // 구름 (cloudy) - 코드 1, 2, 3
    it('WMO 코드 1은 cloudy를 반환한다 (대체로 맑음)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 1 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'cloudy', code: 1, description: '흐림' });
    });

    it('WMO 코드 2는 cloudy를 반환한다 (부분적으로 흐림)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 2 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'cloudy', code: 2, description: '흐림' });
    });

    it('WMO 코드 3은 cloudy를 반환한다 (흐림)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 3 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'cloudy', code: 3, description: '흐림' });
    });

    // 구름 (cloudy) - 안개 코드 45, 48
    it('WMO 코드 45는 cloudy를 반환한다 (안개)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 45 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'cloudy', code: 45, description: '흐림' });
    });

    it('WMO 코드 48은 cloudy를 반환한다 (상고대 안개)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 48 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'cloudy', code: 48, description: '흐림' });
    });

    // 비 (rainy) - 이슬비/비 코드 51-67
    it('WMO 코드 51은 rainy를 반환한다 (약한 이슬비)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 51 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'rainy', code: 51, description: '비' });
    });

    it('WMO 코드 55는 rainy를 반환한다 (강한 이슬비)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 55 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'rainy', code: 55, description: '비' });
    });

    it('WMO 코드 61은 rainy를 반환한다 (약한 비)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 61 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'rainy', code: 61, description: '비' });
    });

    it('WMO 코드 65는 rainy를 반환한다 (강한 비)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 65 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'rainy', code: 65, description: '비' });
    });

    it('WMO 코드 67은 rainy를 반환한다 (강한 진눈깨비)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 67 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'rainy', code: 67, description: '비' });
    });

    // 비 (rainy) - 소나기 코드 80-82
    it('WMO 코드 80은 rainy를 반환한다 (약한 소나기)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 80 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'rainy', code: 80, description: '비' });
    });

    it('WMO 코드 81은 rainy를 반환한다 (보통 소나기)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 81 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'rainy', code: 81, description: '비' });
    });

    it('WMO 코드 82는 rainy를 반환한다 (강한 소나기)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 82 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'rainy', code: 82, description: '비' });
    });

    // 비 (rainy) - 뇌우 코드 95-99
    it('WMO 코드 95는 rainy를 반환한다 (뇌우)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 95 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'rainy', code: 95, description: '비' });
    });

    it('WMO 코드 96은 rainy를 반환한다 (약한 우박 뇌우)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 96 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'rainy', code: 96, description: '비' });
    });

    it('WMO 코드 99는 rainy를 반환한다 (강한 우박 뇌우)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 99 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'rainy', code: 99, description: '비' });
    });

    // 눈 (snowy) - 코드 71-77
    it('WMO 코드 71은 snowy를 반환한다 (약한 눈)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 71 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'snowy', code: 71, description: '눈' });
    });

    it('WMO 코드 73은 snowy를 반환한다 (보통 눈)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 73 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'snowy', code: 73, description: '눈' });
    });

    it('WMO 코드 75는 snowy를 반환한다 (강한 눈)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 75 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'snowy', code: 75, description: '눈' });
    });

    it('WMO 코드 77은 snowy를 반환한다 (싸락눈)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 77 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'snowy', code: 77, description: '눈' });
    });

    // 눈 (snowy) - 눈 소나기 코드 85-86
    it('WMO 코드 85는 snowy를 반환한다 (약한 눈 소나기)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 85 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'snowy', code: 85, description: '눈' });
    });

    it('WMO 코드 86은 snowy를 반환한다 (강한 눈 소나기)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 86 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'snowy', code: 86, description: '눈' });
    });

    // 알 수 없는 코드 -> 기본값 cloudy
    it('알 수 없는 WMO 코드 100은 기본값 cloudy를 반환한다', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 100 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'cloudy', code: 100, description: '흐림' });
    });

    it('음수 WMO 코드 -1은 기본값 cloudy를 반환한다', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: -1 } }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'cloudy', code: -1, description: '흐림' });
    });
  });

  // ----------------------------------------------------------
  // API 에러 응답 테스트
  // ----------------------------------------------------------
  describe('API 에러 응답', () => {
    it('HTTP 500 에러 시 기본값 sunny를 반환한다', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'sunny', code: 0, description: '맑음' });
      expect(console.error).toHaveBeenCalledWith(
        'Failed to fetch weather:',
        expect.any(Error)
      );
    });
  });

  // ----------------------------------------------------------
  // 네트워크 에러 테스트 (fetch 자체가 throw)
  // ----------------------------------------------------------
  describe('네트워크 에러', () => {
    it('fetch가 네트워크 에러를 throw하면 기본값 sunny를 반환한다', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'sunny', code: 0, description: '맑음' });
      expect(console.error).toHaveBeenCalledWith(
        'Failed to fetch weather:',
        expect.any(Error)
      );
    });
  });

  // ----------------------------------------------------------
  // 응답 데이터 누락 테스트
  // ----------------------------------------------------------
  describe('응답 데이터 누락', () => {
    it('data.current가 undefined이면 코드 0(sunny)으로 처리한다', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: undefined }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'sunny', code: 0, description: '맑음' });
    });

    it('data.current.weather_code가 undefined이면 코드 0(sunny)으로 처리한다', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: {} }),
      });

      const result = await getSeoulWeather();
      expect(result).toEqual({ type: 'sunny', code: 0, description: '맑음' });
    });
  });

  // ----------------------------------------------------------
  // fetch 호출 URL 검증
  // ----------------------------------------------------------
  describe('API 호출 URL 검증', () => {
    it('올바른 서울 좌표와 파라미터로 API를 호출한다', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ current: { weather_code: 0 } }),
      });

      await getSeoulWeather();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('latitude=37.5665');
      expect(calledUrl).toContain('longitude=126.978');
      expect(calledUrl).toContain('current=weather_code');
      expect(calledUrl).toContain('timezone=Asia/Seoul');
    });
  });
});
