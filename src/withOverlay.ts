import { useChannel, useEffect, useState } from "storybook/internal/preview-api";
import { DecoratorFunction } from "storybook/internal/types";
import { DEFAULT_DYNAMIC_OVERLAY_OPTIONS, EVENTS } from "./constants";
import { DynamicOverlayOptions } from "./types";
import { renderOverlay, removeOverlay } from './utils/overlay';

export const withOverlay: DecoratorFunction = (StoryFn, context) => {
  const global = context.globals.pixelPerfect;
  const parameter = context.parameters.pixelPerfect;
  
  console.log('[PixelPerfect] withOverlay', { 
    global, 
    parameter,
    isActive: global?.active,
    hasParameter: !!parameter
  });

  const [
    currentDynamicOverlayOptions,
    setCurrentDynamicOverlayOptions
  ] = useState({});

  useChannel({
    [EVENTS.DYNAMIC_OVERLAY_OPTIONS_CHANGED]: (dynamicOverlayOptions: DynamicOverlayOptions) => {
      console.log('[PixelPerfect] Channel received options update:', dynamicOverlayOptions);
      setCurrentDynamicOverlayOptions(dynamicOverlayOptions);
    },
  });

  useEffect(() => {
    console.log('[PixelPerfect] useEffect triggered', {
      active: global?.active,
      parameter,
      currentOptions: currentDynamicOverlayOptions
    });

    if (global?.active && parameter) {
      const options = {
        ...DEFAULT_DYNAMIC_OVERLAY_OPTIONS,
        ...parameter.overlay,
        ...currentDynamicOverlayOptions,
      };
      console.log('[PixelPerfect] Calling renderOverlay with:', options);
      renderOverlay(options);
    } else {
      console.log('[PixelPerfect] Calling removeOverlay');
      removeOverlay();
    }
  }, [global?.active, parameter, currentDynamicOverlayOptions]);

  useEffect(() => {
    return () => {
      removeOverlay();
    };
  }, []);

  return StoryFn();
};
