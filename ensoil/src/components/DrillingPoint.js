'use client';

import Tooltip from './Tooltip';
import { formatCoordinates } from '@/utils/coordinateUtils';

export default function DrillingPoint({ point, imageInfo, clickPosition }) {
  return (
    <div 
      className="absolute"
      style={{
        left: `${clickPosition.x}px`,
        top: `${clickPosition.y}px`,
        transform: 'translate(-50%, -50%)'
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
        <div
          className="w-4 h-4 bg-red-500 rounded-full cursor-pointer hover:bg-red-600 transition-colors"
        />
      </Tooltip>
    </div>
  );
} 