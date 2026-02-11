import { useState, useCallback, useRef, useMemo } from 'react';

// 줌 상태 인터페이스
interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

// 핀치 줌 추적 데이터
interface PinchData {
  initialDistance: number;
  initialScale: number;
  centerX: number;
  centerY: number;
}

// 드래그(팬) 추적 데이터
interface DragData {
  startX: number;
  startY: number;
  startTranslateX: number;
  startTranslateY: number;
}

// 줌 설정 상수
const MIN_SCALE = 1;
const MAX_SCALE = 3;
const DOUBLE_TAP_SCALE = 2;
const DOUBLE_TAP_DELAY = 300; // 더블탭 감지 시간(ms)
const TAP_MOVE_THRESHOLD = 5; // 탭으로 인정할 최대 이동 거리(px)

/**
 * 캔버스 줌 훅 - 핀치 줌, 더블탭 줌, 팬 제스처를 처리
 *
 * @param containerRef - 줌 컨테이너의 ref (바운더리 계산용)
 * @returns 줌 상태, 리셋 함수, 컨테이너 스타일, 이벤트 핸들러
 */
export function useCanvasZoom(containerRef: React.RefObject<HTMLElement | null>) {
  const [zoomState, setZoomState] = useState<ZoomState>({
    scale: MIN_SCALE,
    translateX: 0,
    translateY: 0,
  });

  // 제스처 감지용 ref (렌더링과 무관한 값)
  const pinchRef = useRef<PinchData | null>(null);
  const dragRef = useRef<DragData | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const gestureActiveRef = useRef<boolean>(false); // 제스처 진행 중 플래그
  const currentScaleRef = useRef<number>(MIN_SCALE); // 현재 스케일 ref (이벤트 핸들러에서 최신값 참조)
  const currentTranslateRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 두 터치 포인트 간 거리 계산
  const getTouchDistance = useCallback((t1: React.Touch, t2: React.Touch): number => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // 바운더리 제한 적용
  const clampTranslate = useCallback((tx: number, ty: number, scale: number): { x: number; y: number } => {
    if (scale <= MIN_SCALE) {
      return { x: 0, y: 0 };
    }

    const container = containerRef.current;
    if (!container) {
      return { x: tx, y: ty };
    }

    const rect = container.getBoundingClientRect();
    // 스케일 적용 후 컨텐츠가 컨테이너를 초과하는 범위
    const maxTranslateX = (rect.width * (scale - 1)) / (2 * scale);
    const maxTranslateY = (rect.height * (scale - 1)) / (2 * scale);

    return {
      x: Math.max(-maxTranslateX, Math.min(maxTranslateX, tx)),
      y: Math.max(-maxTranslateY, Math.min(maxTranslateY, ty)),
    };
  }, [containerRef]);

  // 줌 리셋
  const resetZoom = useCallback(() => {
    setZoomState({ scale: MIN_SCALE, translateX: 0, translateY: 0 });
    currentScaleRef.current = MIN_SCALE;
    currentTranslateRef.current = { x: 0, y: 0 };
  }, []);

  // 제스처가 진행 중인지 확인 (외부에서 클릭 억제 용도)
  const isGestureActive = useCallback((): boolean => {
    return gestureActiveRef.current;
  }, []);

  // 터치 시작
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;

    if (touches.length === 2) {
      // 핀치 줌 시작 - 즉시 줌 모드 진입
      e.preventDefault();
      gestureActiveRef.current = true;
      dragRef.current = null; // 드래그 취소

      const distance = getTouchDistance(touches[0], touches[1]);
      pinchRef.current = {
        initialDistance: distance,
        initialScale: currentScaleRef.current,
        centerX: (touches[0].clientX + touches[1].clientX) / 2,
        centerY: (touches[0].clientY + touches[1].clientY) / 2,
      };
    } else if (touches.length === 1) {
      // 단일 터치 - 탭 vs 드래그 추적 시작
      touchStartPosRef.current = {
        x: touches[0].clientX,
        y: touches[0].clientY,
      };

      // 줌 상태에서만 드래그(팬) 가능
      if (currentScaleRef.current > MIN_SCALE) {
        dragRef.current = {
          startX: touches[0].clientX,
          startY: touches[0].clientY,
          startTranslateX: currentTranslateRef.current.x,
          startTranslateY: currentTranslateRef.current.y,
        };
      }
    }
  }, [getTouchDistance]);

  // 터치 이동
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;

    if (touches.length === 2 && pinchRef.current) {
      // 핀치 줌 처리
      e.preventDefault();
      const distance = getTouchDistance(touches[0], touches[1]);
      const scaleRatio = distance / pinchRef.current.initialDistance;
      let newScale = pinchRef.current.initialScale * scaleRatio;

      // 스케일 클램핑
      newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

      const clamped = clampTranslate(
        currentTranslateRef.current.x,
        currentTranslateRef.current.y,
        newScale
      );

      currentScaleRef.current = newScale;
      currentTranslateRef.current = clamped;

      setZoomState({
        scale: newScale,
        translateX: clamped.x,
        translateY: clamped.y,
      });
    } else if (touches.length === 1 && dragRef.current && currentScaleRef.current > MIN_SCALE) {
      // 팬(드래그) 처리 - 줌 상태에서만
      const dx = touches[0].clientX - dragRef.current.startX;
      const dy = touches[0].clientY - dragRef.current.startY;

      // 이동 거리가 임계값 초과 시 제스처로 분류
      const totalMove = Math.sqrt(dx * dx + dy * dy);
      if (totalMove > TAP_MOVE_THRESHOLD) {
        e.preventDefault();
        gestureActiveRef.current = true;

        const scale = currentScaleRef.current;
        const newTx = dragRef.current.startTranslateX + dx / scale;
        const newTy = dragRef.current.startTranslateY + dy / scale;
        const clamped = clampTranslate(newTx, newTy, scale);

        currentTranslateRef.current = clamped;
        setZoomState(prev => ({
          ...prev,
          translateX: clamped.x,
          translateY: clamped.y,
        }));
      }
    } else if (touches.length === 1 && touchStartPosRef.current) {
      // 줌 안 된 상태에서 이동 거리 확인 (탭 vs 스크롤 구분)
      const dx = touches[0].clientX - touchStartPosRef.current.x;
      const dy = touches[0].clientY - touchStartPosRef.current.y;
      const totalMove = Math.sqrt(dx * dx + dy * dy);

      if (totalMove > TAP_MOVE_THRESHOLD) {
        gestureActiveRef.current = true;
      }
    }
  }, [getTouchDistance, clampTranslate]);

  // 터치 종료
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;

    // 핀치가 끝났지만 아직 손가락 하나가 남아있는 경우
    if (pinchRef.current && touches.length < 2) {
      pinchRef.current = null;

      // MIN_SCALE 근처면 리셋
      if (currentScaleRef.current <= MIN_SCALE + 0.05) {
        resetZoom();
      }

      // 잠시 후 제스처 플래그 해제 (클릭 이벤트가 먼저 처리되도록)
      setTimeout(() => {
        gestureActiveRef.current = false;
      }, 50);
      return;
    }

    // 단일 터치 종료
    if (touches.length === 0) {
      dragRef.current = null;

      if (!gestureActiveRef.current && touchStartPosRef.current) {
        // 제스처가 아닌 경우 - 더블탭 확인
        const now = Date.now();
        const timeSinceLastTap = now - lastTapTimeRef.current;

        if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
          // 더블탭 감지 - 줌 토글
          e.preventDefault();
          lastTapTimeRef.current = 0; // 연속 더블탭 방지

          if (currentScaleRef.current > MIN_SCALE) {
            // 줌 해제
            resetZoom();
          } else {
            // 2배 줌
            const newScale = DOUBLE_TAP_SCALE;
            currentScaleRef.current = newScale;
            currentTranslateRef.current = { x: 0, y: 0 };
            setZoomState({
              scale: newScale,
              translateX: 0,
              translateY: 0,
            });
          }

          gestureActiveRef.current = true;
          setTimeout(() => {
            gestureActiveRef.current = false;
          }, 50);
        } else {
          // 단일 탭 - 색칠 클릭 이벤트로 전달 (아무 것도 하지 않음)
          lastTapTimeRef.current = now;
        }
      } else {
        // 제스처 완료 후 플래그 해제
        setTimeout(() => {
          gestureActiveRef.current = false;
        }, 50);
      }

      touchStartPosRef.current = null;
    }
  }, [resetZoom]);

  // 줌 여부
  const isZoomed = zoomState.scale > MIN_SCALE;

  // CSS 트랜스폼 스타일 (메모이제이션)
  const containerStyle = useMemo(() => {
    if (zoomState.scale <= MIN_SCALE) {
      return {
        transform: 'none',
        transformOrigin: 'center center',
      };
    }

    return {
      transform: `translate(${zoomState.translateX}px, ${zoomState.translateY}px) scale(${zoomState.scale})`,
      transformOrigin: 'center center',
    };
  }, [zoomState.scale, zoomState.translateX, zoomState.translateY]);

  // 이벤트 핸들러 객체
  const handlers = useMemo(() => ({
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }), [onTouchStart, onTouchMove, onTouchEnd]);

  return {
    scale: zoomState.scale,
    translateX: zoomState.translateX,
    translateY: zoomState.translateY,
    resetZoom,
    isZoomed,
    isGestureActive,
    containerStyle,
    handlers,
  };
}
