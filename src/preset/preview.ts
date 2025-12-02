import { withOverlay } from "../withOverlay";


export const globals = {
  pixelPerfect: {
    active: false,
    overlay: {
      src: "",
      opacity: 1,
    }
  },
};

export const decorators = [withOverlay];

