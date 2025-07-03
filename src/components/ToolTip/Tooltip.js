'use client';

import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Tooltip.css';

export default function Tooltip({ children, content }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      // Posicionar el tooltip a la derecha y centrado verticalmente respecto al trigger
      const top = triggerRect.top + window.scrollY + triggerRect.height / 2;
      const left = triggerRect.right + 12 + window.scrollX; // 12px separación
      setPosition({ top, left });
    }
  }, [isVisible]);

  // Portal para el tooltip
  const tooltipNode = isVisible && content ? ReactDOM.createPortal(
    <div
      className="tooltip-content"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateY(-50%)',
        zIndex: 9999,
      }}
    >
      {content}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        style={{ display: 'inline-block' }}
      >
        {children}
      </span>
      {tooltipNode}
    </>
  );
} 