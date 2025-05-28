'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { calculateCoordinates, formatCoordinates } from '@/utils/coordinateUtils';
import DrillingPoint from '@/components/DrillingPoint';
import Alert from '@/components/Alert';
import MapUploader from '@/components/MapUploader';
import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
import api from '@/utils/axios';
import './map.css';
import Button from '@/components/button';
import Image from 'next/image';

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
    coordinates: {
      east: '',
      north: ''
    }
  });
  const [previewPoint, setPreviewPoint] = useState(null);
  const [mapScale, setMapScale] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const mapContainerRef = useRef(null);
  const modalMapRef = useRef(null);
  const [mouseDownPos, setMouseDownPos] = useState(null);
  // Estado para zoom y pan en el mapa principal
  const [mainMapScale, setMainMapScale] = useState(1);
  const [mainMapOffset, setMainMapOffset] = useState({ x: 0, y: 0 });
  const [mainIsPanning, setMainIsPanning] = useState(false);
  const [mainPanStart, setMainPanStart] = useState({ x: 0, y: 0 });
  const [mainMouseDownPos, setMainMouseDownPos] = useState(null);
  const mainMapRef = useRef(null);
  const [minScale, setMinScale] = useState(1);
  // Estado para zoom y pan en el modal
  const [modalMinScale, setModalMinScale] = useState(1);
  const [modalMouseDownPos, setModalMouseDownPos] = useState(null);

  useEffect(() => {
    console.log("Drilling Point:", drillingPoints);
  }, [drillingPoints]);

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

  // Mover fetchDrillingPoints fuera del useEffect para poder llamarlo después de crear un punto
  const fetchDrillingPoints = async () => {
    if (!imageInfo) return;
    try {
      console.log(`🔄 Cargando puntos de perforación para el proyecto ${id}`);
      const response = await api.get(`/drillingpoints/all/${id}`);
      console.log(`✅ Puntos de perforación cargados exitosamente para el proyecto ${id}:`, response.data);
      setDrillingPoints(response.data.data.map(point => {
        const coords = point.coordinates.coordinates;
        const x = (coords[0] - imageInfo.topLeft.east) / (imageInfo.bottomRight.east - imageInfo.topLeft.east) * imageInfo.width;
        const y = (coords[1] - imageInfo.topLeft.north) / (imageInfo.bottomRight.north - imageInfo.topLeft.north) * imageInfo.height;
        console.log('Graficando punto:', { id: point.id, tag: point.tag, coords, x, y });
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

  useEffect(() => {
    if (id && imageInfo) {
      fetchDrillingPoints();
    }
  }, [id, imageInfo]);

  // Calcular minScale para el modal
  useEffect(() => {
    if (!imageInfo || !modalMapRef.current) return;
    const container = modalMapRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const scaleX = containerWidth / imageInfo.width;
    const scaleY = containerHeight / imageInfo.height;
    const min = Math.max(scaleX, scaleY);
    setModalMinScale(min);
    setMapScale(min);
    setMapOffset({ x: 0, y: 0 });
  }, [imageInfo, showPointModal]);

  // Limitar pan para que la imagen nunca deje ver bordes blancos en el modal
  const clampModalPan = (offset, scale) => {
    if (!imageInfo || !modalMapRef.current) return { x: 0, y: 0 };
    const container = modalMapRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const imgWidth = imageInfo.width * scale;
    const imgHeight = imageInfo.height * scale;
    let minX = Math.min(0, containerWidth - imgWidth);
    let minY = Math.min(0, containerHeight - imgHeight);
    let maxX = 0;
    let maxY = 0;
    let x = Math.max(minX, Math.min(offset.x, maxX));
    let y = Math.max(minY, Math.min(offset.y, maxY));
    return { x, y };
  };

  // Pan handlers para el modal
  const handlePanStart = (e) => {
    e.preventDefault();
    setIsPanning(true);
    setPanStart({
      x: e.clientX - mapOffset.x,
      y: e.clientY - mapOffset.y,
    });
    setModalMouseDownPos({ x: e.clientX, y: e.clientY });
  };

  const handlePanMove = (e) => {
    if (!isPanning) return;
    const newOffset = {
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    };
    setMapOffset(clampModalPan(newOffset, mapScale));
  };

  const handlePanEnd = (e) => {
    setIsPanning(false);
    if (modalMouseDownPos && e) {
      const dx = e.clientX - modalMouseDownPos.x;
      const dy = e.clientY - modalMouseDownPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 5) {
        // Es un click real, seleccionar punto
        handleMapClick(e);
      }
    }
    setModalMouseDownPos(null);
  };

  // Zoom centrado en el mouse para el modal
  const handleZoom = (e) => {
    e.preventDefault();
    if (!modalMapRef.current) return;
    const container = modalMapRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const prevScale = mapScale;
    let newScale = mapScale;
    if (e.deltaY < 0) {
      newScale = Math.min(mapScale + 0.1, 3);
    } else {
      newScale = Math.max(mapScale - 0.1, modalMinScale);
    }
    // Ajustar offset para centrar el zoom en el mouse
    const imgX = (mouseX - mapOffset.x) / prevScale;
    const imgY = (mouseY - mapOffset.y) / prevScale;
    let newOffset = {
      x: mouseX - imgX * newScale,
      y: mouseY - imgY * newScale,
    };
    newOffset = clampModalPan(newOffset, newScale);
    setMapScale(newScale);
    setMapOffset(newOffset);
  };

  // Click para calcular coordenadas considerando pan y zoom en el modal
  const handleMapClick = (e) => {
    if (!imageInfo || !modalMapRef.current) return;
    const rect = modalMapRef.current.getBoundingClientRect();
    // Ajustar por pan y zoom
    const x = (e.clientX - rect.left - mapOffset.x) / mapScale;
    const y = (e.clientY - rect.top - mapOffset.y) / mapScale;
    // Calcular coordenadas
    const east = imageInfo.topLeft.east + (x / imageInfo.width) * (imageInfo.bottomRight.east - imageInfo.topLeft.east);
    const north = imageInfo.topLeft.north + (y / imageInfo.height) * (imageInfo.bottomRight.north - imageInfo.topLeft.north);
    setNewPointData(prev => ({
      ...prev,
      coordinates: {
        east: east.toFixed(6),
        north: north.toFixed(6)
      }
    }));
  };

  // Calcular preview point considerando pan y zoom
  useEffect(() => {
    if (!imageInfo || !newPointData.coordinates.east || !newPointData.coordinates.north) {
      setPreviewPoint(null);
      return;
    }
    // Posición relativa en porcentaje
    const xPct = (parseFloat(newPointData.coordinates.east) - imageInfo.topLeft.east) / (imageInfo.bottomRight.east - imageInfo.topLeft.east);
    const yPct = (parseFloat(newPointData.coordinates.north) - imageInfo.topLeft.north) / (imageInfo.bottomRight.north - imageInfo.topLeft.north);
    setPreviewPoint({ xPct, yPct });
  }, [newPointData.coordinates, imageInfo]);

  const handleCoordinateChange = (axis, value) => {
    setNewPointData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [axis]: value
      }
    }));
  };

  const handleCreatePoint = async () => {
    if (!newPointData.tag || !newPointData.coordinates.east || !newPointData.coordinates.north) return;

    try {
      const response = await api.post('/drillingPoints', {
        projectId: id,
        tag: newPointData.tag,
        coordinates: {
          type: "Point",
          coordinates: [parseFloat(newPointData.coordinates.east), parseFloat(newPointData.coordinates.north)]
        },
        method: "Diamond drilling",
        dateTime: new Date().toISOString(),
        comments: "Punto creado manualmente"
      });

      // Vuelve a cargar los puntos desde el backend para asegurar consistencia
      await fetchDrillingPoints();

      setShowPointModal(false);
      setAlertMessage(`${newPointData.tag} creado correctamente en las coordenadas ${newPointData.coordinates.east}, ${newPointData.coordinates.north}`);
      setShowAlert(true);
      setNewPointData({ tag: '', coordinates: { east: '', north: '' } });
      setPreviewPoint(null);
      setMapScale(1);
    } catch (error) {
      console.error('❌ Error creando punto:', error.response?.data || error.message);
      setAlertMessage(error.response?.data?.error || 'Error al crear el punto.');
      setShowAlert(true);
    }
  };

  const handleMapDataReady = (data) => {
    setImageInfo(data);
  };

  const handleOpenCreatePointModal = () => {
    console.log('🔄 Intentando abrir modal de creación de punto');
    console.log('Estado actual de showPointModal:', showPointModal);
    
    setNewPointData({
      tag: '',
      coordinates: {
        east: '',
        north: ''
      }
    });
    setPreviewPoint(null);
    setMapScale(1);
    setShowPointModal(true);
    
    console.log('✅ Modal abierto, nuevo estado de showPointModal:', true);
  };

  // Agregar un useEffect para monitorear cambios en showPointModal
  useEffect(() => {
    console.log('🔄 showPointModal cambió a:', showPointModal);
  }, [showPointModal]);

  // Calcular minScale cuando la imagen y el contenedor están listos
  useEffect(() => {
    if (!imageInfo || !mainMapRef.current) return;
    const container = mainMapRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const scaleX = containerWidth / imageInfo.width;
    const scaleY = containerHeight / imageInfo.height;
    const min = Math.max(scaleX, scaleY);
    setMinScale(min);
    setMainMapScale(min);
    setMainMapOffset({ x: 0, y: 0 });
  }, [imageInfo]);

  // Limitar pan para que la imagen nunca deje ver bordes blancos
  const clampPan = (offset, scale) => {
    if (!imageInfo || !mainMapRef.current) return { x: 0, y: 0 };
    const container = mainMapRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const imgWidth = imageInfo.width * scale;
    const imgHeight = imageInfo.height * scale;
    let minX = Math.min(0, containerWidth - imgWidth);
    let minY = Math.min(0, containerHeight - imgHeight);
    let maxX = 0;
    let maxY = 0;
    let x = Math.max(minX, Math.min(offset.x, maxX));
    let y = Math.max(minY, Math.min(offset.y, maxY));
    return { x, y };
  };

  // Pan handlers para el mapa principal
  const handleMainPanStart = (e) => {
    e.preventDefault();
    setMainIsPanning(true);
    setMainPanStart({
      x: e.clientX - mainMapOffset.x,
      y: e.clientY - mainMapOffset.y,
    });
    setMainMouseDownPos({ x: e.clientX, y: e.clientY });
  };

  const handleMainPanMove = (e) => {
    if (!mainIsPanning) return;
    const newOffset = {
      x: e.clientX - mainPanStart.x,
      y: e.clientY - mainPanStart.y,
    };
    setMainMapOffset(clampPan(newOffset, mainMapScale));
  };

  const handleMainPanEnd = () => {
    setMainIsPanning(false);
    setMainMouseDownPos(null);
  };

  // Zoom centrado en el mouse para el mapa principal
  const handleMainZoom = (e) => {
    e.preventDefault();
    if (!mainMapRef.current) return;
    const container = mainMapRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const prevScale = mainMapScale;
    let newScale = mainMapScale;
    if (e.deltaY < 0) {
      newScale = Math.min(mainMapScale + 0.1, 3);
    } else {
      newScale = Math.max(mainMapScale - 0.1, minScale);
    }
    // Ajustar offset para centrar el zoom en el mouse
    const imgX = (mouseX - mainMapOffset.x) / prevScale;
    const imgY = (mouseY - mainMapOffset.y) / prevScale;
    let newOffset = {
      x: mouseX - imgX * newScale,
      y: mouseY - imgY * newScale,
    };
    newOffset = clampPan(newOffset, newScale);
    setMainMapScale(newScale);
    setMainMapOffset(newOffset);
  };

  // Validar si las coordenadas están dentro del mapa
  const isPointInBounds = () => {
    if (!imageInfo) return false;
    const east = parseFloat(newPointData.coordinates.east);
    const north = parseFloat(newPointData.coordinates.north);
    if (isNaN(east) || isNaN(north)) return false;
    const minEast = Math.min(imageInfo.topLeft.east, imageInfo.bottomRight.east);
    const maxEast = Math.max(imageInfo.topLeft.east, imageInfo.bottomRight.east);
    const minNorth = Math.min(imageInfo.topLeft.north, imageInfo.bottomRight.north);
    const maxNorth = Math.max(imageInfo.topLeft.north, imageInfo.bottomRight.north);
    return east >= minEast && east <= maxEast && north >= minNorth && north <= maxNorth;
  };

  if (isLoading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <WithSidebarLayout>
    <div className="dark:bg-secondary map-page-container">
      <div className="map-header">
        <div className="text-h2">Mapa del Proyecto</div>
        <Button label={"Ir a Análisis"} route={`/projects/${id}/analysis`} size="h4" fullWidth={false}></Button>
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
          <div
            className="map-display-container"
            style={{
              overflow: 'hidden',
              background: '#fff',
              borderRadius: '8px',
              position: 'relative',
              width: '100%',
              maxWidth: imageInfo ? `${Math.min(imageInfo.width, 1000)}px` : '100%',
              aspectRatio: imageInfo ? `${imageInfo.width} / ${imageInfo.height}` : '4 / 3',
              margin: '0 auto',
              minHeight: imageInfo ? `${imageInfo.height * (Math.min(imageInfo.width, 1000) / imageInfo.width)}px` : '300px',
            }}
          >
            <div className="flex justify-center mb-4">
              <Button 
                label="Crear punto nuevo" 
                onClick={() => {
                  console.log('🔄 Botón "Crear punto nuevo" clickeado');
                  handleOpenCreatePointModal();
                }}
                size="h4" 
                fullWidth={false}
              />
            </div>
            <div
              ref={mainMapRef}
              className="map-image-container"
              onWheel={handleMainZoom}
              onMouseDown={handleMainPanStart}
              onMouseMove={handleMainPanMove}
              onMouseUp={handleMainPanEnd}
              onMouseLeave={handleMainPanEnd}
              style={{
                width: '100%',
                height: '100%',
                cursor: mainIsPanning ? 'grabbing' : 'grab',
                userSelect: 'none',
                position: 'relative',
                overflow: 'hidden',
                background: '#fff',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  width: `${imageInfo?.width ?? 800}px`,
                  height: `${imageInfo?.height ?? 600}px`,
                  position: 'absolute',
                  left: mainMapOffset.x,
                  top: mainMapOffset.y,
                  transform: `scale(${mainMapScale})`,
                  transformOrigin: 'top left',
                  transition: mainIsPanning ? 'none' : 'transform 0.1s',
                }}
              >
                <Image
                  src={imageInfo.url}
                  alt="Mapa del proyecto"
                  className="map-image"
                  fill={false}
                  width={imageInfo?.width ?? 800}
                  height={imageInfo?.height ?? 600}
                  style={{ objectFit: 'cover', width: '100%', height: '100%', pointerEvents: 'none' }}
                />
                {drillingPoints
                  .filter(p => p.clickPosition.x >= 0 && p.clickPosition.x <= imageInfo.width && p.clickPosition.y >= 0 && p.clickPosition.y <= imageInfo.height)
                  .map((point) => {
                    const size = 20 / mainMapScale;
                    const border = 2 / mainMapScale;
                    return (
                      <div
                        key={point.id}
                        style={{
                          position: 'absolute',
                          left: `${point.clickPosition.x}px`,
                          top: `${point.clickPosition.y}px`,
                          transform: `translate(-50%, -50%)`,
                          width: `${size}px`,
                          height: `${size}px`,
                          zIndex: 2,
                          pointerEvents: 'auto',
                        }}
                      >
                        <DrillingPoint
                          projectId={id}
                          id={point.id}
                          point={point}
                          imageInfo={imageInfo}
                          clickPosition={{ x: 0, y: 0 }}
                          size={size}
                          border={border}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>

      {showPointModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '90vw', width: '1200px' }}>
            <h2 className="modal-title text-black">Crear Nuevo Punto</h2>
            <div className="modal-body" style={{ display: 'flex', gap: '2rem' }}>
              <div className="flex-1" style={{ position: 'relative', height: '500px', overflow: 'hidden', background: '#f8f8f8', borderRadius: '8px' }}>
                <div 
                  ref={modalMapRef}
                  className="map-image-container"
                  onWheel={handleZoom}
                  onMouseDown={handlePanStart}
                  onMouseMove={handlePanMove}
                  onMouseUp={handlePanEnd}
                  onMouseLeave={() => { setIsPanning(false); setModalMouseDownPos(null); }}
                  style={{ 
                    width: '100%',
                    height: '100%',
                    cursor: isPanning ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${imageInfo?.width ?? 800}px`,
                      height: `${imageInfo?.height ?? 600}px`,
                      position: 'absolute',
                      left: mapOffset.x,
                      top: mapOffset.y,
                      transform: `scale(${mapScale})`,
                      transformOrigin: 'top left',
                      transition: isPanning ? 'none' : 'transform 0.1s',
                    }}
                  >
                    <Image
                      src={imageInfo.url}
                      alt="Mapa del proyecto"
                      className="map-image"
                      fill={false}
                      width={imageInfo?.width ?? 800}
                      height={imageInfo?.height ?? 600}
                      style={{ objectFit: 'cover', width: '100%', height: '100%', pointerEvents: 'none' }}
                    />
                    {previewPoint && (
                      <div
                        className="preview-point"
                        style={{
                          position: 'absolute',
                          left: `calc(${previewPoint.xPct * 100}% )`,
                          top: `calc(${previewPoint.yPct * 100}% )`,
                          transform: 'translate(-50%, -50%)',
                          width: `${20 / mapScale}px`,
                          height: `${20 / mapScale}px`,
                          backgroundColor: 'green',
                          borderRadius: '50%',
                          border: `${2 / mapScale}px solid white`,
                          boxShadow: '0 0 0 2px rgba(0,0,0,0.3)',
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="space-y-4">
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
                  <div>
                    <label className="modal-input-label">Coordenada Este</label>
                    <input
                      type="number"
                      step="any"
                      value={newPointData.coordinates.east}
                      onChange={(e) => handleCoordinateChange('east', e.target.value)}
                      className="modal-input"
                      placeholder="Ingrese la coordenada este"
                    />
                  </div>
                  <div>
                    <label className="modal-input-label">Coordenada Norte</label>
                    <input
                      type="number"
                      step="any"
                      value={newPointData.coordinates.north}
                      onChange={(e) => handleCoordinateChange('north', e.target.value)}
                      className="modal-input"
                      placeholder="Ingrese la coordenada norte"
                    />
                  </div>
                  <div className="modal-footer">
                    {!isPointInBounds() && (
                      <div style={{ color: 'red', marginBottom: '8px', fontSize: '0.95em' }}>
                        Las coordenadas están fuera de los límites del mapa.
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setShowPointModal(false);
                        setNewPointData({ tag: '', coordinates: { east: '', north: '' } });
                        setPreviewPoint(null);
                        setMapScale(1);
                      }}
                      className="modal-button modal-button-cancel"
                      type="button"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreatePoint}
                      className="modal-button modal-button-confirm"
                      disabled={!newPointData.tag || !newPointData.coordinates.east || !newPointData.coordinates.north || !isPointInBounds()}
                      type="button"
                    >
                      Crear Punto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </WithSidebarLayout>
  );
} 