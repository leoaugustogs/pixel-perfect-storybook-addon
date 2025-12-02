require("regenerator-runtime/runtime");

module.exports = {
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