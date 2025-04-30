'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { calculateCoordinates, formatCoordinates } from '@/utils/coordinateUtils';
import DrillingPoint from '@/components/DrillingPoint';
import Alert from '@/components/Alert';
import api from '@/utils/axios';
import './map.css'; // Import the new CSS file

export default function ProjectMapPage() {
  const { id } = useParams();
  const [mapImage, setMapImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
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
  const mapContainerRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setMapImage(file);

      const img = new Image();
      img.onload = () => {
        setImageInfo({
          url: url,
          width: img.width,
          height: img.height,
          topLeft: { north: 0, east: 0 },
          bottomRight: { north: 0, east: 0 }
        });
        // Clean up the object URL after loading
        // URL.revokeObjectURL(url); // Consider if needed based on usage
      };
      img.onerror = () => {
        console.error("Error loading image preview.");
        // Optionally revoke URL here too if preview fails
        // URL.revokeObjectURL(url);
      }
      img.src = url;
    }
  };

  const handleMapClick = (e) => {
    if (!imageInfo || !mapContainerRef.current) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    // Use offsetX and offsetY for coordinates relative to the clicked element (the map container)
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    // Ensure coordinates are within the image bounds if needed
    // Check if imageInfo.width and imageInfo.height are available
    // if (x < 0 || x > imageInfo.width || y < 0 || y > imageInfo.height) return;

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

      const response = await api.post('/api/drillingPoints', {
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

  useEffect(() => {
    const fetchDrillingPoints = async () => {
      try {
        console.log(`🔄 Cargando puntos de perforación para el proyecto ${id}`);
        const response = await api.get(`/api/projects/${id}/drillingPoints`);
        console.log(`✅ Puntos de perforación cargados exitosamente para el proyecto ${id}:`, response.data);

        setDrillingPoints(response.data.map(point => ({
          ...point,
          clickPosition: {
            x: (point.coordinates.coordinates[0] - imageInfo?.topLeft.east) / (imageInfo?.bottomRight.east - imageInfo?.topLeft.east) * imageInfo?.width,
            y: (point.coordinates.coordinates[1] - imageInfo?.topLeft.north) / (imageInfo?.bottomRight.north - imageInfo?.topLeft.north) * imageInfo?.height
          }
        })));
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

  // Cleanup object URL when component unmounts or previewUrl changes
  // useEffect(() => {
  //   return () => {
  //     if (previewUrl && previewUrl.startsWith('blob:')) {
  //       URL.revokeObjectURL(previewUrl);
  //     }
  //   };
  // }, [previewUrl]);

  return (
    <div className="map-page-container">
      <div className="map-header">
        <h1 className="map-title">Mapa del Proyecto</h1>
        <Link href={`/projects/${id}/analysis`}>
          {/* Use a button or an anchor styled as a button */}
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
        <div className="file-input-section">
          <label className="file-input-label">
            Subir Mapa
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="file-input"
          />
        </div>

        {previewUrl && (
          <div className="map-preview-section">
            <h2 className="map-preview-title">Vista Previa del Mapa</h2>
            
            <div className="coordinate-grid">
              <div>
                <h3 className="coordinate-section-title">Esquina Superior Izquierda</h3>
                <div className="coordinate-input-group">
                  <div>
                    <label className="coordinate-label">Norte</label>
                    <input
                      type="number"
                      step="any" // Allow any decimal step
                      value={imageInfo?.topLeft.north ?? ''} // Use nullish coalescing
                      onChange={(e) => setImageInfo({
                        ...imageInfo,
                        topLeft: { ...imageInfo.topLeft, north: parseFloat(e.target.value) || 0 } // Default to 0 if parse fails
                      })}
                      className="coordinate-input"
                      placeholder="Ej: 6250000.123"
                    />
                  </div>
                  <div>
                    <label className="coordinate-label">Este</label>
                    <input
                      type="number"
                      step="any"
                      value={imageInfo?.topLeft.east ?? ''}
                      onChange={(e) => setImageInfo({
                        ...imageInfo,
                        topLeft: { ...imageInfo.topLeft, east: parseFloat(e.target.value) || 0 }
                      })}
                      className="coordinate-input"
                      placeholder="Ej: 350000.456"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="coordinate-section-title">Esquina Inferior Derecha</h3>
                <div className="coordinate-input-group">
                  <div>
                    <label className="coordinate-label">Norte</label>
                    <input
                      type="number"
                      step="any"
                      value={imageInfo?.bottomRight.north ?? ''}
                      onChange={(e) => setImageInfo({
                        ...imageInfo,
                        bottomRight: { ...imageInfo.bottomRight, north: parseFloat(e.target.value) || 0 }
                      })}
                      className="coordinate-input"
                      placeholder="Ej: 6249000.789"
                    />
                  </div>
                  <div>
                    <label className="coordinate-label">Este</label>
                    <input
                      type="number"
                      step="any"
                      value={imageInfo?.bottomRight.east ?? ''}
                      onChange={(e) => setImageInfo({
                        ...imageInfo,
                        bottomRight: { ...imageInfo.bottomRight, east: parseFloat(e.target.value) || 0 }
                      })}
                      className="coordinate-input"
                      placeholder="Ej: 351000.012"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="map-display-container">
              <div 
                ref={mapContainerRef}
                className="map-image-container"
                onClick={handleMapClick} // Attach click handler here
                style={{ cursor: 'crosshair' }} // Indicate clickable area
              >
                {imageInfo?.url && ( // Ensure URL exists before rendering image
                  <img
                    src={imageInfo.url}
                    alt="Mapa del proyecto"
                    className="map-image"
                    // Add width/height from imageInfo for better layout stability
                    // width={imageInfo.width} 
                    // height={imageInfo.height}
                  />
                )}
                <div className="drilling-points-overlay">
                  {drillingPoints.map((point) => (
                    <DrillingPoint
                      key={point.id}
                      point={point}
                      imageInfo={imageInfo} // Pass imageInfo if needed by DrillingPoint
                      clickPosition={point.clickPosition}
                    />
                  ))}
                </div>
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
                  autoFocus // Focus the input when modal opens
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
                  type="button" // Explicitly set type
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePoint}
                  className="modal-button modal-button-confirm"
                  disabled={!newPointData.tag} // Disable if tag is empty
                  type="button" // Explicitly set type
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