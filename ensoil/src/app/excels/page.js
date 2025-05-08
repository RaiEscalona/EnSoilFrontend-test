'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { UploadForm } from "@/components/ExcelForm";
import Sidebar from "@/components/sidebar";
import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
//import Image from "next/image";
import "./excels.css";

export default function ExcelsPage() {
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

  const fileData = [
    { id: 1, name: "Muestra Norte", date: "24/04/2025", creationDate: "23/04/2025" },
    { id: 2, name: "Muestra Sur", date: "22/04/2025", creationDate: "21/04/2025" },
    { id: 3, name: "Reporte Abril", date: "20/04/2025", creationDate: "19/04/2025" },
    { id: 4, name: "Muestra Marzo", date: "22/04/2025", creationDate: "21/04/2025" },
    { id: 5, name: "Reporte Febrero", date: "20/04/2025", creationDate: "19/04/2025" },
  ];

  return (
    <WithSidebarLayout>
      <div className="flex gap-8 mt-8">
        <UploadForm />
        <Card
          onClick={() => router.push('/calculo')}
          className="w-[369px] h-[177px] bg-[#b2abab] rounded-[14px] border-none flex flex-col justify-center items-center cursor-pointer hover:opacity-90"
        >
          <div className="flex flex-col items-center justify-center">
            <img className="w-[57px] h-[57px] object-contain mt-[4px]" src="/icons/file-invoice-dollar.png" alt="Presupuesto" />
            <span className="mt-2 text-sm text-black text-center">Calcular nuevo presupuesto</span>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <div className="bg-[#2f2d2d] h-[25px] flex items-center px-8 ml-[-16px] mr-[-16px]">
          <div className="text-white text-xs">Nombre</div>
          <div className="ml-auto text-white text-xs">| Última apertura</div>
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
                    <div className="text-white text-base pr-6">{file.date}</div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </WithSidebarLayout>
  );
}