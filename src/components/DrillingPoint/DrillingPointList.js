import DrillingPointListItem from './DrillingPointListItem';
import './DrillingPointList.css';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';

export default function DrillingPointList({ projectId, drillingPoints, selectedPoints, setSelectedPoints }) {
  const [eyeState, setEyeState] = useState(1);

  useEffect(() => {
    if (eyeState === 1 && drillingPoints && drillingPoints.length > 0) {
      setSelectedPoints(drillingPoints.map(p => p.id));
    }
  }, [drillingPoints, eyeState, setSelectedPoints]);

  const handleEyeClick = () => {
    const nextState = (eyeState % 3) + 1;
    setEyeState(nextState);
    if (nextState === 1) {
      setSelectedPoints(drillingPoints.map(p => p.id));
    } else if (nextState === 2) {
      setSelectedPoints([]);
    }
  };

  const handleCheckboxChange = (pointId) => {
    if (eyeState === 3) {
      setSelectedPoints(prev => 
        prev.includes(pointId) ? prev.filter(id => id !== pointId) : [...prev, pointId]
      );
    }
  };

  if (!drillingPoints || drillingPoints.length === 0) {
    return <div className="drilling-point-list-empty">No hay puntos de perforación registrados.</div>;
  }

  return (
    <div className="drilling-point-list bg-quaternary dark:bg-tertiary dark:text-black">
      <div className="drilling-point-list-header">
        <button onClick={handleEyeClick} className="eye-button">
          {eyeState === 1 && <Eye size={24} />}
          {eyeState === 2 && <EyeOff size={24} />}
          {eyeState === 3 && <Search size={24} />}
        </button>
        <span className="eye-state-text">
          {eyeState === 1 && 'Todo seleccionado'}
          {eyeState === 2 && 'Sin seleccionar'}
          {eyeState === 3 && 'Selección libre'}
        </span>
      </div>
      {drillingPoints.map(point => (
        <DrillingPointListItem 
          key={point.id} 
          projectId={projectId} 
          point={point} 
          isSelected={selectedPoints.includes(point.id)}
          onCheckboxChange={() => handleCheckboxChange(point.id)}
        />
      ))}
    </div>
  );
} 