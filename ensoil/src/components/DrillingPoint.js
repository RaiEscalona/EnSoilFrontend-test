'use client';

import Tooltip from './Tooltip';
import { formatCoordinates } from '@/utils/coordinateUtils';
import './DrillingPoint.css';
import Link from 'next/link';
import { Dot } from 'lucide-react';

export default function DrillingPoint({ projectId, id, point, clickPosition, size = 20, border = 2 }) {
  const route = `/projects/${projectId}/map/drillingPoint/${id}`;

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
  };

  return (
    <div
      className="drilling-point"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: 0,
        top: 0,
        position: 'absolute',
        cursor: 'pointer',
        zIndex: 2,
      }}
      onClick={handleClick}
    >
      <Link href={route} className='text-red-800' onClick={handleClick} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'auto' }}>
        <span style={{ display: 'block', width: '100%', height: '100%' }} />
      </Link>
      <Tooltip
        content={
          <div>
            <p className="font-h5 text-black">{point.tag}</p>
            <p className="text-p text-black">
              {formatCoordinates(point.coordinates)}
            </p>
          </div>
        }
      >
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: 'red',
            borderRadius: '50%',
            border: `${border}px solid white`,
            boxShadow: '0 0 0 2px rgba(0,0,0,0.3)',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 2,
          }}
        />
      </Tooltip>
    </div>
  );
} 