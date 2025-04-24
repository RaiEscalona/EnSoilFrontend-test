'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import * as XLSX from 'xlsx'; // Import xlsx library
import './analysis.css'; // Import the CSS file

export default function AnalysisPage() {
  const { id: projectId } = useParams(); // Rename id to avoid conflict
  const [selectedTableType, setSelectedTableType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState(null);
  const [error, setError] = useState(null);

  const tableTypes = [
    { value: 'depth_analysis', label: 'Análisis de Profundidad' },
    // Add more table types here in the future
  ];

  const handleGenerateTable = async () => {
    if (!selectedTableType) return;

    setIsLoading(true);
    setTableData(null); // Clear previous data
    setError(null); // Clear previous error

    // Simulate API call
    console.log(`Generando tabla: ${selectedTableType} para proyecto ${projectId}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Shorten delay slightly

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/projects/${projectId}/analysis/${selectedTableType}`);
      // if (!response.ok) {
      //   throw new Error('Failed to fetch data from API');
      // }
      // const data = await response.json();
      
      // Load simulated data for now
      if (selectedTableType === 'depth_analysis') {
        // Use dynamic import for JSON data
        const dataModule = await import('@/data/simulatedDepthData.json');
        setTableData(dataModule.default); // Access default export
      } else {
        throw new Error(`Tipo de tabla no soportado: ${selectedTableType}`);
      }

    } catch (err) {
      console.error("Error generando tabla:", err);
      setError(`Error al generar la tabla: ${err.message}. Asegúrate que el archivo simulatedDepthData.json existe en src/data.`);
      setTableData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!tableData || selectedTableType !== 'depth_analysis') return;

    const { depths, samplingPoints, analysisData } = tableData;

    // 1. Create Header Row
    const header = ['Profundidad (cm)', ...samplingPoints];

    // 2. Create Data Rows
    const dataRows = depths.map(depth => {
      const row = [depth]; // Start row with depth value
      samplingPoints.forEach(point => {
        const cellValue = analysisData[depth]?.[point] || ''; // Get data or empty string
        row.push(cellValue);
      });
      return row;
    });

    // 3. Combine Header and Data Rows
    const excelData = [header, ...dataRows];

    // 4. Create Worksheet and Workbook
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AnálisisProfundidad'); // Sheet name

    // 5. Adjust column widths (optional but recommended)
    const colWidths = header.map((_, i) => ({
      wch: i === 0 ? 15 : Math.max(15, ...dataRows.map(r => r[i]?.toString().length || 0), header[i].length) // Calculate max width
    }));
    worksheet['!cols'] = colWidths;

    // 6. Trigger Download
    const fileName = `analisis_profundidad_proyecto_${projectId}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const renderDepthAnalysisTable = () => {
    if (!tableData || !tableData.depths || !tableData.samplingPoints || !tableData.analysisData) {
      return <p>Datos de tabla inválidos o incompletos.</p>;
    }

    const { depths, samplingPoints, analysisData } = tableData;

    return (
      <div className="analysis-table-container">
        <table className="analysis-table">
          <thead>
            <tr>
              <th>Profundidad (cm)</th>
              {/* Map sampling points to th elements directly */}
              {samplingPoints.map(point => <th key={point}>{point}</th>)}
            </tr>
          </thead>
          <tbody>
            {/* Map depths to tr elements */}
            {depths.map(depth => (
              <tr key={depth}>
                {/* Render the depth header cell first */}
                <th>{depth}</th> 
                {/* Then map sampling points to td elements */}
                {samplingPoints.map(point => {
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
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Análisis del Proyecto {projectId}</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Generar Tabla de Análisis</h2>
        <div className="flex items-end space-x-4">
          <div className="flex-grow">
            <label htmlFor="tableType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Tabla
            </label>
            <select
              id="tableType"
              value={selectedTableType}
              onChange={(e) => setSelectedTableType(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              disabled={isLoading}
            >
              <option value="">Seleccione un tipo</option>
              {tableTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerateTable}
            disabled={!selectedTableType || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generando...' : 'Generar Tabla'}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={!tableData || isLoading || selectedTableType !== 'depth_analysis'}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Exportar a Excel
          </button>
        </div>
      </div>

      {/* Table Display Area */}
      {isLoading && <p className="text-center my-4">Cargando datos de la tabla...</p>}
      {error && <p className="text-center my-4 text-red-600">{error}</p>}
      {tableData && selectedTableType === 'depth_analysis' && (
         <div className="bg-white p-6 rounded-lg shadow-md">
           <h3 className="text-lg font-semibold mb-4">Tabla: {tableTypes.find(t => t.value === selectedTableType)?.label}</h3>
           {renderDepthAnalysisTable()}
         </div>
      )}
    </div>
  );
} 