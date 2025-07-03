'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { UploadForm } from "@/components/Forms/ExcelForm";
import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
import BudgetForm from '@/components/Forms/BudgetForm';
import axios from "@/utils/axios"; 
import AnalysisFileItem from "@/components/utils/analysisFileItem";

export default function ExcelsPage() {
  const router = useRouter();
  const [fileData, setFileData] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/projects');
        if (Array.isArray(res.data.projects)) {
          const transformedData = res.data.projects.map(project => ({
            id: project.id,
            name: project.name,
            creationDate: new Date(project.createdAt).toLocaleDateString('es-CL'),
            date: new Date(project.updatedAt).toLocaleDateString('es-CL'),
          }));
          setFileData(transformedData);
        } else {
          console.error("⚠️ No se encontró data válida en projects");
        }
      } catch (error) {
        console.error("❌ Error al obtener proyectos:", error);
      }
    };
    fetchProjects();
  }, []);

  const handleNewUpload = () => {
    router.refresh();
  };

  return (
    <WithSidebarLayout>
      <div className="flex gap-8 m-5 items-start">
        <UploadForm onUpload={handleNewUpload} />
        <BudgetForm onAssign={router.refresh} />
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-11 items-center text-black dark:text-white bg-quaternary dark:bg-base p-2 text-h5">
          <div className="col-start-1 col-span-9 pl-28">Nombre</div>
          <div className="col-start-10 col-span-3 text-center">Fecha Creación</div>
        </div>

        <Table>
          <TableBody>
            {fileData.map((file) => (
              <TableRow
                key={file.id}
                onClick={() => router.push(`/analisis/${file.id}`)}
                className="cursor-pointer p-0"
              >
                <TableCell className="py-1" colSpan={11}>
                  <AnalysisFileItem name={file.name} date={file.date} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </WithSidebarLayout>
  );
}