import {
  convertPixels,
  type ConvertOptions,
  type ConvertResult,
} from 'coloring-svg';

// 지원 이미지 MIME 타입
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/bmp', 'image/tiff'];
const MAX_DIMENSION = 4096;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

/**
 * URL에서 이미지를 가져와 RGBA 픽셀 데이터로 변환
 * Canvas API를 사용하여 이미지 디코딩
 */
export async function fetchImageAsPixels(
  url: string
): Promise<{ pixels: Uint8ClampedArray; width: number; height: number }> {
  // fetch로 이미지 다운로드 (CORS tainted canvas 방지)
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`이미지를 다운로드할 수 없습니다. (${response.status})`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    // HTMLImageElement로 로드
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('이미지를 로드할 수 없습니다.'));
      image.src = objectUrl;
    });

    // 유효성 검사
    const validation = validateImageForConversion(img.width, img.height, blob.size);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Canvas에 그려서 픽셀 데이터 추출
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 컨텍스트를 생성할 수 없습니다.');
    }

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    return {
      pixels: imageData.data,
      width: img.width,
      height: img.height,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * 갤러리 이미지 URL을 SVG 색칠하기 파일로 변환
 * 변환 후 색칠놀이용으로 후처리 적용 (블랙 라인 유지, 나머지 화이트 채우기)
 */
export async function convertGalleryToSvg(
  url: string,
  options?: Partial<ConvertOptions>
): Promise<ConvertResult> {
  const { pixels, width, height } = await fetchImageAsPixels(url);
  const result = convertPixels(pixels, width, height, options);

  // 색칠놀이용으로 SVG 후처리: 블랙 라인 제외 화이트 채우기 + 블랙 스트로크
  return {
    ...result,
    svg: postProcessSvgForColoring(result.svg),
  };
}

/**
 * 변환 전 이미지 유효성 검사
 */
export function validateImageForConversion(
  width: number,
  height: number,
  fileSize?: number
): { valid: boolean; error?: string } {
  if (width <= 0 || height <= 0) {
    return { valid: false, error: '유효하지 않은 이미지 크기입니다.' };
  }

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    return {
      valid: false,
      error: `이미지 크기가 너무 큽니다. 최대 ${MAX_DIMENSION}x${MAX_DIMENSION} 픽셀까지 지원합니다.`,
    };
  }

  if (fileSize !== undefined && fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB까지 지원합니다.`,
    };
  }

  return { valid: true };
}

/**
 * 파일명이 지원되는 이미지 형식인지 확인
 */
export function isSupportedFormat(filename: string): boolean {
  const ext = filename.toLowerCase().split('.').pop();
  const formatMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    tif: 'image/tiff',
  };
  const mime = ext ? formatMap[ext] : undefined;
  return mime ? SUPPORTED_FORMATS.includes(mime) : false;
}

/**
 * HEX 색상의 밝기(luminance) 계산 (ITU-R BT.601)
 */
function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return 0;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * 레이어 색상 목록에서 적응형 dark/light 임계값 계산
 * Natural Breaks: 인접 색상 간 가장 큰 밝기 차이를 기준으로 분리
 * → 이미지마다 최적의 흑백 분리점을 자동으로 결정
 */
function findDarkLightThreshold(colors: string[]): number {
  if (colors.length <= 1) return 128;

  const luminances = colors.map(getLuminance).sort((a, b) => a - b);

  // 연속 색상 간 가장 큰 밝기 차이(gap) 찾기
  let maxGap = 0;
  let gapIndex = 0;
  for (let i = 1; i < luminances.length; i++) {
    const gap = luminances[i] - luminances[i - 1];
    if (gap > maxGap) {
      maxGap = gap;
      gapIndex = i;
    }
  }

  // gap이 너무 작으면(< 30) 고정 임계값 사용
  if (maxGap < 30) return 128;

  // 모두 dark 또는 모두 light가 되는 경우 고정 임계값 사용
  const threshold = (luminances[gapIndex - 1] + luminances[gapIndex]) / 2;
  if (gapIndex === 0 || gapIndex >= luminances.length) return 128;

  return threshold;
}

/**
 * SVG를 색칠놀이용으로 후처리
 * 1. 레이어 색상 추출 → 적응형 임계값 계산 (Natural Breaks)
 * 2. 레이어별 fill 교체 (dark → #000000, light → #FFFFFF)
 * 3. 레이어 순서 재배치 (흰색 먼저, 검정 맨 위)
 */
function postProcessSvgForColoring(svgString: string): string {
  // Step 1: 모든 레이어 색상 추출
  const layerColors: string[] = [];
  const layerColorRegex = /<g\s+id="layer-([^"]*)"[^>]*>/g;
  let colorMatch;
  while ((colorMatch = layerColorRegex.exec(svgString)) !== null) {
    layerColors.push(colorMatch[1]);
  }

  // Step 2: 적응형 임계값 계산
  const threshold = findDarkLightThreshold(layerColors);
  const isDark = (hex: string) => getLuminance(hex) < threshold;

  console.log('[SVG 후처리] 색상:', layerColors.map(c => `${c}(${Math.round(getLuminance(c))})`).join(', '));
  console.log('[SVG 후처리] 임계값:', Math.round(threshold));

  // Step 3: 레이어 추출 + fill 교체 + dark/light 분류 (단일 패스)
  const whiteLayers: string[] = [];
  const blackLayers: string[] = [];

  let processed = svgString.replace(
    /\s*<g\s+id="layer-([^"]*)"[^>]*>[\s\S]*?<\/g>/g,
    (match, colorHex: string) => {
      // 레이어 내 모든 path fill 교체
      const processedLayer = match.trim().replace(
        /<path\s+d="([^"]*)"(?:\s+fill="([^"]*)")?([^/]*)\/?>/g,
        (_m: string, d: string, _fill: string | undefined, rest: string) => {
          const newFill = isDark(colorHex) ? '#000000' : '#FFFFFF';
          const fillRule = rest && rest.includes('fill-rule') ? rest.trim() : '';
          return `<path d="${d}" fill="${newFill}"${fillRule ? ' ' + fillRule : ''}/>`;
        }
      );

      if (isDark(colorHex)) {
        blackLayers.push(processedLayer);
      } else {
        whiteLayers.push(processedLayer);
      }
      return '';
    }
  );

  console.log(`[SVG 후처리] 흰색 레이어: ${whiteLayers.length}, 검정 레이어: ${blackLayers.length}`);

  // Step 4: 레이어 재배치 (흰색 먼저 → 검정 맨 위)
  const reordered = [...whiteLayers, ...blackLayers]
    .map((l) => '  ' + l)
    .join('\n');
  processed = processed.replace('</svg>', `${reordered}\n</svg>`);

  return processed;
}

export type { ConvertOptions, ConvertResult };
