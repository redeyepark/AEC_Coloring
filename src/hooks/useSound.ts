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
 * 색칠 시 팝/클릭 사운드를 합성하여 재생한다.
 * AudioContext 싱글턴을 유지하며 iOS Safari 호환성을 지원한다.
 */
export function useSound(): UseSoundReturn {
  // AudioContext 싱글턴 (lazy 초기화)
  const audioContextRef = useRef<AudioContext | null>(null);
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

  /** 힐링 챙 효과음 재생 (윈드차임 스타일, 0.25초) */
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

      // 기본 톤: 사인파 1047Hz(C6) → 988Hz(B5) 부드러운 하강
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1047, now);
      osc1.frequency.exponentialRampToValueAtTime(988, now + 0.2);

      // 배음 톤: 1568Hz(G6, 5도 위) 은은한 하모닉
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1568, now);
      osc2.frequency.exponentialRampToValueAtTime(1480, now + 0.2);

      // 기본 톤 게인: 0.12 → 0 (0.25초, 부드러운 감쇠)
      const gain1 = ctx.createGain();
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      // 배음 톤 게인: 0.05 → 0 (은은하게)
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.05, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      // 연결: 오실레이터 → 게인 → 출력
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      // 재생 시작 및 자동 종료
      osc1.start(now);
      osc1.stop(now + 0.25);
      osc2.start(now);
      osc2.stop(now + 0.2);
    } catch {
      // 오디오 재생 실패 시 무시 (graceful degradation)
    }
  }, [isMuted, getAudioContext]);

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
