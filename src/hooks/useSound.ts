import { useRef, useState, useCallback, useEffect } from 'react';

interface UseSoundReturn {
  playPopSound: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  startAmbient: () => void;
  stopAmbient: () => void;
  isAmbientPlaying: boolean;
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
 * - 배경 바람 앰비언트 사운드 (루프 재생)
 * - 클릭 시 자연 효과음 (새 지저귐, 물방울, 바람 소리 랜덤)
 * AudioContext 싱글턴을 유지하며 iOS Safari 호환성을 지원한다.
 */
export function useSound(): UseSoundReturn {
  // AudioContext 싱글턴 (lazy 초기화)
  const audioContextRef = useRef<AudioContext | null>(null);
  // 짧은 노이즈 버퍼 (자연 효과음용, ~0.25초)
  const shortNoiseBufferRef = useRef<AudioBuffer | null>(null);
  // 긴 노이즈 버퍼 (앰비언트용, ~2초)
  const ambientNoiseBufferRef = useRef<AudioBuffer | null>(null);

  // 앰비언트 관련 노드 참조
  const ambientSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const ambientLfoRef = useRef<OscillatorNode | null>(null);
  const ambientLfoGainRef = useRef<GainNode | null>(null);

  // 앰비언트 상태 추적
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  // 앰비언트가 "재생되어야 하는" 상태 (음소거 해제 시 복원용)
  const ambientWantedRef = useRef(false);

  const [isMuted, setIsMuted] = useState<boolean>(getInitialMuted);
  // 콜백 내에서 최신 isMuted 값 참조를 위한 ref
  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

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

  /** 짧은 화이트 노이즈 버퍼 생성 (~0.25초, 자연 효과음용) */
  const getShortNoiseBuffer = useCallback((ctx: AudioContext): AudioBuffer => {
    if (shortNoiseBufferRef.current) return shortNoiseBufferRef.current;
    const bufferSize = Math.ceil(ctx.sampleRate * 0.25);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    shortNoiseBufferRef.current = buffer;
    return buffer;
  }, []);

  /** 긴 화이트 노이즈 버퍼 생성 (~2초, 앰비언트용) */
  const getAmbientNoiseBuffer = useCallback((ctx: AudioContext): AudioBuffer => {
    if (ambientNoiseBufferRef.current) return ambientNoiseBufferRef.current;
    const bufferSize = Math.ceil(ctx.sampleRate * 2);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    ambientNoiseBufferRef.current = buffer;
    return buffer;
  }, []);

  // ─────────────────────────────────────────────
  // 사운드 1: 새 지저귐 (Bird Chirp)
  // ─────────────────────────────────────────────
  const playBirdChirp = useCallback((ctx: AudioContext) => {
    const now = ctx.currentTime;

    // 메인 오실레이터: 사인파, 주파수 2000→4000→2500Hz
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, now);
    osc.frequency.linearRampToValueAtTime(4000, now + 0.06);
    osc.frequency.linearRampToValueAtTime(2500, now + 0.15);

    // 비브라토 LFO: 30Hz, 깊이 50Hz
    const vibrato = ctx.createOscillator();
    vibrato.type = 'sine';
    vibrato.frequency.setValueAtTime(30, now);
    const vibratoGain = ctx.createGain();
    vibratoGain.gain.setValueAtTime(50, now);
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    // 게인 엔벨로프: 빠른 어택(5ms), 중간 감쇠(150ms)
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    // 연결: 오실레이터 → 게인 → 출력
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 재생
    osc.start(now);
    vibrato.start(now);
    osc.stop(now + 0.15);
    vibrato.stop(now + 0.15);
  }, []);

  // ─────────────────────────────────────────────
  // 사운드 2: 물방울 (Water Drop)
  // ─────────────────────────────────────────────
  const playWaterDrop = useCallback((ctx: AudioContext) => {
    const now = ctx.currentTime;

    // 메인 오실레이터: 사인파, 1200Hz→400Hz 지수 감소
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);

    // 게인 엔벨로프: 즉시 어택, 지수 감쇠
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    // 연결: 오실레이터 → 게인 → 출력
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // "뚝" 공명: 두 번째 오실레이터 600Hz, 매우 짧은(30ms), 낮은 게인(0.05)
    const plopOsc = ctx.createOscillator();
    plopOsc.type = 'sine';
    plopOsc.frequency.setValueAtTime(600, now);
    const plopGain = ctx.createGain();
    plopGain.gain.setValueAtTime(0.05, now);
    plopGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    plopOsc.connect(plopGain);
    plopGain.connect(ctx.destination);

    // 재생
    osc.start(now);
    plopOsc.start(now);
    osc.stop(now + 0.2);
    plopOsc.stop(now + 0.03);
  }, []);

  // ─────────────────────────────────────────────
  // 사운드 3: 부드러운 바람 (Gentle Wind Gust)
  // ─────────────────────────────────────────────
  const playWindGust = useCallback((ctx: AudioContext) => {
    const now = ctx.currentTime;

    // 화이트 노이즈 소스
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = getShortNoiseBuffer(ctx);

    // 밴드패스 필터: 중심 1000Hz, Q 0.5 (부드러운 바람 질감)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1000, now);
    bandpass.Q.setValueAtTime(0.5, now);

    // 게인 엔벨로프: 0→0.10 (20ms 어택) → 0.001 (180ms 감쇠)
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.10, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    // 연결: 노이즈 → 밴드패스 → 게인 → 출력
    noiseSource.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 재생
    noiseSource.start(now);
    noiseSource.stop(now + 0.2);
  }, [getShortNoiseBuffer]);

  /** 자연 효과음 재생 (새 지저귐 / 물방울 / 바람 중 랜덤) */
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

      // 3가지 자연 사운드 중 랜덤 선택
      const rand = Math.random();
      if (rand < 0.333) {
        playBirdChirp(ctx);
      } else if (rand < 0.666) {
        playWaterDrop(ctx);
      } else {
        playWindGust(ctx);
      }
    } catch {
      // 오디오 재생 실패 시 무시 (graceful degradation)
    }
  }, [isMuted, getAudioContext, playBirdChirp, playWaterDrop, playWindGust]);

  // ─────────────────────────────────────────────
  // 앰비언트 바람 사운드 (연속 루프 재생)
  // ─────────────────────────────────────────────

  /** 앰비언트 노드 정리 헬퍼 */
  const cleanupAmbient = useCallback(() => {
    try {
      if (ambientLfoRef.current) {
        ambientLfoRef.current.stop();
        ambientLfoRef.current.disconnect();
        ambientLfoRef.current = null;
      }
    } catch {
      ambientLfoRef.current = null;
    }
    try {
      if (ambientSourceRef.current) {
        ambientSourceRef.current.stop();
        ambientSourceRef.current.disconnect();
        ambientSourceRef.current = null;
      }
    } catch {
      ambientSourceRef.current = null;
    }
    if (ambientLfoGainRef.current) {
      ambientLfoGainRef.current.disconnect();
      ambientLfoGainRef.current = null;
    }
    if (ambientGainRef.current) {
      ambientGainRef.current.disconnect();
      ambientGainRef.current = null;
    }
    setIsAmbientPlaying(false);
  }, []);

  /** 앰비언트 바람 사운드 시작 */
  const startAmbientInternal = useCallback(() => {
    // 이미 재생 중이면 무시
    if (ambientSourceRef.current) return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // 화이트 노이즈 소스 (루프, ~2초 버퍼)
      const source = ctx.createBufferSource();
      source.buffer = getAmbientNoiseBuffer(ctx);
      source.loop = true;

      // 로우패스 필터: 컷오프 ~500Hz (깊은 바람 울림)
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(500, now);

      // 밴드패스 필터: 200-800Hz 바람 질감
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(500, now);
      bandpass.Q.setValueAtTime(0.5, now);

      // 기본 게인 (0.06)
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.06, now);

      // LFO로 자연스러운 바람 변화: 게인 0.04~0.08 사이 3.5초 주기 변동
      // LFO 오실레이터: 매우 느린 사인파 (~0.286Hz = 1/3.5초)
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(1 / 3.5, now);

      // LFO 깊이: ±0.02 (기본 0.06 기준으로 0.04~0.08 범위)
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.02, now);

      // LFO → 게인 노드의 gain 파라미터에 연결
      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);

      // 오디오 체인: 소스 → 로우패스 → 밴드패스 → 게인 → 출력
      source.connect(lowpass);
      lowpass.connect(bandpass);
      bandpass.connect(gainNode);
      gainNode.connect(ctx.destination);

      // 참조 저장
      ambientSourceRef.current = source;
      ambientGainRef.current = gainNode;
      ambientLfoRef.current = lfo;
      ambientLfoGainRef.current = lfoGain;

      // 재생 시작
      source.start(now);
      lfo.start(now);

      setIsAmbientPlaying(true);
    } catch {
      // 앰비언트 시작 실패 시 무시
    }
  }, [getAudioContext, getAmbientNoiseBuffer]);

  /** 앰비언트 사운드 시작 (외부 API) */
  const startAmbient = useCallback(() => {
    ambientWantedRef.current = true;
    if (!isMutedRef.current) {
      startAmbientInternal();
    }
  }, [startAmbientInternal]);

  /** 앰비언트 사운드 정지 (외부 API) */
  const stopAmbient = useCallback(() => {
    ambientWantedRef.current = false;
    cleanupAmbient();
  }, [cleanupAmbient]);

  /** 음소거 토글 및 localStorage 저장 */
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem(MUTE_STORAGE_KEY, String(next));
      } catch {
        // 프라이빗 브라우징 등에서 localStorage 접근 불가 시 무시
      }

      // 음소거 활성화 시: 앰비언트 재생 중이면 정지
      if (next && ambientSourceRef.current) {
        cleanupAmbient();
      }

      // 음소거 해제 시: 앰비언트가 재생되어야 하는 상태였으면 재시작
      if (!next && ambientWantedRef.current) {
        // setState 콜백 내에서는 직접 호출 대신 다음 틱에서 실행
        setTimeout(() => {
          startAmbientInternal();
        }, 0);
      }

      return next;
    });
  }, [cleanupAmbient, startAmbientInternal]);

  // 컴포넌트 언마운트 시 앰비언트 정리
  useEffect(() => {
    return () => {
      ambientWantedRef.current = false;
      cleanupAmbient();
    };
  }, [cleanupAmbient]);

  return {
    playPopSound,
    isMuted,
    toggleMute,
    startAmbient,
    stopAmbient,
    isAmbientPlaying,
  };
}
