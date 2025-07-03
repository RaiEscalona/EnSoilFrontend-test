'use client';

import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from '@/utils/axios';
import '../../map.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import ButtonComponent from "@/components/utils/button";
import Image from 'next/image';
import Alert from "@/components/Alert/Alert";
import TabsButton from "@/components/utils/tabsButton";
import { MapPinned, Pickaxe, Sprout } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function DrillingPointView() {
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const { id, drillingPointId } = useParams();
    const [drillingPoint, setDrillingPoint] = useState(null);
    const [drillingPointPhotos, setDrillingPointPhotos] = useState([]);
    const [layerLogs, setLayerLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tabOption, setTabOption] = useState('');

    const exportToExcel = (data) => {
        const worksheet = XLSX.utils.json_to_sheet([data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, `proyecto_${id}_capa_${data.id}`);
    };

    useEffect(() => {
        const fetchDrillingPoint = async () => {
            try {
                console.log(`🔄 Cargando punto de perforación ${drillingPointId} del proyecto ${id}`);
                const response = await api.get(`/drillingpoints/${drillingPointId}`);
                console.log(`✅ Punto de muestreo del proyecto ${id} cargados:`, response.data);

                setDrillingPoint(response.data);
                setDrillingPointPhotos(response.data.drillingPointPhotos || []);
                setLayerLogs(response.data.layerLogs || []);
                if (response.data.sampleLogs && response.data.sampleLogs.length > 0) {
                setTabOption(response.data.sampleLogs[0].tag);
                }
            } catch (error) {
                console.error(`❌ Error cargando punto de perforación ${drillingPointId} proyecto ${id}:`, error.response?.data || error.message);
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
                                className="inline"/> {drillingPoint.coordinates.coordinates[0]}, {drillingPoint.coordinates.coordinates[1]}
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
                    
                    {layerLogs && layerLogs.length > 0 && (
                        <>
                            <div className="flex justify-between text-h3 mt-4 pb-2">
                        <div>Información de la capa</div>
                                <ButtonComponent label={'Exportar a excel'} onClick={() => exportToExcel(layerLogs[0])} disable />
                    </div>
                    {layerLogs.map((layerLog) => (
                        <div key={layerLog.id}>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                                {layerLog.initialDepth !== null && layerLog.initialDepth !== undefined && (
                                        <TableHead>Profundidad inicial</TableHead>
                                                )}
                                                {layerLog.finalDepth !== null && layerLog.finalDepth !== undefined && (
                                        <TableHead>Profundidad final</TableHead>
                                                )}
                                                {layerLog.subMatrix && (
                                        <TableHead>Sub matriz</TableHead>
                                                )}
                                                {layerLog.texture && (
                                        <TableHead>Textura</TableHead>
                                                )}
                                        {layerLog.seccondaryTexture && (
                                            <TableHead>Sub textura</TableHead>
                                        )}
                                                {layerLog.color && (
                                        <TableHead>Color</TableHead>
                                                )}
                                                {layerLog.humidity && (
                                        <TableHead>Humedad</TableHead>
                                                )}
                                                {layerLog.smell && (
                                        <TableHead>Olor</TableHead>
                                                )}
                                                {layerLog.pidLog !== null && layerLog.pidLog !== undefined && (
                                        <TableHead>PID</TableHead>
                                                )}
                                                {layerLog.waterPresence !== null && layerLog.waterPresence !== undefined && (
                                        <TableHead>Presencia de agua</TableHead>
                                                )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                                {layerLog.initialDepth !== null && layerLog.initialDepth !== undefined && (
                                        <TableHead>{(layerLog.initialDepth).toFixed(5)}</TableHead>
                                                )}
                                                {layerLog.finalDepth !== null && layerLog.finalDepth !== undefined && (
                                        <TableHead>{(layerLog.finalDepth).toFixed(5)}</TableHead>
                                                )}
                                                {layerLog.subMatrix && (
                                        <TableHead>{layerLog.subMatrix}</TableHead>
                                                )}
                                                {layerLog.texture && (
                                        <TableHead>{layerLog.texture}</TableHead>
                                                )}
                                        {layerLog.seccondaryTexture && (
                                            <TableHead>{layerLog.seccondaryTexture}</TableHead>
                                        )}
                                                {layerLog.color && (
                                        <TableHead>{layerLog.color}</TableHead>
                                                )}
                                                {layerLog.humidity && (
                                        <TableHead>{layerLog.humidity}</TableHead>
                                                )}
                                                {layerLog.smell && (
                                        <TableHead>{layerLog.smell}</TableHead>
                                                )}
                                                {layerLog.pidLog !== null && layerLog.pidLog !== undefined && (
                                        <TableHead>{(layerLog.pidLog).toFixed(5)}</TableHead>
                                                )}
                                                {layerLog.waterPresence !== null && layerLog.waterPresence !== undefined && (
                                                    <TableHead>
                                                        {layerLog.waterPresence ? 'Positivo' : 'Negativo'}
                                                    </TableHead>
                                        )}
                                    </TableRow>
                                </TableBody>
                            </Table>
                                    {layerLog.observations && (
                                        <>
                                            <div className="text-h4 px-2">Comentarios de la capa</div>
                                            <div className="text-h5 px-2">{layerLog.observations}</div>
                                        </>
                                    )}
                        </div>
                    ))}
                        </>
                    )}
                    
                    {drillingPointPhotos && drillingPointPhotos.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-x-2 mt-4">
                            {drillingPointPhotos.map((photo) => (
                                photo && photo.url && (
                                <Image
                                    key={photo.id}
                                    src={photo.url}
                                        alt={`Foto del punto de perforación ${drillingPoint.tag || 'sin etiqueta'}`}
                                    height={300}
                                    width={300}
                                    className="object-cover"
                                />
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </WithSidebarLayout>
    );
}