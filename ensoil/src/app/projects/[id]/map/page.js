'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { calculateCoordinates, formatCoordinates } from '@/utils/coordinateUtils';
import DrillingPoint from '@/components/DrillingPoint';
import Alert from '@/components/Alert';
import MapUploader from '@/components/MapUploader';
import api from '@/utils/axios';
import './map.css';

export default function ProjectMapPage() {
  const { id } = useParams();
  const [mapImage, setMapImage] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [drillingPoints, setDrillingPoints] = useState([]);
  const [showPointModal, setShowPointModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [newPointData, setNewPointData] = useState({
    tag: '',
    coordinates: null,
    clickPosition: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        console.log(`🔄 Cargando datos del proyecto ${id}`);
        const response = await api.get(`/images/projects/map/${id}`);
        console.log('✅ Datos del proyecto cargados:', response.data);

        if (response.data && response.data.data && response.data.data.length > 0) {
          const map = response.data.data[0];
          setImageInfo({
            url: map.url,
            width: map.width || 800,
            height: map.height || 600,
            topLeft: {
              north: map.topLeftNorth,
              east: map.topLeftEast
            },
            bottomRight: {
              north: map.bottomRightNorth,
              east: map.bottomRightEast
            }
          });
        } else {
          setAlertMessage('Por favor, adjunta el mapa del proyecto. Proyecto sin mapa configurado, por favor, indique qué mapa desea utilizar.');
          setShowAlert(true);
        }
      } catch (error) {
        console.error('❌ Error cargando datos del proyecto:', error.response?.data || error.message);
        setAlertMessage('Error al cargar los datos del proyecto. Por favor, configura el mapa manualmente.');
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  useEffect(() => {
    const fetchDrillingPoints = async () => {
      if (!imageInfo) return;

      try {
        console.log(`🔄 Cargando puntos de perforación para el proyecto ${id}`);
        const response = await api.get(`/drillingpoints/all/${id}`);
        console.log(`✅ Puntos de perforación cargados exitosamente para el proyecto ${id}:`, response.data);

        setDrillingPoints(response.data.data.map(point => {
          const x = (point.coordinates.coordinates[0] - imageInfo.topLeft.east) / (imageInfo.bottomRight.east - imageInfo.topLeft.east) * imageInfo.width;
          const y = (point.coordinates.coordinates[1] - imageInfo.topLeft.north) / (imageInfo.bottomRight.north - imageInfo.topLeft.north) * imageInfo.height;
          return {
            ...point,
            clickPosition: { x, y }
          };
        }));
      } catch (error) {
        console.error(`❌ Error cargando puntos de perforación para el proyecto ${id}:`, error.response?.data || error.message);
        setAlertMessage(error.response?.data?.error || 'Error al cargar los puntos de perforación.');
        setShowAlert(true);
      }
    };

    if (id && imageInfo) {
      fetchDrillingPoints();
    }
  }, [id, imageInfo]);

  const handleMapClick = (e) => {
    if (!imageInfo || !mapContainerRef.current) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    const coordinates = calculateCoordinates(imageInfo, { x, y });
    setNewPointData({ 
      ...newPointData, 
      coordinates,
      clickPosition: { x, y }
    });
    setShowPointModal(true);
  };

  const handleCreatePoint = async () => {
    if (!newPointData.tag || !newPointData.coordinates) return;

    try {
      console.log('🔄 Creando nuevo punto en el mapa:', {
        projectId: id,
        tag: newPointData.tag,
        coordinates: newPointData.coordinates
      });

      const response = await api.post('/drillingPoints', {
        projectId: id,
        tag: newPointData.tag,
        coordinates: {
          type: "Point",
          coordinates: [newPointData.coordinates.east, newPointData.coordinates.north]
        },
        method: "Diamond drilling",
        dateTime: new Date().toISOString(),
        comments: "Punto creado desde el mapa"
      });

      console.log('✅ Punto creado exitosamente:', response.data);

      setDrillingPoints([...drillingPoints, { ...response.data, clickPosition: newPointData.clickPosition }]);
      setShowPointModal(false);
      
      setAlertMessage(`${newPointData.tag} creado correctamente en las coordenadas ${formatCoordinates(newPointData.coordinates)}`);
      setShowAlert(true);
      
      setNewPointData({ tag: '', coordinates: null, clickPosition: null });
    } catch (error) {
      console.error('❌ Error creando punto:', error.response?.data || error.message);
      setAlertMessage(error.response?.data?.error || 'Error al crear el punto.');
      setShowAlert(true);
    }
  };

  const handleMapDataReady = (data) => {
    setImageInfo(data);
  };

  if (isLoading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="map-main-bg map-page-container">
      <div className="map-header">
        <h1 className="map-title">Mapa del Proyecto</h1>
        <Link href={`/projects/${id}/analysis`}>
          <span className="analysis-link-button" role="button">
            Ir a Análisis
          </span>
        </Link>
      </div>
      
      {showAlert && (
        <Alert 
          message={alertMessage} 
          onClose={() => setShowAlert(false)} 
        />
      )}

      <div className="map-card">
        {!imageInfo ? (
          <MapUploader onMapDataReady={handleMapDataReady} />
        ) : (
          <div className="map-display-container">
            <div 
              ref={mapContainerRef}
              className="map-image-container"
              onClick={handleMapClick}
              style={{ cursor: 'crosshair' }}
            >
              <img
                src={imageInfo.url}
                alt="Mapa del proyecto"
                className="map-image"
              />
              <div className="drilling-points-overlay">
                {drillingPoints.map((point) => (
                  <DrillingPoint
                    key={point.id}
                    point={point}
                    imageInfo={imageInfo}
                    clickPosition={point.clickPosition}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showPointModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2 className="modal-title">Crear Nuevo Punto</h2>
            <div className="modal-body">
              <div>
                <label className="modal-input-label">Nombre del Punto</label>
                <input
                  type="text"
                  value={newPointData.tag}
                  onChange={(e) => setNewPointData({ ...newPointData, tag: e.target.value })}
                  className="modal-input"
                  autoFocus
                />
              </div>
              {newPointData.coordinates && (
                <div>
                  <p className="modal-coordinates-text">
                    Coordenadas: {formatCoordinates(newPointData.coordinates)}
                  </p>
                </div>
              )}
              <div className="modal-footer">
                <button
                  onClick={() => setShowPointModal(false)}
                  className="modal-button modal-button-cancel"
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePoint}
                  className="modal-button modal-button-confirm"
                  disabled={!newPointData.tag}
                  type="button"
                >
                  Crear Punto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 