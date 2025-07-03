'use client';

import { formatCoordinates } from '@/utils/coordinateUtils';
import './DrillingPoint.css';
import { useRouter } from 'next/navigation';
import Tooltip from '../ToolTip/Tooltip';

export default function DrillingPoint({ projectId, id, point, clickPosition, size = 20, border = 2 }) {
  const route = `/projects/${projectId}/map/drillingPoint/${id}`;
  const router = useRouter();

  const handleClick = (e) => {
    e.stopPropagation();
    router.push(route);
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
    >
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
          onClick={handleClick}
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