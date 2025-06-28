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

    try {
      const methodData = {
        name: newMethod.name.trim(),
        matrixType: newMethod.matrixType.trim(),
        source: newMethod.source.trim(),
        laboratoryName: newMethod.laboratoryName
      };

      // Agregar projectId y cost solo si ambos están presentes
      if (newMethod.projectId && newMethod.cost) {
        methodData.projectId = parseInt(newMethod.projectId);
        methodData.cost = parseFloat(newMethod.cost);
      }

      const response = await api.post('/analysisMethods/', methodData);
      
      // Cerrar modal y limpiar formulario
      setIsDialogOpen(false);
      setNewMethod({ name: '', matrixType: '', source: '', laboratoryName: '', projectId: '', cost: '' });
      setCurrentPage(1);
      
      // Recargar la lista de métodos
      fetchAnalysisMethods();
      
      // Mostrar mensaje de éxito
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
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
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
      <div className="min-h-screen bg-gray-50">
        {showAlert && (
          <Alert 
            message={alertMessage} 
            onClose={() => setShowAlert(false)}
            duration={10000}
          />
        )}
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Métodos de Análisis
                </h1>
                <p className="text-lg text-gray-600">
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
                  <DialogContent className="sm:max-w-[425px] bg-white border-gray-200">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900">Agregar Nuevo Método de Análisis</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name" className="text-gray-700">
                          Nombre del Método <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={newMethod.name}
                          onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ej: Metales, pH/CE, etc."
                          className="bg-white border-gray-300 text-gray-900"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="matrixType" className="text-gray-700">
                          Tipo de Matriz <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="matrixType"
                          value={newMethod.matrixType}
                          onChange={(e) => setNewMethod(prev => ({ ...prev, matrixType: e.target.value }))}
                          placeholder="Ej: Suelo, Agua, Aire, Sedimento, etc."
                          className="bg-white border-gray-300 text-gray-900"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="source" className="text-gray-700">
                          Fuente <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="source"
                          value={newMethod.source}
                          onChange={(e) => setNewMethod(prev => ({ ...prev, source: e.target.value }))}
                          placeholder="Ej: Método ALS 8270D"
                          className="bg-white border-gray-300 text-gray-900"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="laboratoryName" className="text-gray-700">
                          Nombre del Laboratorio <span className="text-red-500">*</span>
                        </Label>
                        <Select value={newMethod.laboratoryName} onValueChange={(value) => setNewMethod(prev => ({ ...prev, laboratoryName: value }))}>
                          <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                            <SelectValue placeholder="Seleccionar laboratorio" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200">
                            {availableLaboratories.map((laboratory) => (
                              <SelectItem 
                                key={laboratory} 
                                value={laboratory} 
                                className="text-gray-900 hover:bg-gray-100"
                              >
                                {laboratory}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="projectId" className="text-gray-700">ID del Proyecto (opcional)</Label>
                          <Input
                            id="projectId"
                            type="number"
                            value={newMethod.projectId}
                            onChange={(e) => setNewMethod(prev => ({ ...prev, projectId: e.target.value }))}
                            placeholder="Ej: 5"
                            className="bg-white border-gray-300 text-gray-900"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cost" className="text-gray-700">Costo (opcional)</Label>
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
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-300 text-gray-700">
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
              <span className="text-sm text-gray-600">Mostrar:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(parseInt(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-20 bg-white border-gray-300 text-gray-900 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="5" className="text-gray-900 hover:bg-gray-100">5</SelectItem>
                  <SelectItem value="10" className="text-gray-900 hover:bg-gray-100">10</SelectItem>
                  <SelectItem value="20" className="text-gray-900 hover:bg-gray-100">20</SelectItem>
                  <SelectItem value="50" className="text-gray-900 hover:bg-gray-100">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">elementos por página</span>
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
                className="max-w-xs w-full border-gray-300"
              />
            </div>
            <div className="text-sm text-gray-600 text-center sm:text-right">
              Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} resultados
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo de Matriz</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Laboratorio</TableHead>
                  <TableHead>Costo Actual (UF)</TableHead>
                  <TableHead>Costo Promedio (UF)</TableHead>
                  <TableHead>Historial de Costos</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell>{method.matrixType}</TableCell>
                    <TableCell className="max-w-xs truncate" title={method.source}>
                      {method.source}
                    </TableCell>
                    <TableCell>{getLaboratoryName(method.laboratory)}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatUF(getCurrentCost(method.relatedProjects))}
                    </TableCell>
                    <TableCell className="text-blue-600">
                      {formatUF(getAverageCost(method.relatedProjects))}
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:scale-105"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver ({method.relatedProjects?.length || 0})
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-white border-gray-200">
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">Historial de Costos - {method.name}</h4>
                            <div className="max-h-60 overflow-y-auto">
                              {method.relatedProjects && method.relatedProjects.length > 0 ? (
                                <div className="space-y-1">
                                  {method.relatedProjects.map((project, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">
                                          {project.projectName}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          Proyecto ID: {project.projectId}
                                        </span>
                                      </div>
                                      <span className="font-medium text-green-600">
                                        {formatUF(project.cost)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm">No hay historial de costos disponible</p>
                              )}
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Promedio:</span>
                                <span className="font-semibold text-blue-600">
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
                        className="delete-btn p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 ease-in-out cursor-pointer"
                        title="Eliminar método"
                        style={{
                          transform: 'rotate(0deg) scale(1)',
                          transition: 'all 0.3s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'rotate(12deg) scale(1.1)';
                          e.currentTarget.style.color = '#dc2626';
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                          e.currentTarget.style.color = '#6b7280';
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
            <DialogContent className="sm:max-w-[500px] bg-white border-gray-200">
              <DialogHeader>
                <DialogTitle className="text-red-600 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Confirmar Eliminación
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Esta acción no se puede deshacer. Por favor, confirme que desea eliminar este método de análisis.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">⚠️ Advertencia Importante</h4>
                  <p className="text-red-700 text-sm mb-3">
                    Eliminar un método de análisis que se esté usando en proyectos puede generar inconsistencias en los datos. 
                    Este botón debe usarse únicamente si se equivocaron en la creación de un método y están seguros de que no provocará ningún cambio indebido.
                  </p>
                  <p className="text-red-700 text-sm font-medium">
                    Método a eliminar: <span className="font-bold">{methodToDelete?.name}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deleteConfirmation" className="text-gray-700">
                    Para confirmar la eliminación, escriba exactamente: <span className="font-mono text-red-600">&quot;confirmar eliminar&quot;</span>
                  </Label>
                  <br />
                  <br />
                  <Input
                    id="deleteConfirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="confirmar eliminar"
                    className="bg-white border-gray-300 text-gray-900"
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
                  className="border-gray-300 text-gray-700"
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