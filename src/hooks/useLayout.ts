import { useEffect, useMemo, useState } from 'react';

export type Profile = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';
/** stack: apilado vertical · split: dos zonas en horizontal · trio: tres columnas */
export type LayoutMode = 'stack' | 'split' | 'trio';

export interface LayoutInfo {
  width: number;
  height: number;
  minSide: number;
  maxSide: number;
  orientation: Orientation;
  profile: Profile;
  mode: LayoutMode;
  /** Pantalla apaisada de poca altura (móvil horizontal). */
  shortLandscape: boolean;
  /** Tamaño seguro de la mascota en px según el espacio disponible. */
  mascotSize: number;
}

export function computeLayout(width: number, height: number): LayoutInfo {
  const minSide = Math.min(width, height);
  const maxSide = Math.max(width, height);
  const orientation: Orientation = width >= height ? 'landscape' : 'portrait';

  let profile: Profile;
  if (minSide < 600) profile = 'mobile';
  else if (width >= 1100) profile = 'desktop';
  else profile = 'tablet';

  let mode: LayoutMode;
  if (orientation === 'portrait') mode = 'stack';
  else if (width >= 960) mode = 'trio';
  else mode = 'split';

  const shortLandscape = orientation === 'landscape' && height < 500;

  let mascotSize: number;
  if (shortLandscape) mascotSize = 56;
  else if (profile === 'mobile') mascotSize = orientation === 'portrait' ? 72 : 60;
  else if (profile === 'tablet') mascotSize = 104;
  else mascotSize = Math.round(Math.min(150, Math.max(110, height * 0.16)));

  return {
    width,
    height,
    minSide,
    maxSide,
    orientation,
    profile,
    mode,
    shortLandscape,
    mascotSize,
  };
}

function readViewport(): { w: number; h: number } {
  if (typeof window === 'undefined') return { w: 1280, h: 800 };
  return { w: window.innerWidth, h: window.innerHeight };
}

/** Reacciona a cambios de tamaño y rotación del dispositivo. */
export function useLayout(): LayoutInfo {
  const [viewport, setViewport] = useState(readViewport);

  useEffect(() => {
    const onResize = (): void => setViewport(readViewport());
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return useMemo(() => computeLayout(viewport.w, viewport.h), [viewport]);
}

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Mide el área real disponible de un contenedor (container-aware).
 * Usa callback ref para seguir funcionando cuando el layout cambia de modo.
 */
export function useElementSize<T extends HTMLElement>(): [(el: T | null) => void, ElementSize] {
  const [el, setEl] = useState<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    if (!el) return;
    const update = (): void => {
      const rect = el.getBoundingClientRect();
      setSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);

  return [setEl, size];
}
