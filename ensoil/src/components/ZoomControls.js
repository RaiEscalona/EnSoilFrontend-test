import React from 'react';
import './ZoomControls.css';
import { Minus } from 'lucide-react';

export default function ZoomControls({ onZoomIn, onZoomOut, className = '', style = {}, disabledIn = false, disabledOut = false }) {
  return (
    <div className={`zoom-controls ${className}`} style={style}>
      <button
        className="zoom-btn bg-white text-black"
        onClick={onZoomIn}
        disabled={disabledIn}
        aria-label="Zoom in"
        type="button"
      >
        +
      </button>
      <button
        className="zoom-btn bg-white text-black"
        onClick={onZoomOut}
        disabled={disabledOut}
        aria-label="Zoom out"
        type="button"
      >
        –
      </button>
    </div>
  );
} 