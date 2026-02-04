import { getDeviceResolution } from '../hooks/useDeviceResolution';
import { saveBase64Data } from '@apps-in-toss/web-framework';

// 이미지만 저장 (색칠한 그림 그대로)
export function saveAsImage(svg: SVGSVGElement, imageName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const resolution = getDeviceResolution();
    const phoneWidth = resolution.width;
    const phoneHeight = resolution.height;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');

      const imgAspect = img.width / img.height;
      let canvasWidth, canvasHeight;

      if (imgAspect > phoneWidth / phoneHeight) {
        canvasWidth = phoneWidth;
        canvasHeight = phoneWidth / imgAspect;
      } else {
        canvasHeight = phoneHeight;
        canvasWidth = phoneHeight * imgAspect;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

      const pngUrl = canvas.toDataURL('image/png');
      const base64Data = pngUrl.replace(/^data:image\/png;base64,/, '');
      const fileName = `coloring_${imageName.replace(/\s/g, '_')}_${Date.now()}.png`;

      try {
        await saveBase64Data({ data: base64Data, fileName, mimeType: 'image/png' });
        resolve();
      } catch (err) {
        console.error('저장 실패:', err);
        reject(err);
      }

      URL.revokeObjectURL(svgUrl);
    };

    img.onerror = reject;
    img.src = svgUrl;
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

export function saveAsCalendar(svg: SVGSVGElement, imageName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const resolution = getDeviceResolution();
    const phoneWidth = resolution.width;
    const phoneHeight = resolution.height;
    const imageHeight = Math.floor(phoneHeight * 0.55);
    const calendarHeight = phoneHeight - imageHeight;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = async () => {
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
      const base64Data = pngUrl.replace(/^data:image\/png;base64,/, '');
      const now = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const fileName = `calendar_${imageName.replace(/\s/g, '_')}_${monthNames[now.getMonth()]}_${Date.now()}.png`;

      try {
        await saveBase64Data({ data: base64Data, fileName, mimeType: 'image/png' });
        resolve();
      } catch (err) {
        console.error('저장 실패:', err);
        reject(err);
      }

      URL.revokeObjectURL(svgUrl);
    };

    img.onerror = reject;
    img.src = svgUrl;
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
    const base64Data = pngUrl.replace(/^data:image\/png;base64,/, '');
    const now = new Date();
    const fileName = `daily_${imageName.replace(/\s/g, '_')}_${now.getDate()}_${Date.now()}.png`;

    saveBase64Data({
      data: base64Data,
      fileName,
      mimeType: 'image/png',
    }).catch(err => {
      console.error('저장 실패:', err);
      alert('이미지 저장에 실패했습니다.');
    });

    URL.revokeObjectURL(svgUrl);
  };

  img.src = svgUrl;
}

export function saveAsWallpaper(svg: SVGSVGElement, imageName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const resolution = getDeviceResolution();
    const phoneWidth = resolution.width;
    const phoneHeight = resolution.height;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = async () => {
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
      const base64Data = pngUrl.replace(/^data:image\/png;base64,/, '');
      const fileName = `wallpaper_${imageName.replace(/\s/g, '_')}_${Date.now()}.png`;

      try {
        await saveBase64Data({ data: base64Data, fileName, mimeType: 'image/png' });
        resolve();
      } catch (err) {
        console.error('저장 실패:', err);
        reject(err);
      }

      URL.revokeObjectURL(svgUrl);
    };

    img.onerror = reject;
    img.src = svgUrl;
  });
}
