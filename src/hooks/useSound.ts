import { useRef, useState, useCallback } from 'react';

interface UseSoundReturn {
  playPopSound: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

/** localStorage 키 */
const MUTE_STORAGE_KEY = 'aec-bg-sound-muted';

/** localStorage에서 음소거 상태를 읽어오는 헬퍼 */
function getInitialMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
  } catch {
    // 프라이빗 브라우징 등에서 localStorage 접근 불가 시
    return false;
  }
}

/**
 * Web Audio API를 사용한 효과음 커스텀 훅.
 * 색칠 시 크래파스 사각사각 사운드를 합성하여 재생한다.
 * AudioContext 싱글턴을 유지하며 iOS Safari 호환성을 지원한다.
 */
export function useSound(): UseSoundReturn {
  // AudioContext 싱글턴 (lazy 초기화)
  const audioContextRef = useRef<AudioContext | null>(null);
  // 노이즈 버퍼 캐시 (재사용)
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(getInitialMuted);

  /** AudioContext를 가져오거나 새로 생성하는 헬퍼 */
  const getAudioContext = useCallback((): AudioContext | null => {
    try {
      if (!audioContextRef.current) {
        // 크로스 브라우저 호환: webkitAudioContext 대응
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return null;
        audioContextRef.current = new AudioContextClass();
      }
      return audioContextRef.current;
    } catch {
      // AudioContext 생성 실패 시 무시
      return null;
    }
  }, []);

  /** 화이트 노이즈 버퍼 생성 (한 번만 생성, 이후 캐시 재사용) */
  const getNoiseBuffer = useCallback((ctx: AudioContext): AudioBuffer => {
    if (noiseBufferRef.current) return noiseBufferRef.current;
    // 0.15초 분량의 화이트 노이즈 샘플 생성
    const bufferSize = Math.ceil(ctx.sampleRate * 0.15);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noiseBufferRef.current = buffer;
    return buffer;
  }, []);

  /** 크래파스 사각사각 효과음 재생 (필터링된 노이즈, 0.12초) */
  const playPopSound = useCallback(() => {
    // 음소거 상태면 즉시 반환
    if (isMuted) return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      // iOS Safari: suspended 상태면 resume
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // 화이트 노이즈 소스
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = getNoiseBuffer(ctx);

      // 밴드패스 필터: 크래파스 긁는 질감 (중심 3500Hz, Q 0.8)
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(3500, now);
      bandpass.Q.setValueAtTime(0.8, now);

      // 하이패스 필터: 저음 제거로 사각사각 느낌 강화
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(1500, now);

      // 게인 엔벨로프: 빠른 어택 → 짧은 감쇠 (크래파스 한 획)
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      // 연결: 노이즈 → 밴드패스 → 하이패스 → 게인 → 출력
      noiseSource.connect(bandpass);
      bandpass.connect(highpass);
      highpass.connect(gainNode);
      gainNode.connect(ctx.destination);

      // 재생 시작 및 자동 종료
      noiseSource.start(now);
      noiseSource.stop(now + 0.12);
    } catch {
      // 오디오 재생 실패 시 무시 (graceful degradation)
    }
  }, [isMuted, getAudioContext, getNoiseBuffer]);

  /** 음소거 토글 및 localStorage 저장 */
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem(MUTE_STORAGE_KEY, String(next));
      } catch {
        // 프라이빗 브라우징 등에서 localStorage 접근 불가 시 무시
      }
      return next;
    });
  }, []);

  return { playPopSound, isMuted, toggleMute };
}
