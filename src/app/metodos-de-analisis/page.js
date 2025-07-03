'use client';

import { useState, useEffect, useMemo } from 'react';
import Alert from "@/components/Alert/Alert";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/ui/pagination";
import { ArrowLeft, Plus, DollarSign, Eye, ChevronDown, Trash2 } from "lucide-react";
import Link from "next/link";
import api from '@/utils/axios';
import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
import * as XLSX from 'xlsx';
import { Checkbox } from "@/components/ui/checkbox";

export default function MetodosAnalisis() {
  const [analysisMethods, setAnalysisMethods] = useState([]);
  const [availableLaboratories, setAvailableLaboratories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [newMethod, setNewMethod] = useState({
    name: '',
    matrixType: '',
    source: '',
    laboratoryName: '',
    projectId: '',
    cost: ''
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [shouldLinkProject, setShouldLinkProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  // Obtener métodos de análisis desde el backend
  const fetchAnalysisMethods = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analysisMethods/all');
      setAnalysisMethods(response.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setAlertMessage('Error al cargar los métodos de análisis');
      setShowAlert(true);
    }
  };

  // Obtener laboratorios disponibles desde el backend
  const fetchAvailableLaboratories = async () => {
    try {
      const response = await api.get('/analysisMethods/availableLaboratories');
      setAvailableLaboratories(response.data.data);
    } catch (error) {
      // No mostrar alerta, solo dejar vacío
    }
  };

  // Crear un nuevo método de análisis
  const createAnalysisMethod = async () => {
    if (!newMethod.name.trim() || !newMethod.matrixType.trim() || !newMethod.source.trim() || !newMethod.laboratoryName) {
      setAlertMessage('Todos los campos obligatorios deben estar completos');
      setShowAlert(true);
      return;
    }
    if (shouldLinkProject) {
      if (!selectedProject || !newMethod.cost) {
        setAlertMessage('Debes seleccionar un proyecto y un costo para vincular.');
        setShowAlert(true);
        return;
      }
    }
    try {
      const methodData = {
        name: newMethod.name.trim(),
        matrixType: newMethod.matrixType.trim(),
        source: newMethod.source.trim(),
        laboratoryName: newMethod.laboratoryName
      };
      if (shouldLinkProject && selectedProject && newMethod.cost) {
        methodData.projectId = selectedProject.id;
        methodData.cost = parseFloat(newMethod.cost);
      }
      const response = await api.post('/analysisMethods/', methodData);
      setIsDialogOpen(false);
      setNewMethod({ name: '', matrixType: '', source: '', laboratoryName: '', projectId: '', cost: '' });
      setCurrentPage(1);
      setShouldLinkProject(false);
      setSelectedProject(null);
      setProjectSearch("");
      fetchAnalysisMethods();
      setAlertMessage(`Método "${response.data.data.name}" creado exitosamente`);
      setShowAlert(true);
    } catch (error) {
      console.error('Error creating analysis method:', error);
      setAlertMessage('Error al crear el método de análisis');
      setShowAlert(true);
    }
  };

  // Eliminar un método de análisis
  const deleteAnalysisMethod = async () => {
    if (deleteConfirmation !== 'confirmar eliminar') return;
    try {
      await api.delete(`/analysisMethods/${methodToDelete.id}`);
      setIsDeleteDialogOpen(false);
      setMethodToDelete(null);
      setDeleteConfirmation('');
      fetchAnalysisMethods();
      setAlertMessage(`Método "${methodToDelete.name}" eliminado exitosamente`);
      setShowAlert(true);
    } catch (error) {
      setAlertMessage('Error al eliminar el método de análisis');
      setShowAlert(true);
    }
  };

  const openDeleteDialog = (method) => {
    setMethodToDelete(method);
    setDeleteConfirmation('');
    setIsDeleteDialogOpen(true);
  };

  useEffect(() => {
    fetchAnalysisMethods();
    fetchAvailableLaboratories();
    // Obtener proyectos para el menú
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        setProjects(response.data.projects);
      } catch (error) {
        // No mostrar alerta, solo dejar vacío
      }
    };
    fetchProjects();
  }, []);

  // Utilidades para tabla y paginación
  const normalize = (str) => str.replace(/\s+/g, "").toLowerCase();
  const filteredMethods = useMemo(() => {
    if (!searchTerm.trim()) return analysisMethods;
    return analysisMethods.filter(method =>
      normalize(method.name).includes(normalize(searchTerm))
    );
  }, [analysisMethods, searchTerm]);
  const totalItems = filteredMethods.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = useMemo(() => {
    return filteredMethods.slice(startIndex, endIndex);
  }, [filteredMethods, startIndex, endIndex]);
  const formatCurrency = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  const formatUF = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
    return Number(amount).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const getValidCosts = (relatedProjects) => Array.isArray(relatedProjects) ? relatedProjects.filter(p => typeof p.cost === 'number' && !isNaN(p.cost)) : [];
  const getAverageCost = (relatedProjects) => {
    const validCosts = getValidCosts(relatedProjects).map(p => p.cost);
    if (!validCosts.length) return 0;
    return validCosts.reduce((a, b) => a + b, 0) / validCosts.length;
  };
  const getCurrentCost = (relatedProjects) => {
    const validCosts = getValidCosts(relatedProjects);
    if (!validCosts.length) return 0;
    return validCosts[0].cost;
  };
  const getLaboratoryName = (laboratory) => laboratory && laboratory.name ? laboratory.name : 'Laboratorio no especificado';
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (loading) {
    return (
      <WithSidebarLayout>
        <div className="min-h-screen bg-[#f5f5f5] dark:bg-secondary text-black dark:text-white">
          <div className="container mx-auto px-4 py-8 text-black dark:text-white bg-[#f5f5f5] dark:bg-secondary">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Cargando métodos de análisis...</div>
            </div>
          </div>
        </div>
      </WithSidebarLayout>
    );
  }

  return (
    <WithSidebarLayout>
      <div className="min-h-screen text-black dark:text-white">
        {showAlert && (
          <Alert 
            message={alertMessage} 
            onClose={() => setShowAlert(false)}
            duration={10000}
          />
        )}
        <div className="container mx-auto px-4 py-8 text-black dark:text-white">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
                  Métodos de Análisis
                </h1>
                <p className="text-lg text-black dark:text-white">
                  Gestión y visualización de métodos de análisis disponibles
                </p>
              </div>
              <div className="flex gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-green-800 text-white cursor-pointer transition-all duration-200 hover:scale-105">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Método
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-[#f5f5f5] dark:bg-[#8f8d8d] text-black dark:text-white border border-[color:var(--foreground)]">
                    <DialogHeader>
                      <DialogTitle className="text-black dark:text-white">Agregar Nuevo Método de Análisis</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name" className="text-black dark:text-white">
                          Nombre del Método <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={newMethod.name}
                          onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ej: Metales, pH/CE, etc."
                          className="bg-quaternary border-[color:var(--foreground)] text-white"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="matrixType" className="text-black dark:text-white">
                          Tipo de Matriz <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="matrixType"
                          value={newMethod.matrixType}
                          onChange={(e) => setNewMethod(prev => ({ ...prev, matrixType: e.target.value }))}
                          placeholder="Ej: Suelo, Agua, Aire, Sedimento, etc."
                          className="bg-quaternary border-[color:var(--foreground)] text-white"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="source" className="text-black dark:text-white">
                          Fuente <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="source"
                          value={newMethod.source}
                          onChange={(e) => setNewMethod(prev => ({ ...prev, source: e.target.value }))}
                          placeholder="Ej: Método ALS 8270D"
                          className="bg-quaternary border-[color:var(--foreground)] text-white"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="laboratoryName" className="text-black dark:text-white">
                          Nombre del Laboratorio <span className="text-red-500">*</span>
                        </Label>
                        <Select value={newMethod.laboratoryName} onValueChange={(value) => setNewMethod(prev => ({ ...prev, laboratoryName: value }))}>
                          <SelectTrigger className="bg-[#f5f5f5] dark:bg-[#8f8d8d] border-[color:var(--foreground)] text-black dark:text-white">
                            <SelectValue placeholder="Seleccionar laboratorio" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#f5f5f5] dark:bg-[#8f8d8d] text-black dark:text-white border border-[color:var(--foreground)]">
                            {availableLaboratories.map((laboratory) => (
                              <SelectItem 
                                key={laboratory} 
                                value={laboratory} 
                                className="text-gray-900 hover:bg-[#3e4866]"
                              >
                                {laboratory}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Checkbox id="shouldLinkProject" checked={shouldLinkProject} onCheckedChange={setShouldLinkProject} />
                        <Label htmlFor="shouldLinkProject" className="text-gray-700 cursor-pointer">Vincular a un proyecto</Label>
                      </div>
                      {shouldLinkProject && (
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="grid gap-2">
                            <Label className="text-gray-700">Proyecto <span className="text-red-500">*</span></Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between border-gray-300 text-gray-900 bg-white">
                                  {selectedProject ? selectedProject.name : 'Seleccionar proyecto'}
                                  <ChevronDown className="w-4 h-4 ml-2" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-0 bg-white border border-gray-200 shadow-md z-[9999]">
                                <div className="p-3 border-b">
                                  <Input
                                    placeholder="Buscar proyecto..."
                                    value={projectSearch}
                                    onChange={e => setProjectSearch(e.target.value)}
                                    className="bg-white border-gray-300 text-gray-900"
                                    autoFocus
                                  />
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                  {projects.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase())).length === 0 ? (
                                    <div className="p-4 text-gray-500 text-center text-sm">No hay proyectos disponibles</div>
                                  ) : (
                                    projects.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase())).map(project => (
                                      <button
                                        key={project.id}
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900 border-b last:border-b-0 ${selectedProject && selectedProject.id === project.id ? 'bg-gray-100 font-semibold' : ''}`}
                                        onClick={() => {
                                          setSelectedProject(project);
                                        }}
                                      >
                                        <div className="font-medium">{project.name}</div>
                                        <div className="text-xs text-gray-500">ID: {project.id}</div>
                                      </button>
                                    ))
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="cost" className="text-gray-700">Costo (UF) <span className="text-red-500">*</span></Label>
                            <Input
                              id="cost"
                              type="number"
                              value={newMethod.cost}
                              onChange={(e) => setNewMethod(prev => ({ ...prev, cost: e.target.value }))}
                              placeholder="Ej: 777"
                              className="bg-white border-gray-300 text-gray-900"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[color:var(--foreground)] border-gray-300">
                        Cancelar
                      </Button>
                      <Button onClick={createAnalysisMethod} className="bg-primary hover:bg-green-800 text-white">
                        Crear Método
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  className="bg-primary hover:bg-green-800 text-white cursor-pointer transition-all duration-200 hover:scale-105"
                  onClick={() => {
                    // Exportar todos los métodos de análisis a Excel
                    const headers = [
                      'Nombre',
                      'Tipo de Matriz',
                      'Fuente',
                      'Laboratorio',
                      'Costo Actual (UF)',
                      'Costo Promedio (UF)'
                    ];
                    const rows = analysisMethods.map(method => [
                      method.name,
                      method.matrixType,
                      method.source,
                      getLaboratoryName(method.laboratory),
                      formatUF(getCurrentCost(method.relatedProjects)),
                      formatUF(getAverageCost(method.relatedProjects))
                    ]);
                    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Métodos de Análisis');
                    XLSX.writeFile(wb, 'metodos_analisis.xlsx');
                  }}
                >
                  Exportar datos a Excel
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-black dark:text-white">Mostrar:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(parseInt(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-20 bg-[#f5f5f5] dark:bg-[#8f8d8d] border-[color:var(--foreground)] text-black dark:text-white cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#f5f5f5] dark:bg-[#8f8d8d] text-black dark:text-white border border-[color:var(--foreground)]">
                  <SelectItem value="5" className="text-white hover:bg-[#3e4866]">5</SelectItem>
                  <SelectItem value="10" className="text-white hover:bg-[#3e4866]">10</SelectItem>
                  <SelectItem value="20" className="text-white hover:bg-[#3e4866]">20</SelectItem>
                  <SelectItem value="50" className="text-white hover:bg-[#3e4866]">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-black dark:text-white">elementos por página</span>
            </div>
            <div className="flex-1 flex justify-center">
              <Input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="max-w-xs w-full border-[color:var(--foreground)] text-black dark:text-white bg-[#f5f5f5] dark:bg-[#8f8d8d] placeholder:text-black dark:placeholder:text-white"
              />
            </div>
            <div className="text-sm text-black dark:text-white text-center sm:text-right">
              Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} resultados
            </div>
          </div>
          <div className="bg-[#f5f5f5] dark:bg-[#8f8d8d] rounded-lg shadow-md overflow-hidden text-black dark:text-white border border-[color:var(--foreground)] max-h-[calc(100vh-300px)] overflow-y-auto">
            <Table>
              <TableHeader className="dark:bg-base">
                <TableRow>
                  <TableHead className="text-black dark:text-white">Nombre</TableHead>
                  <TableHead className="text-black dark:text-white">Tipo de Matriz</TableHead>
                  <TableHead className="text-black dark:text-white">Fuente</TableHead>
                  <TableHead className="text-black dark:text-white">Laboratorio</TableHead>
                  <TableHead className="text-black dark:text-white">Costo Actual (UF)</TableHead>
                  <TableHead className="text-black dark:text-white">Costo Promedio (UF)</TableHead>
                  <TableHead className="text-black dark:text-white">Historial de Costos</TableHead>
                  <TableHead className="text-black dark:text-white">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium text-black dark:text-white">{method.name}</TableCell>
                    <TableCell className="text-black dark:text-white">{method.matrixType}</TableCell>
                    <TableCell className="max-w-xs truncate text-black dark:text-white" title={method.source}>
                      {method.source}
                    </TableCell>
                    <TableCell className="text-black dark:text-white">{getLaboratoryName(method.laboratory)}</TableCell>
                    <TableCell className="font-semibold text-green-400">
                      {formatUF(getCurrentCost(method.relatedProjects))}
                    </TableCell>
                    <TableCell className="text-blue-300">
                      {formatUF(getAverageCost(method.relatedProjects))}
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-[color:var(--foreground)] text-black dark:text-white dark:bg-base hover:bg-[#252424] hover:text-white cursor-pointer transition-all duration-200 hover:scale-105"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver ({method.relatedProjects?.length || 0})
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-[#f5f5f5] dark:bg-[#8f8d8d] text-black dark:text-white border border-[color:var(--foreground)]">
                          <div className="space-y-2">
                            <h4 className="font-medium text-black dark:text-white">Historial de Costos - {method.name}</h4>
                            <div className="max-h-60 overflow-y-auto">
                              {method.relatedProjects && method.relatedProjects.length > 0 ? (
                                <div className="space-y-1">
                                  {method.relatedProjects.map((project, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-300 dark:bg-secondary rounded">
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium text-black dark:text-white">
                                          {project.projectName}
                                        </span>
                                        <span className="text-xs text-black dark:text-white">
                                          Proyecto ID: {project.projectId}
                                        </span>
                                      </div>
                                      <span className="font-medium text-green-500">
                                        {formatUF(project.cost)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-black dark:text-white text-sm">No hay historial de costos disponible</p>
                              )}
                            </div>
                            <div className="pt-2 border-t border-[color:var(--foreground)]">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-black dark:text-white">Promedio:</span>
                                <span className="font-semibold text-blue-400 dark:text-blue-600">
                                  {formatUF(getAverageCost(method.relatedProjects))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => openDeleteDialog(method)}
                        className="delete-btn p-2 rounded-md text-black dark:text-white hover:text-red-400 hover:bg-red-900 transition-all duration-300 ease-in-out cursor-pointer"
                        title="Eliminar método"
                        style={{
                          transform: 'rotate(0deg) scale(1)',
                          transition: 'all 0.3s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'rotate(12deg) scale(1.1)';
                          e.currentTarget.style.color = '#dc2626';
                          e.currentTarget.style.backgroundColor = '#991b1b';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                          e.currentTarget.style.color = '#000';
                          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                            e.currentTarget.style.color = '#fff';
                          }
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[500px] bg-[#f5f5f5] dark:bg-[#8f8d8d] text-black dark:text-white border border-[color:var(--foreground)]">
              <DialogHeader>
                <DialogTitle className="text-red-400 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Confirmar Eliminación
                </DialogTitle>
                <DialogDescription className="text-black dark:text-white">
                  Esta acción no se puede deshacer. Por favor, confirme que desea eliminar este método de análisis.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-red-900 border border-red-400 rounded-lg p-4">
                  <h4 className="font-semibold text-red-200 mb-2">⚠️ Advertencia Importante</h4>
                  <p className="text-red-300 text-sm mb-3">
                    Eliminar un método de análisis que se esté usando en proyectos puede generar inconsistencias en los datos. 
                    Este botón debe usarse únicamente si se equivocaron en la creación de un método y están seguros de que no provocará ningún cambio indebido.
                  </p>
                  <p className="text-red-200 text-sm font-medium">
                    Método a eliminar: <span className="font-bold">{methodToDelete?.name}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deleteConfirmation" className="text-black dark:text-white">
                    Para confirmar la eliminación, escriba exactamente: <span className="font-mono text-red-400">&quot;confirmar eliminar&quot;</span>
                  </Label>
                  <br />
                  <br />
                  <Input
                    id="deleteConfirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="confirmar eliminar"
                    className="bg-quaternary border-[color:var(--foreground)] text-white placeholder:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setMethodToDelete(null);
                    setDeleteConfirmation('');
                  }} 
                  className="border-[color:var(--foreground)] text-white"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={deleteAnalysisMethod}
                  disabled={deleteConfirmation !== 'confirmar eliminar'}
                  className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Eliminar Método
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {totalPages > 1 && (
            <div className="mt-6">
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
                          className="cursor-pointer"
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
      </div>
    </WithSidebarLayout>
  );
} 