import { useState, useEffect, useRef } from 'react';
import {
  uploadImage,
  listImages,
  deleteImage,
  renameImage,
  ImageType,
} from '../lib/supabase';
import {
  parseScheduleFromFilename,
  createScheduledFilename,
  getScheduleStatusByFilename,
  getScheduleLabel,
  getCleanFilename,
} from '../utils/scheduleUtils';
import { convertGalleryToSvg } from '../utils/imageConverter';
import type { ConvertResult } from '../utils/imageConverter';
import styles from './AdminPage.module.css';

// localStorage 키
const DISABLED_IMAGES_KEY = 'aec-disabled-images';

// 비활성화된 이미지 목록 가져오기
function getDisabledImages(): string[] {
  const stored = localStorage.getItem(DISABLED_IMAGES_KEY);
  return stored ? JSON.parse(stored) : [];
}

// 이미지 활성화 상태 토글
function toggleImageEnabled(path: string): boolean {
  const disabled = getDisabledImages();
  const index = disabled.indexOf(path);
  if (index > -1) {
    disabled.splice(index, 1); // 활성화
  } else {
    disabled.push(path); // 비활성화
  }
  localStorage.setItem(DISABLED_IMAGES_KEY, JSON.stringify(disabled));
  return index > -1; // 새로운 활성화 상태 반환
}

interface ImageItem {
  name: string;
  url: string;
  path: string;
  createdAt: string;
}

interface AdminPageProps {
  onClose: () => void;
}

// 관리자 비밀번호
const ADMIN_PASSWORD = 'a1234';

// 앱 버전 정보
const APP_VERSION = '1.0.5';

export function AdminPage({ onClose }: AdminPageProps) {
  // 인증 상태
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [activeTab, setActiveTab] = useState<ImageType | 'convert'>('svg');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [disabledImages, setDisabledImages] = useState<string[]>(getDisabledImages());
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 변환 관련 상태
  const [convertSelectedImage, setConvertSelectedImage] = useState<ImageItem | null>(null);
  const [galleryImages, setGalleryImages] = useState<ImageItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null);
  const [kColors, setKColors] = useState(6);
  const [isSavingSvg, setIsSavingSvg] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  // Gallery 탭 변환 관련 상태
  const [galleryConvertingImage, setGalleryConvertingImage] = useState<ImageItem | null>(null);
  const [galleryConvertResult, setGalleryConvertResult] = useState<ConvertResult | null>(null);
  const [galleryKColors, setGalleryKColors] = useState(6);
  const [isGalleryConverting, setIsGalleryConverting] = useState(false);
  const [galleryConvertError, setGalleryConvertError] = useState<string | null>(null);
  const [isGallerySavingSvg, setIsGallerySavingSvg] = useState(false);

  // 스케줄 관련 상태
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    startDate: '',
    endDate: '',
    noLimit: true,
  });
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // 비밀번호 확인
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPassword('');
    }
  };

  // 이미지 목록 로드
  const loadImages = async () => {
    if (activeTab === 'convert') return; // 변환 탭은 별도 로드
    setIsLoading(true);
    try {
      const list = await listImages(activeTab);
      setImages(list);
    } catch (error) {
      console.error('Failed to load images:', error);
      setMessage({ type: 'error', text: '이미지 목록을 불러올 수 없습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [activeTab]);

  // 변환 탭 진입 시 갤러리 이미지 로드
  useEffect(() => {
    if (activeTab === 'convert') {
      (async () => {
        try {
          const list = await listImages('gallery');
          setGalleryImages(list);
        } catch (error) {
          console.error('Failed to load gallery images:', error);
          setMessage({ type: 'error', text: '갤러리 이미지를 불러올 수 없습니다.' });
        }
      })();
    }
  }, [activeTab]);

  // 스케줄 모달 열기
  const openScheduleModal = (image: ImageItem) => {
    setSelectedImage(image);

    // 파일명에서 스케줄 정보 파싱
    const schedule = parseScheduleFromFilename(image.name);

    if (schedule.hasSchedule) {
      setScheduleForm({
        startDate: schedule.startDate || '',
        endDate: schedule.endDate || '',
        noLimit: false,
      });
    } else {
      setScheduleForm({
        startDate: '',
        endDate: '',
        noLimit: true,
      });
    }
    setScheduleModalOpen(true);
  };

  // 스케줄 모달 닫기
  const closeScheduleModal = () => {
    setScheduleModalOpen(false);
    setSelectedImage(null);
    setScheduleForm({ startDate: '', endDate: '', noLimit: true });
  };

  // 스케줄 저장 (파일명 변경)
  const handleSaveSchedule = async () => {
    if (!selectedImage) return;

    setIsSavingSchedule(true);
    try {
      // 현재 파일명에서 원본 이름 추출
      const parsedSchedule = parseScheduleFromFilename(selectedImage.name);
      const originalName = parsedSchedule.originalName;

      // 새 파일명 생성
      const newFilename = scheduleForm.noLimit
        ? originalName // 기간 제한 없음 → 원본 파일명
        : createScheduledFilename(
            originalName,
            scheduleForm.startDate || null,
            scheduleForm.endDate || null
          );

      // 파일명이 같으면 변경 불필요
      if (newFilename === selectedImage.name) {
        setMessage({ type: 'success', text: '노출 설정이 저장되었습니다.' });
        closeScheduleModal();
        return;
      }

      // 폴더 경로 추출 (예: svg/ 또는 gallery/)
      const folder = selectedImage.path.split('/')[0];
      const oldPath = selectedImage.path;
      const newPath = `${folder}/${newFilename}`;

      // 파일명 변경 (copy + delete)
      const result = await renameImage(oldPath, newPath);

      if (result) {
        // localStorage의 비활성화 목록도 업데이트
        const disabled = getDisabledImages();
        const oldIndex = disabled.indexOf(oldPath);
        if (oldIndex > -1) {
          disabled[oldIndex] = newPath;
          localStorage.setItem(DISABLED_IMAGES_KEY, JSON.stringify(disabled));
          setDisabledImages(disabled);
        }

        setMessage({ type: 'success', text: '노출 설정이 저장되었습니다.' });
        await loadImages(); // 목록 새로고침
        closeScheduleModal();
      } else {
        setMessage({ type: 'error', text: '노출 설정 저장에 실패했습니다.' });
      }
    } catch (error) {
      console.error('Save schedule error:', error);
      setMessage({ type: 'error', text: '노출 설정 저장에 실패했습니다.' });
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // 스케줄 삭제 (기간 제한 해제 = 원본 파일명으로 복구)
  const handleDeleteSchedule = async () => {
    if (!selectedImage) return;

    // 기간 제한 없음으로 설정하고 저장
    setScheduleForm({ startDate: '', endDate: '', noLimit: true });

    // noLimit을 true로 설정한 상태에서 저장 호출
    setIsSavingSchedule(true);
    try {
      const parsedSchedule = parseScheduleFromFilename(selectedImage.name);
      const originalName = parsedSchedule.originalName;

      // 이미 원본 파일명이면 변경 불필요
      if (!parsedSchedule.hasSchedule) {
        setMessage({ type: 'success', text: '노출 설정이 해제되었습니다.' });
        closeScheduleModal();
        return;
      }

      const folder = selectedImage.path.split('/')[0];
      const oldPath = selectedImage.path;
      const newPath = `${folder}/${originalName}`;

      const result = await renameImage(oldPath, newPath);

      if (result) {
        // localStorage의 비활성화 목록도 업데이트
        const disabled = getDisabledImages();
        const oldIndex = disabled.indexOf(oldPath);
        if (oldIndex > -1) {
          disabled[oldIndex] = newPath;
          localStorage.setItem(DISABLED_IMAGES_KEY, JSON.stringify(disabled));
          setDisabledImages(disabled);
        }

        setMessage({ type: 'success', text: '노출 설정이 해제되었습니다.' });
        await loadImages();
        closeScheduleModal();
      } else {
        setMessage({ type: 'error', text: '노출 설정 해제에 실패했습니다.' });
      }
    } catch (error) {
      console.error('Delete schedule error:', error);
      setMessage({ type: 'error', text: '노출 설정 해제에 실패했습니다.' });
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // 파일 업로드
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setMessage(null);

    let successCount = 0;
    let failCount = 0;

    for (const file of Array.from(files)) {
      // SVG 탭에서는 SVG만, 갤러리 탭에서는 이미지만 허용
      if (activeTab === 'svg' && !file.name.endsWith('.svg')) {
        failCount++;
        continue;
      }
      if (activeTab === 'gallery' && !file.type.startsWith('image/')) {
        failCount++;
        continue;
      }

      const result = await uploadImage(file, activeTab as ImageType);
      if (result) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setIsUploading(false);

    if (successCount > 0) {
      setMessage({
        type: 'success',
        text: `${successCount}개 파일 업로드 완료${failCount > 0 ? `, ${failCount}개 실패` : ''}`
      });
      loadImages();
    } else {
      setMessage({ type: 'error', text: '파일 업로드에 실패했습니다.' });
    }

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 파일 삭제
  const handleDelete = async (path: string, name: string) => {
    if (!confirm(`"${name}" 파일을 삭제하시겠습니까?`)) return;

    const success = await deleteImage(path);
    if (success) {
      setMessage({ type: 'success', text: '파일이 삭제되었습니다.' });
      loadImages();
    } else {
      setMessage({ type: 'error', text: '파일 삭제에 실패했습니다.' });
    }
  };

  // 이미지 활성화/비활성화 토글
  const handleToggle = (path: string) => {
    const newEnabled = toggleImageEnabled(path);
    setDisabledImages(getDisabledImages());
    setMessage({
      type: 'success',
      text: newEnabled ? '이미지가 활성화되었습니다.' : '이미지가 비활성화되었습니다.'
    });
  };

  // 파일명에서 스케줄 정보 가져오기
  const getImageScheduleInfo = (filename: string) => {
    const schedule = parseScheduleFromFilename(filename);
    const status = getScheduleStatusByFilename(filename);
    return { schedule, status };
  };

  // 갤러리 이미지를 SVG로 변환
  const handleConvert = async () => {
    if (!convertSelectedImage) return;

    setIsConverting(true);
    setConvertResult(null);
    setConvertError(null);

    try {
      const result = await convertGalleryToSvg(convertSelectedImage.url, { kColors });
      setConvertResult(result);
    } catch (error) {
      console.error('Conversion error:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setConvertError(`변환에 실패했습니다: ${errorMessage}`);
    } finally {
      setIsConverting(false);
    }
  };

  // 변환된 SVG를 Supabase에 저장
  const handleSaveSvg = async () => {
    if (!convertResult || !convertSelectedImage) return;

    setIsSavingSvg(true);
    try {
      // 원본 파일명에서 확장자 제거
      const originalName = convertSelectedImage.name.replace(/\.[^.]+$/, '');
      const filename = `converted_${originalName}.svg`;

      // 중복 확인
      const existingSvgs = await listImages('svg');
      const isDuplicate = existingSvgs.some(img =>
        img.name.includes(`converted_${originalName}`)
      );

      if (isDuplicate) {
        const confirmSave = confirm('이미 변환된 파일이 존재합니다. 덮어쓰시겠습니까?');
        if (!confirmSave) {
          setIsSavingSvg(false);
          return;
        }
      }

      // SVG 문자열에서 File 객체 생성
      const file = new File([convertResult.svg], filename, { type: 'image/svg+xml' });
      const uploadResult = await uploadImage(file, 'svg');

      if (uploadResult) {
        setMessage({ type: 'success', text: 'SVG 파일이 저장되었습니다.' });
      } else {
        setMessage({ type: 'error', text: 'SVG 파일 저장에 실패했습니다.' });
      }
    } catch (error) {
      console.error('Save SVG error:', error);
      setMessage({ type: 'error', text: 'SVG 파일 저장에 실패했습니다.' });
    } finally {
      setIsSavingSvg(false);
    }
  };

  // Gallery 탭: 변환 패널 토글
  const handleGalleryConvertToggle = (image: ImageItem) => {
    if (galleryConvertingImage?.path === image.path) {
      // 같은 이미지 클릭 시 패널 닫기
      setGalleryConvertingImage(null);
      setGalleryConvertResult(null);
      setGalleryConvertError(null);
      setGalleryKColors(6);
    } else {
      // 다른 이미지 클릭 시 상태 초기화 후 새 패널 열기
      setGalleryConvertingImage(image);
      setGalleryConvertResult(null);
      setGalleryConvertError(null);
      setGalleryKColors(6);
    }
  };

  // Gallery 탭: 변환 실행
  const handleGalleryConvert = async () => {
    if (!galleryConvertingImage) return;

    setIsGalleryConverting(true);
    setGalleryConvertResult(null);
    setGalleryConvertError(null);

    try {
      const result = await convertGalleryToSvg(galleryConvertingImage.url, { kColors: galleryKColors });
      setGalleryConvertResult(result);
    } catch (error) {
      console.error('Gallery conversion error:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setGalleryConvertError(`변환에 실패했습니다: ${errorMessage}`);
    } finally {
      setIsGalleryConverting(false);
    }
  };

  // Gallery 탭: SVG 저장
  const handleGallerySaveSvg = async () => {
    if (!galleryConvertResult || !galleryConvertingImage) return;

    setIsGallerySavingSvg(true);
    try {
      const originalName = galleryConvertingImage.name.replace(/\.[^.]+$/, '');
      const filename = `converted_${originalName}.svg`;

      // 중복 확인
      const existingSvgs = await listImages('svg');
      const isDuplicate = existingSvgs.some(img =>
        img.name.includes(`converted_${originalName}`)
      );

      if (isDuplicate) {
        const confirmSave = confirm('이미 변환된 파일이 존재합니다. 덮어쓰시겠습니까?');
        if (!confirmSave) {
          setIsGallerySavingSvg(false);
          return;
        }
      }

      const file = new File([galleryConvertResult.svg], filename, { type: 'image/svg+xml' });
      const uploadResult = await uploadImage(file, 'svg');

      if (uploadResult) {
        setMessage({ type: 'success', text: 'SVG 파일이 저장되었습니다.' });
      } else {
        setMessage({ type: 'error', text: 'SVG 파일 저장에 실패했습니다.' });
      }
    } catch (error) {
      console.error('Gallery save SVG error:', error);
      setMessage({ type: 'error', text: 'SVG 파일 저장에 실패했습니다.' });
    } finally {
      setIsGallerySavingSvg(false);
    }
  };

  // Gallery 탭: SVG 다운로드
  const handleGalleryDownloadSvg = () => {
    if (!galleryConvertResult || !galleryConvertingImage) return;
    const blob = new Blob([galleryConvertResult.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_${galleryConvertingImage.name.replace(/\.[^.]+$/, '')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 비밀번호 입력 화면
  if (!isAuthenticated) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal} style={{ maxWidth: '320px' }}>
          <div className={styles.header}>
            <h2>관리자 인증</h2>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
          <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
            <p className={styles.passwordLabel}>비밀번호를 입력하세요</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.passwordInput} ${passwordError ? styles.error : ''}`}
              placeholder="비밀번호"
              autoFocus
            />
            {passwordError && (
              <p className={styles.passwordError}>비밀번호가 틀렸습니다.</p>
            )}
            <button type="submit" className={styles.passwordBtn}>
              확인
            </button>
            <p className={styles.versionInfo}>v{APP_VERSION}</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>이미지 관리</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* 탭 */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'svg' ? styles.active : ''}`}
            onClick={() => setActiveTab('svg')}
          >
            SVG 파일
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'gallery' ? styles.active : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            갤러리 이미지
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'convert' ? styles.active : ''}`}
            onClick={() => setActiveTab('convert')}
          >
            이미지 변환
          </button>
        </div>

        {/* 메시지 */}
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        {/* 업로드 버튼 (변환 탭에서는 숨김) */}
        {activeTab !== 'convert' && (
          <div className={styles.uploadSection}>
            <input
              ref={fileInputRef}
              type="file"
              accept={activeTab === 'svg' ? '.svg' : 'image/*'}
              multiple
              onChange={handleUpload}
              className={styles.fileInput}
              id="file-upload"
            />
            <label htmlFor="file-upload" className={styles.uploadBtn}>
              {isUploading ? '업로드 중...' : `+ ${activeTab === 'svg' ? 'SVG' : '이미지'} 업로드`}
            </label>
          </div>
        )}

        {/* 이미지 목록 (변환 탭에서는 숨김) */}
        {activeTab !== 'convert' && (
          <div className={styles.imageList}>
            {isLoading ? (
              <div className={styles.loading}>로딩 중...</div>
            ) : images.length === 0 ? (
              <div className={styles.empty}>
                업로드된 {activeTab === 'svg' ? 'SVG 파일' : '이미지'}이 없습니다.
              </div>
            ) : (
              images.map((image) => {
                const enabled = !disabledImages.includes(image.path);
                const { schedule, status } = getImageScheduleInfo(image.name);
                const displayName = getCleanFilename(image.name);
                return (
                  <div
                    key={image.path}
                    className={`${styles.imageItem} ${!enabled ? styles.disabled : ''}`}
                    style={activeTab === 'gallery' && galleryConvertingImage?.path === image.path ? { flexWrap: 'wrap' } : undefined}
                  >
                    <div className={styles.imagePreview}>
                      {activeTab === 'svg' ? (
                        <div className={styles.svgIcon}>SVG</div>
                      ) : (
                        <img src={image.url} alt={image.name} />
                      )}
                    </div>
                    <div className={styles.imageInfo}>
                      <div className={styles.imageNameRow}>
                        <span className={styles.imageName}>{displayName}</span>
                        {status !== 'none' && (
                          <span className={`${styles.statusBadge} ${styles[status]}`}>
                            {getScheduleLabel(status)}
                          </span>
                        )}
                      </div>
                      <span className={styles.imageDate}>
                        {image.createdAt ? new Date(image.createdAt).toLocaleDateString() : ''}
                        {schedule.hasSchedule && (
                          <span className={styles.schedulePeriod}>
                            {' | '}
                            {schedule.startDate || '시작일 없음'} ~ {schedule.endDate || '종료일 없음'}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className={styles.imageActions}>
                      {/* 색칠놀이 변환 버튼 (갤러리 탭에서만) */}
                      {activeTab === 'gallery' && (
                        <button
                          className={styles.galleryConvertBtn}
                          onClick={() => handleGalleryConvertToggle(image)}
                        >
                          {galleryConvertingImage?.path === image.path ? '변환 닫기' : '색칠놀이 변환'}
                        </button>
                      )}
                      {/* 노출 설정 버튼 */}
                      <button
                        className={styles.scheduleBtn}
                        onClick={() => openScheduleModal(image)}
                      >
                        노출 설정
                      </button>
                      {/* 활성화/비활성화 토글 */}
                      <label className={styles.toggleWrapper}>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => handleToggle(image.path)}
                          className={styles.toggleInput}
                        />
                        <span className={styles.toggleSlider}></span>
                        <span className={styles.toggleLabel}>
                          {enabled ? '사용' : '미사용'}
                        </span>
                      </label>
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.viewBtn}
                      >
                        보기
                      </a>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(image.path, displayName)}
                      >
                        삭제
                      </button>
                    </div>

                    {/* Gallery 탭: 인라인 변환 패널 */}
                    {activeTab === 'gallery' && galleryConvertingImage?.path === image.path && (
                      <div className={styles.galleryConvertPanel}>
                        {/* k-colors 슬라이더 */}
                        <div className={styles.galleryConvertOptions}>
                          <div className={styles.sliderRow}>
                            <span className={styles.sliderLabel}>색상 수</span>
                            <input
                              type="range"
                              min={2}
                              max={16}
                              value={galleryKColors}
                              onChange={(e) => setGalleryKColors(Number(e.target.value))}
                              className={styles.slider}
                            />
                            <span className={styles.sliderValue}>{galleryKColors}</span>
                          </div>
                        </div>

                        {/* 변환 시작 버튼 */}
                        <button
                          className={styles.galleryConvertStartBtn}
                          onClick={handleGalleryConvert}
                          disabled={isGalleryConverting}
                        >
                          {isGalleryConverting ? '변환 중...' : '변환 시작'}
                        </button>

                        {/* 로딩 인디케이터 */}
                        {isGalleryConverting && (
                          <div className={styles.convertLoading}>
                            <div className={styles.convertLoadingSpinner} />
                            <span className={styles.convertLoadingText}>이미지를 분석하고 변환하는 중...</span>
                          </div>
                        )}

                        {/* 에러 메시지 */}
                        {galleryConvertError && (
                          <div className={styles.convertError}>{galleryConvertError}</div>
                        )}

                        {/* 변환 결과 미리보기 */}
                        {galleryConvertResult && (
                          <>
                            <div className={styles.previewSection}>
                              <div className={styles.previewHeader}>
                                <p className={styles.previewTitle}>변환 결과</p>
                                <span className={styles.previewMeta}>
                                  {galleryConvertResult.metadata.width}x{galleryConvertResult.metadata.height} | {galleryConvertResult.metadata.colorCount}색 | {Math.round(galleryConvertResult.metadata.processingTimeMs)}ms
                                </span>
                              </div>
                              <div className={styles.previewSvg}>
                                <img
                                  src={'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(galleryConvertResult.svg)}
                                  alt="변환된 SVG 미리보기"
                                />
                              </div>
                              <div className={styles.paletteInfo}>
                                <p className={styles.paletteTitle}>색상 팔레트</p>
                                <div className={styles.paletteColors}>
                                  {galleryConvertResult.palette.map((color, index) => (
                                    <div key={index} className={styles.paletteColor}>
                                      <span
                                        className={styles.colorSwatch}
                                        style={{ backgroundColor: color.hex }}
                                      />
                                      <span className={styles.colorHex}>{color.hex}</span>
                                      <span className={styles.colorPercent}>
                                        {color.percentage.toFixed(1)}%
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* 저장/다운로드 버튼 */}
                            <div className={styles.convertActions}>
                              <button
                                className={styles.saveSvgBtn}
                                onClick={handleGallerySaveSvg}
                                disabled={isGallerySavingSvg}
                              >
                                {isGallerySavingSvg ? '저장 중...' : 'SVG 저장'}
                              </button>
                              <button
                                className={styles.downloadBtn}
                                onClick={handleGalleryDownloadSvg}
                              >
                                다운로드
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 변환 탭 컨텐츠 */}
        {activeTab === 'convert' && (
          <div className={styles.convertContent}>
            {/* 갤러리 이미지 그리드 */}
            {galleryImages.length === 0 ? (
              <div className={styles.empty}>
                변환할 갤러리 이미지가 없습니다. 먼저 갤러리에 이미지를 업로드하세요.
              </div>
            ) : (
              <>
                <div className={styles.convertGrid}>
                  {galleryImages.map((image) => {
                    const isSelected = convertSelectedImage?.path === image.path;
                    return (
                      <div
                        key={image.path}
                        className={`${styles.convertGridItem} ${isSelected ? styles.selected : ''}`}
                        onClick={() => {
                          setConvertSelectedImage(isSelected ? null : image);
                          setConvertResult(null);
                          setConvertError(null);
                        }}
                      >
                        <img src={image.url} alt={getCleanFilename(image.name)} />
                        {isSelected && (
                          <span className={styles.checkmark}>&#10003;</span>
                        )}
                        <span className={styles.convertGridItemName}>
                          {getCleanFilename(image.name)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 변환 옵션 */}
                <div className={styles.convertOptions}>
                  <p className={styles.convertOptionsTitle}>변환 옵션</p>
                  <div className={styles.sliderRow}>
                    <span className={styles.sliderLabel}>색상 수</span>
                    <input
                      type="range"
                      min={2}
                      max={16}
                      value={kColors}
                      onChange={(e) => setKColors(Number(e.target.value))}
                      className={styles.slider}
                    />
                    <span className={styles.sliderValue}>{kColors}</span>
                  </div>
                </div>

                {/* 변환 버튼 */}
                <button
                  className={styles.convertBtn}
                  onClick={handleConvert}
                  disabled={!convertSelectedImage || isConverting}
                >
                  {isConverting ? '변환 중...' : 'SVG로 변환'}
                </button>

                {/* 로딩 인디케이터 */}
                {isConverting && (
                  <div className={styles.convertLoading}>
                    <div className={styles.convertLoadingSpinner} />
                    <span className={styles.convertLoadingText}>이미지를 분석하고 변환하는 중...</span>
                  </div>
                )}

                {/* 에러 메시지 */}
                {convertError && (
                  <div className={styles.convertError}>{convertError}</div>
                )}

                {/* 변환 결과 미리보기 */}
                {convertResult && (
                  <>
                    <div className={styles.previewSection}>
                      <div className={styles.previewHeader}>
                        <p className={styles.previewTitle}>변환 결과</p>
                        <span className={styles.previewMeta}>
                          {convertResult.metadata.width}x{convertResult.metadata.height} | {convertResult.metadata.colorCount}색 | {Math.round(convertResult.metadata.processingTimeMs)}ms
                        </span>
                      </div>
                      <div className={styles.previewSvg}>
                        <img
                          src={'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(convertResult.svg)}
                          alt="변환된 SVG 미리보기"
                        />
                      </div>

                      {/* 팔레트 정보 */}
                      <div className={styles.paletteInfo}>
                        <p className={styles.paletteTitle}>색상 팔레트</p>
                        <div className={styles.paletteColors}>
                          {convertResult.palette.map((color, index) => (
                            <div key={index} className={styles.paletteColor}>
                              <span
                                className={styles.colorSwatch}
                                style={{ backgroundColor: color.hex }}
                              />
                              <span className={styles.colorHex}>{color.hex}</span>
                              <span className={styles.colorPercent}>
                                {color.percentage.toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 저장/다운로드 버튼 */}
                    <div className={styles.convertActions}>
                      <button
                        className={styles.saveSvgBtn}
                        onClick={handleSaveSvg}
                        disabled={isSavingSvg}
                      >
                        {isSavingSvg ? '저장 중...' : 'SVG 저장'}
                      </button>
                      <button
                        className={styles.downloadBtn}
                        onClick={() => {
                          if (!convertResult || !convertSelectedImage) return;
                          const blob = new Blob([convertResult.svg], { type: 'image/svg+xml' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `converted_${convertSelectedImage.name.replace(/\.[^.]+$/, '')}.svg`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        다운로드
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* 사용법 안내 */}
        <div className={styles.helpText}>
          <p>
            {activeTab === 'svg'
              ? '색칠할 SVG 파일을 업로드하세요. 업로드된 파일은 앱에서 자동으로 사용됩니다.'
              : activeTab === 'gallery'
              ? '인트로 화면에 표시될 갤러리 이미지를 업로드하세요. 각 이미지의 "색칠놀이 변환" 버튼으로 SVG 변환도 가능합니다.'
              : '갤러리 이미지를 SVG 색칠하기 파일로 변환할 수 있습니다. 변환할 이미지를 선택하고 색상 수를 조절한 후 변환 버튼을 눌러주세요.'}
          </p>
        </div>

        {/* 노출 설정 모달 */}
        {scheduleModalOpen && selectedImage && (
          <div className={styles.scheduleOverlay} onClick={closeScheduleModal}>
            <div className={styles.scheduleModal} onClick={e => e.stopPropagation()}>
              <div className={styles.scheduleHeader}>
                <h3>노출 기간 설정</h3>
                <button className={styles.closeBtn} onClick={closeScheduleModal}>✕</button>
              </div>
              <div className={styles.scheduleContent}>
                <p className={styles.scheduleImageName}>
                  {getCleanFilename(selectedImage.name)}
                </p>

                {/* 기간 제한 없음 체크박스 */}
                <label className={styles.noLimitCheckbox}>
                  <input
                    type="checkbox"
                    checked={scheduleForm.noLimit}
                    onChange={(e) => setScheduleForm(prev => ({
                      ...prev,
                      noLimit: e.target.checked,
                      startDate: e.target.checked ? '' : prev.startDate,
                      endDate: e.target.checked ? '' : prev.endDate,
                    }))}
                  />
                  <span>기간 제한 없음 (항상 노출)</span>
                </label>

                {/* 날짜 입력 필드 */}
                {!scheduleForm.noLimit && (
                  <div className={styles.dateInputs}>
                    <div className={styles.dateField}>
                      <label>시작일</label>
                      <input
                        type="date"
                        value={scheduleForm.startDate}
                        onChange={(e) => setScheduleForm(prev => ({
                          ...prev,
                          startDate: e.target.value,
                        }))}
                        className={styles.dateInput}
                      />
                    </div>
                    <div className={styles.dateField}>
                      <label>종료일</label>
                      <input
                        type="date"
                        value={scheduleForm.endDate}
                        onChange={(e) => setScheduleForm(prev => ({
                          ...prev,
                          endDate: e.target.value,
                        }))}
                        className={styles.dateInput}
                      />
                    </div>
                  </div>
                )}

                <p className={styles.scheduleHint}>
                  {scheduleForm.noLimit
                    ? '이 이미지는 항상 사용자에게 노출됩니다.'
                    : '설정한 기간 동안만 이미지가 사용자에게 노출됩니다.'}
                </p>
              </div>
              <div className={styles.scheduleActions}>
                {parseScheduleFromFilename(selectedImage.name).hasSchedule && (
                  <button
                    className={styles.scheduleResetBtn}
                    onClick={handleDeleteSchedule}
                    disabled={isSavingSchedule}
                  >
                    설정 해제
                  </button>
                )}
                <div className={styles.scheduleMainBtns}>
                  <button
                    className={styles.scheduleCancelBtn}
                    onClick={closeScheduleModal}
                    disabled={isSavingSchedule}
                  >
                    취소
                  </button>
                  <button
                    className={styles.scheduleSaveBtn}
                    onClick={handleSaveSchedule}
                    disabled={isSavingSchedule}
                  >
                    {isSavingSchedule ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
