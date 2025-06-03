'use client'

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from '@/utils/axios';

export default function GroundMetalsTable({data}) {

    if (!data) return <p>Datos no disponibles.</p>;

    const { info, analytes } = data;
    // const { id } = useParams();
    // const [isLoading, setIsLoading] = useState(true);

    // useEffect(() => {
    //     const fetchTableData = async () => {
    //         try {
    //             console.log(`🔄 Cargando datos de la tabla metales suelo del proyecto ${id}`);
    //             const response = await api.get(`/${id}/groundMetals`);
    //             console.log(`✅ Datos de la tabla metales suelo del proyecto ${id} cargado:`, response.data);

    //             setDrillingPoint(response.data);
    //         } catch (error) {
    //             console.error(`❌ Error cargando punto de perforación ${id} proyecto ${id}:`, error.response?.data || error.message);
    //             setAlertMessage(error.response?.data?.error || 'Error al cargar el punto de perforación.');
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };

    //     fetchTableData();
    // }, [id])

    // if (isLoading) {
    //     return <div className="loading">Cargando...</div>;
    // }

    return (
    <div className="analysis-table-container">
      <table className="analysis-table">
        <thead>
          <tr>
            <th>Punto de muestreo</th>
            <th>Muestra</th>
            {analytes.length > 0 ? (
              analytes.map((point) => (
                <th key={point}>{point}</th>
              ))
            ) : (
              <th colSpan={2}>No hay puntos de muestreo</th>
            )}
          </tr>
        </thead>
        <tbody>
            {info.map((point) =>
            point.sampleLogs.map((sample) => (
                <tr key={sample.sampleLogTag}>
                    <th>{point.drillingPointTag}</th>
                    <td>{sample.sampleLogTag}</td>
                    {analytes.map((analyte) => {
                        const match = sample.analytes.find((a) => a.analyte === analyte);
                        const content = match ? match.result : '';
                        return (
                            <td key={analyte} className={content ? 'highlight' : ''}>
                                {content}
                            </td>
                        );
                    })}
                </tr>
            ))
            )}
        </tbody>
      </table>
    </div>
  );
}