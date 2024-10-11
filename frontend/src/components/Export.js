import html2canvas from "html2canvas";
import { Canvas } from "konva/lib/Canvas";
import React, { useRef, forwardRef } from "react";

function Export({ forwardRef }) {
  const handleExportImage = (e) => {
    const link = e.currentTarget;
    link.setAttribute("download", "canvas.jpg");
    const canvas = forwardRef.current;
    html2canvas(canvas).then((canvas) => {
      const image = canvas.toDataURL();
      link.setAttribute("href", image);
      link.click();
    });
  };
  console.log(forwardRef);
  return (
    <div>
      <button>
        <a onClick={handleExportImage} href="downlaod_link">
          image
        </a>
      </button>
      
    </div>
  );
}

const forwarded = React.forwardRef(Export);
export default forwarded;
