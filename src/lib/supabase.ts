import { createClient } from '@supabase/supabase-js';

// Supabase 설정
const supabaseUrl = 'https://veectttvbapuzhultfmc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZWN0dHR2YmFwdXpodWx0Zm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTk4OTIsImV4cCI6MjA4NTc5NTg5Mn0.JevC0A_ZOwGuins7u78-PqD8BDbBpPQqETh8ZqgVDgg';

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage 버킷 이름
export const BUCKET_NAME = 'images';

// 이미지 타입
export type ImageType = 'svg' | 'gallery';

// 이미지 업로드
export async function uploadImage(
  file: File,
  type: ImageType
): Promise<{ url: string; path: string } | null> {
  const folder = type === 'svg' ? 'svg' : 'gallery';
  const fileName = `${folder}/${Date.now()}_${file.name}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  // 퍼블릭 URL 생성
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

// 이미지 목록 조회
export async function listImages(type: ImageType): Promise<Array<{
  name: string;
  url: string;
  path: string;
  createdAt: string;
}>> {
  const folder = type === 'svg' ? 'svg' : 'gallery';

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(folder, {
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) {
    console.error('List error:', error);
    return [];
  }

  return (data || [])
    .filter(item => !item.name.startsWith('.'))
    .map(item => {
      const path = `${folder}/${item.name}`;
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);

      return {
        name: item.name,
        url: urlData.publicUrl,
        path,
        createdAt: item.created_at || '',
      };
    });
}

// 이미지 삭제
export async function deleteImage(path: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    console.error('Delete error:', error);
    return false;
  }

  return true;
}

// 이미지 URL 가져오기
export function getImageUrl(path: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
}

// 이미지 파일명 변경 (copy + delete 방식)
export async function renameImage(
  oldPath: string,
  newPath: string
): Promise<{ url: string; path: string } | null> {
  try {
    // 1. 기존 파일 다운로드
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(oldPath);

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError);
      return null;
    }

    // 2. 새 경로에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(newPath, fileData, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    // 3. 기존 파일 삭제
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([oldPath]);

    if (deleteError) {
      console.error('Delete old file error:', deleteError);
      // 삭제 실패해도 새 파일은 이미 생성됨
    }

    // 4. 새 URL 반환
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(uploadData.path);

    return {
      url: urlData.publicUrl,
      path: uploadData.path,
    };
  } catch (error) {
    console.error('Rename error:', error);
    return null;
  }
}

// ========================================
// 이미지 스케줄 관련 타입 및 함수
// ========================================

// 이미지 스케줄 타입
export interface ImageSchedule {
  id: string;
  image_path: string;
  image_type: 'svg' | 'gallery';
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 노출 상태 타입
export type ScheduleStatus = 'scheduled' | 'active' | 'expired' | 'none';

// 이미지가 현재 노출 가능한지 확인
export function isImageVisible(schedule: ImageSchedule | undefined): boolean {
  if (!schedule) return true; // 스케줄 없으면 항상 노출
  if (!schedule.is_active) return false;

  const today = new Date().toISOString().split('T')[0];

  if (schedule.start_date && today < schedule.start_date) return false; // 예약됨
  if (schedule.end_date && today > schedule.end_date) return false; // 만료됨

  return true;
}

// 이미지의 노출 상태 확인
export function getScheduleStatus(schedule: ImageSchedule | undefined): ScheduleStatus {
  if (!schedule) return 'none';
  if (!schedule.is_active) return 'expired';

  const today = new Date().toISOString().split('T')[0];

  if (schedule.start_date && today < schedule.start_date) return 'scheduled';
  if (schedule.end_date && today > schedule.end_date) return 'expired';

  return 'active';
}

// 모든 이미지 스케줄 조회
export async function getImageSchedules(): Promise<ImageSchedule[]> {
  const { data, error } = await supabase
    .from('image_schedules')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get schedules error:', error);
    return [];
  }

  return data || [];
}

// 특정 이미지의 스케줄 조회
export async function getImageSchedule(imagePath: string): Promise<ImageSchedule | null> {
  const { data, error } = await supabase
    .from('image_schedules')
    .select('*')
    .eq('image_path', imagePath)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // 데이터 없음 (정상)
      return null;
    }
    console.error('Get schedule error:', error);
    return null;
  }

  return data;
}

// 이미지 스케줄 생성/수정
export async function upsertImageSchedule(schedule: Partial<ImageSchedule> & { image_path: string; image_type: ImageType }): Promise<boolean> {
  const { error } = await supabase
    .from('image_schedules')
    .upsert({
      ...schedule,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'image_path',
    });

  if (error) {
    console.error('Upsert schedule error:', error);
    return false;
  }

  return true;
}

// 이미지 스케줄 삭제
export async function deleteImageSchedule(imagePath: string): Promise<boolean> {
  const { error } = await supabase
    .from('image_schedules')
    .delete()
    .eq('image_path', imagePath);

  if (error) {
    console.error('Delete schedule error:', error);
    return false;
  }

  return true;
}
