import { useChannel, useEffect, useState } from "storybook/internal/preview-api";
import { DecoratorFunction } from "storybook/internal/types";
import { DEFAULT_DYNAMIC_OVERLAY_OPTIONS, EVENTS } from "./constants";
import { DynamicOverlayOptions } from "./types";
import { renderOverlay, removeOverlay } from './utils/overlay';

export const withOverlay: DecoratorFunction = (StoryFn, context) => {
  const global = context.globals.pixelPerfect;
  const parameter = context.parameters.pixelPerfect;
  
  const [
    currentDynamicOverlayOptions,
    setCurrentDynamicOverlayOptions
  ] = useState({});

  useChannel({
    [EVENTS.DYNAMIC_OVERLAY_OPTIONS_CHANGED]: (dynamicOverlayOptions: DynamicOverlayOptions) => {
      setCurrentDynamicOverlayOptions(dynamicOverlayOptions);
    },
  });

  useEffect(() => {
    if (global?.active && parameter) {
      const options = {
        ...DEFAULT_DYNAMIC_OVERLAY_OPTIONS,
        ...parameter.overlay,
        ...currentDynamicOverlayOptions,
      };
      renderOverlay(options);
    } else {
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
