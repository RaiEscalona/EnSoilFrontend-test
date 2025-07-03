'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from 'next/navigation';
import * as XLSX from "xlsx";

export default function WaterAnalysis({ projectId }) {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/analysisMethods/${projectId}/costsSummary?Agua`);
        setData(res.data || []);
        if (res.data?.length) {
          const claves = Object.keys(res.data[0]);
          const columnasOrdenadas = claves.filter(k => k !== 'sampleLog' && k !== 'totalCost');
          setColumns(["Muestra", ...columnasOrdenadas, "Costo Total"]);
        }
      } catch (err) {
        setError("Error al cargar los datos");
      }
      setLoading(false);
    }
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const exportToExcel = () => {
    const exportData = data.map(row => {
      const exportRow = {};
      columns.forEach(col => {
        if (col === "Muestra") {
          exportRow[col] = row.sampleLog ?? "";
        } else if (col === "Costo Total") {
          exportRow[col] = row.totalCost ?? "";
        } else {
          exportRow[col] = row[col] ?? "";
        }
      });
      return exportRow;
    });
    const ws = XLSX.utils.json_to_sheet(exportData, { header: columns });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Análisis de Agua");
    XLSX.writeFile(wb, "analisis_agua.xlsx");
  };

  if (loading) return <div className="text-center py-4 text-gray-500">No hay datos disponibles</div>;
  if (error) return <div className="text-center py-4 text-red-600">{error}</div>;

  // Calculate totals for numeric columns that include costs (assumed to be columns with $)
  const totals = {};
  if (data.length > 0) {
    columns.forEach(col => {
      if (col === "Muestra") {
        totals[col] = "Total";
      } else if (col === "Costo Total") {
        const sum = data.reduce((acc, row) => {
          const val = row.totalCost;
          if (typeof val === "number") return acc + val;
          if (typeof val === "string") {
            const num = parseFloat(val.replace(/[^0-9.-]+/g,""));
            return acc + (isNaN(num) ? 0 : num);
          }
          return acc;
        }, 0);
        totals[col] = `$${sum.toFixed(2)}`;
      } else {
        const sum = data.reduce((acc, row) => {
          const val = row[col];
          if (typeof val === "number") return acc + val;
          if (typeof val === "string") {
            const num = parseFloat(val.replace(/[^0-9.-]+/g,""));
            return acc + (isNaN(num) ? 0 : num);
          }
          return acc;
        }, 0);
        totals[col] = sum !== 0 ? sum : '';
      }
    });
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Análisis de Agua</h2>
        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
        >
          Exportar a Excel
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-6 text-gray-400">
                  No hay datos.
                </td>
              </tr>
            ) : (
              <>
                {data.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {columns.map((col, colIdx) => {
                      const valor = col === "Muestra" ? row.sampleLog ?? '' : col === "Costo Total" ? row.totalCost ?? '' : row[col] ?? '';
                      return (
                        <td key={colIdx} className={`px-4 py-2 whitespace-nowrap text-sm text-gray-700 truncate ${typeof valor === 'string' && valor.includes('$') ? 'text-green-500' : ''}`}>
                          {valor}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="bg-gray-100 font-semibold">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-4 py-2 whitespace-nowrap text-sm text-gray-800 truncate ${typeof totals[col] === 'string' && totals[col].includes('$') ? 'text-green-600' : ''}`}>
                      {totals[col]}
                    </td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}