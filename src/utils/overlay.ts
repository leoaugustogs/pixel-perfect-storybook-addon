import { OverlayOptions } from "../types";

const rootSelector = "#root";
const overlayId = "pixel-perfect-overlay";

const toCssValue = (value?: string | number): string | undefined => {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

export const renderOverlay = ({
  src,
  opacity,
  colorInversion,
  x = 0,
  y = 0,
  visualMode = 'normal',
  width,
  height,
}: Required<OverlayOptions>) => {
  const root = document.querySelector(rootSelector) || document.querySelector("#storybook-root");
  
  if (!root) {
    return;
  }

  const rootRect = root.getBoundingClientRect();
  const existingOverlay = root.querySelector(`#${overlayId}`) as HTMLElement;

  // Determine effective opacity and filters based on visual mode
  let effectiveOpacity = `${opacity}`;
  let effectiveFilter = colorInversion ? "invert(1)" : "none";
  let effectiveMixBlendMode = "normal";

  if (visualMode === 'rendering-drift') {
    effectiveOpacity = '1';
    effectiveMixBlendMode = 'difference';
    effectiveFilter = 'none'; // Override color inversion in this mode
  } else if (visualMode === 'structural-drift') {
    effectiveOpacity = '1';
    effectiveMixBlendMode = 'difference';
    effectiveFilter = 'grayscale(100%) contrast(150%) brightness(1000%)';
  }

  const updateOverlayStyles = (overlay: HTMLElement) => {
    overlay.style.top = `${rootRect.top}px`;
    overlay.style.left = `${rootRect.left}px`;
    
    overlay.setAttribute("src", src);
    overlay.style.opacity = effectiveOpacity;
    overlay.style.filter = effectiveFilter;
    overlay.style.mixBlendMode = effectiveMixBlendMode;
    overlay.style.transform = `translate(${x}px, ${y}px)`;
    
    if (width !== undefined) {
      overlay.style.width = toCssValue(width) as string;
    }
    if (height !== undefined) {
      overlay.style.height = toCssValue(height) as string;
    }
  };

  if (!existingOverlay) {
    const newOverlay = document.createElement("img");
    newOverlay.setAttribute("id", overlayId);
    newOverlay.setAttribute("alt", "pixel perfect overlaying image");
    newOverlay.style.position = "absolute";
    newOverlay.style.zIndex = "100000";
    newOverlay.style.pointerEvents = "none";
    
    updateOverlayStyles(newOverlay);
    root.appendChild(newOverlay);
  } else {
    updateOverlayStyles(existingOverlay);
  }
}

export const removeOverlay =() => {
  const overlay = document.querySelector(`${rootSelector} #${overlayId}`) || document.querySelector(`#storybook-root #${overlayId}`);
  if (!overlay) return;
  overlay.remove();
}