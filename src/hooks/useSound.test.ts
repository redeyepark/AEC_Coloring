// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSound } from './useSound';

// ============================================================
// Web Audio API Mock 설정 (자연 효과음 + 앰비언트 기반)
// ============================================================

/** OscillatorNode Mock 생성 헬퍼 */
function createMockOscillator() {
  return {
    type: 'sine' as OscillatorType,
    frequency: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
  };
}

/** BufferSourceNode Mock 생성 헬퍼 */
function createMockBufferSource() {
  return {
    buffer: null as AudioBuffer | null,
    loop: false,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
  };
}

/** BiquadFilterNode Mock 생성 헬퍼 */
function createMockBiquadFilter() {
  return {
    type: 'lowpass' as BiquadFilterType,
    frequency: {
      setValueAtTime: vi.fn(),
    },
    Q: {
      setValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

/** GainNode Mock 생성 헬퍼 */
function createMockGainNode() {
  return {
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

/** AudioBuffer Mock */
function createMockAudioBuffer() {
  const channelData = new Float32Array(11025); // ~0.25초 분량 (44100 * 0.25)
  return {
    getChannelData: vi.fn(() => channelData),
    length: 11025,
    sampleRate: 44100,
    numberOfChannels: 1,
    duration: 0.25,
  };
}

/** AudioContext Mock 생성 헬퍼 (생성된 노드 추적) */
function createMockAudioContext(state: AudioContextState = 'running') {
  const createdOscillators: ReturnType<typeof createMockOscillator>[] = [];
  const createdBufferSources: ReturnType<typeof createMockBufferSource>[] = [];
  const createdBiquadFilters: ReturnType<typeof createMockBiquadFilter>[] = [];
  const createdGainNodes: ReturnType<typeof createMockGainNode>[] = [];
  const audioBuffer = createMockAudioBuffer();

  const ctx = {
    state,
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    createOscillator: vi.fn(() => {
      const osc = createMockOscillator();
      createdOscillators.push(osc);
      return osc;
    }),
    createBufferSource: vi.fn(() => {
      const src = createMockBufferSource();
      createdBufferSources.push(src);
      return src;
    }),
    createBuffer: vi.fn(() => audioBuffer),
    createBiquadFilter: vi.fn(() => {
      const filter = createMockBiquadFilter();
      createdBiquadFilters.push(filter);
      return filter;
    }),
    createGain: vi.fn(() => {
      const gain = createMockGainNode();
      createdGainNodes.push(gain);
      return gain;
    }),
    resume: vi.fn(() => Promise.resolve()),
  };

  return {
    ctx,
    createdOscillators,
    createdBufferSources,
    createdBiquadFilters,
    createdGainNodes,
    audioBuffer,
  };
}

// ============================================================
// 테스트 스위트
// ============================================================
describe('useSound', () => {
  let mockAudioContextConstructor: ReturnType<typeof vi.fn>;
  let mockCtx: ReturnType<typeof createMockAudioContext>;

  beforeEach(() => {
    // localStorage 초기화
    localStorage.clear();

    // AudioContext Mock 설정
    mockCtx = createMockAudioContext('running');
    mockAudioContextConstructor = vi.fn(function (this: unknown) {
      return mockCtx.ctx;
    });

    // window.AudioContext를 Mock으로 교체
    vi.stubGlobal('AudioContext', mockAudioContextConstructor);

    // webkitAudioContext 제거
    if ('webkitAudioContext' in window) {
      delete (window as unknown as Record<string, unknown>).webkitAudioContext;
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // ----------------------------------------------------------
  // 1. AudioContext 관리
  // ----------------------------------------------------------
  describe('AudioContext 관리', () => {
    it('AudioContext는 lazy 초기화되어야 한다 (첫 playPopSound 호출 시 생성)', () => {
      const { result } = renderHook(() => useSound());

      expect(mockAudioContextConstructor).not.toHaveBeenCalled();

      act(() => {
        result.current.playPopSound();
      });

      expect(mockAudioContextConstructor).toHaveBeenCalledTimes(1);
    });

    it('AudioContext 인스턴스는 하나만 생성되어야 한다 (싱글턴)', () => {
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });
      act(() => { result.current.playPopSound(); });
      act(() => { result.current.playPopSound(); });

      expect(mockAudioContextConstructor).toHaveBeenCalledTimes(1);
    });

    it('webkitAudioContext 폴백이 동작해야 한다', () => {
      vi.stubGlobal('AudioContext', undefined);

      const webkitMock = vi.fn(function (this: unknown) {
        return mockCtx.ctx;
      });
      (window as unknown as Record<string, unknown>).webkitAudioContext = webkitMock;

      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      expect(webkitMock).toHaveBeenCalledTimes(1);
    });

    it('AudioContext 생성 실패 시 예외가 발생하지 않아야 한다', () => {
      mockAudioContextConstructor.mockImplementation(function (this: unknown) {
        throw new Error('AudioContext not supported');
      });

      const { result } = renderHook(() => useSound());

      expect(() => {
        act(() => { result.current.playPopSound(); });
      }).not.toThrow();
    });

    it('AudioContext와 webkitAudioContext 모두 없으면 정상 동작해야 한다', () => {
      vi.stubGlobal('AudioContext', undefined);
      if ('webkitAudioContext' in window) {
        delete (window as unknown as Record<string, unknown>).webkitAudioContext;
      }

      const { result } = renderHook(() => useSound());

      expect(() => {
        act(() => { result.current.playPopSound(); });
      }).not.toThrow();

      // AudioContext가 없으므로 어떤 노드도 생성되지 않아야 한다
      expect(mockCtx.ctx.createBufferSource).not.toHaveBeenCalled();
      expect(mockCtx.ctx.createOscillator).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 2. playPopSound 자연 효과음 재생
  // ----------------------------------------------------------
  describe('playPopSound 자연 효과음 재생', () => {
    afterEach(() => {
      vi.spyOn(Math, 'random').mockRestore();
    });

    it('Math.random < 0.333이면 새 지저귐(bird chirp)을 재생해야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      // 새 지저귐: 오실레이터 2개 (메인 + 비브라토 LFO), 게인 2개 (메인 + 비브라토 깊이)
      expect(mockCtx.ctx.createOscillator).toHaveBeenCalledTimes(2);
      expect(mockCtx.ctx.createGain).toHaveBeenCalledTimes(2);
      // 버퍼 소스는 사용하지 않음
      expect(mockCtx.ctx.createBufferSource).not.toHaveBeenCalled();
    });

    it('Math.random < 0.666이면 물방울(water drop)을 재생해야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      // 물방울: 오실레이터 2개 (메인 + 뚝 공명), 게인 2개 (메인 + 뚝 게인)
      expect(mockCtx.ctx.createOscillator).toHaveBeenCalledTimes(2);
      expect(mockCtx.ctx.createGain).toHaveBeenCalledTimes(2);
      // 버퍼 소스는 사용하지 않음
      expect(mockCtx.ctx.createBufferSource).not.toHaveBeenCalled();
    });

    it('Math.random >= 0.666이면 바람(wind gust)을 재생해야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.8);
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      // 바람: 버퍼 소스 1개, 밴드패스 필터 1개, 게인 1개
      expect(mockCtx.ctx.createBufferSource).toHaveBeenCalledTimes(1);
      expect(mockCtx.ctx.createBiquadFilter).toHaveBeenCalledTimes(1);
      expect(mockCtx.ctx.createGain).toHaveBeenCalledTimes(1);
      // 노이즈 버퍼 생성 (0.25초)
      expect(mockCtx.ctx.createBuffer).toHaveBeenCalledWith(
        1,
        expect.any(Number),
        44100,
      );
      // 오실레이터는 사용하지 않음
      expect(mockCtx.ctx.createOscillator).not.toHaveBeenCalled();
    });

    it('새 지저귐: 오실레이터 주파수가 2000Hz로 시작해야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      // 첫 번째 오실레이터가 메인 (2000Hz)
      const mainOsc = mockCtx.createdOscillators[0];
      expect(mainOsc.frequency.setValueAtTime).toHaveBeenCalledWith(
        2000,
        expect.any(Number),
      );
    });

    it('물방울: 오실레이터 주파수가 1200Hz로 시작해야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      // 첫 번째 오실레이터가 메인 (1200Hz)
      const mainOsc = mockCtx.createdOscillators[0];
      expect(mainOsc.frequency.setValueAtTime).toHaveBeenCalledWith(
        1200,
        expect.any(Number),
      );
    });

    it('바람: 밴드패스 필터 주파수가 1000Hz여야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.8);
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      const bandpass = mockCtx.createdBiquadFilters[0];
      expect(bandpass.frequency.setValueAtTime).toHaveBeenCalledWith(
        1000,
        expect.any(Number),
      );
    });

    it('gainNode가 destination에 연결되어야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      // 새 지저귐: 두 번째 게인 노드가 메인 게인 (destination 연결)
      // createdGainNodes[0] = vibratoGain, createdGainNodes[1] = mainGain
      const mainGain = mockCtx.createdGainNodes[1];
      expect(mainGain.connect).toHaveBeenCalledWith(mockCtx.ctx.destination);
    });

    it('오디오 재생 중 에러 발생 시 예외가 발생하지 않아야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.8);
      mockCtx.ctx.createBufferSource.mockImplementation(() => {
        throw new Error('Audio playback failed');
      });

      const { result } = renderHook(() => useSound());

      expect(() => {
        act(() => { result.current.playPopSound(); });
      }).not.toThrow();
    });

    it('노이즈 버퍼는 캐시되어 바람 효과음 두 번째 호출 시 재생성하지 않아야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.8);
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });
      act(() => { result.current.playPopSound(); });

      // createBuffer는 한 번만 호출 (캐시 재사용)
      expect(mockCtx.ctx.createBuffer).toHaveBeenCalledTimes(1);
    });

    it('새 지저귐: 게인 엔벨로프가 0.001에서 시작하여 0.12까지 상승 후 감쇠해야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      // createdGainNodes[0] = vibratoGain, createdGainNodes[1] = mainGain
      const mainGain = mockCtx.createdGainNodes[1];
      expect(mainGain.gain.setValueAtTime).toHaveBeenCalledWith(0.001, expect.any(Number));
      expect(mainGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.12, expect.any(Number));
      expect(mainGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.001, expect.any(Number));
    });

    it('물방울: 메인 게인이 0.15에서 시작해야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      // createdGainNodes[0] = mainGain (물방울은 vibratoGain 없음)
      const mainGain = mockCtx.createdGainNodes[0];
      expect(mainGain.gain.setValueAtTime).toHaveBeenCalledWith(0.15, expect.any(Number));
    });

    it('바람: 게인 엔벨로프가 0.001에서 시작하여 0.10까지 상승 후 감쇠해야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.8);
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      const gainNode = mockCtx.createdGainNodes[0];
      expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.001, expect.any(Number));
      expect(gainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.10, expect.any(Number));
      expect(gainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.001, expect.any(Number));
    });
  });

  // ----------------------------------------------------------
  // 3. 음소거 상태 관리
  // ----------------------------------------------------------
  describe('음소거 상태 관리', () => {
    it('초기 상태는 기본값 false (음소거 해제)이어야 한다', () => {
      const { result } = renderHook(() => useSound());
      expect(result.current.isMuted).toBe(false);
    });

    it('localStorage에 true가 저장되어 있으면 초기 상태가 true여야 한다', () => {
      localStorage.setItem('aec-bg-sound-muted', 'true');
      const { result } = renderHook(() => useSound());
      expect(result.current.isMuted).toBe(true);
    });

    it('localStorage에 false가 저장되어 있으면 초기 상태가 false여야 한다', () => {
      localStorage.setItem('aec-bg-sound-muted', 'false');
      const { result } = renderHook(() => useSound());
      expect(result.current.isMuted).toBe(false);
    });

    it('음소거 상태에서 playPopSound 호출 시 AudioContext가 생성되지 않아야 한다', () => {
      localStorage.setItem('aec-bg-sound-muted', 'true');
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      expect(mockAudioContextConstructor).not.toHaveBeenCalled();
      expect(mockCtx.ctx.createBufferSource).not.toHaveBeenCalled();
      expect(mockCtx.ctx.createOscillator).not.toHaveBeenCalled();
    });

    it('toggleMute 호출 시 상태가 반전되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      expect(result.current.isMuted).toBe(false);
      act(() => { result.current.toggleMute(); });
      expect(result.current.isMuted).toBe(true);
      act(() => { result.current.toggleMute(); });
      expect(result.current.isMuted).toBe(false);
    });

    it('toggleMute 호출 시 localStorage에 값이 저장되어야 한다', () => {
      const { result } = renderHook(() => useSound());
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      act(() => { result.current.toggleMute(); });

      expect(setItemSpy).toHaveBeenCalledWith('aec-bg-sound-muted', 'true');
    });

    it('음소거 해제 후 playPopSound 호출 시 정상 재생되어야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      localStorage.setItem('aec-bg-sound-muted', 'true');
      const { result } = renderHook(() => useSound());

      expect(result.current.isMuted).toBe(true);

      act(() => { result.current.toggleMute(); });
      expect(result.current.isMuted).toBe(false);

      act(() => { result.current.playPopSound(); });

      // 새 지저귐이 재생되어야 한다 (오실레이터 2개 생성)
      expect(mockCtx.ctx.createOscillator).toHaveBeenCalledTimes(2);
    });
  });

  // ----------------------------------------------------------
  // 4. localStorage 영속성
  // ----------------------------------------------------------
  describe('localStorage 영속성', () => {
    it('toggleMute 시 localStorage.setItem이 호출되어야 한다', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useSound());

      act(() => { result.current.toggleMute(); });

      expect(setItemSpy).toHaveBeenCalled();
    });

    it('localStorage 키는 aec-bg-sound-muted여야 한다', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useSound());

      act(() => { result.current.toggleMute(); });

      expect(setItemSpy).toHaveBeenCalledWith(
        'aec-bg-sound-muted',
        expect.any(String),
      );
    });

    it('toggleMute로 true 상태 저장 시 문자열 true가 저장되어야 한다', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useSound());

      act(() => { result.current.toggleMute(); });

      expect(setItemSpy).toHaveBeenCalledWith('aec-bg-sound-muted', 'true');
    });

    it('toggleMute로 false 상태 저장 시 문자열 false가 저장되어야 한다', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useSound());

      act(() => { result.current.toggleMute(); });
      act(() => { result.current.toggleMute(); });

      expect(setItemSpy).toHaveBeenLastCalledWith('aec-bg-sound-muted', 'false');
    });

    it('localStorage 접근 실패 시 예외가 발생하지 않아야 한다 (프라이빗 브라우징)', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const { result } = renderHook(() => useSound());

      expect(() => {
        act(() => { result.current.toggleMute(); });
      }).not.toThrow();
    });

    it('localStorage.getItem 실패 시 기본값 false를 반환해야 한다', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      const { result } = renderHook(() => useSound());
      expect(result.current.isMuted).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 5. iOS Safari 호환성
  // ----------------------------------------------------------
  describe('iOS Safari 호환성', () => {
    it('AudioContext state가 suspended이면 resume()이 호출되어야 한다', () => {
      const suspendedCtx = createMockAudioContext('suspended');
      mockAudioContextConstructor.mockImplementation(function (this: unknown) {
        return suspendedCtx.ctx;
      });

      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      expect(suspendedCtx.ctx.resume).toHaveBeenCalledTimes(1);
    });

    it('AudioContext state가 running이면 resume()이 호출되지 않아야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      expect(mockCtx.ctx.resume).not.toHaveBeenCalled();
    });

    it('AudioContext state가 closed이면 resume()이 호출되지 않아야 한다', () => {
      const closedCtx = createMockAudioContext('closed');
      mockAudioContextConstructor.mockImplementation(function (this: unknown) {
        return closedCtx.ctx;
      });

      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      expect(closedCtx.ctx.resume).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 6. 반환값 구조 검증
  // ----------------------------------------------------------
  describe('반환값 구조 검증', () => {
    it('playPopSound, isMuted, toggleMute, startAmbient, stopAmbient, isAmbientPlaying을 반환해야 한다', () => {
      const { result } = renderHook(() => useSound());

      expect(result.current).toHaveProperty('playPopSound');
      expect(result.current).toHaveProperty('isMuted');
      expect(result.current).toHaveProperty('toggleMute');
      expect(result.current).toHaveProperty('startAmbient');
      expect(result.current).toHaveProperty('stopAmbient');
      expect(result.current).toHaveProperty('isAmbientPlaying');
    });

    it('playPopSound는 함수여야 한다', () => {
      const { result } = renderHook(() => useSound());
      expect(typeof result.current.playPopSound).toBe('function');
    });

    it('isMuted는 boolean이어야 한다', () => {
      const { result } = renderHook(() => useSound());
      expect(typeof result.current.isMuted).toBe('boolean');
    });

    it('toggleMute는 함수여야 한다', () => {
      const { result } = renderHook(() => useSound());
      expect(typeof result.current.toggleMute).toBe('function');
    });

    it('startAmbient는 함수여야 한다', () => {
      const { result } = renderHook(() => useSound());
      expect(typeof result.current.startAmbient).toBe('function');
    });

    it('stopAmbient는 함수여야 한다', () => {
      const { result } = renderHook(() => useSound());
      expect(typeof result.current.stopAmbient).toBe('function');
    });

    it('isAmbientPlaying은 boolean이어야 한다', () => {
      const { result } = renderHook(() => useSound());
      expect(typeof result.current.isAmbientPlaying).toBe('boolean');
    });
  });

  // ----------------------------------------------------------
  // 7. 앰비언트 바람 사운드
  // ----------------------------------------------------------
  describe('앰비언트 바람 사운드', () => {
    it('startAmbient 호출 시 앰비언트가 재생되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      expect(result.current.isAmbientPlaying).toBe(false);

      act(() => { result.current.startAmbient(); });

      expect(result.current.isAmbientPlaying).toBe(true);
    });

    it('startAmbient 호출 시 루프 노이즈 소스가 생성되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => { result.current.startAmbient(); });

      expect(mockCtx.ctx.createBufferSource).toHaveBeenCalledTimes(1);
      // 루프 설정 확인
      const source = mockCtx.createdBufferSources[0];
      expect(source.loop).toBe(true);
    });

    it('startAmbient 호출 시 2초 앰비언트 노이즈 버퍼가 생성되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => { result.current.startAmbient(); });

      // 앰비언트 버퍼: 1채널, ~2초 (44100 * 2 = 88200), 44100Hz
      expect(mockCtx.ctx.createBuffer).toHaveBeenCalledWith(
        1,
        expect.any(Number),
        44100,
      );
    });

    it('startAmbient 호출 시 LFO 오실레이터가 생성되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => { result.current.startAmbient(); });

      // LFO 오실레이터 1개
      expect(mockCtx.ctx.createOscillator).toHaveBeenCalledTimes(1);
      const lfo = mockCtx.createdOscillators[0];
      expect(lfo.frequency.setValueAtTime).toHaveBeenCalledWith(
        1 / 3.5,
        expect.any(Number),
      );
    });

    it('startAmbient 호출 시 로우패스 + 밴드패스 필터가 생성되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => { result.current.startAmbient(); });

      // 2개 필터 (로우패스 + 밴드패스)
      expect(mockCtx.ctx.createBiquadFilter).toHaveBeenCalledTimes(2);
    });

    it('startAmbient 호출 시 게인 노드가 destination에 연결되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => { result.current.startAmbient(); });

      // 게인 2개 (메인 게인 + LFO 깊이 게인)
      expect(mockCtx.ctx.createGain).toHaveBeenCalledTimes(2);
      // 메인 게인 노드가 destination에 연결
      const mainGain = mockCtx.createdGainNodes[0];
      expect(mainGain.connect).toHaveBeenCalledWith(mockCtx.ctx.destination);
    });

    it('stopAmbient 호출 시 앰비언트가 정지되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => { result.current.startAmbient(); });
      expect(result.current.isAmbientPlaying).toBe(true);

      act(() => { result.current.stopAmbient(); });
      expect(result.current.isAmbientPlaying).toBe(false);
    });

    it('이미 재생 중이면 startAmbient 중복 호출이 무시되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => { result.current.startAmbient(); });
      act(() => { result.current.startAmbient(); });

      // createBufferSource는 한 번만 호출 (중복 방지)
      expect(mockCtx.ctx.createBufferSource).toHaveBeenCalledTimes(1);
    });

    it('음소거 상태에서 startAmbient 호출 시 실제로 재생하지 않아야 한다', () => {
      localStorage.setItem('aec-bg-sound-muted', 'true');
      const { result } = renderHook(() => useSound());

      act(() => { result.current.startAmbient(); });

      // 음소거 상태에서는 AudioContext 생성하지 않음
      expect(mockCtx.ctx.createBufferSource).not.toHaveBeenCalled();
      expect(result.current.isAmbientPlaying).toBe(false);
    });

    it('음소거 해제 시 앰비언트가 자동 재시작되어야 한다', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useSound());

      // 1) 앰비언트 시작
      act(() => { result.current.startAmbient(); });
      expect(result.current.isAmbientPlaying).toBe(true);

      // 2) 음소거 활성화 -> 앰비언트 정지
      act(() => { result.current.toggleMute(); });
      expect(result.current.isMuted).toBe(true);
      expect(result.current.isAmbientPlaying).toBe(false);

      // 3) 음소거 해제 -> 앰비언트 자동 재시작 (setTimeout 사용)
      act(() => { result.current.toggleMute(); });
      expect(result.current.isMuted).toBe(false);

      // setTimeout 콜백 실행
      act(() => { vi.runAllTimers(); });

      expect(result.current.isAmbientPlaying).toBe(true);

      vi.useRealTimers();
    });

    it('stopAmbient 후 음소거 토글해도 앰비언트가 재시작되지 않아야 한다', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useSound());

      // 1) 앰비언트 시작
      act(() => { result.current.startAmbient(); });
      expect(result.current.isAmbientPlaying).toBe(true);

      // 2) 명시적 정지 (ambientWanted = false)
      act(() => { result.current.stopAmbient(); });
      expect(result.current.isAmbientPlaying).toBe(false);

      // 3) 음소거 활성화 후 해제
      act(() => { result.current.toggleMute(); });
      act(() => { result.current.toggleMute(); });
      act(() => { vi.runAllTimers(); });

      // stopAmbient로 명시적 정지했으므로 재시작되지 않아야 한다
      expect(result.current.isAmbientPlaying).toBe(false);

      vi.useRealTimers();
    });
  });
});
