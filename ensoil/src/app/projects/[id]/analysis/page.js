'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import * as XLSX from 'xlsx'; 
import './analysis.css'; 
import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
import DepthAnalysisTable from './depth-analysis';
import LabAnalysisTable from './lab-analysis';
import Button from '@/components/button';

export default function AnalysisPage() {
  const { id: projectId } = useParams(); // Rename id to avoid conflict
  const [selectedTableType, setSelectedTableType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState(null);
  const [error, setError] = useState(null);

  const tableTypes = [
    { value: 'depth_analysis', label: 'Análisis de Profundidad' },
    { value: 'lab_analysis', label: 'Análisis de Laboratorio'},
    // Add more table types here in the future
  ];

  const handleGenerateTable = async () => {
    if (!selectedTableType) return;

    setIsLoading(true);
    setTableData(null);
    setError(null);

    console.log(`Generando tabla: ${selectedTableType} para proyecto ${projectId}`);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      if (selectedTableType === 'depth_analysis') {
        const dataModule = await import('@/data/simulatedDepthData.json');
        setTableData(dataModule.default);
      } else if (selectedTableType === 'lab_analysis') {
        // Simulación de datos para análisis de laboratorio
        setTableData({}); // Puedes reemplazarlo con una carga real
      } else {
        throw new Error(`Tipo de tabla no soportado: ${selectedTableType}`);
      }
    } catch (err) {
      console.error("Error generando tabla:", err);
      setError(`Error al generar la tabla: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!tableData || selectedTableType !== 'depth_analysis') return;

    const { depths, samplingPoints, analysisData } = tableData;
    const header = ['Profundidad (cm)', ...samplingPoints];
    const dataRows = depths.map(depth => {
      const row = [depth];
      samplingPoints.forEach(point => {
        row.push(analysisData[depth]?.[point] || '');
      });
      return row;
    });

    const excelData = [header, ...dataRows];
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AnálisisProfundidad');

    worksheet['!cols'] = header.map((_, i) => ({
      wch: i === 0 ? 15 : Math.max(15, ...dataRows.map(r => r[i]?.toString().length || 0), header[i].length)
    }));

    const fileName = `analisis_profundidad_proyecto_${projectId}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <WithSidebarLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-h2 font-bold mb-8">Análisis del Proyecto {projectId}</h1>

        <div className="p-6 rounded-lg border mb-5" style={{ borderColor: 'var(--color-quaternary)' }}>
          <h2 className="text-h3 mb-4">Generar Tabla de Análisis</h2>
          <div className="flex items-end space-x-4">
            <div className="flex-grow">
              <label htmlFor="tableType" className="text-h4 block mb-[2px]">
                Tipo de Tabla
              </label>
              <select
                id="tableType"
                value={selectedTableType}
                onChange={(e) => {
                  setSelectedTableType(e.target.value);
                  setTableData(null); // Limpiar tabla generada al cambiar selección
                }}
                className="block w-full bg-quaternary dark:bg-base p-2 rounded-md border-secondary shadow-sm sm:text-h5"
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

            {/* <button
              onClick={handleGenerateTable}
              disabled={!selectedTableType || isLoading}
              className="px-4 py-2 text-h5 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generando...' : 'Generar Tabla'}
            </button> */}
            <Button label={isLoading ? 'Generando...' : 'Generar Tabla'} onClick={handleGenerateTable} disable={!selectedTableType || isLoading}/>
            {/* <button
              onClick={handleExportExcel}
              disabled={!tableData || isLoading || selectedTableType !== 'depth_analysis'}
              className="px-4 py-2 text-h5 text-white bg-primary rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Exportar a Excel
            </button> */}
            <Button label={'Exportar a Excel'} onClick={handleExportExcel} disable={!tableData || isLoading || selectedTableType !== 'depth_analysis'}/>
          </div>
        </div>

        {/* Tabla de resultados */}
        {isLoading && <p className="text-center my-4">Cargando datos de la tabla...</p>}
        {error && <p className="text-center my-4 text-red-600">{error}</p>}
        {tableData && (
          <div className="bg-white dark:bg-quaternary border border-quaternary p-6 rounded-lg shadow-md max-h-[75vh] overflow-auto">
            <h3 className="text-black text-h3 mb-4">
              Tabla: {tableTypes.find(t => t.value === selectedTableType)?.label}
            </h3>
            {selectedTableType === 'depth_analysis' && <DepthAnalysisTable data={tableData} />}
            {selectedTableType === 'lab_analysis' && <LabAnalysisTable />}
          </div>
        )}
      </div>
    </WithSidebarLayout>
  );
}