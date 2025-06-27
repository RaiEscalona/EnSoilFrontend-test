'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
import axios from '@/utils/axios';

const tipoMatriz = ['Relave', 'Agua Superficial', 'LDLQ', 'Minmax', 'Polvo', 'Sedimento', 'Suelo', 'Suelo background'];

export default function AnalisisResultadosPage() {
  const params = useParams();
  const projectId = params.id; // dinámico desde URL

  const [normas, setNormas] = useState([]);
  const [normaSeleccionada, setNormaSeleccionada] = useState(null);
  const [matriz, setMatriz] = useState('');
  const [comentario, setComentario] = useState('');
  const [chartData, setChartData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [selectedAnalitos, setSelectedAnalitos] = useState([]);
  const [selectedMuestras, setSelectedMuestras] = useState([]);
  const [parametrosUnicos, setParametrosUnicos] = useState([]);
  const [muestrasUnicas, setMuestrasUnicas] = useState([]);

  useEffect(() => {
    const fetchNormas = async () => {
      try {
        console.log("/internationalNorms/entities");
        const res = await axios.get(`/internationalNorms/entities`);
        console.log("✅ Normas:", res.data);
        if (res.data && Array.isArray(res.data.data)) {
          setNormas(res.data.data);
          setNormaSeleccionada(null); // Por defecto, ninguna seleccionada
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
      console.log(`🚀 GET /dataLaboratories/project/${projectId}`);
      const res = await axios.get(`/dataLaboratories/${projectId}/results`);
      console.log("✅ Response:", res.data);

      if (Array.isArray(res.data.data) && res.data.data.length > 0) {
        const rawData = res.data.data;

        // ✅ Correcto: recorrer el array y flatear los results
        const transformedData = rawData.flatMap(sample => {
          return (sample.results || []).map(result => ({
            muestra: sample.sampleName,
            analito: result.analyteName,
            valor: result.result
          }));
        });

        console.log("✅ Transformed data:", transformedData);
        setAllData(transformedData);
        setChartData(transformedData);

        const uniqueAnalitos = [...new Set(transformedData.map(d => d.analito))];
        const uniqueMuestras = [...new Set(transformedData.map(d => d.muestra))];
        setParametrosUnicos(uniqueAnalitos);
        setMuestrasUnicas(uniqueMuestras);
      } else {
        console.error("⚠️ No se encontró data válida");
      }
    } catch (error) {
      console.error("❌ Error al obtener Excel:", error);
    }
  };

  fetchExcelData();
}, [projectId]);

useEffect(() => {
  const fetchResultsWithNorms = async () => {
    try {
      console.log(`🚀 GET /dataLaboratories/${projectId}/results-with-norms/${normaSeleccionada.id}`);
      const res = await axios.get(`/dataLaboratories/${projectId}/results-with-norms/${normaSeleccionada.id}`);
      console.log("✅ Response con normas:", res.data);

      if (Array.isArray(res.data.data) && res.data.data.length > 0) {
        const rawData = res.data.data;

        const transformedData = rawData.flatMap(sample => {
          return (sample.results || []).map(result => ({
            muestra: sample.sampleName,
            analito: result.analyteName,
            valor: result.result,
            overNorm: result.overNorm
          }));
        });

        console.log("✅ Transformed data con normas:", transformedData);
        setAllData(transformedData);
        setChartData(transformedData);

        const uniqueAnalitos = [...new Set(transformedData.map(d => d.analito))];
        const uniqueMuestras = [...new Set(transformedData.map(d => d.muestra))];
        setParametrosUnicos(uniqueAnalitos);
        setMuestrasUnicas(uniqueMuestras);
      } else {
        console.error("⚠️ No se encontró data válida (con normas)");
      }
    } catch (error) {
      console.error("❌ Error al obtener resultados con normas:", error);
    }
  };

  const fetchResultsWithoutNorms = async () => {
    try {
      console.log(`🚀 GET /dataLaboratories/${projectId}/results`);
      const res = await axios.get(`/dataLaboratories/${projectId}/results`);
      console.log("✅ Response SIN normas:", res.data);

      if (Array.isArray(res.data.data) && res.data.data.length > 0) {
        const rawData = res.data.data;

        const transformedData = rawData.flatMap(sample => {
          return (sample.results || []).map(result => ({
            muestra: sample.sampleName,
            analito: result.analyteName,
            valor: result.result
          }));
        });

        console.log("✅ Transformed data SIN normas:", transformedData);
        setAllData(transformedData);
        setChartData(transformedData);

        const uniqueAnalitos = [...new Set(transformedData.map(d => d.analito))];
        const uniqueMuestras = [...new Set(transformedData.map(d => d.muestra))];
        setParametrosUnicos(uniqueAnalitos);
        setMuestrasUnicas(uniqueMuestras);
      } else {
        console.error("⚠️ No se encontró data válida (sin normas)");
      }
    } catch (error) {
      console.error("❌ Error al obtener resultados SIN normas:", error);
    }
  };

  // ✅ Decisión:
  if (normaSeleccionada?.id) {
    fetchResultsWithNorms();
  } else {
    fetchResultsWithoutNorms();
  }

}, [normaSeleccionada, projectId]);

  // FILTRADO
  const filteredData = chartData.filter(d => {
    const matchAnalito = selectedAnalitos.length === 0 || selectedAnalitos.includes(d.analito);
    const matchMuestra = selectedMuestras.length === 0 || selectedMuestras.includes(d.muestra);
    return matchAnalito && matchMuestra;
  });

  // PIVOT DATA para gráfico (X dinámico)
  const pivotData = [...new Set(filteredData.map(d => d.analito))].map(analito => {
  const row = { analito };
  const muestrasFiltradas = muestrasUnicas.filter(m =>
    selectedMuestras.length === 0 || selectedMuestras.includes(m)
  );
  muestrasFiltradas.forEach(muestra => {
    const match = filteredData.find(d => d.analito === analito && d.muestra === muestra);
    row[muestra] = match?.valor ?? null;
  });
  return row;
});

  return (
    <WithSidebarLayout>
      <main className="h-screen flex flex-col p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Análisis de Resultados</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Select
            onValueChange={(id) => {
              if (id === 'none') {
                setNormaSeleccionada(null);
              } else {
                const selected = normas.find(n => n.id.toString() === id);
                setNormaSeleccionada(selected);
              }
            }}
            value={normaSeleccionada?.id?.toString() ?? 'none'}
            className="w-full"
          >
            <SelectTrigger className="min-w-[200px] w-full bg-[color:var(--background)] text-[color:var(--foreground)] border border-[color:var(--foreground)]">
              <SelectValue placeholder="Norma internacional" />
            </SelectTrigger>
            <SelectContent className="bg-[color:var(--background)]">
              <SelectItem value="none">
                Sin norma seleccionada
              </SelectItem>
              {normas.map((norma) => (
                <SelectItem key={norma.id} value={norma.id.toString()}>
                  {norma.entity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Analitos MULTI */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {selectedAnalitos.length > 0
                  ? selectedAnalitos.join(", ")
                  : "Selecciona analitos"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-[325px] w-full bg-[color:var(--background)] text-black border border-[color:var(--foreground)]">
              <ScrollArea className="h-[200px] text-black">
                {parametrosUnicos.map((analito, i) => (
                  <div key={i} className="flex items-center space-x-2 mb-1 text-black">
                    <Checkbox
                      id={`analito-${i}`}
                      checked={selectedAnalitos.includes(analito)}
                      onCheckedChange={(checked) => {
                        setSelectedAnalitos(prev =>
                          checked
                            ? [...prev, analito]
                            : prev.filter(a => a !== analito)
                        );
                      }}
                    />
                    <label htmlFor={`analito-${i}`} className="text-sm cursor-pointer text-black">
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
              <Button variant="outline" className="w-full justify-start">
                {selectedMuestras.length > 0
                  ? selectedMuestras.join(", ")
                  : "Selecciona punto(s) de muestreo"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-[325px] w-full bg-[color:var(--background)] text-black border border-[color:var(--foreground)]">
              <ScrollArea className="h-[200px] text-black">
                {muestrasUnicas.map((muestra, i) => (
                  <div key={i} className="flex items-center space-x-2 mb-1 text-black">
                    <Checkbox
                      id={`muestra-${i}`}
                      checked={selectedMuestras.includes(muestra)}
                      onCheckedChange={(checked) => {
                        setSelectedMuestras(prev =>
                          checked
                            ? [...prev, muestra]
                            : prev.filter(m => m !== muestra)
                        );
                      }}
                    />
                    <label htmlFor={`muestra-${i}`} className="text-sm cursor-pointer text-black">
                      {muestra}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Select onValueChange={setMatriz} value={matriz} className="w-full">
            <SelectTrigger className="min-w-[200px] w-full bg-[color:var(--background)] text-[color:var(--foreground)] border border-[color:var(--foreground)]">
              <SelectValue placeholder="Tipo matriz" />
            </SelectTrigger>
            <SelectContent className="bg-[color:var(--background)]">
              {tipoMatriz.map((t, i) => <SelectItem key={i} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* CARD GRANDE CON TABLA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          <Card className="bg-[color:var(--background)] text-[color:var(--foreground)] border border-[color:var(--foreground)] h-full">
            <CardContent className="h-[755px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[color:var(--background)] z-0">
                  <tr className="text-left border-b border-gray-600">
                    <th className="py-3 px-2 font-semibold">Muestra</th>
                    <th className="py-3 px-2 font-semibold">Analito</th>
                    <th className="py-3 px-2 font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, i) => (
                    <tr key={i} className="border-b border-gray-700">
                      <td className="py-2 px-2">{row.muestra}</td>
                      <td className="py-2 px-2">{row.analito}</td>
                      <td
                        className={`py-2 px-2 ${
                          row.overNorm ? 'text-red-500 font-bold' : ''
                        }`}
                      >
                        {row.valor}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* CARD lateral con gráfico */}
          <div className="flex flex-col gap-4 h-full">
            <div className="flex-[3]">
              <Card className="bg-[color:var(--background)] text-[color:var(--foreground)] border border-[color:var(--foreground)] h-full">
                <CardContent className="p-4 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pivotData}>
                      <XAxis dataKey="analito" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'white', color: 'black' }}
                        labelStyle={{ color: 'black', fontWeight: 'bold' }}
                      />
                      {muestrasUnicas
                        .filter(m => selectedMuestras.length === 0 || selectedMuestras.includes(m))
                        .map((muestra, i) => (
                          <Line
                            key={muestra}
                            type="monotone"
                            dataKey={muestra}
                            stroke={`hsl(${i * 50}, 35%, 50%)`} // colores suaves
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                        ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* CARD Descripción + Observaciones */}
            <div className="flex-[1.5]">
              <Card className="bg-[color:var(--background)] text-[color:var(--foreground)] border border-[color:var(--foreground)] h-full">
                <CardContent className="p-4 h-full flex flex-col">
                  <h2 className="font-semibold text-lg mb-2">Punto de muestreo</h2>
                  <p className="text-sm mb-2">Descripción:</p>
                  <Textarea defaultValue="" placeholder="Descripción..." className="mb-4" />
                  <p className="text-sm mb-2">Observaciones:</p>
                  <Textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Observaciones..." className="flex-grow" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </WithSidebarLayout>
  );
}