export type VisualMode = 'normal' | 'rendering-drift' | 'structural-drift';

export type OverlayOptions = {
  src: string;
  opacity?: number;
  colorInversion?: boolean;
  x?: number;
  y?: number;
  visualMode?: VisualMode;
};

export type Parameter = {
  overlay: OverlayOptions;
}

export type DynamicOverlayOptions = Omit<OverlayOptions, "src">;