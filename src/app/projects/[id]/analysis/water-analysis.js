'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from 'next/navigation';

export default function WaterAnalysis({ projectId: propProjectId, onDataReady }) {
  const params = useParams();
  const projectId = propProjectId || params.id;
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      setNoData(false);
      try {
        const res = await axios.get(`/analysisMethods/${projectId}/costsSummary?Agua`);
        if (res.data?.data && res.data?.columns) {
          setData(res.data.data);
          setColumns(res.data.columns);
          if (onDataReady) {
            onDataReady({ data: res.data.data, columns: res.data.columns });
          }
          if (!res.data.data.length) setNoData(true);
        } else if (res.data?.length) {
          // Fallback legacy: columnas dinámicas
          const claves = Object.keys(res.data[0]);
          setColumns(claves);
          setData(res.data);
          if (onDataReady) {
            onDataReady({ data: res.data, columns: claves });
          }
        } else {
          setNoData(true);
          if (onDataReady) {
            onDataReady({ data: [], columns: [] });
          }
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setNoData(true);
          if (onDataReady) onDataReady({ data: [], columns: [] });
        } else {
          setError("Error al cargar los datos");
          if (onDataReady) onDataReady({ data: [], columns: [] });
        }
      }
      setLoading(false);
    }
    if (projectId) {
      fetchData();
    }
  }, [projectId, onDataReady]);

  // Alias para headers
  const columnAliases = {
    sampleLog: 'Muestra',
    totalCost: 'Costo Total',
  };

  if (loading) return <div className="text-center py-4 text-gray-500">No hay datos disponibles</div>;
  if (noData) return <div className="text-center py-4 text-gray-500">No hay datos disponibles</div>;
  if (error) return <div className="text-center py-4 text-red-600">{error}</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
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
                  {columnAliases[col] || col}
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
                      return (
                        <td key={colIdx} className={`px-4 py-2 whitespace-nowrap text-sm text-gray-700 truncate`}>
                          {row[col] ?? ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}