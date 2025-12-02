import React, { useEffect } from "react";
import { styled, themes } from "storybook/internal/theming";
import { IconButton } from "storybook/internal/components";
import { ArrowUpIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, SyncIcon } from "@storybook/icons";

const Container = styled.div({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "5px",
});

const ButtonGroup = styled.div({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "2px",
  alignItems: "center",
});

interface NudgeControlsProps {
  x: number;
  y: number;
  onNudge: (dx: number, dy: number) => void;
  onReset: () => void;
}

export const NudgeControls = ({ x, y, onNudge, onReset }: NudgeControlsProps) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Only handle arrow keys when the container or its children are focused
    const target = e.target as HTMLElement;
    if (!target.closest('[data-nudge-controls="true"]')) return;

    let dx = 0;
    let dy = 0;

    switch (e.key) {
      case "ArrowUp":
        dy = -1;
        break;
      case "ArrowDown":
        dy = 1;
        break;
      case "ArrowLeft":
        dx = -1;
        break;
      case "ArrowRight":
        dx = 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    onNudge(dx, dy);
  };

  // This assumes the parent panel or a specific container will catch these events
  // For now, we'll attach it to the container div but it needs focus.
  // Alternatively, we can attach global listener but check for specific focus context?
  // The requirement was "Keyboard arrow keys shift the overlay when the addon panel is focused."
  // Since detecting "panel focus" generally is hard, we'll rely on the user focusing this control group.

  return (
    <Container data-nudge-controls="true" onKeyDown={(e: any) => handleKeyDown(e as any)} tabIndex={0}>
      <ButtonGroup>
        <div />
        <IconButton title="Nudge Up" onClick={() => onNudge(0, -1)}>
          <ArrowUpIcon />
        </IconButton>
        <div />
        <IconButton title="Nudge Left" onClick={() => onNudge(-1, 0)}>
          <ArrowLeftIcon />
        </IconButton>
        <IconButton title="Reset Nudge" onClick={onReset}>
          <SyncIcon />
        </IconButton>
        <IconButton title="Nudge Right" onClick={() => onNudge(1, 0)}>
          <ArrowRightIcon />
        </IconButton>
        <div />
        <IconButton title="Nudge Down" onClick={() => onNudge(0, 1)}>
          <ArrowDownIcon />
        </IconButton>
        <div />
      </ButtonGroup>
      <span style={{ marginLeft: 10, fontSize: 12, color: themes.normal.textMutedColor }}>
        X: {x}px Y: {y}px
      </span>
    </Container>
  );
};
