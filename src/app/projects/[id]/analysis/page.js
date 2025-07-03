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
import { getLabAnalysisExcel } from './lab-analysis';
import LabGeneralAnalysisTable from './lab-general-analysis';

export default function AnalysisPage() {
  const { id: projectId } = useParams(); // Rename id to avoid conflict
  const [selectedTableType, setSelectedTableType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState(null);
  const [error, setError] = useState(null);
  const [labTableData, setLabTableData] = useState(null); // { data, columns, methodTotals, tipoMatriz }
  const [waterTableData, setWaterTableData] = useState(null); // { data, columns }
  const [noData, setNoData] = useState(false);
  const [labGeneralTableData, setLabGeneralTableData] = useState(null); // { data, columns }

  const tableTypes = [
    { value: 'depth_analysis', label: 'Análisis de Profundidad' },
    { value: 'lab_analysis', label: 'Análisis de Laboratorio - Suelo'},
    { value: 'water_analysis', label: 'Análisis de Laboratorio - Agua'},
    { value: 'lab_general_analysis', label: 'Análisis de Laboratorio' },
    { value: 'ground_metals_analysis', label: 'Análisis de Metales en el suelo'},
    // Add more table types here in the future
  ];

  const handleGenerateTable = async () => {
    if (!selectedTableType) return;

    setIsLoading(true);
    setTableData(null);
    setError(null);
    setNoData(false);

    try {
      if (selectedTableType === 'depth_analysis') {
        const response = await api.get(`/projects/${projectId}/depthAnalysis`);
        const data = response.data;
        console.log('[Análisis de Profundidad] Datos recibidos:', data);
        if (!data || data.length === 0) {
          setNoData(true);
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
        const response = await api.get(`/analysisMethods/${projectId}/costsSummary?matrixType=Suelo`);
        const data = response.data;
        console.log('[Análisis de Laboratorio - Suelo] Datos recibidos:', data);
        setNoData(false);
        setTableData({});
      } else if (selectedTableType === 'water_analysis') {
        const response = await api.get(`/analysisMethods/${projectId}/costsSummary?matrixType=Agua`);
        const data = response.data;
        console.log('[Análisis de Laboratorio - Agua] Datos recibidos:', data);
        setNoData(false);
        setTableData({});
      } else if (selectedTableType === 'ground_metals_analysis') {
        const response = await api.get(`/projects/${projectId}/groundMetals`);
        const data = response.data;
        console.log('[Análisis de Metales en el Suelo] Datos recibidos:', data);
        if (!data || data.length === 0) {
          setNoData(true);
          return;
        }

        const info = data.info;
        const analytes = data.analytes;
        setTableData({
          info, analytes
        })

        // const dataModule = await import('@/data/simulatedGroundMetalData.json');
        // setTableData(dataModule.default);
      } else if (selectedTableType === 'lab_general_analysis') {
        const response = await api.get(`/analysisMethods/${projectId}/costsSummary`);
        const data = response.data;
        console.log('[Análisis de Laboratorio General] Datos recibidos:', data);
        if (!data || !data.data || !data.columns || data.data.length === 0) {
          setNoData(true);
          return;
        }
        setLabGeneralTableData({ data: data.data, columns: data.columns });
        setTableData({});
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
    if (!tableData) return;

    try {
      if (selectedTableType === 'depth_analysis') {
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
      } else if (selectedTableType === 'ground_metals_analysis') {
        const { info, analytes } = tableData;
        const exportData = [];
        
        info.forEach((point) => {
          point.sampleLogs.forEach((sample) => {
            const row = {
              'Punto de muestreo': point.drillingPointTag,
              'Muestra': sample.sampleLogTag
            };
            
            analytes.forEach((analyte) => {
              const match = sample.analytes.find((a) => a.analyte === analyte);
              row[analyte] = match ? match.result : '';
            });
            
            exportData.push(row);
          });
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'MetalesSuelo');

        const maxWidth = Math.max(...analytes.map(a => a.length), 20);
        worksheet['!cols'] = [
          { wch: 20 }, // Punto de muestreo
          { wch: 15 }, // Muestra
          ...analytes.map(() => ({ wch: maxWidth }))
        ];

        const fileName = `analisis_metales_suelo_proyecto_${projectId}.xlsx`;
        XLSX.writeFile(workbook, fileName);
      } else if (selectedTableType === 'lab_analysis') {
        if (labTableData && labTableData.data && labTableData.columns) {
          getLabAnalysisExcel(labTableData.data, labTableData.columns, labTableData.methodTotals, labTableData.tipoMatriz);
        }
      } else if (selectedTableType === 'water_analysis') {
        if (waterTableData && waterTableData.data && waterTableData.columns) {
          // Exportar a Excel usando XLSX
          const exportData = waterTableData.data.map(row => {
            const exportRow = {};
            waterTableData.columns.forEach(col => {
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
          const ws = XLSX.utils.json_to_sheet(exportData, { header: waterTableData.columns });
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Análisis de Agua");
          XLSX.writeFile(wb, `analisis_agua_proyecto_${projectId}.xlsx`);
        }
      } else if (selectedTableType === 'lab_general_analysis') {
        if (labGeneralTableData && labGeneralTableData.data && labGeneralTableData.columns) {
          // Exportar a Excel usando XLSX
          const exportData = labGeneralTableData.data.map(row => {
            const exportRow = {};
            labGeneralTableData.columns.forEach(col => {
              exportRow[col] = row[col] ?? '';
            });
            return exportRow;
          });
          const ws = XLSX.utils.json_to_sheet(exportData, { header: labGeneralTableData.columns });
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Análisis de Laboratorio');
          XLSX.writeFile(wb, `analisis_laboratorio_proyecto_${projectId}.xlsx`);
        }
      }
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
    }
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
                  setLabTableData(null);
                  setWaterTableData(null);
                  setLabGeneralTableData(null);
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
            <ButtonComponent label={'Exportar a Excel'} onClick={handleExportExcel} disable={
              !tableData || isLoading ||
              (selectedTableType === 'lab_analysis' && !labTableData) ||
              (selectedTableType === 'water_analysis' && !waterTableData) ||
              (selectedTableType === 'lab_general_analysis' && !labGeneralTableData)
            }/>
          </div>
        </div>

        {/* Tabla de resultados */}
        {isLoading && <p className="text-center my-4">Cargando datos de la tabla...</p>}
        {noData && <p className="text-center my-4 text-gray-500">No hay datos disponibles</p>}
        {error && !noData && <p className="text-center my-4 text-red-600">{error}</p>}
        {tableData && !noData && (
          <div className="bg-white dark:bg-quaternary border border-quaternary p-6 rounded-lg shadow-md flex flex-col overflow-hidden max-h-[calc(100vh-250px)]">
            {/* Selector Suelo/Agua flotante y título */}
            {selectedTableType === 'lab_analysis' ? (
              <h3 className="text-black text-h3 mb-4">Tabla: Análisis de Laboratorio</h3>
            ) : (
              <h3 className="text-black text-h3 mb-4">
                Tabla: {tableTypes.find(t => t.value === selectedTableType)?.label}
              </h3>
            )}
            {selectedTableType === 'depth_analysis' && <div className="h-full overflow-auto"><DepthAnalysisTable data={tableData} projectId={projectId} /></div>}
            {selectedTableType === 'lab_analysis' && <div className="h-full overflow-auto"><LabAnalysisTable projectId={projectId} onDataReady={setLabTableData} /></div>}
            {selectedTableType === 'water_analysis' && <div className="h-full overflow-auto"><WaterAnalysisTable projectId={projectId} onDataReady={setWaterTableData} /></div>}
            {selectedTableType === 'ground_metals_analysis' && <div className="h-full overflow-auto"><GroundMetalsTable data={tableData} projectId={projectId} /></div>}
            {selectedTableType === 'lab_general_analysis' && <div className="h-full overflow-auto"><LabGeneralAnalysisTable projectId={projectId} data={labGeneralTableData?.data} columns={labGeneralTableData?.columns} /></div>}
          </div>
        )}
      </div>
    </WithSidebarLayout>
  );
}