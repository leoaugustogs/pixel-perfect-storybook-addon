import React from "react";

export default {
  title: "Example/Dimensions",
  parameters: {
    pixelPerfect: {
      overlay: {
        src: "https://placehold.co/600x400",
        opacity: 0.5,
        width: "150px",
        height: "100px",
      },
    },
  },
};

export const ExplicitWidth = () => (
  <div
    style={{
      width: "300px",
      height: "200px",
      background: "#e0e0e0",
      border: "1px solid #ccc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <p>Component (300x200)</p>
  </div>
);
