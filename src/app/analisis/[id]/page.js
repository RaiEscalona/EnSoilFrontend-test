'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
import axios from '@/utils/axios';
import * as XLSX from 'xlsx';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import ButtonComponent from '@/components/utils/button';



export default function AnalisisResultadosPage() {
  const params = useParams();
  const projectId = params.id; // dinámico desde URL

  const [normas, setNormas] = useState([]);
  const [normasSeleccionadas, setNormasSeleccionadas] = useState([]);
  const [tipoMatriz, setTipoMatriz] = useState([]);
  const [matriz, setMatriz] = useState('');
  const [comentario, setComentario] = useState('');
  const [chartData, setChartData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [selectedAnalitos, setSelectedAnalitos] = useState([]);
  const [selectedMuestras, setSelectedMuestras] = useState([]);
  const [selectedMuestrasCompletas, setSelectedMuestrasCompletas] = useState([]);
  const [parametrosUnicos, setParametrosUnicos] = useState([]);
  const [muestrasUnicas, setMuestrasUnicas] = useState([]);
  const [mostrarSoloFueraDeNorma, setMostrarSoloFueraDeNorma] = useState(false);
  const [normasIncumplidas, setNormasIncumplidas] = useState([]);

  useEffect(() => {
    const fetchNormas = async () => {
      try {
        const res = await axios.get(`/internationalNorms/entities`);
        if (res.data && Array.isArray(res.data.data)) {
          setNormas(res.data.data);
          setNormasSeleccionadas([]); // Por defecto, ninguna seleccionada
        }
      } catch (error) {
        console.error("❌ Error al obtener normas:", error);
      }
    };
    fetchNormas();
  }, []);

  useEffect(() => {
    const fetchExcelData = async () => {
      try {
        const res = await axios.get(`/dataLaboratories/${projectId}/results`);

        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          const rawData = res.data.data;

          // ✅ Correcto: recorrer el array y flatear los results
          const transformedData = rawData.flatMap(sample => {
            return (sample.results || []).map(result => ({
              muestra: sample.sampleName,
              puntoMuestreo: sample.sampleName.split('_')[0],
              analito: result.analyteName,
              valor: result.result
            }));
          });
        }
      } catch (error) {
        console.error("❌ Error al obtener Excel:", error);
      }
    };

    fetchExcelData();
  }, [projectId]);

  useEffect(() => {
    const fetchAllResultsWithNorms = async () => {
      try {
        const mergedMap = new Map();

        for (const norma of normasSeleccionadas) {
          const res = await axios.get(`/dataLaboratories/${projectId}/results-with-norms/${norma.id}`);
          const rawData = res.data.data;

          rawData.forEach(sample => {
            (sample.results || []).forEach(result => {
              const key = `${sample.sampleName}-${result.analyteName}`;
              const value = {
                muestra: sample.sampleName,
                analito: result.analyteName,
                valor: result.result,
                overNorm: result.overNorm,
                normasIncumplidas: result.overNorm ? [norma.entity] : []
              };

              if (mergedMap.has(key)) {
                const existing = mergedMap.get(key);
                mergedMap.set(key, {
                  ...existing,
                  overNorm: existing.overNorm || value.overNorm,
                  normasIncumplidas: Array.from(new Set([...(existing.normasIncumplidas || []), ...(value.normasIncumplidas || [])]))
                });
              } else {
                mergedMap.set(key, value);
              }
            });
          });
        }

        const allDataWithNorms = Array.from(mergedMap.values()).map(row => ({
          ...row,
          puntoMuestreo: row.muestra.split('_')[0]
        }));

        setAllData(allDataWithNorms);
        setChartData(allDataWithNorms);

        const uniqueAnalitos = [...new Set(allDataWithNorms.map(d => d.analito))];
        const uniqueMuestras = [...new Set(allDataWithNorms.map(d => d.puntoMuestreo))];
        setParametrosUnicos(uniqueAnalitos);
        setMuestrasUnicas(uniqueMuestras);
      } catch (error) {
        console.error("❌ Error al combinar resultados de normas múltiples:", error);
      }
    };

    const fetchResultsWithoutNorms = async () => {
      try {
        const res = await axios.get(`/dataLaboratories/${projectId}/results`);
        const rawData = res.data.data;

        const transformedData = rawData.flatMap(sample =>
          (sample.results || []).map(result => ({
            muestra: sample.sampleName,
            puntoMuestreo: sample.sampleName.split('_')[0],
            analito: result.analyteName,
            valor: result.result
          }))
        );

        setAllData(transformedData);
        setChartData(transformedData);

        const uniqueAnalitos = [...new Set(transformedData.map(d => d.analito))];
        const uniqueMuestras = [...new Set(transformedData.map(d => d.puntoMuestreo))];
        setParametrosUnicos(uniqueAnalitos);
        setMuestrasUnicas(uniqueMuestras);
      } catch (error) {
        console.error("❌ Error al obtener resultados SIN normas:", error);
      }
    };

    if (normasSeleccionadas.length > 0) {
      fetchAllResultsWithNorms();
    } else {
      fetchResultsWithoutNorms();
    }
  }, [normasSeleccionadas, projectId]);

  // FILTRADO
  const filteredData = chartData.filter(d => {
    const matchAnalito = selectedAnalitos.length === 0 || selectedAnalitos.includes(d.analito);
    const matchMuestra = selectedMuestras.length === 0 || selectedMuestras.includes(d.puntoMuestreo);
    const matchMuestraCompleta = selectedMuestrasCompletas.length === 0 || selectedMuestrasCompletas.includes(d.muestra);
    const matchNorma = !mostrarSoloFueraDeNorma || d.overNorm;
    return matchAnalito && matchMuestra && matchMuestraCompleta && matchNorma;
  });

  // Exportar a Excel los datos filtrados, incluyendo columna por cada norma seleccionada
  const handleExportToExcel = () => {
    const exportData = filteredData.map(row => {
      const base = {
        "Punto de muestreo": row.puntoMuestreo,
        "Muestra": row.muestra,
        "Analito": row.analito,
        "Valor": row.valor
      };

      normasSeleccionadas.forEach(norma => {
        base[`Fuera de norma - ${norma.entity}`] = row.normasIncumplidas?.includes(norma.entity) ? "Sí" : "No";
      });

      return base;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");

    XLSX.writeFile(workbook, `resultados_proyecto_${projectId}.xlsx`);
  };

  // PIVOT DATA para gráfico (X = muestra, barras = analitos)
  const pivotData = [...new Set(filteredData.map(d => d.muestra))].map(muestra => {
    const row = { muestra };
    const analitosFiltrados = parametrosUnicos.filter(a =>
      selectedAnalitos.length === 0 || selectedAnalitos.includes(a)
    );
    analitosFiltrados.forEach(analito => {
      const match = filteredData.find(d => d.muestra === muestra && d.analito === analito);
      row[analito] = match?.valor ?? null;
    });
    return row;
  });

  // Filtrar datos para gráfico de barras: solo valores positivos (> 0.01), los ceros/negativos/null se reemplazan por null
  const safePivotData = pivotData.map(row => {
    const safeRow = { ...row };
    parametrosUnicos.forEach(a => {
      if (safeRow[a] == null || safeRow[a] <= 0.0) {
        safeRow[a] = null;
      }
    });
    return safeRow;
  });

  // Calcular máximos por analito para líneas de referencia en el gráfico
  const maximosPorAnalito = parametrosUnicos.reduce((acc, analito) => {
    const max = Math.max(
      ...safePivotData
        .map(d => d[analito])
        .filter(v => v != null && v > 0)
    );
    acc[analito] = max > 0 ? max : null;
    return acc;
  }, {});

  return (
    <WithSidebarLayout>
      <main className="flex flex-col h-full overflow-hidden">
        <div className="flex flex-col gap-6 pt-2 px-6 pb-6 flex-1 overflow-hidden max-h-screen">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold">Análisis de Resultados</h1>
            {/* <Button
              onClick={handleExportToExcel}
              className="w-fit bg-primary text-white hover:bg-primary/90"
            >
              Exportar a Excel
            </Button> */}
            <ButtonComponent label={'Exportar a Excel'} onClick={handleExportToExcel}/>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-8 text-sm justify-start truncate whitespace-nowrap overflow-hidden bg-[#8f8d8d] text-white border border-[color:var(--foreground)]"
              >
                {normasSeleccionadas.length > 0
                  ? normasSeleccionadas.map(n => n.entity).join(", ")
                  : "Selecciona normas"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] bg-[#8f8d8d] text-white border border-[color:var(--foreground)]">
              <ScrollArea className="h-[200px] text-white">
                {/* Opción especial: Mostrar solo fuera de norma */}
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="only-out-of-norm"
                    checked={mostrarSoloFueraDeNorma}
                    onCheckedChange={(checked) => setMostrarSoloFueraDeNorma(!!checked)}
                  />
                  <label htmlFor="only-out-of-norm" className="text-sm cursor-pointer text-white font-semibold">
                    Mostrar solo fuera de norma
                  </label>
                </div>
                {/* Seleccionar todas las normas */}
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="select-all-normas"
                    checked={normasSeleccionadas.length === normas.length}
                    onCheckedChange={(checked) => {
                      setNormasSeleccionadas(checked ? [...normas] : []);
                    }}
                  />
                  <label htmlFor="select-all-normas" className="text-sm cursor-pointer text-white font-semibold">
                    Seleccionar todas
                  </label>
                </div>
                {normas.map((norma, i) => (
                  <div key={i} className="flex items-center space-x-2 mb-1 text-white">
                    <Checkbox
                      id={`norma-${i}`}
                      checked={normasSeleccionadas.some(n => n.id === norma.id)}
                      onCheckedChange={(checked) => {
                        setNormasSeleccionadas(prev =>
                          checked
                            ? [...prev, norma]
                            : prev.filter(n => n.id !== norma.id)
                        );
                      }}
                    />
                    <label htmlFor={`norma-${i}`} className="text-sm cursor-pointer text-white">
                      {norma.entity}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Analitos MULTI */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-8 text-sm justify-start truncate whitespace-nowrap overflow-hidden bg-[#8f8d8d] text-white border border-[color:var(--foreground)]"
              >
                {selectedAnalitos.length > 0
                ? selectedAnalitos.join(", ")
                : "Selecciona analitos"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] bg-[#8f8d8d] text-white border border-[color:var(--foreground)]">
              <ScrollArea className="h-[200px] text-white">
                {/* Seleccionar todos los analitos */}
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="select-all-analitos"
                    checked={selectedAnalitos.length === parametrosUnicos.length}
                    onCheckedChange={(checked) => {
                      setSelectedAnalitos(checked ? [...parametrosUnicos] : []);
                    }}
                  />
                  <label htmlFor="select-all-analitos" className="text-sm cursor-pointer text-white font-semibold">
                    Seleccionar todos
                  </label>
                </div>
                {parametrosUnicos.map((analito, i) => (
                  <div key={i} className="flex items-center space-x-2 mb-1 text-white">
                    <Checkbox
                      id={`analito-${i}`}
                      checked={selectedAnalitos.includes(analito)}
                      onCheckedChange={(checked) => {
                        setSelectedAnalitos(prev =>
                          checked
                            ? (prev.length < 10 ? [...prev, analito] : prev)
                            : prev.filter(a => a !== analito)
                        );
                      }}
                    />
                    <label htmlFor={`analito-${i}`} className="text-sm cursor-pointer text-white">
                      {analito}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Punto de muestreo MULTI */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-8 text-sm justify-start truncate whitespace-nowrap overflow-hidden bg-[#8f8d8d] text-white border border-[color:var(--foreground)]"
              >
                {selectedMuestras.length > 0
                  ? selectedMuestras.join(", ")
                  : "Selecciona punto(s) de muestreo"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] bg-[#8f8d8d] text-white border border-[color:var(--foreground)]">
              <ScrollArea className="h-[200px] text-white">
                {/* Seleccionar todos los puntos de muestreo */}
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="select-all-muestras"
                    checked={selectedMuestras.length === muestrasUnicas.length}
                    onCheckedChange={(checked) => {
                      setSelectedMuestras(checked ? [...muestrasUnicas] : []);
                    }}
                  />
                  <label htmlFor="select-all-muestras" className="text-sm cursor-pointer text-white font-semibold">
                    Seleccionar todos
                  </label>
                </div>
                {muestrasUnicas.map((muestra, i) => (
                  <div key={i} className="flex items-center space-x-2 mb-1 text-white">
                    <Checkbox
                      id={`muestra-${i}`}
                      checked={selectedMuestras.includes(muestra)}
                      onCheckedChange={(checked) => {
                        setSelectedMuestras(prev =>
                          checked
                            ? (prev.length < 10 ? [...prev, muestra] : prev)
                            : prev.filter(m => m !== muestra)
                        );
                      }}
                    />
                    <label htmlFor={`muestra-${i}`} className="text-sm cursor-pointer text-white">
                      {muestra}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Muestra completa MULTI */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-8 text-sm justify-start truncate whitespace-nowrap overflow-hidden bg-[#8f8d8d] text-white border border-[color:var(--foreground)]"
              >
                {selectedMuestrasCompletas.length > 0
                  ? selectedMuestrasCompletas.join(", ")
                  : "Selecciona muestra(s)"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] bg-[#8f8d8d] text-white border border-[color:var(--foreground)]">
              <ScrollArea className="h-[200px] text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="select-all-muestras-completas"
                    checked={selectedMuestrasCompletas.length === chartData.map(d => d.muestra).filter((v, i, a) => a.indexOf(v) === i).length}
                    onCheckedChange={(checked) => {
                      // Todas las muestras completas únicas
                      const muestrasCompletasUnicas = chartData.map(d => d.muestra).filter((v, i, a) => a.indexOf(v) === i);
                      setSelectedMuestrasCompletas(checked ? [...muestrasCompletasUnicas] : []);
                    }}
                  />
                  <label htmlFor="select-all-muestras-completas" className="text-sm cursor-pointer text-white font-semibold">
                    Seleccionar todas
                  </label>
                </div>
                {chartData
                  .map(d => d.muestra)
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .map((muestra, i) => (
                    <div key={i} className="flex items-center space-x-2 mb-1 text-white">
                      <Checkbox
                        id={`muestra-completa-${i}`}
                        checked={selectedMuestrasCompletas.includes(muestra)}
                        onCheckedChange={(checked) => {
                          setSelectedMuestrasCompletas(prev =>
                            checked
                              ? (prev.length < 10 ? [...prev, muestra] : prev)
                              : prev.filter(m => m !== muestra)
                          );
                        }}
                      />
                      <label htmlFor={`muestra-completa-${i}`} className="text-sm cursor-pointer text-white">
                        {muestra}
                      </label>
                    </div>
                ))}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Select onValueChange={setMatriz} value={matriz} className="w-full">
            <SelectTrigger
              className="min-w-[200px] w-full h-8 text-sm bg-[#8f8d8d] text-white border border-[color:var(--foreground)]"
              style={{
                background: '#8f8d8d',
                color: 'white',
                borderColor: 'var(--foreground)'
              }}
            >
              <SelectValue placeholder="Tipo matriz" className="text-white" />
            </SelectTrigger>
            <SelectContent
              className="w-full bg-[#8f8d8d] text-white border border-[color:var(--foreground)]"
              style={{
                background: '#8f8d8d',
                color: 'white',
                borderColor: 'var(--foreground)'
              }}
            >
              {tipoMatriz.map((t, i) => (
                <SelectItem
                  key={i}
                  value={t}
                  className="text-white"
                  style={{ color: 'white' }}
                >
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* CARD GRANDE CON TABLA */}
        <div className="flex flex-1 gap-6 overflow-hidden max-h-full">
          <Card className="w-full h-full flex flex-col overflow-hidden bg-[#8f8d8d] text-[color:var(--foreground)] border border-[color:var(--foreground)]">
            <CardContent className="h-full flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto h-full">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#8f8d8d] z-0">
                    <tr className="text-left border-b border-gray-600">
                      <th className="py-3 px-2 font-semibold">Punto de muestreo</th>
                      <th className="py-3 px-2 font-semibold">Muestra</th>
                      <th className="py-3 px-2 font-semibold">Analito</th>
                      <th className="py-3 px-2 font-semibold">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, i) => (
                      <HoverCard key={i}>
                        <HoverCardTrigger asChild>
                          <tr
                            className={`border-b border-gray-700 ${row.overNorm ? 'bg-red-50 dark:bg-red-600' : ''} cursor-pointer`}
                          >
                            <td className="py-2 px-2">{row.puntoMuestreo}</td>
                            <td className="py-2 px-2">{row.muestra}</td>
                            <td className="py-2 px-2">{row.analito}</td>
                            <td className="py-2 px-2">{row.valor}</td>
                          </tr>
                        </HoverCardTrigger>
                        {row.overNorm && row.normasIncumplidas?.length > 0 && (
                          <HoverCardContent className="bg-[#8f8d8d] text-[color:var(--foreground)] border border-[color:var(--foreground)] w-64">
                            <p className="font-semibold mb-1">Normas que no cumple:</p>
                            <ul className="list-disc list-inside text-sm">
                              {row.normasIncumplidas.map((norma, idx) => (
                                <li key={idx}>{norma}</li>
                              ))}
                            </ul>
                          </HoverCardContent>
                        )}
                      </HoverCard>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* CARD lateral con gráfico o mensaje */}
          <div className="flex flex-col h-full w-full gap-4">
            <div className="flex-[2] h-full">
              <Card className="bg-[#8f8d8d] text-[color:var(--foreground)] border border-[color:var(--foreground)] h-full">
                <CardContent className="p-4 h-full flex flex-col justify-center">
                  {(selectedAnalitos.length > 0 && selectedAnalitos.length <= 10) || (selectedMuestras.length > 0 && selectedMuestras.length <= 10) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={safePivotData}>
                        <XAxis
                          dataKey="muestra"
                          stroke="#ccc"
                          tick={{ fill: '#ccc', fontSize: 10 }}
                          angle={selectedMuestras.length > 5 ? 45 : 0}
                          textAnchor={selectedMuestras.length > 5 ? "start" : "middle"}
                          interval={0}
                          dy={10}
                        />
                        <YAxis stroke="#ccc" scale="log" domain={[0.01, 'auto']} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'white', color: 'black' }}
                          labelStyle={{ color: 'black', fontWeight: 'bold' }}
                        />
                        <Legend />
                        {parametrosUnicos
                          .filter(a =>
                            (selectedAnalitos.length === 0 || selectedAnalitos.includes(a)) &&
                            safePivotData.some(row => row[a] != null && row[a] > 0.0)
                          )
                          .map((analito, i) => (
                            <Bar
                              key={analito}
                              dataKey={analito}
                              fill={`hsl(${i * 50}, 35%, 50%)`}
                              radius={[4, 4, 0, 0]}
                            />
                        ))}
                        {/* Agregar líneas horizontales para el valor máximo de cada analito */}
                        {parametrosUnicos
                          .filter(a =>
                            (selectedAnalitos.length === 0 || selectedAnalitos.includes(a)) &&
                            safePivotData.some(row => row[a] != null && row[a] > 0.0)
                          )
                          .map((analito, i) =>
                            maximosPorAnalito[analito] != null ? (
                              <ReferenceLine
                                key={`linea-${analito}`}
                                y={maximosPorAnalito[analito]}
                                stroke={`hsl(${i * 50}, 35%, 50%)`}
                                strokeDasharray="3 3"
                                label={{ value: `Máx ${analito}`, position: "top", fill: "white", fontSize: 10 }}
                              />
                            ) : null
                          )
                        }
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-sm text-gray-300">
                      Aplica un filtro (máx 10 analitos o máx 10 puntos de muestreo) para ver el gráfico
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        </div>
      </main>
    </WithSidebarLayout>
  );
}