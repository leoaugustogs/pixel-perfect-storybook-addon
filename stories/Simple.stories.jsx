import React from 'react';

export default {
  title: 'Example/Simple',
  parameters: {
    pixelPerfect: {
      overlay: {
        src: "https://placehold.co/600x400",
        opacity: 0.5,
      },
    },
  },
};

export const Default = () => (
  <div style={{ width: '600px', height: '400px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <h1>Simple Component</h1>
  </div>
);
