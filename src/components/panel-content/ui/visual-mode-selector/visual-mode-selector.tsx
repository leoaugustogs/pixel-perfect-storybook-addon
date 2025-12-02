import React from "react";
import { styled, themes } from "storybook/internal/theming";
import { VisualMode } from "../../../../types";

const Select = styled.select({
  width: "100%",
  padding: "5px",
  borderRadius: 4,
  border: `1px solid ${themes.normal.appBorderColor}`,
  color: themes.normal.colorSecondary,
  backgroundColor: "transparent",
  "&:focus": {
    outline: "none",
    border: `1px solid ${themes.normal.colorSecondary}`,
  },
});

interface VisualModeSelectorProps {
  value: VisualMode;
  onChange: (value: VisualMode) => void;
}

export const VisualModeSelector = ({ value, onChange }: VisualModeSelectorProps) => {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as VisualMode)}
    >
      <option value="normal">Normal</option>
      <option value="rendering-drift">Rendering Drift (Difference)</option>
      <option value="structural-drift">Structural Drift (High Contrast)</option>
    </Select>
  );
};
