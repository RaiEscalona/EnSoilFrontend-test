'use client';

import Tooltip from './Tooltip';
import { formatCoordinates } from '@/utils/coordinateUtils';
import './DrillingPoint.css';

export default function DrillingPoint({ point, imageInfo, clickPosition }) {
  return (
    <div 
      className="drilling-point"
      style={{
        left: `${clickPosition.x}px`,
        top: `${clickPosition.y}px`,
      }}
    >
      <Tooltip
        content={
          <div>
            <p className="font-medium">{point.tag}</p>
            <p className="text-sm text-gray-600">
              {formatCoordinates(point.coordinates)}
            </p>
          </div>
        }
      >
        <div className="drilling-point-marker" />
      </Tooltip>
    </div>
  );
} 