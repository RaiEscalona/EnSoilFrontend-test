'use client';

import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from '@/utils/axios';
import '../../map.css';
import Carousel from "@/components/carousel";
import Button from "@/components/button";

export default function DrillingPointView() {
    const { id, drillingPointId } = useParams();
    const [drillingPoint, setDrillingPoint] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDrillingPoint = async () => {
            try {
                console.log(`🔄 Cargando punto de perforación ${drillingPointId} del proyecto ${id}`);
                const response = await api.get(`/drillingpoints/${drillingPointId}`);
                console.log(`✅ Punto de perforación ${drillingPointId} del proyecto ${id} cargado:`, response.data);

                setDrillingPoint(response.data);
            } catch (error) {
                console.error(`❌ Error cargando punto de perforación ${drillingPointId} proyecto ${id}:`, error.response?.data || error.message);
                setAlertMessage(error.response?.data?.error || 'Error al cargar el punto de perforación.');
                setShowAlert(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDrillingPoint();
    }, [id, drillingPointId])

    if (isLoading) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <WithSidebarLayout>
            <div className="dark:bg-secondary map-page-container">
                <div className="map-header">
                    <div className="text-h2">Punto de muestreo {drillingPoint.tag}</div>
                    <Button label={"Volver al mapa"} route={`/projects/${id}/map`} size="h4" fullWidth={false}></Button>
                </div>
                <div className="map-card flex flex-col">
                    <div className="text-h4">Coordenadas: {drillingPoint.coordinates.coordinates[0]} – {drillingPoint.coordinates.coordinates[1]}</div>
                    <div className="text-h4">Método {drillingPoint.method}</div>
                    <div className="text-h4">Comentarios del punto:</div>
                    <div className="px-2">
                        <div className="text-h5">{drillingPoint.comments}</div>
                    </div>
                    {drillingPoint.drillingPointPhotos.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-x-2">
                            {drillingPoint.drillingPointPhotos.map((id) => (
                                <img
                                    src={id.url}
                                    height={"100%"}
                                    width={"49%"}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </WithSidebarLayout>
    );
}