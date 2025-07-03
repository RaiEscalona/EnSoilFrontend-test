'use client';

import React from 'react';

export default function DepthAnalysisTable({ data, projectId }) {
  if (!data) return <p>Datos no disponibles.</p>;

  const { depths, samplingPoints, analysisData } = data;

  // Protección para datos incompletos
  if (!Array.isArray(depths) || !Array.isArray(samplingPoints) || !analysisData) {
    return <p>No hay datos suficientes para mostrar la tabla.</p>;
  }

  return (
    <div className="analysis-table-container">
      <table className="analysis-table">
        <thead>
          <tr>
            <th>Profundidad (cm)</th>
            {samplingPoints.length > 0 ? (
              samplingPoints.map((point) => (
                <th key={point}>{point}</th>
              ))
            ) : (
              <th colSpan={2}>No hay puntos de muestreo</th>
            )}
          </tr>
        </thead>
        <tbody>
          {depths.length > 0 ? (
            depths.map((depth) => (
              <tr key={depth}>
                <th>{depth}</th>
                {samplingPoints.map((point) => {
                  const cellData = analysisData[depth]?.[point] || '';
                  const hasContent = cellData !== '';
                  return (
                    <td key={`${depth}-${point}`} className={hasContent ? 'highlight' : ''}>
                      {cellData}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr><td colSpan={samplingPoints.length + 1}>No hay profundidades para mostrar</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}