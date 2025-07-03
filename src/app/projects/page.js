'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import api from '@/utils/axios';
import "./projects.css";
import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
import ButtonComponent from '@/components/utils/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/ui/pagination";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        setProjects(response.data.projects);
      } catch (error) {
        console.error('❌ Error cargando proyectos:', error.response?.data || error.message);
      }
    };
    fetchProjects();
  }, []);

  // Normaliza texto para búsqueda (sin espacios y minúsculas)
  const normalize = (str) => str.replace(/\s+/g, "").toLowerCase();

  // Filtrado reactivo por nombre
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;
    return projects.filter(project =>
      normalize(project.name).includes(normalize(searchTerm))
    );
  }, [projects, searchTerm]);

  // Cálculos de paginación sobre los proyectos filtrados
  const totalItems = filteredProjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = useMemo(() => {
    return filteredProjects.slice(startIndex, endIndex);
  }, [filteredProjects, startIndex, endIndex]);

  // Función para generar números de página
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <WithSidebarLayout>
      <div className="projects-container">
        <div className="text-h2">Proyectos</div>
        <br />
        {/* Controles de paginación y barra de búsqueda */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-200">Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={e => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-20 bg-white border border-gray-300 text-gray-900 rounded px-2 py-1 cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={20}>20</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-200">elementos por página</span>
          </div>
          <div className="flex-1 flex justify-center">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="max-w-xs w-full border border-gray-300 rounded px-2 py-1"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-200 text-center sm:text-right">
            Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} resultados
          </div>
        </div>
        {/* Projects List */}
        <div className="projects-list">
          {paginatedData.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-content">
                <div>
                  <div className="project-card-title text-black dark:text-white">{project.name}</div>
                  <p className="project-card-desc text-base dark:text-quaternary">{project.description}</p>
                  <p className="project-card-dates">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </div>
                <ButtonComponent label="Ir al proyecto" route={`/projects/${project.id}/map`}></ButtonComponent>
              </div>
            </div>
          ))}
        </div>
        {/* Paginación estilizada */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {generatePageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className={currentPage === page ? "" : "cursor-pointer"}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </WithSidebarLayout>
  );
} 