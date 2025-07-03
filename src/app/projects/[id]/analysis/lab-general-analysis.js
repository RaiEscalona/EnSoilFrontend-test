import React from 'react';

export default function LabGeneralAnalysisTable({ data, columns }) {
  // Alias para headers
  const columnAliases = {
    drillingPoint: 'Punto',
    sampleLog: 'Muestra',
    totalCost: 'Costo Total',
  };

  if (!columns || columns.length === 0) {
    return <div className="text-center py-4 text-gray-500">No hay datos disponibles</div>;
  }

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
            {(!data || data.length === 0) ? (
              <tr><td colSpan={columns.length} className="text-center py-4 text-gray-500">No hay datos disponibles</td></tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-gray-700">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="truncate">{row[col] ?? ''}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 