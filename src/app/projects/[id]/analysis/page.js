'use client';

import { lazy, useState } from 'react';
import { useParams } from 'next/navigation';
import * as XLSX from 'xlsx'; 
import './analysis.css'; 
import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
import DepthAnalysisTable from './depth-analysis';
import LabAnalysisTable from './lab-analysis';
import WaterAnalysisTable from './water-analysis';
import ButtonComponent from '@/components/utils/button';
import api from '@/utils/axios';
import GroundMetalsTable from './ground-metals-analysis';

export default function AnalysisPage() {
  const { id: projectId } = useParams(); // Rename id to avoid conflict
  const [selectedTableType, setSelectedTableType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState(null);
  const [error, setError] = useState(null);

  const tableTypes = [
    { value: 'depth_analysis', label: 'Análisis de Profundidad' },
    { value: 'lab_analysis', label: 'Análisis de Laboratorio - Suelo'},
    { value: 'water_analysis', label: 'Análisis de Laboratorio - Agua'},
    { value: 'ground_metals_analysis', label: 'Análisis de Metales en el suelo'},
    // Add more table types here in the future
  ];

  const handleGenerateTable = async () => {
    if (!selectedTableType) return;

    setIsLoading(true);
    setTableData(null);
    setError(null);

    try {
      if (selectedTableType === 'depth_analysis') {
        const response = await api.get(`/projects/${projectId}/depthAnalysis`);
        const data = response.data;

        if (!data || data.length === 0) {
          setError('No hay información suficiente para generar la tabla de análisis de profundidad.');
          return;
        }

        // Transform API data into table format
        // Get all unique depths from the first point's analysis and sort them numerically
        const depths = Object.keys(data[0].analysis)
          .map(Number)
          .sort((a, b) => a - b);

        // Get all sampling points (drilling point tags)
        const samplingPoints = data.map(point => point.drillingPoint.tag);
        
        // Create the analysis data structure
        const analysisData = {};
        depths.forEach(depth => {
          analysisData[depth] = {};
          samplingPoints.forEach((point, index) => {
            const pointData = data[index];
            // Get elements exceeding the norm for this depth and point
            const elements = pointData.analysis[depth] || [];
            // Join elements with commas, or empty string if no elements
            analysisData[depth][point] = elements.length > 0 ? elements.join(', ') : '';
          });
        });

        setTableData({
          depths,
          samplingPoints,
          analysisData
        });
      } else if (selectedTableType === 'lab_analysis') {
        setTableData({}); 
      } else if (selectedTableType === 'water_analysis') {
        setTableData({});
      } else if (selectedTableType === 'ground_metals_analysis') {
        const response = await api.get(`/projects/${projectId}/groundMetals`);
        console.log(`✅ Datos de la tabla metales suelo del proyecto ${projectId} cargado:`);
        const data = response.data;

        if (!data || data.length === 0) {
          setError('No hay información suficiente para generar la tabla de análisis de metales en el suelo.');
          return;
        }

        const info = data.info;
        const analytes = data.analytes;
        setTableData({
          info, analytes
        })

        // const dataModule = await import('@/data/simulatedGroundMetalData.json');
        // setTableData(dataModule.default);
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
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <h1 className="text-h2 font-bold mb-6">Análisis del Proyecto {projectId}</h1>
        <div className="p-4 rounded-lg border mb-5" style={{ borderColor: 'var(--color-quaternary)' }}>
          <h2 className="text-h3 mb-4 text-center">Generar Tabla de Análisis</h2>
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
            <ButtonComponent label={isLoading ? 'Generando...' : 'Generar Tabla'} onClick={handleGenerateTable} disable={!selectedTableType || isLoading}/>
            <ButtonComponent label={'Exportar a Excel'} onClick={handleExportExcel} disable={!tableData || isLoading || selectedTableType !== 'depth_analysis'}/>
          </div>
        </div>

        {/* Tabla de resultados */}
        {isLoading && <p className="text-center my-4">Cargando datos de la tabla...</p>}
        {error && <p className="text-center my-4 text-red-600">{error}</p>}
        {tableData && (
          <div className="bg-white dark:bg-quaternary border border-quaternary p-6 rounded-lg shadow-md flex flex-col overflow-hidden max-h-[calc(100vh-250px)]">
            {/* Selector Suelo/Agua flotante y título */}
            {selectedTableType === 'lab_analysis' ? (
              <h3 className="text-black text-h3 mb-4">Tabla: Análisis de Laboratorio</h3>
            ) : (
              <h3 className="text-black text-h3 mb-4">
                Tabla: {tableTypes.find(t => t.value === selectedTableType)?.label}
              </h3>
            )}
            {selectedTableType === 'depth_analysis' && <div className="h-full overflow-auto"><DepthAnalysisTable data={tableData} /></div>}
            {selectedTableType === 'lab_analysis' && <div className="h-full overflow-auto"><LabAnalysisTable showHeaderControls={false} /></div>}
            {selectedTableType === 'water_analysis' && <div className="h-full overflow-auto"><WaterAnalysisTable /></div>}
            {selectedTableType === 'ground_metals_analysis' && <div className="h-full overflow-auto"><GroundMetalsTable data={tableData} /></div>}
          </div>
        )}
      </div>
    </WithSidebarLayout>
  );
}