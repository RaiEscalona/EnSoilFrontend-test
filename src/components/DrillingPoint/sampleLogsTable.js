'use client';

import { useState } from "react";
import TabsButton from "../utils/tabsButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function SampleLogsTable({ drillingPoint }) {
    const [tabOption, setTabOption] = useState(0);
    const [sampleLogOnShow, setSampleLogOnShow] = useState([]);
    const [showAllSamples, setShowAllSample] = useState(false);

    const handleOptionSampleChange = ( sampleLog ) => {
        setTabOption(sampleLog.tag);
        setSampleLogOnShow(sampleLog);
        setShowAllSample(false);
    };

    const handleShowAllSample = () => {
        setTabOption(-1);
        setShowAllSample(true);
    };

    const handleHideSample = () => {
        setShowAllSample(false);
        setTabOption('');
        setSampleLogOnShow([]);
    };

    return (
        <>
            {drillingPoint.sampleLogs && drillingPoint.sampleLogs.length > 0 && (
                <>
                <div className="flex justify-between text-h3 mt-4">
                    <div>Información de puntos de muestreo según capa</div>
                </div>
                <div className="flex justify-start gap-2 mt-4 pb-2">
                    <TabsButton label={'Ocultar datos'} onUse={tabOption == 0} onClick={handleHideSample} />
                    <TabsButton label={'Mostrar todos'} onUse={tabOption == -1} onClick={handleShowAllSample} />
                    {drillingPoint.sampleLogs.map((sampleLog) => ( (sampleLog.layerLogs.length > 0) && (
                        <div key={sampleLog.tag}>
                            <TabsButton label={`Muestreo ${sampleLog.tag}`} onUse={tabOption === sampleLog.tag} onClick={() => handleOptionSampleChange(sampleLog)} />
                        </div>
                    )))}
                </div>
                </>
            )}
            {showAllSamples && (
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
                            {drillingPoint.sampleLogs.flatMap((sampleLog) =>
                                sampleLog.layerLogs.map((layerLog) => (
                                <TableRow key={`${sampleLog.tag}-${layerLog.id}`}>
                                    <TableCell>
                                    {layerLog.initialDepth !== null ? layerLog.initialDepth.toFixed(5) : 'Sin datos'}
                                    </TableCell>
                                    <TableCell>
                                    {layerLog.finalDepth !== null ? layerLog.finalDepth.toFixed(5) : 'Sin datos'}
                                    </TableCell>
                                    <TableCell>
                                    {layerLog.subMatrix?.trim() ? layerLog.subMatrix : 'Sin datos'}
                                    </TableCell>
                                    <TableCell>
                                    {layerLog.texture?.trim() ? layerLog.texture : 'Sin datos'}
                                    </TableCell>
                                    <TableCell>
                                    {layerLog.seccondaryTexture?.trim() ? layerLog.seccondaryTexture : 'Sin datos'}
                                    </TableCell>
                                    <TableCell>
                                    {layerLog.color?.trim() ? layerLog.color : 'Sin datos'}
                                    </TableCell>
                                    <TableCell>
                                    {layerLog.humidity?.trim() ? layerLog.humidity : 'Sin datos'}
                                    </TableCell>
                                    <TableCell>
                                    {layerLog.smell?.trim() ? layerLog.smell : 'Sin datos'}
                                    </TableCell>
                                    <TableCell>
                                    {layerLog.pidLog !== null ? layerLog.pidLog.toFixed(5) : 'Sin datos'}
                                    </TableCell>
                                    <TableCell>
                                    {layerLog.waterPresence ? 'Positivo' : 'Negativo'}
                                    </TableCell>
                                </TableRow>
                                ))
                            )}
                            </TableBody>
                    </Table>
                </>
            )}
            {(sampleLogOnShow.tag == tabOption) && (
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
                            {sampleLogOnShow.layerLogs.map((layerLog) =>
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
        </>
    );
}