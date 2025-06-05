'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/utils/axios';

export default function LabAnalysisTable({ projectId = 1 }) { // dejas projectId dinámico si quieres
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`🚀 GET /projects/${projectId}/samplesAnalysisMethodsSummary?matrixType=Suelo`);
        const res = await axios.get(`/projects/${projectId}/samplesAnalysisMethodsSummary?matrixType=Suelo`);
        console.log('✅ Response:', res.data);

        if (res.data?.data && res.data?.columns) {
          setData(res.data.data);
          setColumns(res.data.columns);
        } else {
          console.error('⚠️ No se encontró data válida');
        }
      } catch (error) {
        console.error('❌ Error al obtener resumen:', error);
      }
    };

    fetchData();
  }, [projectId]);

  const handleExportExcel = () => {
    // Aquí puedes agregar tu lógica de exportación si quieres (opcional)
    console.log('Exportar a Excel');
  };

  return (
    <div className="analysis-table-container">
      <div>
        <h3 className="text-white text-xl font-semibold mb-4">Tabla: Análisis de Laboratorio - Suelo</h3>
        <table className="analysis-table w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-600">
              {columns.map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-700">
                {columns.map((col, colIdx) => (
                  <td key={colIdx}>
                    {row[col] === 'X' ? 'X' : row[col] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}