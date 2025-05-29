'use client';

import React from 'react';

export default function DepthAnalysisTable({ data }) {
  if (!data) return <p>Datos no disponibles.</p>;

  const { depths, samplingPoints, analysisData } = data;

  return (
    <div className="analysis-table-container">
      <table className="analysis-table">
        <thead>
          <tr>
            <th>Profundidad (cm)</th>
            {samplingPoints.map((point) => (
              <th key={point}>{point}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {depths.map((depth) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
}