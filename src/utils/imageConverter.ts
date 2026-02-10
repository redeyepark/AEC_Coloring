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
 * 갤러리 이미지 URL을 SVG 파일로 변환
 * 어두운 색상(윤곽선)은 #000000으로, 나머지는 K-Means 원본 컬러 유지
 * 레이어 순서: 컬러 레이어 먼저, 검정 윤곽선 레이어가 맨 위
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
 * SVG를 색칠놀이용으로 후처리
 * 어두운 색상(윤곽선)은 #000000으로 변환하고, 나머지는 K-Means 원본 컬러 유지
 * 1. 레이어 색상 추출 → luminance 기반 판정
 * 2. 어두운 색상(luminance < 80) → #000000 (경계선/윤곽선)
 * 3. 그 외 색상 → 원본 K-Means 클러스터 컬러 유지
 * 4. 레이어 순서 재배치 (컬러 레이어 먼저, 검정 윤곽선 맨 위)
 */
function postProcessSvgForColoring(svgString: string): string {
  // 어두운 색상 판정: luminance < 80 → 검정 윤곽선
  const DARK_THRESHOLD = 80;
  const isDark = (hex: string) => getLuminance(hex) < DARK_THRESHOLD;

  // Step 1: 레이어 추출 + fill 교체 + 분류 (단일 패스)
  const coloredLayers: string[] = [];
  const blackLayers: string[] = [];

  let processed = svgString.replace(
    /\s*<g\s+id="layer-([^"]*)"[^>]*>[\s\S]*?<\/g>/g,
    (match, colorHex: string) => {
      if (isDark(colorHex)) {
        // 어두운 레이어: 모든 path fill을 #000000으로 변환 (윤곽선)
        const processedLayer = match.trim().replace(
          /<path\s+d="([^"]*)"(?:\s+fill="([^"]*)")?([^/]*)\/?>/g,
          (_m: string, d: string, _fill: string | undefined, rest: string) => {
            const fillRule = rest && rest.includes('fill-rule') ? rest.trim() : '';
            return `<path d="${d}" fill="#000000"${fillRule ? ' ' + fillRule : ''}/>`;
          }
        );
        blackLayers.push(processedLayer);
      } else {
        // 밝은 레이어: 원본 K-Means 클러스터 컬러 유지
        coloredLayers.push(match.trim());
      }
      return '';
    }
  );

  // Step 2: 레이어 재배치 (컬러 레이어 먼저 → 검정 윤곽선 맨 위)
  const reordered = [...coloredLayers, ...blackLayers]
    .map((l) => '  ' + l)
    .join('\n');
  processed = processed.replace('</svg>', `${reordered}\n</svg>`);

  return processed;
}

export type { ConvertOptions, ConvertResult };
