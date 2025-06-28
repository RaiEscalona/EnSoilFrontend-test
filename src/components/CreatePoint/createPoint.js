'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import './createPoint.css';
import ZoomControls from '../ZoomControls/ZoomControls';
import ButtonComponent from '../utils/button';

export default function CreatePoint({ imageInfo, handleCreatePoint, mapScale, setMapScale, previewPoint, setPreviewPoint, newPointData, setNewPointData, showPointModal, setShowPointModal }) {
    const [isPanning, setIsPanning] = useState(false);
    const [modalMouseDownPos, setModalMouseDownPos] = useState(null);
    const [isMouseOverMap, setIsMouseOverMap] = useState(false);
    const modalMapRef = useRef(null);
    const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
    const [modalMinScale, setModalMinScale] = useState(1);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

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

    const handleWheel = (e) => {
        if (isMouseOverMap) {
            e.preventDefault();
            handleZoom(e);
        }
    };

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

    const handleCoordinateChange = (axis, value) => {
        setNewPointData(prev => ({
        ...prev,
        coordinates: {
            ...prev.coordinates,
            [axis]: value
        }
        }));
    };

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

    useEffect(() => {
        const el = modalMapRef.current;
        if (el) {
            el.addEventListener('wheel', () => {}, { passive: false });
        }
    }, []);

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
    }, [imageInfo, showPointModal, setMapScale]);

    useEffect(() => {
        if (!imageInfo || !newPointData.coordinates.east || !newPointData.coordinates.north) {
            setPreviewPoint(null);
            return;
        }
        // Posición relativa en porcentaje
        const xPct = (parseFloat(newPointData.coordinates.east) - imageInfo.topLeft.east) / (imageInfo.bottomRight.east - imageInfo.topLeft.east);
        const yPct = (parseFloat(newPointData.coordinates.north) - imageInfo.topLeft.north) / (imageInfo.bottomRight.north - imageInfo.topLeft.north);
        setPreviewPoint({ xPct, yPct });
    }, [newPointData.coordinates, imageInfo, setPreviewPoint]);

    useEffect(() => {
        if (isMouseOverMap) {
            document.body.style.overflowY = 'hidden';
        } else {
            document.body.style.overflowY = 'auto';
        }
    }, [isMouseOverMap]);

    return (
        <div className="modal-backdrop">
            <div className="modal-content bg-white dark:bg-quaternary" style={{ maxWidth: '70%', width: '90vw', maxHeight: '95%' }}>
                <div className="text-h3 text-black dark:text-white">Crear Nuevo Punto</div>
                <div className="modal-body">
                        <div 
                            ref={modalMapRef}
                            className="modal-map-image-container"
                            onWheel={handleWheel}
                            onMouseDown={handlePanStart}
                            onMouseMove={handlePanMove}
                            onMouseUp={handlePanEnd}
                            onMouseLeave={() => { setIsPanning(false); setModalMouseDownPos(null); setIsMouseOverMap(false) }}
                            onMouseEnter={() => setIsMouseOverMap(true)}
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
                                    fill
                                    style={{
                                        objectFit: 'contain',
                                        width: '100%',
                                        height: '100%',
                                        pointerEvents: 'none',
                                    }}
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
                    {/* Botones de zoom para el modal debajo del mapa (únicos) */}
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 6 }}>
                            <ZoomControls
                                onZoomIn={(e) => {
                                    if (e) e.stopPropagation();
                                    const newScale = Math.min(mapScale + 0.1, 3);
                                    setMapScale(newScale);
                                    setMapOffset(clampModalPan(mapOffset, newScale));
                                }}
                                onZoomOut={(e) => {
                                    if (e) e.stopPropagation();
                                    const newScale = Math.max(mapScale - 0.1, modalMinScale);
                                    setMapScale(newScale);
                                    setMapOffset(clampModalPan(mapOffset, newScale));
                                }}
                            />
                        </div>
                    <div className="flex-1">
                        <div className="space-y-2">
                            <div>
                                <label className="modal-input-label text-h4 text-black dark:text-white">Nombre del Punto</label>
                                <input
                                    type="text"
                                    value={newPointData.tag}
                                    onChange={(e) => setNewPointData({ ...newPointData, tag: e.target.value })}
                                    className="modal-input dark:bg-white text-black px-2"
                                    placeholder='Ingrese un nombre'
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="modal-input-label text-h4 text-black dark:text-white">Coordenada Este</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={newPointData.coordinates.east}
                                    onChange={(e) => handleCoordinateChange('east', e.target.value)}
                                    className="modal-input dark:bg-white text-black px-2"
                                    placeholder="Ingrese la coordenada este"
                                />
                            </div>
                            <div>
                                <label className="modal-input-label text-h4 text-black dark:text-white">Coordenada Norte</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={newPointData.coordinates.north}
                                    onChange={(e) => handleCoordinateChange('north', e.target.value)}
                                    className="modal-input dark:bg-white text-black px-2"
                                    placeholder="Ingrese la coordenada norte"
                                />
                            </div>
                            <div className="modal-footer">
                                {!isPointInBounds() && (
                                    <div style={{ color: 'red', marginBottom: '6px', fontSize: '0.9em' }}>
                                    Las coordenadas están fuera de los límites del mapa.
                                    </div>
                                )}
                                
                                <ButtonComponent label={'Cancelar'} onClick={() => {
                                    setShowPointModal(false);
                                    setNewPointData({ tag: '', coordinates: { east: '', north: '' } });
                                    setPreviewPoint(null);
                                    setMapScale(1);
                                    }}/>
                                    
                                <ButtonComponent label={'Crear punto'} onClick={handleCreatePoint} disable={!newPointData.tag || !newPointData.coordinates.east || !newPointData.coordinates.north || !isPointInBounds()}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}