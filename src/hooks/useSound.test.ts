// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSound } from './useSound';

// ============================================================
// Web Audio API Mock 설정 (크래파스 노이즈 기반)
// ============================================================

/** BufferSourceNode Mock 생성 헬퍼 */
function createMockBufferSource() {
  return {
    buffer: null as AudioBuffer | null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
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
  };
}

/** AudioBuffer Mock */
function createMockAudioBuffer() {
  const channelData = new Float32Array(4410); // ~0.1초 분량
  return {
    getChannelData: vi.fn(() => channelData),
    length: 4410,
    sampleRate: 44100,
    numberOfChannels: 1,
    duration: 0.1,
  };
}

/** AudioContext Mock 생성 헬퍼 */
function createMockAudioContext(state: AudioContextState = 'running') {
  const bufferSource = createMockBufferSource();
  const biquadFilters: ReturnType<typeof createMockBiquadFilter>[] = [];
  const gainNode = createMockGainNode();
  const audioBuffer = createMockAudioBuffer();

  const ctx = {
    state,
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    createBufferSource: vi.fn(() => createMockBufferSource()),
    createBuffer: vi.fn(() => audioBuffer),
    createBiquadFilter: vi.fn(() => {
      const filter = createMockBiquadFilter();
      biquadFilters.push(filter);
      return filter;
    }),
    createGain: vi.fn(() => createMockGainNode()),
    // 구버전 호환: 오실레이터 관련 (사용하지 않지만 일부 테스트에서 참조)
    createOscillator: vi.fn(),
    resume: vi.fn(() => Promise.resolve()),
  };

  return { ctx, bufferSource, biquadFilters, gainNode, audioBuffer };
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
    });
  });

  // ----------------------------------------------------------
  // 2. playPopSound 크래파스 효과음 재생
  // ----------------------------------------------------------
  describe('playPopSound 크래파스 효과음 재생', () => {
    it('호출 시 노이즈 버퍼를 생성해야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      expect(mockCtx.ctx.createBuffer).toHaveBeenCalledWith(
        1,
        expect.any(Number),
        44100
      );
    });

    it('노이즈 버퍼는 캐시되어 두 번째 호출 시 재생성하지 않아야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });
      act(() => { result.current.playPopSound(); });

      // createBuffer는 한 번만 호출 (캐시 재사용)
      expect(mockCtx.ctx.createBuffer).toHaveBeenCalledTimes(1);
    });

    it('BufferSourceNode가 생성되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      expect(mockCtx.ctx.createBufferSource).toHaveBeenCalledTimes(1);
    });

    it('밴드패스 필터와 하이패스 필터가 생성되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      // 밴드패스 + 하이패스 = 2개 필터
      expect(mockCtx.ctx.createBiquadFilter).toHaveBeenCalledTimes(2);
    });

    it('GainNode가 생성되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => { result.current.playPopSound(); });

      expect(mockCtx.ctx.createGain).toHaveBeenCalledTimes(1);
    });

    it('게인 엔벨로프가 빠른 어택 후 감쇠해야 한다', () => {
      const { result } = renderHook(() => useSound());
      // createGain이 반환하는 mock의 gain 메서드를 추적
      const mockGain = createMockGainNode();
      mockCtx.ctx.createGain.mockReturnValue(mockGain);

      act(() => { result.current.playPopSound(); });

      // 초기값 0.001 설정
      expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(
        0.001,
        expect.any(Number)
      );
      // 빠른 어택: 0.18까지 상승
      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.18,
        expect.any(Number)
      );
      // 감쇠: 0.001로 하강
      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.001,
        expect.any(Number)
      );
    });

    it('gainNode가 destination에 연결되어야 한다', () => {
      const { result } = renderHook(() => useSound());
      const mockGain = createMockGainNode();
      mockCtx.ctx.createGain.mockReturnValue(mockGain);

      act(() => { result.current.playPopSound(); });

      expect(mockGain.connect).toHaveBeenCalledWith(mockCtx.ctx.destination);
    });

    it('노이즈 소스의 start()와 stop()이 호출되어야 한다', () => {
      const { result } = renderHook(() => useSound());
      const mockSource = createMockBufferSource();
      mockCtx.ctx.createBufferSource.mockReturnValue(mockSource);

      act(() => { result.current.playPopSound(); });

      expect(mockSource.start).toHaveBeenCalledWith(expect.any(Number));
      expect(mockSource.stop).toHaveBeenCalledWith(expect.any(Number));
    });

    it('오디오 재생 중 에러 발생 시 예외가 발생하지 않아야 한다', () => {
      mockCtx.ctx.createBufferSource.mockImplementation(() => {
        throw new Error('Audio playback failed');
      });

      const { result } = renderHook(() => useSound());

      expect(() => {
        act(() => { result.current.playPopSound(); });
      }).not.toThrow();
    });

    it('밴드패스 필터 중심 주파수가 3500Hz여야 한다', () => {
      const { result } = renderHook(() => useSound());
      const filters: ReturnType<typeof createMockBiquadFilter>[] = [];
      mockCtx.ctx.createBiquadFilter.mockImplementation(() => {
        const f = createMockBiquadFilter();
        filters.push(f);
        return f;
      });

      act(() => { result.current.playPopSound(); });

      // 첫 번째 필터가 밴드패스
      expect(filters[0].frequency.setValueAtTime).toHaveBeenCalledWith(
        3500,
        expect.any(Number)
      );
    });

    it('하이패스 필터 주파수가 1500Hz여야 한다', () => {
      const { result } = renderHook(() => useSound());
      const filters: ReturnType<typeof createMockBiquadFilter>[] = [];
      mockCtx.ctx.createBiquadFilter.mockImplementation(() => {
        const f = createMockBiquadFilter();
        filters.push(f);
        return f;
      });

      act(() => { result.current.playPopSound(); });

      // 두 번째 필터가 하이패스
      expect(filters[1].frequency.setValueAtTime).toHaveBeenCalledWith(
        1500,
        expect.any(Number)
      );
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
      localStorage.setItem('aec-bg-sound-muted', 'true');
      const { result } = renderHook(() => useSound());

      expect(result.current.isMuted).toBe(true);

      act(() => { result.current.toggleMute(); });
      expect(result.current.isMuted).toBe(false);

      act(() => { result.current.playPopSound(); });

      expect(mockCtx.ctx.createBufferSource).toHaveBeenCalledTimes(1);
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
        expect.any(String)
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
    it('playPopSound, isMuted, toggleMute를 반환해야 한다', () => {
      const { result } = renderHook(() => useSound());

      expect(result.current).toHaveProperty('playPopSound');
      expect(result.current).toHaveProperty('isMuted');
      expect(result.current).toHaveProperty('toggleMute');
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
  });
});
