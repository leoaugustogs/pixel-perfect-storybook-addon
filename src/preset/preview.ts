import { withOverlay } from "../withOverlay";


export const globalTypes = {
  pixelPerfect: {
    name: "Pixel Perfect",
    description: "Pixel Perfect Overlay",
    defaultValue: {
      active: false,
      overlay: {
        src: "",
        opacity: 1,
        x: 0,
        y: 0,
        visualMode: "normal",
      }
    },
  },
};

export const decorators = [withOverlay];

