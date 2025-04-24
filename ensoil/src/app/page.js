'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";

export default function VistaPrincipal() {
  const router = useRouter();

  // Función para manejar la carga de archivos
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    console.log("Archivo seleccionado:", file.name);
  
    // 🔁 Aquí preparas para enviar al backend
    const formData = new FormData();
    formData.append('archivo', file);
  
    try {
      const res = await fetch('/api/subir-archivo', {
        method: 'POST',
        body: formData,
      });
  
      if (!res.ok) throw new Error("Error al subir archivo");
  
      const data = await res.json();
      alert(`Archivo "${file.name}" subido correctamente`);
      console.log(data);
    } catch (error) {
      console.error("Fallo en la subida", error);
      alert("Error al subir el archivo");
    }
  };
  

  const fileData = [
    { id: 1, name: "Muestra Norte", date: "24/04/2025", creationDate: "23/04/2025" },
    { id: 2, name: "Muestra Sur", date: "22/04/2025", creationDate: "21/04/2025" },
    { id: 3, name: "Reporte Abril", date: "20/04/2025", creationDate: "19/04/2025" },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-[125px] bg-[#383636] flex flex-col items-center">
        <div className="mt-14 mb-4">
          <div className="w-[73px] h-[68px] bg-[#c7058a] rounded-[36.5px/34px] flex items-center justify-center">
            <span className="font-normal text-[32px] text-[#740b5d]">ES</span>
          </div>
          <div className="mt-2 text-white text-base text-center">ENSOIL</div>
        </div>

        <div className="mt-20 flex flex-col items-center gap-8">
          <div className="flex flex-col items-center">
            <div className="w-[63px] h-[63px] flex items-center justify-center">
              <img className="w-[39px] h-11" alt="Home Icon" src="/icons/home.png" />
            </div>
            <span className="text-white text-base mt-1">Home</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-[55px] h-[55px] flex items-center justify-center">
              <img className="w-[46px] h-[46px]" alt="Recent Icon" src="/icons/document.png" />
            </div>
            <span className="text-white text-base mt-1">Recent</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="flex gap-8 mt-8">

          {/* Upload new file Button */}
          <Card className="w-[369px] h-[177px] bg-[#b2abab] rounded-[14px] border-none cursor-pointer hover:opacity-90">
            <label className="flex flex-col items-center justify-center h-full p-0 cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <img className="w-[57px] h-[57px]" alt="Agregar" src="/icons/add.png" />
              <span className="mt-2 text-sm text-black">Subir nuevo archivo</span>
            </label>
          </Card>

          {/* Calculate Budget */}
          <Card
                onClick={() => router.push('/calculo')}
                className="w-[369px] h-[177px] bg-[#b2abab] rounded-[14px] border-none cursor-pointer hover:opacity-90" >
            <CardContent className="flex flex-col items-center justify-center h-full p-0">
              <img className="w-[57px] h-[57px]" alt="Presupuesto" src="/icons/coins.png" />
              <span className="mt-2 text-sm text-black">Calcular nuevo presupuesto</span>
            </CardContent>
          </Card>

        </div>

        <div className="mt-4 flex justify-between">
          <div className="text-white text-xl">Subir nuevo archivo:</div>
          <div className="text-white text-xl">Calcular nuevo presupuesto:</div>
        </div>

        {/* Tabla de archivos */}
        <div className="mt-8">
          <div className="bg-[#393737] h-[25px] flex items-center px-4">
            <div className="text-white text-xs ml-[83px]">Name</div>
            <div className="text-white text-xs ml-auto">| Last opened by you</div>
          </div>

          <Table>
            <TableBody>
              {fileData.map((file) => (
                <TableRow
                  key={file.id}
                  className={`${
                    file.id % 2 === 0 ? "bg-[#736f6f]" : "bg-[#5a5858]"
                  } h-[66px] rounded-[10px] cursor-pointer hover:opacity-80`}
                  onClick={() => router.push(`/archivo/${file.id}`)}
                >
                  <TableCell className="w-[42px] p-0 pl-4">
                    <div className="w-[42px] h-[41px] flex items-center justify-center">
                      <img className="w-7 h-[34px]" alt="File Icon" src="/icons/document.png" />
                    </div>
                  </TableCell>
                  <TableCell className="p-0">
                    <div>
                      <div className="text-white text-base">{file.name}</div>
                      <div className="text-white text-xs">{file.creationDate}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right p-0 pr-8">
                    <div className="text-white text-base">{file.date}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
