'use client'

export default function GroundMetalsTable({data, projectId}) {

    if (!data) return <p>Datos no disponibles.</p>;

    const { info, analytes } = data;

    return (
    <div className="analysis-table-container">
      <table className="analysis-table">
        <thead>
          <tr>
            <th>Punto de muestreo</th>
            <th>Muestra</th>
            {analytes.length > 0 ? (
              analytes.map((point) => (
                <th key={point}>{point}</th>
              ))
            ) : (
              <th colSpan={2}>No hay datos de análisis</th>
            )}
          </tr>
        </thead>
        <tbody>
            {info.length > 0 ? (info.map((point) => 
            point.sampleLogs.map((sample) => (
                <tr key={sample.sampleLogTag}>
                    <th>{point.drillingPointTag}</th>
                    <td>{sample.sampleLogTag}</td>
                    {analytes.map((analyte) => {
                        const match = sample.analytes.find((a) => a.analyte === analyte);
                        const content = match ? match.result : '';
                        return (
                            <td key={analyte} className={content ? 'highlight' : ''}>
                                {content}
                            </td>
                        );
                    })}
                </tr>
            )))) : (
              <th colSpan={2}>No hay puntos de muestreo</th>
            )}
        </tbody>
      </table>
    </div>
  );
}