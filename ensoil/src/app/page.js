'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { UploadForm } from "@/components/ExcelForm";

export default function VistaPrincipal() {
  const router = useRouter();

    // Acá se crea la constante de la ruta para la subida de archivos al backend
    const apiUrl = "http://localhost:3000";
  

  const fileData = [
    { id: 1, name: "Muestra Norte", date: "24/04/2025", creationDate: "23/04/2025" },
    { id: 2, name: "Muestra Sur", date: "22/04/2025", creationDate: "21/04/2025" },
    { id: 3, name: "Reporte Abril", date: "20/04/2025", creationDate: "19/04/2025" },
    { id: 4, name: "Muestra Marzo", date: "22/04/2025", creationDate: "21/04/2025" },
    { id: 5, name: "Reporte Febrero", date: "20/04/2025", creationDate: "19/04/2025" },
  ];

  return (
    <div className="flex h-screen bg-[#5A5757]">
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
          <UploadForm />

          {/* Calculate Budget */}
          <Card
            onClick={() => router.push('/calculo')}
            className="w-[369px] h-[177px] bg-[#b2abab] rounded-[14px] border-none flex flex-col justify-center items-center cursor-pointer hover:opacity-90">
            <div className="flex flex-col items-center justify-center">
              <img className="w-[57px] h-[57px] object-contain mt-[4px]" src="/icons/file-invoice-dollar.png" alt="Presupuesto" />
              <span className="mt-2 text-sm text-black text-center">Calcular nuevo presupuesto</span>
            </div>
          </Card>

        </div>

        {/* Tabla de archivos */}
        <div className="mt-8">
        <div className="bg-[#2f2d2d] h-[25px] flex items-center px-21 ml-[-16px] mr-[-16px]">

            <div className="text-white text-xs">Name</div>
            <div className="ml-auto text-white text-xs">| Last opened by you</div>
        </div>

        <Table>
          <TableBody>
            {fileData.map((file) => (
              <TableRow
              key={file.id}
              onClick={() => router.push(`/archivo/${file.id}`)}
              className="cursor-pointer"
            >
              <TableCell colSpan={3} className="p-0">
                <div
                  className={`${
                    file.id % 2 === 0
                      ? "bg-[rgba(219,219,219,0.1)] hover:bg-[#626060]"
                      : "bg-[#5a5858] hover:bg-[#626060]"
                  } rounded-xl flex items-center justify-between h-[66px] transition-all`}
                >
                  <div className="w-[66px] flex items-center justify-center">
                    <img className="w-7 h-[34px]" alt="File Icon" src="/icons/document.png" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-base">{file.name}</div>
                    <div className="text-white text-xs">{file.creationDate}</div>
                  </div>
                  <div className="text-white text-base pr-23">{file.date}</div>
                </div>
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
