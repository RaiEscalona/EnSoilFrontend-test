'use client';

import { useState, useRef, useEffect } from 'react';
import './Tooltip.css';

export default function Tooltip({ children, content }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  const calculatePosition = () => {
    if (!tooltipRef.current || !triggerRef.current) return { top: 0, left: 0 };

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const triggerRect = triggerRef.current.getBoundingClientRect();

    // El punto tiene 16px de ancho (w-4), así que sumamos 8px (radio) + 10px de separación
    const left = triggerRect.width / 2 + 18;
    
    // Centramos verticalmente el tooltip con el punto
    const top = -(tooltipRect.height / 2) + (triggerRect.height / 2);

    return { top, left };
  };

  useEffect(() => {
    if (isVisible) {
      const updatePosition = () => {
        setPosition(calculatePosition());
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isVisible]);

  return (
    <div className="tooltip-container">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="tooltip-content"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
} 