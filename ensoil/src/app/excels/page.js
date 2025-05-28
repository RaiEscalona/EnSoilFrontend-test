'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { UploadForm } from "@/components/ExcelForm";
import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
import { File } from "lucide-react";

export default function ExcelsPage() {
  const router = useRouter();

  // Estado inicial vacío, sin muestras simuladas
  const [fileData, setFileData] = useState([]);

  // Recibe un objeto file generado al subir un archivo
  const handleNewUpload = (file) => {
    setFileData([file, ...fileData]);
  };

  return (
    <WithSidebarLayout>
      <div className="flex gap-8 mt-8">
        <UploadForm onUpload={handleNewUpload} />
        <Card
          onClick={() => router.push('/calculo')}
          className="w-[369px] h-[177px] bg-quaternary rounded-[14px] border-none flex flex-col justify-center items-center cursor-pointer hover:opacity-90"
        >
          <div className="flex flex-col items-center justify-center">
            <img className="w-[57px] h-[57px] object-contain mt-[4px]" src="/icons/file-invoice-dollar.png" alt="Presupuesto" />
            <span className="mt-2 text-sm text-black text-center">Calcular nuevo presupuesto</span>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <div className=" bg-quaternary dark:bg-base h-[25px] flex items-center px-8 ml-[-16px] mr-[-16px]">
          <div className="text-black dark:text-white text-h5">Nombre</div>
          <div className="ml-auto text-black dark:text-white text-h5">| Última apertura</div>
        </div>

        <Table>
          <TableBody>
            {fileData.map((file) => (
              <TableRow
                key={file.id}
                onClick={() => router.push(`/analysis/${file.id}`)}
                className="cursor-pointer text-black dark:text-white"
              >
                <TableCell colSpan={3} className="p-0">
                  <div
                    className={`${
                      file.id % 2 === 0
                        ? "bg-quaternary dark:bg-[#737070] hover:bg-tertiary"
                        : "bg-white dark:bg-secondary hover:bg-tertiary"
                    } rounded-xl flex items-center justify-between h-[66px] transition-all`}
                  >
                    <div className="w-[66px] flex items-center justify-center">
                      <File size={30} strokeWidth={1} />
                    </div>
                    <div className="flex-1">
                      <div className="text-black dark:text-white text-h5">{file.name}</div>
                      <div className="text-black dark:text-white text-p">{file.creationDate}</div>
                    </div>
                    <div className="text-black dark:text-white text-h5 pr-6">{file.date}</div>
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