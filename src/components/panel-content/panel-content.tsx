import React, { useMemo, useEffect, useCallback } from "react";
import { Form, Button } from "storybook/internal/components";
import { useAddonState, useStorybookState, useParameter, useChannel } from "storybook/internal/manager-api";
import { styled, themes } from "storybook/internal/theming";
import ControlTable from './ui/control-table/control-table';
import { ResetButton } from "./ui/reset-button/reset-button";
import { VisualModeSelector } from "./ui/visual-mode-selector/visual-mode-selector";
import { NudgeControls } from "./ui/nudge-controls/nudge-controls";
import { DEFAULT_DYNAMIC_OVERLAY_OPTIONS, EVENTS, DYNAMIC_OVERLAYS_OPTIONS_STATE, PARAM_KEY } from "../../constants";
import { Parameter, DynamicOverlayOptions, VisualMode } from "../../types";

const RangeInput = styled.input({
  width: '100%',
  cursor: 'pointer',
  accentColor: themes.normal.colorSecondary,
  '&:disabled': {
    cursor: 'not-allowed',
    opacity: 0.5,
  }
});

const PanelContent = () => {
  const parameter = useParameter<Parameter>(PARAM_KEY);
  const { storyId } = useStorybookState();
  const emit = useChannel({});
  const [
    dynamicOverlaysOptions,
    setDynamicOverlaysOptions
  ] = useAddonState<Record<string, DynamicOverlayOptions>>(DYNAMIC_OVERLAYS_OPTIONS_STATE, {});

  const currentDynamicOverlayOptions = useMemo(() => {
    return dynamicOverlaysOptions[storyId] ?? {};
  }, [dynamicOverlaysOptions, storyId]);

  // Load persisted nudge options on story change
  useEffect(() => {
    const savedOptions = localStorage.getItem(`pixel-perfect-nudge-${storyId}`);
    if (savedOptions) {
      try {
        const parsed = JSON.parse(savedOptions);
        // Only update if we don't have state for this story yet (avoid overwriting session state)
        // Or should we merge? Let's merge persisted nudge with current state
        if (parsed.x !== currentDynamicOverlayOptions.x || parsed.y !== currentDynamicOverlayOptions.y) {
           setDynamicOverlaysOptions(prev => ({
             ...prev,
             [storyId]: {
               ...prev[storyId],
               x: parsed.x ?? 0,
               y: parsed.y ?? 0
             }
           }));
        }
      } catch (e) {
        console.error("Failed to parse persisted nudge options", e);
      }
    }
  }, [storyId]); // Dependencies: strictly just storyId to load once per story switch

  useEffect(() => {
    emit(EVENTS.DYNAMIC_OVERLAY_OPTIONS_CHANGED, currentDynamicOverlayOptions);
  }, [currentDynamicOverlayOptions]);

  const updateOverlayOptions = useCallback((options: DynamicOverlayOptions) => {
    
    const newOptions = {
      ...currentDynamicOverlayOptions,
      ...options
    };

    // Persist nudge settings if they changed
    if (options.x !== undefined || options.y !== undefined) {
      const toSave = { x: newOptions.x ?? 0, y: newOptions.y ?? 0 };
      localStorage.setItem(`pixel-perfect-nudge-${storyId}`, JSON.stringify(toSave));
    }

    setDynamicOverlaysOptions(
      Object.assign(
        {},
        dynamicOverlaysOptions,
        {
          [storyId]: newOptions,
        },
      )
    );
  }, [dynamicOverlaysOptions, setDynamicOverlaysOptions, storyId, currentDynamicOverlayOptions]);

  const isDifferentFromDefault: (option: "all" | keyof DynamicOverlayOptions) => boolean = useCallback((option) => {
    if (option === "all") {
      return Object
        .keys(currentDynamicOverlayOptions)
        .some((optionName: keyof DynamicOverlayOptions) => isDifferentFromDefault(optionName));
    } else {
      if (!(`${option}` in currentDynamicOverlayOptions)) {
        return false;
      } else if (parameter && parameter.overlay[option]) {
        return currentDynamicOverlayOptions[option] !== parameter.overlay[option];
      } else {
        // Handle defaults for new properties
        if (option === 'x' || option === 'y') return (currentDynamicOverlayOptions[option] ?? 0) !== 0;
        if (option === 'visualMode') return (currentDynamicOverlayOptions[option] ?? 'normal') !== 'normal';
        return currentDynamicOverlayOptions[option] !== DEFAULT_DYNAMIC_OVERLAY_OPTIONS[option];
      }
    }
  }, [currentDynamicOverlayOptions, parameter]);

  const resetOverlayOptions = useCallback((option: "all" | keyof DynamicOverlayOptions) => {
    let replacement: DynamicOverlayOptions;

    if (option === "all") {
      replacement = {};
      // Also clear local storage for this story
      localStorage.removeItem(`pixel-perfect-nudge-${storyId}`);
    } else {
      replacement = Object.assign({}, currentDynamicOverlayOptions);
      delete replacement[option];
      
      // Handle specific persistence cleanup
      if (option === 'x' || option === 'y') {
         const toSave = { 
           x: option === 'x' ? 0 : (replacement.x ?? 0), 
           y: option === 'y' ? 0 : (replacement.y ?? 0) 
         };
         localStorage.setItem(`pixel-perfect-nudge-${storyId}`, JSON.stringify(toSave));
      }
    }

    setDynamicOverlaysOptions(
      Object.assign({}, dynamicOverlaysOptions, { [storyId]: replacement }),
    );
  }, [dynamicOverlaysOptions, setDynamicOverlaysOptions, storyId, currentDynamicOverlayOptions]);

  const currentVisualMode = currentDynamicOverlayOptions.visualMode ?? 'normal';
  const isOpacityDisabled = currentVisualMode !== 'normal';

  return (
    <div>
      <ControlTable
        headReset={<ResetButton
          title="Reset all options"
          canReset={isDifferentFromDefault("all")}
          onClick={() => resetOverlayOptions("all")}
        />}
        rows={[
          {
            name: "Visual Mode",
            control: <VisualModeSelector
              value={currentVisualMode}
              onChange={(value) => updateOverlayOptions({ visualMode: value })}
            />,
            reset: <ResetButton
              title="Reset visual mode"
              canReset={isDifferentFromDefault("visualMode")}
              onClick={() => resetOverlayOptions("visualMode")}
            />,
          },
          {
            name: "Opacity",
            control: <RangeInput
              type="range"
              value={
                currentDynamicOverlayOptions?.opacity
                ?? parameter?.overlay?.opacity
                ?? DEFAULT_DYNAMIC_OVERLAY_OPTIONS.opacity
              }
              min={0}
              max={1}
              step={0.05}
              onChange={(e) => updateOverlayOptions({ opacity: Number(e.target.value) })}
              disabled={isOpacityDisabled}
              aria-label="Opacity"
            />,
            reset: <ResetButton
              title="Reset opacity"
              canReset={isDifferentFromDefault("opacity")}
              onClick={() => resetOverlayOptions("opacity")}
            />,
          },
          {
            name: "Enable color inversion",
            control: <Form.Input
              type="checkbox"
              checked={
                !!(currentDynamicOverlayOptions.colorInversion
                ?? parameter?.overlay?.colorInversion
                ?? DEFAULT_DYNAMIC_OVERLAY_OPTIONS.colorInversion)
              }
              onChange={(e) => updateOverlayOptions({ colorInversion: (e.target as HTMLInputElement).checked })}
              disabled={isOpacityDisabled}
              aria-label="Toggle color inversion"
              style={{
                color: themes.normal.colorSecondary,
              }}
            />,
            reset: <ResetButton
              title="Reset color inversion"
              canReset={isDifferentFromDefault("colorInversion")}
              onClick={() => resetOverlayOptions("colorInversion")}
            />,
          },
          {
            name: "Sensitivity",
            control: <RangeInput
              type="range"
              value={
                currentDynamicOverlayOptions?.sensitivity
                ?? parameter?.overlay?.sensitivity
                ?? DEFAULT_DYNAMIC_OVERLAY_OPTIONS.sensitivity
              }
              min={0}
              max={1}
              step={0.05}
              onChange={(e) => updateOverlayOptions({ sensitivity: Number(e.target.value) })}
              disabled={currentVisualMode !== 'diff-heatmap' && !currentDynamicOverlayOptions.showPixelMatchDiff}
              aria-label="Sensitivity"
            />,
            reset: <ResetButton
              title="Reset sensitivity"
              canReset={isDifferentFromDefault("sensitivity")}
              onClick={() => resetOverlayOptions("sensitivity")}
            />,
          },
          {
            name: "Show Pixel Grid",
            control: <Form.Input
              type="checkbox"
              checked={
                !!(currentDynamicOverlayOptions.showGrid
                ?? parameter?.overlay?.showGrid
                ?? DEFAULT_DYNAMIC_OVERLAY_OPTIONS.showGrid)
              }
              onChange={(e) => updateOverlayOptions({ showGrid: (e.target as HTMLInputElement).checked })}
              aria-label="Show Pixel Grid"
              style={{
                color: themes.normal.colorSecondary,
              }}
            />,
            reset: <ResetButton
              title="Reset grid"
              canReset={isDifferentFromDefault("showGrid")}
              onClick={() => resetOverlayOptions("showGrid")}
            />,
          },
          {
            name: "Show PixelMatch Diff",
            control: <Form.Input
              type="checkbox"
              checked={
                !!(currentDynamicOverlayOptions.showPixelMatchDiff
                ?? parameter?.overlay?.showPixelMatchDiff
                ?? DEFAULT_DYNAMIC_OVERLAY_OPTIONS.showPixelMatchDiff)
              }
              onChange={(e) => updateOverlayOptions({ showPixelMatchDiff: (e.target as HTMLInputElement).checked })}
              aria-label="Show PixelMatch Diff"
              style={{
                color: themes.normal.colorSecondary,
              }}
            />,
            reset: <ResetButton
              title="Reset diff toggle"
              canReset={isDifferentFromDefault("showPixelMatchDiff")}
              onClick={() => resetOverlayOptions("showPixelMatchDiff")}
            />,
          },
          {
            name: "Ignore Transparency",
            control: <Form.Input
              type="checkbox"
              checked={
                !!(currentDynamicOverlayOptions.ignoreTransparency
                ?? parameter?.overlay?.ignoreTransparency
                ?? DEFAULT_DYNAMIC_OVERLAY_OPTIONS.ignoreTransparency)
              }
              onChange={(e) => updateOverlayOptions({ ignoreTransparency: (e.target as HTMLInputElement).checked })}
              disabled={!currentDynamicOverlayOptions.showPixelMatchDiff}
              aria-label="Ignore Transparency"
              style={{
                color: themes.normal.colorSecondary,
              }}
            />,
            reset: <ResetButton
              title="Reset transparency"
              canReset={isDifferentFromDefault("ignoreTransparency")}
              onClick={() => resetOverlayOptions("ignoreTransparency")}
            />,
          },
          {
            name: "PixelMatch",
            control: <Button
              onClick={() => emit(EVENTS.RECALCULATE_PIXELMATCH)}
              style={{ width: '100%' }}
            >
              Recalculate Diff
            </Button>,
            reset: <div/>,
          },
          {
            name: "Nudge",
            control: <NudgeControls
              x={currentDynamicOverlayOptions.x ?? 0}
              y={currentDynamicOverlayOptions.y ?? 0}
              onNudge={(dx, dy) => updateOverlayOptions({
                x: (currentDynamicOverlayOptions.x ?? 0) + dx,
                y: (currentDynamicOverlayOptions.y ?? 0) + dy
              })}
              onReset={() => updateOverlayOptions({ x: 0, y: 0 })}
            />,
            reset: <ResetButton
              title="Reset nudge"
              canReset={isDifferentFromDefault("x") || isDifferentFromDefault("y")}
              onClick={() => {
                resetOverlayOptions("x");
                resetOverlayOptions("y");
              }}
            />,
          }
        ]}
      />
    </div>
  );
};

export default PanelContent;
