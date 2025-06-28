'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import api from '@/utils/axios';
import './MapUploader.css';
import ButtonComponent from '../utils/button';

export default function MapUploader({ onMapDataReady }) {
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const fileInputRef = useRef();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

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
      img.onerror = () => {
        setAlertMessage('Error cargando la vista previa de la imagen.');
        setShowAlert(true);
      }
      img.src = url;
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (imageInfo && imageInfo.topLeft.north && imageInfo.topLeft.east && 
        imageInfo.bottomRight.north && imageInfo.bottomRight.east && selectedFile) {
      const formData = new FormData();
      formData.append('projectId', String(id));
      formData.append('map', selectedFile);
      formData.append('name', selectedFile.name);
      formData.append('topLeftEast', String(imageInfo.topLeft.east));
      formData.append('topLeftNorth', String(imageInfo.topLeft.north));
      formData.append('bottomRightEast', String(imageInfo.bottomRight.east));
      formData.append('bottomRightNorth', String(imageInfo.bottomRight.north));
      formData.append('width', String(imageInfo.width));
      formData.append('height', String(imageInfo.height));
      try {
        console.log('🟢 Subiendo mapa para proyecto:', id);
        console.log('🟢 FormData:', {
          name: selectedFile.name,
          topLeftEast: imageInfo.topLeft.east,
          topLeftNorth: imageInfo.topLeft.north,
          bottomRightEast: imageInfo.bottomRight.east,
          bottomRightNorth: imageInfo.bottomRight.north,
          width: imageInfo.width,
          height: imageInfo.height
        });
        await api.post(`/images/projects/map/createProjectMap`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        onMapDataReady(imageInfo);
      } catch (err) {
        console.error('🛑 Error al subir el mapa:', err, err?.response);
        if (err.response && err.response.status === 404) {
          setAlertMessage('El proyecto no existe. Por favor, crea el proyecto antes de subir el mapa.');
        } else {
          setAlertMessage('Error al subir el mapa. Intenta nuevamente o revisa la conexión.');
        }
        setShowAlert(true);
      }
    }
  };

  return (
    <div className="map-uploader">
      {showAlert && (
        <div className="alert-message">
          <span>{alertMessage}</span>
          <button onClick={() => setShowAlert(false)} className="remove-file-button" type="button">×</button>
        </div>
      )}
      <div className="file-input-section">
        {!selectedFile ? (
          // <button
          //   type="button"
          //   onClick={() => fileInputRef.current && fileInputRef.current.click()}
          //   className="file-input-button"
          // >
          //   Elegir Archivo
          // </button>
          <ButtonComponent label={'Elegir Archivo'} onClick={() => fileInputRef.current && fileInputRef.current.click()}/>
        ) : (
          <div className="selected-file">
            <span className="file-name">{selectedFile.name}</span>
            <button onClick={handleRemoveFile} className="remove-file-button" type="button">
              ×
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="file-input"
          ref={fileInputRef}
          tabIndex={-1}
        />
      </div>

      {selectedFile && (
        <div className="map-preview-section">
          <h2 className="map-preview-title">Configuración del Mapa</h2>
          
          <div className="coordinate-grid">
            <div>
              <h3 className="coordinate-section-title">Esquina Superior Izquierda</h3>
              <div className="coordinate-input-group">
                <div>
                  <label className="text-h5">Norte</label>
                  <input
                    type="number"
                    step="any"
                    value={imageInfo?.topLeft.north ?? ''}
                    onChange={(e) => {
                      setImageInfo({
                        ...imageInfo,
                        topLeft: { ...imageInfo.topLeft, north: parseFloat(e.target.value) || 0 }
                      });
                    }}
                    className="coordinate-input"
                    placeholder="Ej: 6250000.123"
                  />
                </div>
                <div>
                  <label className="text-h5">Este</label>
                  <input
                    type="number"
                    step="any"
                    value={imageInfo?.topLeft.east ?? ''}
                    onChange={(e) => {
                      setImageInfo({
                        ...imageInfo,
                        topLeft: { ...imageInfo.topLeft, east: parseFloat(e.target.value) || 0 }
                      });
                    }}
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
                  <label className="text-h5">Norte</label>
                  <input
                    type="number"
                    step="any"
                    value={imageInfo?.bottomRight.north ?? ''}
                    onChange={(e) => {
                      setImageInfo({
                        ...imageInfo,
                        bottomRight: { ...imageInfo.bottomRight, north: parseFloat(e.target.value) || 0 }
                      });
                    }}
                    className="coordinate-input"
                    placeholder="Ej: 6249000.789"
                  />
                </div>
                <div>
                  <label className="text-h5">Este</label>
                  <input
                    type="number"
                    step="any"
                    value={imageInfo?.bottomRight.east ?? ''}
                    onChange={(e) => {
                      setImageInfo({
                        ...imageInfo,
                        bottomRight: { ...imageInfo.bottomRight, east: parseFloat(e.target.value) || 0 }
                      });
                    }}
                    className="coordinate-input"
                    placeholder="Ej: 351000.012"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="submit-section">
            <ButtonComponent label={'Guardar Configuración del Mapa'} onClick={handleSubmit} disable={!imageInfo?.topLeft.north || !imageInfo?.topLeft.east || 
                       !imageInfo?.bottomRight.north || !imageInfo?.bottomRight.east}/>
          </div>
        </div>
      )}
    </div>
  );
} 