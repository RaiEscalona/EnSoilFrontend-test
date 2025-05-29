'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";

const mockData = [
  { sample: 'LP-01', value: 150 },
  { sample: 'LP-02', value: 45 },
  { sample: 'LP-03', value: 80 },
  { sample: 'LP-04', value: 12 },
];

const metodoAnalisis = ['ICP-MS', 'pH', 'Conductividad Electrica', 'Carbono Organico Total', 'Granulometría', 'Azufre Total', 'Sulfato', 'Cromo Hexavalente'];
const parametros = ['Ag', 'Al', 'As', 'B', 'Ba', 'Be', 'Bi', 'Cd'];
const tipoMatriz = ['Relave', 'Agua Superficial', 'LDLQ', 'Minmax', 'Polvo', 'Sedimento', 'Suelo', 'Suelo background'];
const descripcionMuestra = ['LDLQ', 'Minmax', 'Polvo (vivienda comunidad)', 'Relave', 'Relave (cubeta)', 'Relave (disperso hacia estero)', 'Relave (muro)', 'Sedimento (aguas abajo)'];

export default function AnalisisResultadosPage() {
  const [metodo, setMetodo] = useState('');
  const [parametro, setParametro] = useState('');
  const [matriz, setMatriz] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [comentario, setComentario] = useState('');

  return (
    <WithSidebarLayout>
    <main className=" h-screen flex flex-col p-6 ">
      <h1 className="text-3xl font-bold mb-6 text-center">Análisis de Resultados</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Select onValueChange={setMetodo} className="w-full">
          <SelectTrigger className="min-w-[200px] w-full bg-[color:var(--background)] text-[color:var(--foreground)] border border-[color:var(--foreground)]"><SelectValue placeholder="Método de análisis" /></SelectTrigger>
          <SelectContent className="bg-[color:var(--background)]">
            {metodoAnalisis.map((m, i) => <SelectItem key={i} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select onValueChange={setParametro} className="w-full">
          <SelectTrigger className="min-w-[200px] w-full bg-[color:var(--background)] text-[color:var(--foreground)] border border-[color:var(--foreground)]"><SelectValue placeholder="Parámetro" /></SelectTrigger>
          <SelectContent className="bg-[color:var(--background)]">
            {parametros.map((p, i) => <SelectItem key={i} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select onValueChange={setMatriz} className="w-full">
          <SelectTrigger className="min-w-[200px] w-full bg-[color:var(--background)] text-[color:var(--foreground)] border border-[color:var(--foreground)]"><SelectValue placeholder="Tipo matriz" /></SelectTrigger>
          <SelectContent className="bg-[color:var(--background)]">
            {tipoMatriz.map((t, i) => <SelectItem key={i} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select onValueChange={setDescripcion} className="w-full">
          <SelectTrigger className="min-w-[200px] w-full bg-[color:var(--background)] text-[color:var(--foreground)] border border-[color:var(--foreground)]"><SelectValue placeholder="Descripción muestra" /></SelectTrigger>
          <SelectContent className="bg-[color:var(--background)]">
            {descripcionMuestra.map((d, i) => <SelectItem key={i} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 flex-1">
        <Card className="bg-[color:var(--background)] text-[color:var(--foreground)] border border-[color:var(--foreground)] h-full">
          <CardContent className="overflow-auto p-4 h-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-600">
                  <th>Muestra</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {mockData.map((row, i) => (
                  <tr key={i} className="border-b border-gray-700">
                    <td>{row.sample}</td>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 h-full">
          <div className="flex-[3]">
            <Card className="bg-[color:var(--background)] text-[color:var(--foreground)] border border-[color:var(--foreground)] h-full">
              <CardContent className="p-4 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockData}>
                    <XAxis dataKey="sample" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#00cc99" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="flex-[1.5]">
            <Card className="bg-[color:var(--background)] text-[color:var(--foreground)] border border-[color:var(--foreground)] h-full">
              <CardContent className="p-4 h-full flex flex-col">
                <h2 className="font-semibold text-lg mb-2">Punto de muestreo</h2>
                <p className="text-sm mb-2">Descripción:</p>
                <Textarea value={""} placeholder="Descripción..." className="mb-4" />
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