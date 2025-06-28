'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from 'next/navigation';
import * as XLSX from "xlsx";

const columnasAgua = [
  "Muestra",
  "Metales",
  "pH/CE",
  "PB",
  "Iones",
  "Coliformes fecales",
  "Alcalinidad",
  "Amoníaco y amonio"
];

export default function WaterAnalysis({ projectId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/analysisMethods/${projectId}/costsSummary?Agua`);
        setData(res.data || []);
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
    const exportData = data.map(row => ({
      "Muestra": row.sampleLog ?? "",
      "Metales": row.metales ?? "",
      "pH/CE": row.phce ?? "",
      "PB": row.pb ?? "",
      "Iones": row.iones ?? "",
      "Coliformes fecales": row.coliformesFecales ?? "",
      "Alcalinidad": row.alcalinidad ?? "",
      "Amoníaco y amonio": row.amoniaco ?? ""
    }));
    const ws = XLSX.utils.json_to_sheet(exportData, { header: columnasAgua });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Análisis de Agua");
    XLSX.writeFile(wb, "analisis_agua.xlsx");
  };

  if (loading) return <div className="text-center py-4 text-gray-500">No hay datos disponibles</div>;
  if (error) return <div className="text-center py-4 text-red-600">{error}</div>;

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
              {columnasAgua.map((col) => (
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
                <td colSpan={columnasAgua.length} className="text-center py-6 text-gray-400">
                  No hay datos.
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {columnasAgua.map((col, colIdx) => {
                    let cellValue = '';
                    if (col === "Muestra") cellValue = row.sampleLog ?? '';
                    else if (col === "Metales") cellValue = row.metales ?? '';
                    else if (col === "pH/CE") cellValue = row.phce ?? '';
                    else if (col === "PB") cellValue = row.pb ?? '';
                    else if (col === "Iones") cellValue = row.iones ?? '';
                    else if (col === "Coliformes fecales") cellValue = row.coliformesFecales ?? '';
                    else if (col === "Alcalinidad") cellValue = row.alcalinidad ?? '';
                    else if (col === "Amoníaco y amonio") cellValue = row.amoniaco ?? '';
                    return (
                      <td key={colIdx} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 truncate">
                        {cellValue}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}