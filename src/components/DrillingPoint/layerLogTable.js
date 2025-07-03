'use client';

import { useState } from "react";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import TabsButton from "../utils/tabsButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import ButtonComponent from "../utils/button";

export default function LayerLogTable({ id, layerLogs }) {
    const [tabOptionLayer, setTabOptionLayer] = useState(0);
    const [layerLogOnShow, setLayerLogOnShow] = useState([]);
    const [showAllLayers, setShowAllLayers] = useState(false);
    const [hideLayers, setHideLayers] = useState(true);
    
    const handleOptionLayerChange = ( layerLog ) => {
        setTabOptionLayer(layerLog.id);
        setLayerLogOnShow(layerLog);
        setShowAllLayers(false);
        setHideLayers(false);
    };

    const handleShowAllLayer = () => {
        setLayerLogOnShow(layerLogs);
        setTabOptionLayer(-1);
        setHideLayers(false);
        setShowAllLayers(true);
    };

    const handleHideLayer = () => {
        setTabOptionLayer(0);
        setShowAllLayers(false);
        setHideLayers(true);
        setLayerLogOnShow([]);
    };

    const sanitizeData = (obj) => {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => {
            if (value === null || value === undefined) return [key, ''];
            if (typeof value === 'object') return [key, JSON.stringify(value)];
            return [key, value];
            })
        );
    };

    const exportToExcel = (data) => {
        const exportData = Array.isArray(data)
            ? data.map(sanitizeData)
            : [sanitizeData(data)];

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const nameSuffix = !Array.isArray(data) && data.id ? `_capa_${data.id}` : '';
        saveAs(blob, `proyecto_${id}${nameSuffix}.xlsx`);
    };

    return (
        <>
            {layerLogs && layerLogs.length > 0 && (
                <>
                <div className="flex justify-between text-h3 mt-4 max-w-[100%]">
                    <div>Información de capas sin asociar</div>
                    <ButtonComponent label={'Exportar a excel'} onClick={() => exportToExcel(layerLogOnShow)} disable={hideLayers} />
                </div>
                <div className="flex justify-start gap-2 mt-4 pb-2">
                    <TabsButton label={'Ocultar todos'} onUse={tabOptionLayer == 0} onClick={handleHideLayer} />
                    <TabsButton label={'Mostrar todos'} onUse={tabOptionLayer == -1} onClick={handleShowAllLayer} />
                    {layerLogs.map((layerLog) => (
                            <div key={layerLog.id}>
                                <TabsButton label={`Capa ${layerLog.id}`} onUse={tabOptionLayer === layerLog.id} onClick={() => handleOptionLayerChange(layerLog)} />
                        </div>
                    ))}
                </div>
                </>
            )}
            {showAllLayers && (
                <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Profundidad inicial</TableHead>
                                    <TableHead>Profundidad final</TableHead>
                                    <TableHead>Sub matriz</TableHead>
                                    <TableHead>Textura</TableHead>
                                    <TableHead>Sub textura</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead>Humedad</TableHead>
                                    <TableHead>Olor</TableHead>
                                    <TableHead>PID</TableHead>
                                    <TableHead>Presencia de agua</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {layerLogs.map((layerLog) =>
                                    <TableRow key={layerLog.id}>
                                        <TableCell>
                                            {(layerLog.initialDepth) !== null ? (layerLog.initialDepth).toFixed(5) : 'Sin datos'}
                                        </TableCell>
                                        <TableCell>
                                            {(layerLog.finalDepth) !== null ? (layerLog.finalDepth).toFixed(5) : 'Sin datos'}
                                        </TableCell>
                                        <TableCell>
                                            {(layerLog.subMatrix) !== "" ? layerLog.subMatrix : 'Sin datos'}
                                        </TableCell>
                                        <TableCell>
                                            {(layerLog.texture) !== "" ? layerLog.texture : 'Sin datos'}
                                        </TableCell>
                                        <TableCell>
                                            {(layerLog.seccondaryTexture) !== "" ? layerLog.seccondaryTexture : 'Sin datos'}
                                        </TableCell>
                                        <TableCell>
                                            {(layerLog.color) !== " " ? layerLog.color : 'Sin datos'}
                                        </TableCell>
                                        <TableCell>
                                            {(layerLog.humidity) !== "" ? layerLog.humidity : 'Sin datos'}
                                        </TableCell>
                                        <TableCell>
                                            {(layerLog.smell) !== "" ? layerLog.smell : 'Sin datos'}
                                        </TableCell>
                                        <TableCell>
                                            {(layerLog.pidLog) !== null ? (layerLog.pidLog).toFixed(5) : 'Sin datos'}
                                        </TableCell>
                                        <TableCell>
                                            {layerLog.waterPresence ? 'Positivo' : 'Negativo'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                </>
            )}
            {(layerLogOnShow.id == tabOptionLayer) && (
                <>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Profundidad inicial</TableHead>
                            <TableHead>Profundidad final</TableHead>
                            <TableHead>Sub matriz</TableHead>
                            <TableHead>Textura</TableHead>
                            <TableHead>Sub textura</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Humedad</TableHead>
                            <TableHead>Olor</TableHead>
                            <TableHead>PID</TableHead>
                            <TableHead>Presencia de agua</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableHead>
                                {(layerLogOnShow.initialDepth) !== null ? (layerLogOnShow.initialDepth).toFixed(5) : 'Sin datos'}
                            </TableHead>
                            <TableHead>
                                {(layerLogOnShow.finalDepth) !== null ? (layerLogOnShow.finalDepth).toFixed(5) : 'Sin datos'}
                            </TableHead>
                            <TableHead>
                                {(layerLogOnShow.subMatrix) !== "" ? layerLogOnShow.subMatrix : 'Sin datos'}
                            </TableHead>
                            <TableHead>
                                {(layerLogOnShow.texture) !== "" ? layerLogOnShow.texture : 'Sin datos'}
                            </TableHead>
                            <TableHead>
                                {(layerLogOnShow.seccondaryTexture) !== "" ? layerLogOnShow.seccondaryTexture : 'Sin datos'}
                            </TableHead>
                            <TableHead>
                                {(layerLogOnShow.color) !== " " ? layerLogOnShow.color : 'Sin datos'}
                            </TableHead>
                            <TableHead>
                                {(layerLogOnShow.humidity) !== "" ? layerLogOnShow.humidity : 'Sin datos'}
                            </TableHead>
                            <TableHead>
                                {(layerLogOnShow.smell) !== "" ? layerLogOnShow.smell : 'Sin datos'}
                            </TableHead>
                            <TableHead>
                                {(layerLogOnShow.pidLog) !== null ? (layerLogOnShow.pidLog).toFixed(5) : 'Sin datos'}
                            </TableHead>
                            <TableHead>
                                {layerLogOnShow.waterPresence ? 'Positivo' : 'Negativo'}
                            </TableHead>
                        </TableRow>
                    </TableBody>
                </Table>
                {layerLogOnShow.observations && (
                    <>
                        <div className="text-h4 px-2">Comentarios de la capa {layerLogOnShow.id}</div>
                        <div className="text-h5 px-2">{layerLogOnShow.observations}</div>
                    </>
                )}
                </>
            )}
        </>
    );
}