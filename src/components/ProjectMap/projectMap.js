'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import './projectMap.css';
import MapUploader from '../MapUploader/MapUploader';
import DrillingPoint from '../DrillingPoint/DrillingPoint';
import ButtonComponent from '../utils/button';
import ZoomControls from '../ZoomControls/ZoomControls';

export default function ProjectMap({ id, imageInfo, handleMapDataReady, handleOpenCreatePointModal, drillingPoints, selectedPoints, showPointModal  }) {
    
    const mainMapRef = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [mainMapScale, setMainMapScale] = useState(1);
    const [mainIsPanning, setMainIsPanning] = useState(false);
    const [mainPanStart, setMainPanStart] = useState({ x: 0, y: 0 });
    const [mainMouseDownPos, setMainMouseDownPos] = useState(null);
    const [mainMapOffset, setMainMapOffset] = useState({ x: 0, y: 0 });
    const [isMouseOverMainMap, setIsMouseOverMainMap] = useState(false);
    const [minScale, setMinScale] = useState(1);

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

    useEffect(() => {
        if (!imageInfo || !mainMapRef.current || !imageLoaded) return;
        const container = mainMapRef.current;
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const scaleX = containerWidth / imageInfo.width;
        const scaleY = containerHeight / imageInfo.height;
        const min = Math.max(scaleX, scaleY);
        setMinScale(min);
        setMainMapScale(min);
        setMainMapOffset({ x: 0, y: 0 });
    }, [imageInfo, imageLoaded]);

    useEffect(() => {
        if (isMouseOverMainMap) {
        document.body.style.overflow = 'hidden';
        } else {
        document.body.style.overflow = 'auto';
        }
        return () => {
        document.body.style.overflow = 'auto';
        };
    }, [isMouseOverMainMap]);

    return (
        <div className="map-card">
            {!imageInfo ? (
                <MapUploader onMapDataReady={handleMapDataReady} />
            ) : (
            <div
                className="map-display-container"
                style={{
                overflow: 'hidden',
                objectFit: 'contain',
                background: '#fff',
                borderRadius: '8px',
                position: 'relative',
                width: '100%',
                maxWidth: imageInfo ? `${Math.min(imageInfo.width, 1000)}px` : '100%',
                aspectRatio: imageInfo ? `${imageInfo.width} / ${imageInfo.height}` : '4 / 3',
                margin: '0 auto',
                minHeight: imageInfo ? `${imageInfo.height * (Math.min(imageInfo.width, 1000) / imageInfo.width)}px` : '300px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                }}>
                    <div
                    ref={mainMapRef}
                    className="map-image-container"
                    onWheel={handleMainZoom}
                    onMouseDown={handleMainPanStart}
                    onMouseMove={handleMainPanMove}
                    onMouseUp={handleMainPanEnd}
                    onMouseLeave={() => { handleMainPanEnd(); setIsMouseOverMainMap(false); }}
                    onMouseEnter={() => setIsMouseOverMainMap(true)}
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
                                objectFit: 'contain',
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
                            style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
                            onLoad={() => setImageLoaded(true)}
                            />
                            {drillingPoints
                            .filter(p => selectedPoints.includes(p.id))
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
                {/* Botones de zoom SOLO para el mapa principal, ocultos si el modal está abierto */}
                {!showPointModal && (
                <div className='grid grid-cols-4 justify-items-center items-center md:grid-cols-3' >
                    <div className='col-start-1'>
                        <ButtonComponent 
                            label="Crear punto nuevo" 
                            onClick={() => {
                            console.log('🔄 Botón "Crear punto nuevo" clickeado');
                            handleOpenCreatePointModal();
                            }}
                            size="h4" 
                            fullWidth={false}
                        />
                    </div>
                    <div className='col-start-4 md:col-start-3' style={{ margin: 16, pointerEvents: 'auto', zIndex: 200 }}>
                        <ZoomControls
                            onZoomIn={(e) => {
                            if (e) e.stopPropagation();
                            const newScale = Math.min(mainMapScale + 0.1, 3);
                            setMainMapScale(newScale);
                            setMainMapOffset(clampPan(mainMapOffset, newScale));
                            }}
                            onZoomOut={(e) => {
                            if (e) e.stopPropagation();
                            const newScale = Math.max(mainMapScale - 0.1, minScale);
                            setMainMapScale(newScale);
                            setMainMapOffset(clampPan(mainMapOffset, newScale));
                            }}
                        />
                    </div>
                </div>
                )}
            </div>
            )}
        </div>
    );
}