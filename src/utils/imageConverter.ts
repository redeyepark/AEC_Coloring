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
 * 갤러리 이미지 URL을 색칠놀이용 SVG로 변환
 * 블랙 계열(윤곽선)은 #000000, 나머지는 #FFFFFF(빈 영역)로 변환
 * 레이어 순서: 흰색 영역 먼저, 검정 윤곽선 레이어가 맨 위
 */
export async function convertGalleryToSvg(
  url: string,
  options?: Partial<ConvertOptions>
): Promise<ConvertResult> {
  const { pixels, width, height } = await fetchImageAsPixels(url);
  const result = convertPixels(pixels, width, height, options);
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
 * HEX 색상이 블랙 계열인지 판정 (ITU-R BT.601 휘도 기준)
 * luminance < 30 → 윤곽선(#000000), 그 외 → 빈 영역(#FFFFFF)
 * 임계값 30은 약 #1E1E1E까지만 윤곽선으로 분류
 */
function isDarkColor(hex: string): boolean {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return false;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  // ITU-R BT.601 휘도 기준 (임계값 30: 거의 순수 검정만 윤곽선으로 분류)
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 30;
}

/**
 * SVG를 색칠놀이용으로 후처리
 * - 블랙 계열(휘도 < 30, 약 #1E1E1E 이하) → #000000 (윤곽선/경계선)
 * - 그 외 모든 색상 → #FFFFFF (색칠할 빈 영역)
 * - 레이어 순서: 흰색 영역 먼저, 검정 윤곽선 맨 위
 */
function postProcessSvgForColoring(svgString: string): string {
  // Step 1: 레이어 추출 + fill 교체 + 분류 (단일 패스)
  const colorLayers: string[] = [];
  const outlineLayers: string[] = [];

  let processed = svgString.replace(
    /\s*<g\s+id="layer-([^"]*)"[^>]*>[\s\S]*?<\/g>/g,
    (match, colorHex: string) => {
      const dark = isDarkColor(colorHex);
      const fillColor = dark ? '#000000' : '#FFFFFF';

      // g 태그의 id와 data-color 속성을 변환된 색상으로 업데이트
      let processedLayer = match.trim()
        .replace(/id="layer-[^"]*"/, `id="layer-${fillColor}"`)
        .replace(/data-color="[^"]*"/, `data-color="${fillColor}"`);

      // 모든 path의 fill을 대상 색상으로 교체
      processedLayer = processedLayer.replace(
        /<path\s+d="([^"]*)"(?:\s+fill="([^"]*)")?([^/]*)\/?>/g,
        (_m: string, d: string, _fill: string | undefined, rest: string) => {
          const fillRule = rest && rest.includes('fill-rule') ? rest.trim() : '';
          return `<path d="${d}" fill="${fillColor}"${fillRule ? ' ' + fillRule : ''}/>`;
        }
      );

      if (dark) {
        outlineLayers.push(processedLayer);
      } else {
        colorLayers.push(processedLayer);
      }
      return '';
    }
  );

  // Step 2: 레이어 재배치 (흰색 영역 먼저 → 검정 윤곽선 맨 위)
  const reordered = [...colorLayers, ...outlineLayers]
    .map((l) => '  ' + l)
    .join('\n');

  // Step 3: 빈 줄 정리 후 레이어 삽입
  processed = processed.replace(/\n\s*\n/g, '\n');
  processed = processed.replace('</svg>', `${reordered}\n</svg>`);

  return processed;
}

export type { ConvertOptions, ConvertResult };
