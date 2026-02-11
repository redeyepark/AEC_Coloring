// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSound } from './useSound';

// ============================================================
// Web Audio API Mock 설정
// ============================================================

/** OscillatorNode Mock 생성 헬퍼 */
function createMockOscillator() {
  return {
    type: 'sine' as OscillatorType,
    frequency: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
}

/** GainNode Mock 생성 헬퍼 */
function createMockGainNode() {
  return {
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  };
}

/** AudioContext Mock 생성 헬퍼 */
function createMockAudioContext(state: AudioContextState = 'running') {
  const oscillator = createMockOscillator();
  const gainNode = createMockGainNode();

  const ctx = {
    state,
    currentTime: 0,
    destination: {},
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => gainNode),
    resume: vi.fn(() => Promise.resolve()),
  };

  return { ctx, oscillator, gainNode };
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
    // new 키워드로 호출되므로 function 키워드를 사용해야 한다
    // (화살표 함수는 생성자로 사용 불가)
    mockAudioContextConstructor = vi.fn(function (this: unknown) {
      return mockCtx.ctx;
    });

    // window.AudioContext를 Mock으로 교체
    vi.stubGlobal('AudioContext', mockAudioContextConstructor);

    // webkitAudioContext 제거 (기본 테스트에서는 불필요)
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

      // 훅 초기화 직후에는 AudioContext가 생성되지 않아야 한다
      expect(mockAudioContextConstructor).not.toHaveBeenCalled();

      // playPopSound 호출 시 AudioContext가 생성되어야 한다
      act(() => {
        result.current.playPopSound();
      });

      expect(mockAudioContextConstructor).toHaveBeenCalledTimes(1);
    });

    it('AudioContext 인스턴스는 하나만 생성되어야 한다 (싱글턴)', () => {
      const { result } = renderHook(() => useSound());

      // playPopSound를 여러 번 호출해도 AudioContext는 한 번만 생성
      act(() => {
        result.current.playPopSound();
      });
      act(() => {
        result.current.playPopSound();
      });
      act(() => {
        result.current.playPopSound();
      });

      expect(mockAudioContextConstructor).toHaveBeenCalledTimes(1);
    });

    it('webkitAudioContext 폴백이 동작해야 한다', () => {
      // window.AudioContext 제거
      vi.stubGlobal('AudioContext', undefined);

      // webkitAudioContext를 Mock으로 설정
      const webkitMock = vi.fn(function (this: unknown) {
        return mockCtx.ctx;
      });
      (window as unknown as Record<string, unknown>).webkitAudioContext = webkitMock;

      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.playPopSound();
      });

      expect(webkitMock).toHaveBeenCalledTimes(1);
    });

    it('AudioContext 생성 실패 시 예외가 발생하지 않아야 한다', () => {
      // AudioContext 생성자에서 에러를 throw하도록 설정
      mockAudioContextConstructor.mockImplementation(function (this: unknown) {
        throw new Error('AudioContext not supported');
      });

      const { result } = renderHook(() => useSound());

      // 예외 없이 정상 동작해야 한다
      expect(() => {
        act(() => {
          result.current.playPopSound();
        });
      }).not.toThrow();
    });

    it('AudioContext와 webkitAudioContext 모두 없으면 null을 반환해야 한다', () => {
      // 두 생성자 모두 제거
      vi.stubGlobal('AudioContext', undefined);
      if ('webkitAudioContext' in window) {
        delete (window as unknown as Record<string, unknown>).webkitAudioContext;
      }

      const { result } = renderHook(() => useSound());

      // 예외 없이 정상 동작 (OscillatorNode 생성 시도 없음)
      expect(() => {
        act(() => {
          result.current.playPopSound();
        });
      }).not.toThrow();

      expect(mockCtx.ctx.createOscillator).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 2. playPopSound 효과음 재생
  // ----------------------------------------------------------
  describe('playPopSound 효과음 재생', () => {
    it('음소거 해제 상태에서 호출 시 OscillatorNode가 생성되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.playPopSound();
      });

      expect(mockCtx.ctx.createOscillator).toHaveBeenCalledTimes(1);
    });

    it('OscillatorNode type이 sine이어야 한다', () => {
      // 구현에서 oscillator.type = 'sine'을 설정하므로
      // createOscillator가 반환하는 mock의 type이 설정되는지 확인
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.playPopSound();
      });

      // 구현 코드에서 oscillator.type = 'sine'을 직접 대입하므로
      // mock 오실레이터의 type 속성이 'sine'이어야 한다
      expect(mockCtx.oscillator.type).toBe('sine');
    });

    it('주파수가 800Hz에서 시작해야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.playPopSound();
      });

      expect(mockCtx.oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        800,
        expect.any(Number)
      );
    });

    it('주파수가 400Hz로 하강해야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.playPopSound();
      });

      expect(
        mockCtx.oscillator.frequency.exponentialRampToValueAtTime
      ).toHaveBeenCalledWith(400, expect.any(Number));
    });

    it('GainNode gain이 0.3에서 시작해야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.playPopSound();
      });

      expect(mockCtx.gainNode.gain.setValueAtTime).toHaveBeenCalledWith(
        0.3,
        expect.any(Number)
      );
    });

    it('GainNode gain이 0.001로 감쇠해야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.playPopSound();
      });

      expect(
        mockCtx.gainNode.gain.exponentialRampToValueAtTime
      ).toHaveBeenCalledWith(0.001, expect.any(Number));
    });

    it('oscillator가 gainNode에 연결되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.playPopSound();
      });

      expect(mockCtx.oscillator.connect).toHaveBeenCalledWith(mockCtx.gainNode);
    });

    it('gainNode가 destination에 연결되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.playPopSound();
      });

      expect(mockCtx.gainNode.connect).toHaveBeenCalledWith(
        mockCtx.ctx.destination
      );
    });

    it('oscillator.start()가 호출되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.playPopSound();
      });

      expect(mockCtx.oscillator.start).toHaveBeenCalledWith(expect.any(Number));
    });

    it('oscillator.stop()이 호출되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.playPopSound();
      });

      expect(mockCtx.oscillator.stop).toHaveBeenCalledWith(expect.any(Number));
    });

    it('오디오 재생 중 에러 발생 시 예외가 발생하지 않아야 한다 (graceful degradation)', () => {
      // createOscillator에서 에러를 throw
      mockCtx.ctx.createOscillator.mockImplementation(() => {
        throw new Error('Audio playback failed');
      });

      const { result } = renderHook(() => useSound());

      expect(() => {
        act(() => {
          result.current.playPopSound();
        });
      }).not.toThrow();
    });

    it('GainNode 생성 시 createGain이 호출되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.playPopSound();
      });

      expect(mockCtx.ctx.createGain).toHaveBeenCalledTimes(1);
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

      act(() => {
        result.current.playPopSound();
      });

      // 음소거 상태이므로 AudioContext 생성 시도가 없어야 한다
      expect(mockAudioContextConstructor).not.toHaveBeenCalled();
      expect(mockCtx.ctx.createOscillator).not.toHaveBeenCalled();
    });

    it('toggleMute 호출 시 상태가 반전되어야 한다', () => {
      const { result } = renderHook(() => useSound());

      // 초기 상태: false
      expect(result.current.isMuted).toBe(false);

      // 첫 번째 토글: false -> true
      act(() => {
        result.current.toggleMute();
      });
      expect(result.current.isMuted).toBe(true);

      // 두 번째 토글: true -> false
      act(() => {
        result.current.toggleMute();
      });
      expect(result.current.isMuted).toBe(false);
    });

    it('toggleMute 호출 시 localStorage에 값이 저장되어야 한다', () => {
      const { result } = renderHook(() => useSound());
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      act(() => {
        result.current.toggleMute();
      });

      expect(setItemSpy).toHaveBeenCalledWith('aec-bg-sound-muted', 'true');
    });

    it('음소거 해제 후 playPopSound 호출 시 정상 재생되어야 한다', () => {
      localStorage.setItem('aec-bg-sound-muted', 'true');

      const { result } = renderHook(() => useSound());

      // 음소거 상태 확인
      expect(result.current.isMuted).toBe(true);

      // 음소거 해제
      act(() => {
        result.current.toggleMute();
      });
      expect(result.current.isMuted).toBe(false);

      // playPopSound 호출 시 정상 재생
      act(() => {
        result.current.playPopSound();
      });

      expect(mockCtx.ctx.createOscillator).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------------------------
  // 4. localStorage 영속성
  // ----------------------------------------------------------
  describe('localStorage 영속성', () => {
    it('toggleMute 시 localStorage.setItem이 호출되어야 한다', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.toggleMute();
      });

      expect(setItemSpy).toHaveBeenCalled();
    });

    it('localStorage 키는 aec-bg-sound-muted여야 한다', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.toggleMute();
      });

      expect(setItemSpy).toHaveBeenCalledWith(
        'aec-bg-sound-muted',
        expect.any(String)
      );
    });

    it('toggleMute로 true 상태 저장 시 문자열 true가 저장되어야 한다', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useSound());

      // false -> true
      act(() => {
        result.current.toggleMute();
      });

      expect(setItemSpy).toHaveBeenCalledWith('aec-bg-sound-muted', 'true');
    });

    it('toggleMute로 false 상태 저장 시 문자열 false가 저장되어야 한다', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const { result } = renderHook(() => useSound());

      // false -> true -> false
      act(() => {
        result.current.toggleMute();
      });
      act(() => {
        result.current.toggleMute();
      });

      expect(setItemSpy).toHaveBeenLastCalledWith(
        'aec-bg-sound-muted',
        'false'
      );
    });

    it('localStorage 접근 실패 시 예외가 발생하지 않아야 한다 (프라이빗 브라우징)', () => {
      // localStorage.setItem이 에러를 throw하도록 설정
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const { result } = renderHook(() => useSound());

      // 예외 없이 정상 동작해야 한다
      expect(() => {
        act(() => {
          result.current.toggleMute();
        });
      }).not.toThrow();
    });

    it('localStorage.getItem 실패 시 기본값 false를 반환해야 한다', () => {
      // localStorage.getItem이 에러를 throw하도록 설정
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
      // suspended 상태의 AudioContext 생성
      const suspendedCtx = createMockAudioContext('suspended');
      mockAudioContextConstructor.mockImplementation(function (this: unknown) {
        return suspendedCtx.ctx;
      });

      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.playPopSound();
      });

      expect(suspendedCtx.ctx.resume).toHaveBeenCalledTimes(1);
    });

    it('AudioContext state가 running이면 resume()이 호출되지 않아야 한다', () => {
      // running 상태 (기본값)
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.playPopSound();
      });

      expect(mockCtx.ctx.resume).not.toHaveBeenCalled();
    });

    it('AudioContext state가 closed이면 resume()이 호출되지 않아야 한다', () => {
      // closed 상태의 AudioContext 생성
      const closedCtx = createMockAudioContext('closed');
      mockAudioContextConstructor.mockImplementation(function (this: unknown) {
        return closedCtx.ctx;
      });

      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.playPopSound();
      });

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
