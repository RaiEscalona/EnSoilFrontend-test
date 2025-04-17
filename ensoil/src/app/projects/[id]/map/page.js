'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { calculateCoordinates, formatCoordinates } from '@/utils/coordinateUtils';
import DrillingPoint from '@/components/DrillingPoint';
import Alert from '@/components/Alert';

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
  const imageRef = useRef(null);
  const mapContainerRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setMapImage(file);

      // Cargar la imagen para obtener sus dimensiones
      const img = new Image();
      img.onload = () => {
        setImageInfo({
          url: url,
          width: img.width,
          height: img.height,
          topLeft: { north: 0, east: 0 },
          bottomRight: { north: 0, east: 0 }
        });
      };
      img.src = url;
    }
  };

  const handleMapClick = (e) => {
    if (!imageInfo || !mapContainerRef.current) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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

    // Simular API call
    // TODO: Replace with actual API call when backend is ready
    /*
    const response = await fetch('/api/drillingPoints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zoneId: 1,
        tag: newPointData.tag,
        coordinates: {
          type: "Point",
          coordinates: [newPointData.coordinates.east, newPointData.coordinates.north]
        },
        method: "Percusión",
        dateTime: new Date().toISOString(),
        comments: "Punto creado desde el mapa"
      }),
    });
    const newPoint = await response.json();
    */

    // Simulated response
    const newPoint = {
      id: drillingPoints.length + 1,
      tag: newPointData.tag,
      coordinates: newPointData.coordinates,
      clickPosition: newPointData.clickPosition,
      method: "Percusión",
      dateTime: new Date().toISOString(),
      comments: "Punto creado desde el mapa"
    };

    setDrillingPoints([...drillingPoints, newPoint]);
    setShowPointModal(false);
    
    // Mostrar alerta
    setAlertMessage(`${newPointData.tag} creado correctamente en las coordenadas ${formatCoordinates(newPointData.coordinates)}`);
    setShowAlert(true);
    
    setNewPointData({ tag: '', coordinates: null, clickPosition: null });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mapa del Proyecto</h1>
      
      {/* Alert */}
      {showAlert && (
        <Alert 
          message={alertMessage} 
          onClose={() => setShowAlert(false)} 
        />
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subir Mapa
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
        </div>

        {previewUrl && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Vista Previa del Mapa</h2>
            
            {/* Input de coordenadas límite */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Esquina Superior Izquierda</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Norte</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={imageInfo?.topLeft.north || ''}
                      onChange={(e) => setImageInfo({
                        ...imageInfo,
                        topLeft: { ...imageInfo.topLeft, north: parseFloat(e.target.value) }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Este</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={imageInfo?.topLeft.east || ''}
                      onChange={(e) => setImageInfo({
                        ...imageInfo,
                        topLeft: { ...imageInfo.topLeft, east: parseFloat(e.target.value) }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Esquina Inferior Derecha</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Norte</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={imageInfo?.bottomRight.north || ''}
                      onChange={(e) => setImageInfo({
                        ...imageInfo,
                        bottomRight: { ...imageInfo.bottomRight, north: parseFloat(e.target.value) }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Este</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={imageInfo?.bottomRight.east || ''}
                      onChange={(e) => setImageInfo({
                        ...imageInfo,
                        bottomRight: { ...imageInfo.bottomRight, east: parseFloat(e.target.value) }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa con puntos */}
            <div className="flex-1 relative">
              <div 
                ref={mapContainerRef}
                className="relative w-full h-full"
                onClick={handleMapClick}
              >
                {imageInfo && (
                  <img
                    src={imageInfo.url}
                    alt="Mapa del proyecto"
                    className="w-full h-full object-contain"
                  />
                )}
                <div className="absolute inset-0">
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
          </div>
        )}
      </div>

      {/* Modal para crear nuevo punto */}
      {showPointModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Crear Nuevo Punto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Punto</label>
                <input
                  type="text"
                  value={newPointData.tag}
                  onChange={(e) => setNewPointData({ ...newPointData, tag: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              {newPointData.coordinates && (
                <div>
                  <p className="text-sm text-gray-600">
                    Coordenadas: {formatCoordinates(newPointData.coordinates)}
                  </p>
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPointModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePoint}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
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