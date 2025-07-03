'use client';

import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from '@/utils/axios';
import '../../map.css';
import ButtonComponent from "@/components/utils/button";
import Image from 'next/image';
import Alert from "@/components/Alert/Alert";
import { MapPinned, Pickaxe, Sprout } from "lucide-react";
import SampleLogsTable from "@/components/DrillingPoint/sampleLogsTable";
import LayerLogTable from "@/components/DrillingPoint/layerLogTable";

export default function DrillingPointView() {
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const { id, drillingPointId } = useParams();
    const [drillingPoint, setDrillingPoint] = useState(null);
    const [drillingPointPhotos, setDrillingPointPhotos] = useState([]);
    const [layerLogs, setLayerLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDrillingPoint = async () => {
            try {
                const response = await api.get(`/drillingpoints/${drillingPointId}`);

                setDrillingPoint(response.data);
                setDrillingPointPhotos(response.data.drillingPointPhotos || []);
                setLayerLogs(response.data.layerLogs || []);
            } catch (error) {
                setAlertMessage(error.response?.data?.error || 'Error al cargar el punto de perforación.');
                setShowAlert(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDrillingPoint();
    }, []);

    if (isLoading) {
        return <div className="loading">Cargando...</div>;
    }

    if (!drillingPoint) {
        return (
            <WithSidebarLayout>
                <div className="dark:bg-secondary map-page-container">
                    <div className="text-center py-8">
                        <div className="text-h3">No se encontró el punto de perforación</div>
                        <ButtonComponent label={"Volver al mapa"} route={`/projects/${id}/map`} size="h4" fullWidth={false}></ButtonComponent>
                    </div>
                </div>
            </WithSidebarLayout>
        );
    }

    return (
        <WithSidebarLayout>
            <div className="dark:bg-secondary map-page-container">
                {showAlert && (
                    <Alert message={alertMessage} onClose={() => setShowAlert(false)} />
                )}
                <div className="map-header">
                    <div className="text-h2">
                        Punto de excavación {drillingPoint.tag || 'Sin etiqueta'}
                    </div>
                    <ButtonComponent label={"Volver al mapa"} route={`/projects/${id}/map`} size="h4" fullWidth={false}></ButtonComponent>
                </div>
                <div className="m-4">
                    <div className="grid grid-row justify-center text-h4 gap-3">
                        {drillingPoint.coordinates && drillingPoint.coordinates.coordinates && drillingPoint.coordinates.coordinates.length >= 2 && (
                        <div className="border-1 rounded-full py-3 px-4">
                            <MapPinned 
                                size={30}
                                strokeWidth={1}
                                className="inline"/> {(drillingPoint.coordinates.coordinates[0])?.toFixed(5)}, {(drillingPoint.coordinates.coordinates[1])?.toFixed(5)}
                        </div>
                        )}
                        {drillingPoint.method && (
                        <div className="border-1 rounded-full py-3 px-4">
                            <Pickaxe 
                                size={30}
                                strokeWidth={1}
                                className="inline"/> {drillingPoint.method}
                        </div>
                        )}
                        {drillingPoint.matrixType && (
                        <div className="border-1 rounded-full py-3 px-4">
                            <Sprout 
                                size={30}
                                strokeWidth={1}
                                className="inline"/> {drillingPoint.matrixType}
                        </div>
                        )}
                    </div>
                    
                    <SampleLogsTable drillingPoint={drillingPoint} />
                    
                    <LayerLogTable id={id} layerLogs={layerLogs} />
                    
                    {drillingPointPhotos && drillingPointPhotos.length > 0 && (
                        <>
                            <div className="flex justify-between text-h3 mt-4">
                                <div>Imágenes del punto</div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-x-2 mt-4">
                                {drillingPointPhotos.map((photo) => (
                                    photo && photo.url && (
                                    <Image
                                        key={photo.url}
                                        src={photo.url}
                                        alt={`Foto del punto de perforación ${drillingPoint.tag || 'sin etiqueta'}`}
                                        height={300}
                                        width={300}
                                        className="object-cover"
                                    />
                                    )
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </WithSidebarLayout>
    );
}