'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/utils/axios';
import { useParams } from 'next/navigation';
import * as XLSX from 'xlsx';

const columnasSuelo = ["Punto", "Muestra", "Metales", "pH/CE", "Gran.", "COT", "SPLP", "ABA", "Cr VI", "TTRR/Rh", "Costo Total"];

export function getLabAnalysisExcel(data, columns, methodTotals, tipoMatriz) {
  const columnasFijas = columnasSuelo;
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
        formatted[col] = row[col] ? 'X' : '';
      }
    });
    return formatted;
  });

  exportData.push({ ...methodTotals, 'Punto': 'TOTAL COSTOS' });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Resumen Suelo`);
  XLSX.writeFile(wb, `Resumen_Laboratorio_Suelo.xlsx`);
}

export default function LabAnalysisTable({ onDataReady }) {
  const params = useParams();
  const projectId = params.id;
  const columns = columnasSuelo;
  const [data, setData] = useState([]);
  const [methodTotals, setMethodTotals] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/analysisMethods/${projectId}/costsSummary?Suelo`);

        if (res.data?.data) {
          setData(res.data.data);
          setMethodTotals(res.data.methodTotals || {});
          if (onDataReady) {
            onDataReady({
              data: res.data.data,
              columns,
              methodTotals: res.data.methodTotals || {},
              tipoMatriz: 'Suelo'
            });
          }
        }
      } catch (error) {
        console.error('Error al obtener resumen:', error);
      }
    };
    fetchData();
  }, [projectId, onDataReady, columns]);

  return (
    <div className="analysis-table-container h-full w-full flex flex-col">
      <div className="flex-1 h-full w-full overflow-auto">
        <table className="analysis-table w-full h-full table-fixed text-sm">
            <thead>
              <tr className="text-left border-b border-gray-600">
                {columns.map((col, idx) => (
                  <th key={idx} className="truncate" style={{ width: `${100 / columns.length}%` }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-gray-700">
                  {columns.map((col, colIdx) => {
                    if (col === "Punto") {
                      return <td key={colIdx} className="truncate">{row.drillingPoint ?? ''}</td>;
                    } else if (col === "Muestra") {
                      return <td key={colIdx} className="truncate">{row.sampleLog ?? ''}</td>;
                    } else if (col === "Costo Total") {
                      return <td key={colIdx} className="truncate">{row.totalCost ?? ''}</td>;
                    } else {
                      return <td key={colIdx} className="truncate">{row[col] ? 'X' : ''}</td>;
                    }
                  })}
                </tr>
              ))}
              <tr className="font-semibold">
                {columns.map((col, idx) => {
                  if (col === "Punto") {
                    return <td key={idx} className="truncate">TOTAL COSTOS</td>;
                  } else if (col === "Muestra") {
                    return <td key={idx} className="truncate"></td>;
                  } else if (col === "Costo Total") {
                    return <td key={idx} className="truncate"></td>;
                  } else {
                    return <td key={idx} className="truncate">{methodTotals[col] ?? ''}</td>;
                  }
                })}
              </tr>
            </tbody>
        </table>
      </div>
    </div>
  );
}