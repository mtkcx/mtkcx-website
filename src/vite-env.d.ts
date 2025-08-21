/// <reference types="vite/client" />

// Visual Viewport API types
interface VisualViewport extends EventTarget {
  readonly offsetLeft: number;
  readonly offsetTop: number;
  readonly pageLeft: number;
  readonly pageTop: number;
  readonly width: number;
  readonly height: number;
  readonly scale: number;
  onresize: ((this: VisualViewport, ev: Event) => any) | null;
  onscroll: ((this: VisualViewport, ev: Event) => any) | null;
  addEventListener<K extends keyof VisualViewportEventMap>(type: K, listener: (this: VisualViewport, ev: VisualViewportEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof VisualViewportEventMap>(type: K, listener: (this: VisualViewport, ev: VisualViewportEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

interface VisualViewportEventMap {
  "resize": Event;
  "scroll": Event;
}

declare global {
  interface Window {
    visualViewport?: VisualViewport;
  }
}
