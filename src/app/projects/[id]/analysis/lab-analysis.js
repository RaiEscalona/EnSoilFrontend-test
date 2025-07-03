'use client';


import React, { useState, useEffect } from 'react';
import axios from '@/utils/axios';
import { useParams } from 'next/navigation';
import * as XLSX from 'xlsx';

export function getLabAnalysisExcel(data, columns, methodTotals, tipoMatriz) {
  const columnasFijas = columns;
  const exportData = data.map(row => {
    const formatted = {};
    columnasFijas.forEach(col => {
      if (col === "Punto") {
        formatted[col] = row.drillingPoint ?? '';
      } else if (col === "Muestra") {
        formatted[col] = row.sampleLog ?? '';
      } else if (col === "Costo Total") {
        formatted[col] = row.totalCost ?? '';
      } else {
        formatted[col] = row[col] ?? '';
      }
    });
    return formatted;
  });

  exportData.push({ ...methodTotals, 'Punto': 'TOTAL COSTOS' });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Resumen ${tipoMatriz}`);
  XLSX.writeFile(wb, `Resumen_Laboratorio_${tipoMatriz}.xlsx`);
}

export default function LabAnalysisTable({ onDataReady, projectId }) {
  const params = useParams();
  const currentProjectId = projectId || params.id;
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [methodTotals, setMethodTotals] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/analysisMethods/${currentProjectId}/costsSummary?matrixType=Suelo`);
        if (res.data?.data && res.data?.columns) {
          setData(res.data.data);
          setMethodTotals(res.data.methodTotals || {});
          setColumns(res.data.columns);
          if (onDataReady) {
            onDataReady({
              data: res.data.data,
              columns: res.data.columns,
              methodTotals: res.data.methodTotals || {},
              tipoMatriz: 'Suelo'
            });
          }
        } else if (res.data?.data) {
          // Fallback legacy: columnas dinámicas
          const claves = Object.keys(res.data.data[0] || {});
          setColumns(claves);
          setData(res.data.data);
          setMethodTotals(res.data.methodTotals || {});
          if (onDataReady) {
            onDataReady({
              data: res.data.data,
              columns: claves,
              methodTotals: res.data.methodTotals || {},
              tipoMatriz: 'Suelo'
            });
          }
        }
      } catch (error) {
        // Manejo silencioso de error
      }
    };
    fetchData();
  }, [currentProjectId, onDataReady]);

  // Alias para headers
  const columnAliases = {
    drillingPoint: 'Punto',
    sampleLog: 'Muestra',
    totalCost: 'Costo Total',
  };

  return (
    <div className="analysis-table-container w-full flex flex-col max-h-[50vh] overflow-auto">
      <div className="w-full flex-1 overflow-auto">
        <table className="analysis-table w-full h-full table-fixed text-sm">
            <thead>
              <tr className="text-left border-b border-gray-600">
                {columns.map((col, idx) => (
                  <th key={idx} className="truncate" style={{ width: `${100 / columns.length}%` }}>{columnAliases[col] || col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={columns.length} className="text-center py-4 text-gray-500">No hay datos disponibles</td></tr>
              ) : (
                <>
                  {data.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-gray-700">
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} className="truncate">
                          {row[col] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Totales si corresponde */}
                  {methodTotals && Object.keys(methodTotals).length > 0 && (
                    <tr key="totales" className="font-semibold">
                      {columns.map((col, idx) => {
                        if (col === "drillingPoint") {
                          return <td key={idx} className="truncate">TOTAL COSTOS</td>;
                        } else if (col === "sampleLog") {
                          return <td key={idx} className="truncate"></td>;
                        } else if (col === "totalCost") {
                          return <td key={idx} className="truncate">{methodTotals[col] ?? ''}</td>;
                        } else {
                          return <td key={idx} className="truncate">{methodTotals[col] ?? ''}</td>;
                        }
                      })}
                    </tr>
                  )}
                </>
              )}
            </tbody>
        </table>
      </div>
    </div>
  );
}