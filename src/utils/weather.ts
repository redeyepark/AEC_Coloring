// 날씨 정보 유틸리티 (Open-Meteo API 사용)

// 서울 좌표
const SEOUL_LAT = 37.5665;
const SEOUL_LON = 126.9780;

// 날씨 타입
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy';

// 날씨 정보 인터페이스
export interface WeatherInfo {
  type: WeatherType;
  code: number;
  description: string;
}

// WMO 날씨 코드를 WeatherType으로 변환
function weatherCodeToType(code: number): WeatherType {
  // WMO Weather interpretation codes
  // https://open-meteo.com/en/docs

  // 맑음: 0 (Clear sky)
  if (code === 0) return 'sunny';

  // 구름: 1-3 (Mainly clear, partly cloudy, overcast)
  // 안개: 45, 48
  if (code >= 1 && code <= 3) return 'cloudy';
  if (code === 45 || code === 48) return 'cloudy';

  // 비: 51-67 (Drizzle, Rain), 80-82 (Rain showers), 95-99 (Thunderstorm)
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) {
    return 'rainy';
  }

  // 눈: 71-77 (Snow), 85-86 (Snow showers)
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return 'snowy';
  }

  // 기본값: 구름
  return 'cloudy';
}

// 날씨 설명
function getWeatherDescription(type: WeatherType): string {
  const descriptions: Record<WeatherType, string> = {
    sunny: '맑음',
    cloudy: '흐림',
    rainy: '비',
    snowy: '눈'
  };
  return descriptions[type];
}

// 현재 서울 날씨 가져오기
export async function getSeoulWeather(): Promise<WeatherInfo> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${SEOUL_LAT}&longitude=${SEOUL_LON}&current=weather_code&timezone=Asia/Seoul`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    const weatherCode = data.current?.weather_code ?? 0;
    const type = weatherCodeToType(weatherCode);

    return {
      type,
      code: weatherCode,
      description: getWeatherDescription(type)
    };
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    // 기본값: 맑음
    return {
      type: 'sunny',
      code: 0,
      description: '맑음'
    };
  }
}

// 날씨 타입에 따른 이모지 반환
export function getWeatherEmoji(type: WeatherType): string {
  const emojis: Record<WeatherType, string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    snowy: '❄️'
  };
  return emojis[type];
}

// 모든 날씨 타입 목록 (순서대로)
export const ALL_WEATHER_TYPES: WeatherType[] = ['sunny', 'cloudy', 'rainy', 'snowy'];
