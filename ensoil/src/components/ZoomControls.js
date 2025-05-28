import React from 'react';
import './ZoomControls.css';

export default function ZoomControls({ onZoomIn, onZoomOut, className = '', style = {}, disabledIn = false, disabledOut = false }) {
  return (
    <div className={`zoom-controls ${className}`} style={style}>
      <button
        className="zoom-btn"
        onClick={onZoomIn}
        disabled={disabledIn}
        aria-label="Zoom in"
        type="button"
      >
        +
      </button>
      <button
        className="zoom-btn"
        onClick={onZoomOut}
        disabled={disabledOut}
        aria-label="Zoom out"
        type="button"
      >
        -
      </button>
    </div>
  );
} 