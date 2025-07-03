'use client';


import React, { useState, useEffect } from 'react';
import axios from '@/utils/axios';
import { useParams } from 'next/navigation';
import * as XLSX from 'xlsx';

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
        formatted[col] = row[col] ?? '';
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
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [methodTotals, setMethodTotals] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/analysisMethods/${projectId}/costsSummary?Suelo`);

        if (res.data?.data) {
          setData(res.data.data);
          setMethodTotals(res.data.methodTotals || {});

          const claves = Object.keys(res.data.data[0] || {});
          const columnasOrdenadas = claves.filter(k => k !== 'drillingPoint' && k !== 'sampleLog' && k !== 'totalCost');
          setColumns(["Punto", "Muestra", ...columnasOrdenadas, "Costo Total"]);

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
        // Manejo silencioso de error
      }
    };
    fetchData();
  }, [projectId, onDataReady, columns]);

  return (
    <div className="analysis-table-container w-full flex flex-col max-h-[50vh] overflow-auto">
      <div className="w-full flex-1 overflow-auto">
        <table className="analysis-table w-full h-full table-fixed text-sm">
            <thead>
              <tr className="text-left border-b border-gray-600">
                {columns.map((col, idx) => (
                  <th key={idx} className="truncate" style={{ width: `${100 / columns.length}%` }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const conteoPorColumna = {};
                const precioPorColumna = {};
                let totalCostoTotal = 0;

                const filas = data.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-gray-700">
                    {columns.map((col, colIdx) => {
                      if (col === "Punto") {
                        return <td key={colIdx} className="truncate">{row.drillingPoint ?? ''}</td>;
                      } else if (col === "Muestra") {
                        return <td key={colIdx} className="truncate">{row.sampleLog ?? ''}</td>;
                      } else if (col === "Costo Total") {
                        const totalFila = parseFloat(row.totalCost?.replace('$','')) || 0;
                        totalCostoTotal += totalFila;
                        return <td key={colIdx} className="truncate">{row.totalCost ?? ''}</td>;
                      } else {
                        const valor = row[col] ?? '';
                        const costoMatch = valor.match(/\$\s*([\d.]+)/);
                        if (valor.includes('X')) {
                          conteoPorColumna[col] = (conteoPorColumna[col] || 0) + 1;
                        }
                        if (costoMatch) {
                          precioPorColumna[col] = parseFloat(costoMatch[1]);
                        }
                        return <td key={colIdx} className={`truncate ${valor.includes('$') ? 'text-green-400' : ''}`}>
                          {valor}
                        </td>;
                      }
                    })}
                  </tr>
                ));

                return filas.concat(
                  <tr key="totales" className="font-semibold">
                    {columns.map((col, idx) => {
                      if (col === "Punto") {
                        return <td key={idx} className="truncate">TOTAL COSTOS</td>;
                      } else if (col === "Muestra") {
                        return <td key={idx} className="truncate"></td>;
                      } else if (col === "Costo Total") {
                        return <td key={idx} className="truncate">${totalCostoTotal.toFixed(2)}</td>;
                      } else {
                        const cantidad = conteoPorColumna[col] || 0;
                        const precioUnitario = precioPorColumna[col] || 0;
                        const total = cantidad * precioUnitario;
                        return <td key={idx} className="truncate">{total > 0 ? `$${total.toFixed(2)}` : ''}</td>;
                      }
                    })}
                  </tr>
                );
              })()}
            </tbody>
        </table>
      </div>
    </div>
  );
}