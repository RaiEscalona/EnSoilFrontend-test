'use client';

import Tooltip from './Tooltip';
import { formatCoordinates } from '@/utils/coordinateUtils';
import './DrillingPoint.css';
import Link from 'next/link';
import { Dot } from 'lucide-react';

export default function DrillingPoint({ projectId, id, point, clickPosition }) {
  const route = `/projects/${projectId}/map/drillingPoint/${id}`
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
            <p className="font-h5 text-black">{point.tag}</p>
            <p className="text-p text-black">
              {formatCoordinates(point.coordinates)}
            </p>
          </div>
        }
      >
        {/* <div className="drilling-point-marker" /> */}
        <Link href={route} className='text-red-800'>
          <Dot 
            size={100}/>
        </Link>
      </Tooltip>
    </div>
  );
} 