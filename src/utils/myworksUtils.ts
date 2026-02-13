/**
 * 내 작품(myworks) 파일명 인코딩/파싱 유틸리티
 *
 * 파일명 형식: {timestamp}_{sanitizedTitle}_by_{sanitizedArtist}.{ext}
 * 예시: 1700000000000_my-artwork_by_artist-name.png
 */

/**
 * 특수문자 제거 및 정규화
 * 허용: 한국어, 영어, 숫자, 하이픈만 허용
 * 공백은 하이픈으로 변환, 연속 하이픈은 단일 하이픈으로
 */
export function sanitizeMetaString(str: string): string {
  return str
    .trim()
    // 허용 문자 외 제거 (한국어, 영어, 숫자, 공백, 하이픈)
    .replace(/[^\uAC00-\uD7A3\u3131-\u3163\u1100-\u11FFa-zA-Z0-9\s-]/g, '')
    // 공백을 하이픈으로 변환
    .replace(/\s+/g, '-')
    // 연속 하이픈을 단일 하이픈으로
    .replace(/-+/g, '-')
    // 앞뒤 하이픈 제거
    .replace(/^-+|-+$/g, '');
}

/**
 * 내 작품 파일명 생성
 * @returns "{timestamp}_{sanitizedTitle}_by_{sanitizedArtist}.{ext}"
 */
export function buildMyWorkFilename(
  title: string,
  artist: string,
  ext: string
): string {
  const sanitizedTitle = sanitizeMetaString(title);
  const sanitizedArtist = sanitizeMetaString(artist);
  const cleanExt = ext.replace(/^\./, ''); // 점 접두사 제거
  return `${Date.now()}_${sanitizedTitle}_by_${sanitizedArtist}.${cleanExt}`;
}

/**
 * 내 작품 파일명에서 제목/작가 파싱
 * 파일명 형식: {timestamp}_{title}_by_{artist}.{ext}
 * 폴백: _by_ 구분자가 없으면 전체를 제목으로, 작가는 "알 수 없음"
 */
export function parseMyWorkFilename(filename: string): {
  title: string;
  artist: string;
} {
  // 확장자 제거
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');

  // 타임스탬프 접두사 제거 (첫 번째 _ 이전의 숫자)
  const firstUnderscoreIdx = nameWithoutExt.indexOf('_');
  const nameBody =
    firstUnderscoreIdx > 0
      ? nameWithoutExt.substring(firstUnderscoreIdx + 1)
      : nameWithoutExt;

  // _by_ 구분자로 분리
  const byIndex = nameBody.lastIndexOf('_by_');
  if (byIndex === -1) {
    // 구분자가 없으면 전체를 제목으로 사용
    return {
      title: nameBody.replace(/-/g, ' ').trim() || filename,
      artist: '알 수 없음',
    };
  }

  const titlePart = nameBody.substring(0, byIndex);
  const artistPart = nameBody.substring(byIndex + 4); // '_by_' 길이 = 4

  return {
    title: titlePart.replace(/-/g, ' ').trim() || filename,
    artist: artistPart.replace(/-/g, ' ').trim() || '알 수 없음',
  };
}
