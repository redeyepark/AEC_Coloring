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
  ScheduleStatus,
} from '../utils/scheduleUtils';
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
const APP_VERSION = '1.0.3';

export function AdminPage({ onClose }: AdminPageProps) {
  // 인증 상태
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [activeTab, setActiveTab] = useState<ImageType>('svg');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [disabledImages, setDisabledImages] = useState<string[]>(getDisabledImages());
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const result = await uploadImage(file, activeTab);
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
        </div>

        {/* 메시지 */}
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        {/* 업로드 버튼 */}
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

        {/* 이미지 목록 */}
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
                </div>
              );
            })
          )}
        </div>

        {/* 사용법 안내 */}
        <div className={styles.helpText}>
          <p>
            {activeTab === 'svg'
              ? '색칠할 SVG 파일을 업로드하세요. 업로드된 파일은 앱에서 자동으로 사용됩니다.'
              : '인트로 화면에 표시될 갤러리 이미지를 업로드하세요.'}
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
