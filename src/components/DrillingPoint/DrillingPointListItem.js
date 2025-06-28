import Link from 'next/link';
import { formatCoordinates } from '@/utils/coordinateUtils';
import './DrillingPointListItem.css';
import { CheckSquare, Square } from 'lucide-react';
import ButtonComponent from '../utils/button';

export default function DrillingPointListItem({ projectId, point, isSelected, onCheckboxChange }) {
  const route = `/projects/${projectId}/map/drillingPoint/${point.id}`;
  return (
    <div className="drilling-point-list-item bg-white dark:bg-quaternary">
      <div className="dpi-checkbox" onClick={onCheckboxChange}>
        {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
      </div>
      <div className="dpi-name">{point.tag}</div>
      <div className="dpi-coords">{formatCoordinates(point.coordinates)}</div>
      {/* <div className="dpi-link">
        <Link href={route} className="dpi-link-btn">Ver</Link>
      </div> */}
      <ButtonComponent label={'Ver'} route={route}/>
    </div>
  );
} 