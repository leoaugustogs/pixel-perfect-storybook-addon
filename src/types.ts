export type VisualMode = 'normal' | 'rendering-drift' | 'structural-drift' | 'diff-heatmap';

export type OverlayOptions = {
  src: string;
  opacity?: number;
  colorInversion?: boolean;
  x?: number;
  y?: number;
  visualMode?: VisualMode;
  width?: string | number;
  height?: string | number;
  sensitivity?: number;
  showGrid?: boolean;
  target?: string;
  showPixelMatchDiff?: boolean;
  ignoreTransparency?: boolean;
};

export type Parameter = {
  overlay: OverlayOptions;
}

export type DynamicOverlayOptions = Omit<OverlayOptions, "src">;
