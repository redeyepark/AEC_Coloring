import { getDeviceResolution } from '../hooks/useDeviceResolution';
import { extractColorsFromSvg, analyzeColors } from './colorAnalysis';
import { getSeoulWeather, ALL_WEATHER_TYPES, getWeatherEmoji, type WeatherType } from './weather';

// 이미지 저장 함수 (Promise 반환)
export async function saveAsImage(svg: SVGSVGElement, imageName: string): Promise<void> {
  console.log('[saveAsImage] 시작', { svg, imageName });

  return new Promise((resolve, reject) => {
    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      console.log('[saveAsImage] SVG 직렬화 완료, 길이:', svgData.length);

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      console.log('[saveAsImage] Blob URL 생성:', svgUrl);

      const img = new Image();
      img.onload = () => {
        console.log('[saveAsImage] 이미지 로드 완료', { width: img.width, height: img.height });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const pngUrl = canvas.toDataURL('image/png');
        console.log('[saveAsImage] PNG 생성 완료, 길이:', pngUrl.length);

        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `coloring_${imageName.replace(/\s/g, '_')}_${Date.now()}.png`;
        console.log('[saveAsImage] 다운로드 시작:', link.download);
        link.click();

        URL.revokeObjectURL(svgUrl);
        resolve();
      };
      img.onerror = (e) => {
        console.error('[saveAsImage] 이미지 로드 실패', e);
        reject(new Error('이미지 로드 실패'));
      };
      img.src = svgUrl;
    } catch (error) {
      console.error('[saveAsImage] 예외 발생', error);
      reject(error);
    }
  });
}

// 월간 달력 그리기 함수
function drawCalendar(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const scale = width / 1080;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, width, height);

  const padding = Math.round(60 * scale);
  const headerHeight = Math.round(150 * scale);
  const dayHeight = (height - headerHeight - padding * 2) / 7;
  const dayWidth = (width - padding * 2) / 7;

  const titleFontSize = Math.round(48 * scale);
  const dayHeaderFontSize = Math.round(28 * scale);
  const dateFontSize = Math.round(40 * scale);

  ctx.fillStyle = '#333333';
  ctx.font = `bold ${titleFontSize}px Pretendard, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${monthNames[month]} ${year}`, x + width / 2, y + padding + headerHeight * 0.4);

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  ctx.font = `bold ${dayHeaderFontSize}px Pretendard, sans-serif`;
  const headerY = y + headerHeight + padding;

  days.forEach((day, i) => {
    ctx.fillStyle = i === 0 ? '#e74c3c' : (i === 6 ? '#3498db' : '#666666');
    ctx.fillText(day, x + padding + dayWidth * i + dayWidth / 2, headerY);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  ctx.font = `${dateFontSize}px Pretendard, sans-serif`;
  let date = 1;
  for (let row = 0; row < 6 && date <= lastDate; row++) {
    for (let col = 0; col < 7 && date <= lastDate; col++) {
      if (row === 0 && col < firstDay) continue;

      const cellX = x + padding + dayWidth * col + dayWidth / 2;
      const cellY = headerY + dayHeight * (row + 1) + Math.round(15 * scale);

      ctx.fillStyle = col === 0 ? '#e74c3c' : (col === 6 ? '#3498db' : '#333333');
      ctx.fillText(date.toString(), cellX, cellY);
      date++;
    }
  }
}

// 일력 그리기 함수
function drawDailyCalendar(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth();
  const dayOfWeek = now.getDay();

  const scale = width / 1080;

  const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
                      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  // 배경 (베이지/크림색)
  ctx.fillStyle = '#F5F0E6';
  ctx.fillRect(x, y, width, height);

  const padding = Math.round(40 * scale);

  // 월 (상단)
  const monthFontSize = Math.round(56 * scale);
  ctx.fillStyle = '#1A1A1A';
  ctx.font = `600 ${monthFontSize}px "Times New Roman", Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(monthNames[month], x + width / 2, y + padding + monthFontSize);

  // 날짜 (중앙 - 큰 숫자)
  const dateFontSize = Math.round(280 * scale);
  ctx.font = `bold ${dateFontSize}px "Times New Roman", Georgia, serif`;
  ctx.fillText(day.toString(), x + width / 2, y + height / 2 + dateFontSize * 0.25);

  // 요일 (하단)
  const dayFontSize = Math.round(48 * scale);
  // 일요일은 빨강, 토요일은 파랑
  if (dayOfWeek === 0) {
    ctx.fillStyle = '#C41E3A';
  } else if (dayOfWeek === 6) {
    ctx.fillStyle = '#1E5AA8';
  } else {
    ctx.fillStyle = '#1A1A1A';
  }
  ctx.font = `500 ${dayFontSize}px "Times New Roman", Georgia, serif`;
  ctx.fillText(dayNames[dayOfWeek], x + width / 2, y + height - padding - dayFontSize * 0.5);
}

export async function saveAsCalendar(svg: SVGSVGElement, imageName: string): Promise<void> {
  console.log('[saveAsCalendar] 시작', { svg, imageName });

  return new Promise((resolve, reject) => {
    try {
      const resolution = getDeviceResolution();
      const phoneWidth = resolution.width;
      const phoneHeight = resolution.height;
      const imageHeight = Math.floor(phoneHeight * 0.55);
      const calendarHeight = phoneHeight - imageHeight;
      console.log('[saveAsCalendar] 해상도:', { phoneWidth, phoneHeight });

      const svgData = new XMLSerializer().serializeToString(svg);
      console.log('[saveAsCalendar] SVG 직렬화 완료, 길이:', svgData.length);

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        console.log('[saveAsCalendar] 이미지 로드 완료', { width: img.width, height: img.height });
        const canvas = document.createElement('canvas');
        canvas.width = phoneWidth;
        canvas.height = phoneHeight;
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, phoneWidth, phoneHeight);

        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight, drawX, drawY;

        if (imgAspect > phoneWidth / imageHeight) {
          drawWidth = phoneWidth;
          drawHeight = phoneWidth / imgAspect;
          drawX = 0;
          drawY = (imageHeight - drawHeight) / 2;
        } else {
          drawHeight = imageHeight;
          drawWidth = imageHeight * imgAspect;
          drawX = (phoneWidth - drawWidth) / 2;
          drawY = 0;
        }
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        drawCalendar(ctx, 0, imageHeight, phoneWidth, calendarHeight);

        const pngUrl = canvas.toDataURL('image/png');
        console.log('[saveAsCalendar] PNG 생성 완료');

        const link = document.createElement('a');
        link.href = pngUrl;
        const now = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        link.download = `calendar_${imageName.replace(/\s/g, '_')}_${monthNames[now.getMonth()]}_${Date.now()}.png`;
        console.log('[saveAsCalendar] 다운로드 시작:', link.download);
        link.click();

        URL.revokeObjectURL(svgUrl);
        resolve();
      };
      img.onerror = (e) => {
        console.error('[saveAsCalendar] 이미지 로드 실패', e);
        reject(new Error('이미지 로드 실패'));
      };
      img.src = svgUrl;
    } catch (error) {
      console.error('[saveAsCalendar] 예외 발생', error);
      reject(error);
    }
  });
}

export function saveAsDailyCalendar(svg: SVGSVGElement, imageName: string) {
  const resolution = getDeviceResolution();
  const phoneWidth = resolution.width;
  const phoneHeight = resolution.height;
  const imageHeight = Math.floor(phoneHeight * 0.55);
  const dailyHeight = phoneHeight - imageHeight;

  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = phoneWidth;
    canvas.height = phoneHeight;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, phoneWidth, phoneHeight);

    const imgAspect = img.width / img.height;
    let drawWidth, drawHeight, drawX, drawY;

    if (imgAspect > phoneWidth / imageHeight) {
      drawWidth = phoneWidth;
      drawHeight = phoneWidth / imgAspect;
      drawX = 0;
      drawY = (imageHeight - drawHeight) / 2;
    } else {
      drawHeight = imageHeight;
      drawWidth = imageHeight * imgAspect;
      drawX = (phoneWidth - drawWidth) / 2;
      drawY = 0;
    }
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    drawDailyCalendar(ctx, 0, imageHeight, phoneWidth, dailyHeight);

    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    const now = new Date();
    link.download = `daily_${imageName.replace(/\s/g, '_')}_${now.getDate()}_${Date.now()}.png`;
    link.click();

    URL.revokeObjectURL(svgUrl);
  };

  img.src = svgUrl;
}

// 그림일기장 날짜 헤더 그리기 (원고지 스타일 - 한 글자씩, 날씨 강조)
function drawDiaryHeader(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, currentWeather: WeatherType) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dayOfWeek = now.getDay();

  const scale = width / 1080;
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  // 배경
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, width, height);

  // 격자 영역 (외부에서 이미 padding이 적용된 위치로 전달됨)
  const gridX = x;
  const gridY = y;
  const gridWidth = width;
  const gridHeight = height;

  // 격자 설정 (메시지 영역과 동일한 14칸)
  const cols = 14;
  const rows = 1;
  const cellSize = Math.min(gridWidth / cols, gridHeight);
  const actualGridWidth = cellSize * cols;
  const actualGridHeight = cellSize * rows;
  const offsetX = gridX + (gridWidth - actualGridWidth) / 2;
  const offsetY = gridY + (gridHeight - actualGridHeight) / 2;

  // 외곽선
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = Math.round(2 * scale);
  ctx.strokeRect(offsetX, offsetY, actualGridWidth, actualGridHeight);

  // 내부 격자선 (세로선만)
  ctx.strokeStyle = '#CCCCCC';
  ctx.lineWidth = Math.round(1 * scale);

  for (let i = 1; i < cols; i++) {
    ctx.beginPath();
    ctx.moveTo(offsetX + cellSize * i, offsetY);
    ctx.lineTo(offsetX + cellSize * i, offsetY + actualGridHeight);
    ctx.stroke();
  }

  // 날짜 문자열 생성: "2026년2월5일수" (10글자) + 날씨 아이콘 4개
  const dateStr = `${year}년${month}월${day}일${dayNames[dayOfWeek]}`;
  const dateChars = [...dateStr];

  // 날씨 아이콘 (순서: sunny, cloudy, rainy, snowy)
  const weatherEmojis = ALL_WEATHER_TYPES.map(type => getWeatherEmoji(type));

  // 날짜 부분 배치
  const fontSize = Math.round(cellSize * 0.5);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 날짜 글자 배치 (처음 10칸 - 요일 포함)
  for (let col = 0; col < 10 && col < dateChars.length; col++) {
    const char = dateChars[col];
    const cellCenterX = offsetX + cellSize * col + cellSize / 2;
    const cellCenterY = offsetY + actualGridHeight / 2;

    ctx.fillStyle = '#191F28';
    ctx.font = `500 ${fontSize}px Pretendard, sans-serif`;
    ctx.fillText(char, cellCenterX, cellCenterY);
  }

  // 날씨 아이콘 배치 (마지막 4칸: 10, 11, 12, 13)
  const weatherStartCol = 10;
  for (let i = 0; i < weatherEmojis.length; i++) {
    const col = weatherStartCol + i;
    const emoji = weatherEmojis[i];
    const weatherType = ALL_WEATHER_TYPES[i];
    const cellCenterX = offsetX + cellSize * col + cellSize / 2;
    const cellCenterY = offsetY + actualGridHeight / 2;

    // 현재 날씨인지 확인
    const isCurrentWeather = weatherType === currentWeather;

    ctx.font = `${Math.round(cellSize * 0.6)}px sans-serif`;

    if (isCurrentWeather) {
      // 현재 날씨: 컬러로 표시 (기본 이모지 색상)
      ctx.globalAlpha = 1.0;
    } else {
      // 다른 날씨: 회색으로 표시 (반투명)
      ctx.globalAlpha = 0.3;
    }

    ctx.fillText(emoji, cellCenterX, cellCenterY);
    ctx.globalAlpha = 1.0; // 알파값 복원
  }
}

// 그림일기장 메시지 영역 그리기 (원고지 스타일 - 한 글자씩)
function drawDiaryMessage(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, message: string, emoji: string) {
  const scale = width / 1080;

  // 배경
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, width, height);

  // 격자 영역 (외부에서 이미 padding이 적용된 위치로 전달됨)
  const gridX = x;
  const gridY = y;
  const gridWidth = width;
  const gridHeight = height;

  // 격자 설정 (원고지 스타일)
  const cols = 14; // 한 줄에 14글자
  const rows = 7;  // 7줄 (3줄 추가)
  const cellSize = Math.min(gridWidth / cols, gridHeight / rows);
  const actualGridWidth = cellSize * cols;
  const actualGridHeight = cellSize * rows;
  const offsetX = gridX + (gridWidth - actualGridWidth) / 2;
  const offsetY = gridY + (gridHeight - actualGridHeight) / 2;

  // 외곽선
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = Math.round(2 * scale);
  ctx.strokeRect(offsetX, offsetY, actualGridWidth, actualGridHeight);

  // 내부 격자선
  ctx.strokeStyle = '#CCCCCC';
  ctx.lineWidth = Math.round(1 * scale);

  // 세로선
  for (let i = 1; i < cols; i++) {
    ctx.beginPath();
    ctx.moveTo(offsetX + cellSize * i, offsetY);
    ctx.lineTo(offsetX + cellSize * i, offsetY + actualGridHeight);
    ctx.stroke();
  }

  // 가로선
  for (let i = 1; i < rows; i++) {
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + cellSize * i);
    ctx.lineTo(offsetX + actualGridWidth, offsetY + cellSize * i);
    ctx.stroke();
  }

  // 메시지를 한 글자씩 격자에 배치
  const fontSize = Math.round(cellSize * 0.6);
  ctx.fillStyle = '#191F28';
  ctx.font = `500 ${fontSize}px Pretendard, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 이모지 + 메시지 결합
  const fullText = emoji + ' ' + message;
  const chars = [...fullText]; // 유니코드 문자 배열로 변환

  let charIndex = 0;
  for (let row = 0; row < rows && charIndex < chars.length; row++) {
    for (let col = 0; col < cols && charIndex < chars.length; col++) {
      const char = chars[charIndex];
      const cellCenterX = offsetX + cellSize * col + cellSize / 2;
      const cellCenterY = offsetY + cellSize * row + cellSize / 2;

      // 이모지는 더 큰 폰트로
      if (charIndex === 0) {
        ctx.font = `${Math.round(cellSize * 0.7)}px sans-serif`;
      } else {
        ctx.font = `500 ${fontSize}px Pretendard, sans-serif`;
      }

      ctx.fillText(char, cellCenterX, cellCenterY);
      charIndex++;
    }
  }
}

// 그림일기장으로 저장
export async function saveAsDiary(svg: SVGSVGElement, imageName: string, userText?: string): Promise<void> {
  // 먼저 날씨 정보 가져오기
  const weather = await getSeoulWeather();

  return new Promise((resolve, reject) => {
    try {
      // A4 용지 비율 (210mm x 297mm = 1:1.414)
      const a4Width = 1080;
      const a4Height = Math.round(a4Width * 1.414); // 1527
      const scale = a4Width / 1080;
      const borderWidth = Math.round(2 * scale); // 격자와 동일한 두께
      const padding = Math.round(20 * scale); // 격자와 동일한 padding

      // 컨텐츠 영역 (테두리 안쪽)
      const contentWidth = a4Width - padding * 2;
      const contentHeight = a4Height - padding * 2;

      // 레이아웃 비율: 헤더 6%, 이미지 50%, 메시지 44% (7줄)
      const headerHeight = Math.floor(contentHeight * 0.06);
      const messageHeight = Math.floor(contentHeight * 0.44);
      const imageHeight = contentHeight - headerHeight - messageHeight;

      // 사용자 텍스트 또는 색상 분석 메시지 사용
      const colors = extractColorsFromSvg(svg);
      const analysis = analyzeColors(colors);
      const diaryText = userText || analysis.message;

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = a4Width;
        canvas.height = a4Height;
        const ctx = canvas.getContext('2d')!;

        // 전체 배경
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, a4Width, a4Height);

        // 컨텐츠 시작 위치 (테두리 안쪽)
        const contentX = padding;
        const contentY = padding;

        // 헤더 그리기 (현재 날씨 전달) - 테두리 안쪽에 배치
        drawDiaryHeader(ctx, contentX, contentY, contentWidth, headerHeight, weather.type);

        // 이미지 영역 배경
        const imageY = contentY + headerHeight;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(contentX, imageY, contentWidth, imageHeight);

        // 이미지 그리기
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight, drawX, drawY;

        if (imgAspect > contentWidth / imageHeight) {
          drawWidth = contentWidth;
          drawHeight = contentWidth / imgAspect;
          drawX = contentX;
          drawY = imageY + (imageHeight - drawHeight) / 2;
        } else {
          drawHeight = imageHeight;
          drawWidth = imageHeight * imgAspect;
          drawX = contentX + (contentWidth - drawWidth) / 2;
          drawY = imageY;
        }
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // 메시지 영역 그리기 (사용자 텍스트 사용) - 테두리 안쪽에 배치
        const messageY = imageY + imageHeight;
        drawDiaryMessage(ctx, contentX, messageY, contentWidth, messageHeight, diaryText, '');

        // 페이지 전체 테두리 그리기 (격자와 동일한 스타일)
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(padding, padding, a4Width - padding * 2, a4Height - padding * 2);

        // 다운로드
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        link.download = `diary_${dateStr}_${imageName.replace(/\s/g, '_')}.png`;
        link.click();

        URL.revokeObjectURL(svgUrl);
        resolve();
      };
      img.onerror = () => reject(new Error('이미지 로드 실패'));
      img.src = svgUrl;
    } catch (error) {
      reject(error);
    }
  });
}

// PC 달력 배경화면 저장 함수 (1920x1080 FHD 가로 레이아웃)
export async function saveAsPcCalendar(svg: SVGSVGElement, imageName: string): Promise<void> {
  console.log('[saveAsPcCalendar] 시작', { svg, imageName });

  return new Promise((resolve, reject) => {
    try {
      // FHD 가로 해상도
      const pcWidth = 1920;
      const pcHeight = 1080;
      // 좌측 ~55%에 이미지, 우측 ~45%에 달력
      const imageAreaWidth = Math.floor(pcWidth * 0.55);
      const calendarAreaWidth = pcWidth - imageAreaWidth;
      console.log('[saveAsPcCalendar] 레이아웃:', { pcWidth, pcHeight, imageAreaWidth, calendarAreaWidth });

      const svgData = new XMLSerializer().serializeToString(svg);
      console.log('[saveAsPcCalendar] SVG 직렬화 완료, 길이:', svgData.length);

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        console.log('[saveAsPcCalendar] 이미지 로드 완료', { width: img.width, height: img.height });
        const canvas = document.createElement('canvas');
        canvas.width = pcWidth;
        canvas.height = pcHeight;
        const ctx = canvas.getContext('2d')!;

        // 전체 흰색 배경
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, pcWidth, pcHeight);

        // 좌측 이미지 영역: 중앙 맞춤 (center fit)
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight, drawX, drawY;

        if (imgAspect > imageAreaWidth / pcHeight) {
          // 이미지가 더 넓은 경우: 가로 맞춤
          drawWidth = imageAreaWidth;
          drawHeight = imageAreaWidth / imgAspect;
          drawX = 0;
          drawY = (pcHeight - drawHeight) / 2;
        } else {
          // 이미지가 더 높은 경우: 세로 맞춤
          drawHeight = pcHeight;
          drawWidth = pcHeight * imgAspect;
          drawX = (imageAreaWidth - drawWidth) / 2;
          drawY = 0;
        }
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // 우측 달력 영역: 기존 drawCalendar 재사용
        drawCalendar(ctx, imageAreaWidth, 0, calendarAreaWidth, pcHeight);

        const pngUrl = canvas.toDataURL('image/png');
        console.log('[saveAsPcCalendar] PNG 생성 완료');

        const link = document.createElement('a');
        link.href = pngUrl;
        const now = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        link.download = `pc_calendar_${imageName.replace(/\s/g, '_')}_${monthNames[now.getMonth()]}_${Date.now()}.png`;
        console.log('[saveAsPcCalendar] 다운로드 시작:', link.download);
        link.click();

        URL.revokeObjectURL(svgUrl);
        resolve();
      };
      img.onerror = (e) => {
        console.error('[saveAsPcCalendar] 이미지 로드 실패', e);
        reject(new Error('이미지 로드 실패'));
      };
      img.src = svgUrl;
    } catch (error) {
      console.error('[saveAsPcCalendar] 예외 발생', error);
      reject(error);
    }
  });
}

export async function saveAsWallpaper(svg: SVGSVGElement, imageName: string): Promise<void> {
  console.log('[saveAsWallpaper] 시작', { svg, imageName });

  return new Promise((resolve, reject) => {
    try {
      const resolution = getDeviceResolution();
      const phoneWidth = resolution.width;
      const phoneHeight = resolution.height;
      console.log('[saveAsWallpaper] 해상도:', { phoneWidth, phoneHeight });

      const svgData = new XMLSerializer().serializeToString(svg);
      console.log('[saveAsWallpaper] SVG 직렬화 완료, 길이:', svgData.length);

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        console.log('[saveAsWallpaper] 이미지 로드 완료', { width: img.width, height: img.height });
        const canvas = document.createElement('canvas');
        canvas.width = phoneWidth;
        canvas.height = phoneHeight;
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, phoneWidth, phoneHeight);

        const phoneAspect = phoneWidth / phoneHeight;

        let srcX, srcY, srcWidth, srcHeight;

        srcWidth = img.width;
        srcHeight = img.width / phoneAspect;
        srcX = 0;
        srcY = (img.height - srcHeight) / 2;

        if (srcHeight > img.height) {
          srcHeight = img.height;
          srcWidth = img.height * phoneAspect;
          srcX = (img.width - srcWidth) / 2;
          srcY = 0;
        }

        ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, phoneWidth, phoneHeight);

        const pngUrl = canvas.toDataURL('image/png');
        console.log('[saveAsWallpaper] PNG 생성 완료');

        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `wallpaper_${imageName.replace(/\s/g, '_')}_${Date.now()}.png`;
        console.log('[saveAsWallpaper] 다운로드 시작:', link.download);
        link.click();

        URL.revokeObjectURL(svgUrl);
        resolve();
      };
      img.onerror = (e) => {
        console.error('[saveAsWallpaper] 이미지 로드 실패', e);
        reject(new Error('이미지 로드 실패'));
      };
      img.src = svgUrl;
    } catch (error) {
      console.error('[saveAsWallpaper] 예외 발생', error);
      reject(error);
    }
  });
}
