import pixelmatch from "pixelmatch";
import { OverlayOptions } from "../types";

const rootSelector = "#root";
const ids = {
  img: "pixel-perfect-overlay",
  tint: "pixel-perfect-tint",
  grid: "pixel-perfect-grid",
  diff: "pixel-perfect-diff-canvas",
  badge: "pixel-perfect-diff-badge"
};

const toCssValue = (value?: string | number): string | undefined => {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

let diffCache: HTMLCanvasElement | null = null;
let cacheParams: { src: string, target: string, sensitivity: number, ignoreTransparency: boolean } | null = null;
let currentRenderId = 0;

export const clearPixelMatchCache = () => {
  diffCache = null;
  cacheParams = null;
};

const loadImage = async (url: string): Promise<ImageBitmap | HTMLImageElement> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return await createImageBitmap(blob, { 
      premultiplyAlpha: 'none', 
      colorSpaceConversion: 'default' 
    });
  } catch (e) {
    console.warn("createImageBitmap failed, falling back to Image()", e);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  }
};

const runPixelMatch = async (src: string, target: string, sensitivity: number, ignoreTransparency: boolean) => {
  const [img1, img2] = await Promise.all([loadImage(src), loadImage(target)]);
  
  const w = Math.min(img1.width, img2.width);
  const h = Math.min(img1.height, img2.height);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  const c1 = document.createElement("canvas");
  c1.width = w;
  c1.height = h;
  const ctx1 = c1.getContext("2d", { willReadFrequently: true, colorSpace: 'srgb' });
  if (!ctx1) throw new Error("Context error");
  ctx1.imageSmoothingEnabled = false;
  
  if (ignoreTransparency) {
    ctx1.fillStyle = '#ffffff';
    ctx1.fillRect(0, 0, w, h);
  }
  
  
  let d1: ImageData;
  try {
    d1 = ctx1.getImageData(0, 0, w, h);
  } catch (e) {
    throw new Error("CORS Error: Cannot access image data. Ensure images have CORS headers.");
  }

  const c2 = document.createElement("canvas");
  c2.width = w;
  c2.height = h;
  const ctx2 = c2.getContext("2d", { willReadFrequently: true, colorSpace: 'srgb' });
  if (!ctx2) throw new Error("Context error");
  ctx2.imageSmoothingEnabled = false;
  
  if (ignoreTransparency) {
    ctx2.fillStyle = '#ffffff';
    ctx2.fillRect(0, 0, w, h);
  }

  
  let d2: ImageData;
  try {
    d2 = ctx2.getImageData(0, 0, w, h);
  } catch (e) {
    throw new Error("CORS Error: Cannot access image data. Ensure images have CORS headers.");
  }

  const diff = ctx.createImageData(w, h);
  const mismatch = pixelmatch(d1.data, d2.data, diff.data, w, h, { threshold: sensitivity });
  
  ctx.putImageData(diff, 0, 0);
  return { canvas, mismatch, w, h };
};


export const renderOverlay = async ({
  src,
  opacity,
  colorInversion,
  x = 0,
  y = 0,
  visualMode = 'normal',
  width,
  height,
  sensitivity = 0,
  showGrid = false,
  target,
  showPixelMatchDiff = false,
  ignoreTransparency = false
}: Required<OverlayOptions>) => {
  const root = document.querySelector(rootSelector) || document.querySelector("#storybook-root");
  
  if (!root) {
    return;
  }

  const rootRect = root.getBoundingClientRect();
  const renderId = ++currentRenderId;
  
  let effectiveOpacity = `${opacity}`;
  let effectiveFilter = colorInversion ? "invert(1)" : "none";
  let effectiveMixBlendMode = "normal";

  if (visualMode === 'rendering-drift') {
    effectiveOpacity = '1';
    effectiveMixBlendMode = 'difference';
    effectiveFilter = 'none'; 
  } else if (visualMode === 'structural-drift') {
    effectiveOpacity = '1';
    effectiveMixBlendMode = 'difference';
    effectiveFilter = 'grayscale(100%) contrast(150%) brightness(1000%)';
  } else if (visualMode === 'diff-heatmap') {
    effectiveOpacity = '1';
    effectiveMixBlendMode = 'difference';
    const contrast = 1 + (sensitivity * 10);
    effectiveFilter = `grayscale(100%) contrast(${contrast})`;
  }

  const updateElementGeometry = (el: HTMLElement, w?: string | number, h?: string | number) => {
    el.style.top = `${rootRect.top}px`;
    el.style.left = `${rootRect.left}px`;
    el.style.transform = `translate(${x}px, ${y}px)`;
    
    if (w !== undefined) el.style.width = toCssValue(w) as string;
    if (h !== undefined) el.style.height = toCssValue(h) as string;
  };

  let img = root.querySelector(`#${ids.img}`) as HTMLImageElement;
  if (!img) {
    img = document.createElement("img");
    img.id = ids.img;
    img.setAttribute("alt", "pixel perfect overlaying image");
    img.style.position = "absolute";
    img.style.zIndex = "100000";
    img.style.pointerEvents = "none";
    root.appendChild(img);
  }
  img.setAttribute("src", src);
  img.style.opacity = effectiveOpacity;
  img.style.filter = effectiveFilter;
  img.style.mixBlendMode = effectiveMixBlendMode;
  updateElementGeometry(img, width, height);

  const syncDimensions = () => {
    const w = img.getBoundingClientRect().width;
    const h = img.getBoundingClientRect().height;
    const tint = root.querySelector(`#${ids.tint}`) as HTMLElement;
    const grid = root.querySelector(`#${ids.grid}`) as HTMLElement;
    if (tint) { tint.style.width = `${w}px`; tint.style.height = `${h}px`; }
    if (grid) { grid.style.width = `${w}px`; grid.style.height = `${h}px`; }
  };
  img.onload = syncDimensions;
  requestAnimationFrame(syncDimensions);

  let tint = root.querySelector(`#${ids.tint}`) as HTMLElement;
  if (visualMode === 'diff-heatmap') {
    if (!tint) {
      tint = document.createElement("div");
      tint.id = ids.tint;
      tint.style.position = "absolute";
      tint.style.zIndex = "100001";
      tint.style.pointerEvents = "none";
      tint.style.backgroundColor = "#FF0000";
      tint.style.mixBlendMode = "multiply";
      root.appendChild(tint);
    }
    updateElementGeometry(tint, width, height);
  } else {
    if (tint) tint.remove();
  }

  let grid = root.querySelector(`#${ids.grid}`) as HTMLElement;
  if (showGrid) {
    if (!grid) {
      grid = document.createElement("div");
      grid.id = ids.grid;
      grid.style.position = "absolute";
      grid.style.zIndex = "100002";
      grid.style.pointerEvents = "none";
      grid.style.backgroundImage = `linear-gradient(to right, rgba(0, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 255, 255, 0.5) 1px, transparent 1px)`;
      grid.style.backgroundSize = "10px 10px";
      root.appendChild(grid);
    }
    updateElementGeometry(grid, width, height);
  } else {
    if (grid) grid.remove();
  }

  let diffCanvas = root.querySelector(`#${ids.diff}`) as HTMLCanvasElement;
  let badge = root.querySelector(`#${ids.badge}`) as HTMLElement;

  if (showPixelMatchDiff && target) {
    const paramsChanged = !cacheParams || 
      cacheParams.src !== src || 
      cacheParams.target !== target || 
      cacheParams.sensitivity !== sensitivity ||
      cacheParams.ignoreTransparency !== ignoreTransparency;
    
    if (paramsChanged || !diffCache) {
        try {
            const result = await runPixelMatch(src, target, sensitivity, ignoreTransparency);
            

            diffCache = result.canvas;
            cacheParams = { src, target, sensitivity, ignoreTransparency };
            
            if (!badge) {
                badge = document.createElement("div");
                badge.id = ids.badge;
                badge.style.position = "absolute";
                badge.style.zIndex = "100004";
                badge.style.top = "10px";
                badge.style.right = "10px";
                badge.style.padding = "4px 8px";
                badge.style.backgroundColor = "rgba(0,0,0,0.8)";
                badge.style.color = "white";
                badge.style.borderRadius = "4px";
                badge.style.fontSize = "12px";
                badge.style.fontFamily = "sans-serif";
                badge.style.pointerEvents = "none";
                root.appendChild(badge);
            }
            badge.textContent = `Mismatch: ${result.mismatch}px`;
        } catch (e: any) {
            console.error("PixelMatch error", e);
                badge = document.createElement("div");
                badge.id = ids.badge;
                badge.style.position = "absolute";
                badge.style.zIndex = "100004";
                badge.style.top = "10px";
                badge.style.right = "10px";
                badge.style.padding = "4px 8px";
                badge.style.backgroundColor = "red";
                badge.style.color = "white";
                badge.style.borderRadius = "4px";
                badge.style.fontSize = "12px";
                badge.style.fontFamily = "sans-serif";
                root.appendChild(badge);
            }
            badge.textContent = `Error: ${e.message}`;
            return; 
        }
    }

    if (diffCache) {
        diffCanvas = diffCache;
        diffCanvas.id = ids.diff;
        diffCanvas.style.position = "absolute";
        diffCanvas.style.pointerEvents = "none";
        
        const existingDiff = root.querySelector(`#${ids.diff}`);
        if (!existingDiff) {
            root.appendChild(diffCanvas);
        } else if (existingDiff !== diffCanvas) {
            existingDiff.replaceWith(diffCanvas);
        }
    }

    if (diffCanvas) {
         updateElementGeometry(diffCanvas, width, height);
    }
    
  } else {
    if (diffCanvas) diffCanvas.remove();
    if (badge) badge.remove();
  }
}

export const removeOverlay =() => {
  const elements = [
    document.querySelector(`${rootSelector} #${ids.img}`),
    document.querySelector(`#storybook-root #${ids.img}`),
    document.querySelector(`${rootSelector} #${ids.tint}`),
    document.querySelector(`#storybook-root #${ids.tint}`),
    document.querySelector(`${rootSelector} #${ids.grid}`),
    document.querySelector(`#storybook-root #${ids.grid}`),
    document.querySelector(`${rootSelector} #${ids.diff}`),
    document.querySelector(`#storybook-root #${ids.diff}`),
    document.querySelector(`${rootSelector} #${ids.badge}`),
    document.querySelector(`#storybook-root #${ids.badge}`)
  ];
  
  elements.forEach(el => el?.remove());
}
