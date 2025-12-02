import React from "react";
import { IconButton } from "storybook/internal/components";
import { SyncIcon } from "@storybook/icons";
import { themes } from "storybook/internal/theming";

interface ResetButtonProps {
  title: string;
  canReset: boolean;
  onClick: () => void;
}

export const ResetButton = (props: ResetButtonProps) => {
  return (
    <IconButton 
      onClick={props.onClick} 
      title={props.title}
    >
      <SyncIcon 
        style={{
          color: props.canReset ? themes.normal.colorSecondary : themes.normal.base,
        }} 
      />
    </IconButton>
  );
};