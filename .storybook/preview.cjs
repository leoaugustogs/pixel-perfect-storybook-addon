module.exports = {
  globalTypes: {
    pixelPerfect: {
      name: "Pixel Perfect",
      description: "Pixel Perfect Overlay",
      defaultValue: {
        active: false,
        overlay: {
          src: "",
          opacity: 1,
        }
      },
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
      viewports: {
        desktop: {
          name: 'Desktop',
          type: 'desktop',
          styles: {
            width: '1366px',
            height: '655px',
          },
        },
      },
    },
    chromatic: {
      disableSnapshot: true,
    },
  },
  tags: ['autodocs'],
};