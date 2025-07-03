'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
import api from '@/utils/axios';
import './map.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import CreatePoint from '@/components/CreatePoint/createPoint';
import ProjectMap from '@/components/ProjectMap/projectMap';
import Alert from '@/components/Alert/Alert';
import ButtonComponent from '@/components/utils/button';
import DrillingPointList from '@/components/DrillingPoint/DrillingPointList';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/ui/pagination';
import TabsButton from '@/components/utils/tabsButton';
import { DialogDescription, DialogFooter } from '@/ui/dialog';
import { DialogClose } from '@radix-ui/react-dialog';
import { UserAuth } from '@/components/Authentication/AuthContext';
import { getIdToken, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';

export default function ProjectMapPage() {
  const { id } = useParams();
  const [imageInfo, setImageInfo] = useState(null);
  const [drillingPoints, setDrillingPoints] = useState([]);
  const [showPointModal, setShowPointModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [newPointData, setNewPointData] = useState({
    tag: '',
    coordinates: {
      east: '',
      north: ''
    }
  });
  const [previewPoint, setPreviewPoint] = useState(null);
  const [mapScale, setMapScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  // Estado para zoom y pan en el modal
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [viewMode, setViewMode] = useState('points'); // 'points' o 'analysisMethods'
  const [analysisMethods, setAnalysisMethods] = useState([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisCurrentPage, setAnalysisCurrentPage] = useState(1);
  const [analysisItemsPerPage, setAnalysisItemsPerPage] = useState(10);
  
  // Estados para el modal de edición de costo
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [editCost, setEditCost] = useState('');
  const [isUpdatingCost, setIsUpdatingCost] = useState(false);
  
  // Estados para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMethod, setDeletingMethod] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Estados para vincular método de análisis
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [allAnalysisMethods, setAllAnalysisMethods] = useState([]);
  const [linkSearch, setLinkSearch] = useState('');
  const [linkCandidates, setLinkCandidates] = useState([]);
  const [selectedLinkMethod, setSelectedLinkMethod] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkCost, setLinkCost] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  // Utilidad para formatear moneda UF
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(amount);
  };

  // Utilidad para obtener el costo promedio de un método
  const getAverageCost = (relatedProjects) => {
    if (!Array.isArray(relatedProjects) || relatedProjects.length === 0) return 0;
    const validCosts = relatedProjects
      .map(p => {
        if (typeof p.cost === 'number') return parseFloat(p.cost);
        if (typeof p.analysisCost === 'number') return parseFloat(p.analysisCost);
        return null;
      })
      .filter(c => typeof c === 'number' && !isNaN(c));
    if (!validCosts.length) return 0;
    return validCosts.reduce((a, b) => a + b, 0.0) / validCosts.length;
  };

  useEffect(() => {
    console.log("Drilling Point:", drillingPoints);
  }, [drillingPoints]);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        console.log(`🔄 Cargando datos del proyecto ${id}`);
        
        // Obtener información del proyecto (incluyendo nombre)
        const projectResponse = await api.get(`/projects`);
        const project = projectResponse.data.projects.find(p => p.id === parseInt(id));
        if (project) {
          setProjectName(project.name);
        }
        
        const response = await api.get(`/images/projects/map/${id}`);
        console.log('✅ Datos del proyecto cargados:', response.data);

        if (response.data && response.data.data && response.data.data.length > 0) {
          const map = response.data.data[0];
          setImageInfo({
            url: map.url,
            width: map.width || 800,
            height: map.height || 600,
            topLeft: {
              north: map.topLeftNorth,
              east: map.topLeftEast
            },
            bottomRight: {
              north: map.bottomRightNorth,
              east: map.bottomRightEast
            }
          });
        } else {
          setAlertMessage('Por favor, adjunta el mapa del proyecto. Proyecto sin mapa configurado, por favor, indique qué mapa desea utilizar.');
          setShowAlert(true);
        }
      } catch (error) {
        console.error('❌ Error cargando datos del proyecto:', error.response?.data || error.message);
        setAlertMessage('Error al cargar los datos del proyecto. Por favor, configura el mapa manualmente.');
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  // Mover fetchDrillingPoints fuera del useEffect para poder llamarlo después de crear un punto
  const fetchDrillingPoints = useCallback(async () => {
    if (!imageInfo) return;
    try {
      console.log(`🔄 Cargando puntos de perforación para el proyecto ${id}`);
      const response = await api.get(`/drillingpoints/all/${id}`);
      console.log(`✅ Puntos de perforación cargados exitosamente para el proyecto ${id}:`, response.data);
      setDrillingPoints(response.data.data.map(point => {
        const coords = point.coordinates.coordinates;
        const x = (coords[0] - imageInfo.topLeft.east) / (imageInfo.bottomRight.east - imageInfo.topLeft.east) * imageInfo.width;
        const y = (coords[1] - imageInfo.topLeft.north) / (imageInfo.bottomRight.north - imageInfo.topLeft.north) * imageInfo.height;
        console.log('Graficando punto:', { id: point.id, tag: point.tag, coords, x, y });
        return {
          ...point,
          clickPosition: { x, y }
        };
      }));
    } catch (error) {
      console.error(`❌ Error cargando puntos de perforación para el proyecto ${id}:`, error.response?.data || error.message);
      setAlertMessage(error.response?.data?.error || 'Error al cargar los puntos de perforación.');
      setShowAlert(true);
    }
  }, [imageInfo, id]);

  useEffect(() => {
    if (id && imageInfo) {
      fetchDrillingPoints();
    }
  }, [id, imageInfo, fetchDrillingPoints]);

  const handleCreatePoint = async () => {
    if (!newPointData.tag || !newPointData.coordinates.east || !newPointData.coordinates.north) return;

    try {
      const response = await api.post('/drillingPoints', {
        projectId: id,
        tag: newPointData.tag,
        coordinates: {
          type: "Point",
          coordinates: [parseFloat(newPointData.coordinates.east), parseFloat(newPointData.coordinates.north)]
        },
        method: "Diamond drilling",
        dateTime: new Date().toISOString(),
        comments: "Punto creado manualmente"
      });

      // Vuelve a cargar los puntos desde el backend para asegurar consistencia
      await fetchDrillingPoints();

      setShowPointModal(false);
      setAlertMessage(`${newPointData.tag} creado correctamente en las coordenadas ${newPointData.coordinates.east}, ${newPointData.coordinates.north}`);
      setShowAlert(true);
      setNewPointData({ tag: '', coordinates: { east: '', north: '' } });
      setPreviewPoint(null);
      setMapScale(1);
    } catch (error) {
      console.error('❌ Error creando punto:', error.response?.data || error.message);
      setAlertMessage(error.response?.data?.error || 'Error al crear el punto.');
      setShowAlert(true);
    }
  };

  const handleMapDataReady = (data) => {
    setImageInfo(data);
  };

  const handleOpenCreatePointModal = () => {
    console.log('🔄 Intentando abrir modal de creación de punto');
    console.log('Estado actual de showPointModal:', showPointModal);
    
    setNewPointData({
      tag: '',
      coordinates: {
        east: '',
        north: ''
      }
    });
    setPreviewPoint(null);
    setMapScale(1);
    setShowPointModal(true);
    
    console.log('✅ Modal abierto, nuevo estado de showPointModal:', true);
  };

  // Agregar un useEffect para monitorear cambios en showPointModal
  useEffect(() => {
    console.log('🔄 showPointModal cambió a:', showPointModal);
  }, [showPointModal]);

  useEffect(() => {
    if (showPointModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showPointModal]);

  // Cuando se cargan los puntos, selecciona todos por defecto
  useEffect(() => {
    if (drillingPoints && drillingPoints.length > 0) {
      setSelectedPoints(drillingPoints.map(p => p.id));
    }
  }, [drillingPoints]);

  function exportSelectedPointsToCSV(project, points) {
    let csv = '';
    // Datos del proyecto
    csv += 'ID Proyecto,"URL Imagen"\n';
    csv += `${project.id},"${project.url}"\n\n`;
    // Encabezado de la tabla de puntos
    if (points.length > 0) {
      const headers = Object.keys(points[0]);
      csv += headers.join(',') + '\n';
      points.forEach(point => {
        csv += headers.map(h => JSON.stringify(point[h] ?? '')).join(',') + '\n';
      });
    }
    return csv;
  }

  function exportSelectedPointsToExcel(project, points) {
    // Hoja 1: Datos del proyecto
    const projectSheet = [
      ['ID Proyecto', 'URL Imagen'],
      [project.id, project.url],
    ];
    // Hoja 2: Puntos seleccionados
    let pointSheet = [];
    if (points.length > 0) {
      // Filtrar y transformar los datos
      const headers = Object.keys(points[0])
        .filter(h => h !== 'comments' && h !== 'dateTime' && h !== 'coordinates' && h !== 'project' && h !== 'clickPosition')
        .concat(['east', 'north']);
      pointSheet.push(headers);
      points.forEach(point => {
        const row = headers.map(h => {
          if (h === 'east') {
            return point.coordinates?.coordinates?.[0] ?? '';
          } else if (h === 'north') {
            return point.coordinates?.coordinates?.[1] ?? '';
          } else {
            return point[h] ?? '';
          }
        });
        pointSheet.push(row);
      });
    } else {
      pointSheet.push(['No hay puntos seleccionados']);
    }
    // Crear libro y hojas
    const wb = XLSX.utils.book_new();
    const wsProject = XLSX.utils.aoa_to_sheet(projectSheet);
    const wsPoints = XLSX.utils.aoa_to_sheet(pointSheet);
    // Ajuste de ancho de columna (opcional)
    wsPoints['!cols'] = pointSheet[0].map(() => ({ wch: 20 }));
    XLSX.utils.book_append_sheet(wb, wsProject, 'Proyecto');
    XLSX.utils.book_append_sheet(wb, wsPoints, 'Puntos');
    // Generar y descargar
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `proyecto_${project.id}_puntos.xlsx`);
  }

  // Fetch analysis methods
  const fetchAnalysisMethods = useCallback(async () => {
    setLoadingAnalysis(true);
    try {
      const response = await api.get(`/analysisMethods/${id}`);
      setAnalysisMethods(response.data.data);
    } catch (error) {
      setAnalysisMethods([]);
      setAlertMessage('Error al cargar los métodos de análisis.');
      setShowAlert(true);
    } finally {
      setLoadingAnalysis(false);
    }
  }, [id]);

  useEffect(() => {
    if (viewMode === 'analysisMethods') {
      fetchAnalysisMethods();
    }
  }, [viewMode, fetchAnalysisMethods]);

  // Paginación para métodos de análisis
  const analysisTotalItems = analysisMethods.length;
  const analysisTotalPages = Math.ceil(analysisTotalItems / analysisItemsPerPage);
  const analysisStartIndex = (analysisCurrentPage - 1) * analysisItemsPerPage;
  const analysisEndIndex = analysisStartIndex + analysisItemsPerPage;
  const paginatedAnalysisMethods = analysisMethods.slice(analysisStartIndex, analysisEndIndex);
  const generateAnalysisPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    if (analysisTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= analysisTotalPages; i++) pages.push(i);
    } else {
      if (analysisCurrentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(analysisTotalPages);
      } else if (analysisCurrentPage >= analysisTotalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = analysisTotalPages - 3; i <= analysisTotalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = analysisCurrentPage - 1; i <= analysisCurrentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(analysisTotalPages);
      }
    }
    return pages;
  };

  // Función para manejar la actualización del costo
  const handleUpdateCost = async () => {
    if (!editingMethod || !editCost) return;
    
    setIsUpdatingCost(true);
    try {
      const response = await api.patch(`/analysisMethods/${editingMethod.id}`, {
        name: editingMethod.name,
        matrixType: editingMethod.matrixType,
        source: editingMethod.source,
        laboratoryName: editingMethod.labName,
        projectId: parseInt(id),
        cost: parseFloat(editCost)
      });

      // Actualizar la lista de métodos de análisis
      setAnalysisMethods(prevMethods => 
        prevMethods.map(method => 
          method.id === editingMethod.id 
            ? { ...method, projectCost: parseFloat(editCost) }
            : method
        )
      );

      setShowEditModal(false);
      setEditingMethod(null);
      setEditCost('');
      setAlertMessage('Costo actualizado correctamente');
      setShowAlert(true);
    } catch (error) {
      console.error('Error actualizando costo:', error);
      setAlertMessage(error.response?.data?.error || 'Error al actualizar el costo');
      setShowAlert(true);
    } finally {
      setIsUpdatingCost(false);
    }
  };

  // Función para cerrar el modal de edición
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingMethod(null);
    setEditCost('');
  };

  // Función para abrir el modal de confirmación de eliminación
  const handleOpenDeleteModal = (method) => {
    setDeletingMethod(method);
    setShowDeleteModal(true);
    setDeleteConfirmation('');
  };

  // Función para manejar la desasociación de un método de análisis
  const handleDisassociateProject = async () => {
    if (!deletingMethod) return;
    setIsDeleting(true);
    try {
      const response = await api.delete(`/analysisMethods/disassociateProject/${deletingMethod.id}/${parseInt(id)}`);
      // Actualizar la lista de métodos de análisis
      setAnalysisMethods(prevMethods => 
        prevMethods.filter(method => method.id !== deletingMethod.id)
      );
      setShowDeleteModal(false);
      setDeletingMethod(null);
      setDeleteConfirmation('');
      setAlertMessage('Método de análisis eliminado correctamente');
      setShowAlert(true);
    } catch (error) {
      console.error('Error eliminando método:', error);
      setAlertMessage(error.response?.data?.error || 'Error al eliminar el método de análisis');
      setShowAlert(true);
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para cerrar el modal de eliminación
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingMethod(null);
    setDeleteConfirmation('');
  };

  // Cargar todos los métodos de análisis y filtrar los no vinculados
  const fetchAllAnalysisMethods = useCallback(async () => {
    try {
      const response = await api.get('/analysisMethods/all');
      setAllAnalysisMethods(response.data.data);
    } catch (error) {
      setAlertMessage('Error al cargar todos los métodos de análisis');
      setShowAlert(true);
    }
  }, []);

  // Filtrar métodos no vinculados al proyecto actual
  useEffect(() => {
    if (!allAnalysisMethods.length) {
      setLinkCandidates([]);
      return;
    }
    const linkedIds = new Set(analysisMethods.map(m => m.id));
    const filtered = allAnalysisMethods.filter(m => !linkedIds.has(m.id));
    setLinkCandidates(filtered);
  }, [allAnalysisMethods, analysisMethods]);

  // Buscar por nombre ignorando mayúsculas y espacios
  const normalized = s => s.replace(/\s+/g, '').toLowerCase();
  const filteredLinkCandidates = linkSearch.trim()
    ? linkCandidates.filter(m => normalized(m.name).includes(normalized(linkSearch)))
    : linkCandidates;

  if (isLoading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <WithSidebarLayout>
    <div className="dark:bg-secondary map-page-container">
      <div className="map-header">
        <div className="text-h2">{projectName}</div>
        <ButtonComponent label={"Ir a Análisis"} route={`/projects/${id}/analysis`} size="h4" fullWidth={false}></ButtonComponent>
      </div>
      
      {showAlert && (
        <Alert
          message={alertMessage} 
          onClose={() => setShowAlert(false)} 
        />
      )}

        <ProjectMap 
          id={id}
          imageInfo={imageInfo} 
          handleMapDataReady={handleMapDataReady} 
          handleOpenCreatePointModal={handleOpenCreatePointModal} 
          drillingPoints={drillingPoints} 
          selectedPoints={selectedPoints} 
          showPointModal={showPointModal} />

      {/* Botones para cambiar la vista debajo del mapa */}
      <div className='m-5 pt-3 flex gap-4'>
        {/* <Button
          onClick={() => setViewMode('points')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
            viewMode === 'points' 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          Ver puntos de perforación
        </Button> */}
        {/* <Button
          onClick={() => setViewMode('analysisMethods')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
            viewMode === 'analysisMethods' 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          Ver métodos de análisis
        </Button> */}
        <TabsButton label={'Ver puntos de perforación'} onUse={viewMode == 'points'} onClick={() => setViewMode('points')} />
        <TabsButton label={'Ver métodos de análisis'} onUse={viewMode == 'analysisMethods'} onClick={() => setViewMode('analysisMethods')} />

      </div>
      {/* Vista condicional debajo del mapa */}
      {viewMode === 'points' && (
        <div className='m-5'>
          <div className="text-h3" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            Lista de Puntos de Perforación
            <ButtonComponent label={'Exportar puntos'} onClick={() => {
                if (!imageInfo) return;
                const selected = drillingPoints.filter(p => selectedPoints.includes(p.id));
                exportSelectedPointsToExcel({ id, url: imageInfo.url }, selected);
              }}/>
          </div>
          <DrillingPointList projectId={id} drillingPoints={drillingPoints} selectedPoints={selectedPoints} setSelectedPoints={setSelectedPoints} />
        </div>
      )}
      {viewMode === 'analysisMethods' && (
        <div className='m-5'>
          <div className="flex justify-between items-center mb-4">
            <div className="text-h3" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 16 }}>
              Métodos de Análisis del Proyecto
            </div>
            <Popover open={showLinkPopover} onOpenChange={open => {
              setShowLinkPopover(open);
              if (open && allAnalysisMethods.length === 0) fetchAllAnalysisMethods();
            }}>
              <PopoverTrigger asChild>
                <Button className="bg-primary hover:bg-green-800 text-white cursor-pointer transition-all duration-200 hover:scale-105">
                  Vincular método
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 bg-white border border-gray-200 shadow-md z-[9999]">
                <div className="p-3 border-b">
                  <Input
                    placeholder="Buscar método..."
                    value={linkSearch}
                    onChange={e => setLinkSearch(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900"
                    autoFocus
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredLinkCandidates.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center text-sm">No hay métodos disponibles</div>
                  ) : (
                    filteredLinkCandidates.map(method => (
                      <button
                        key={method.id}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900 border-b last:border-b-0"
                        onClick={() => {
                          setSelectedLinkMethod(method);
                          setShowLinkPopover(false);
                          setShowLinkModal(true);
                        }}
                      >
                        <div className="font-medium">{method.name}</div>
                        <div className="text-xs text-gray-500">
                          Laboratorio: {method.laboratory?.name || 'Sin laboratorio'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Costo promedio (UF) : {formatCurrency(getAverageCost(method.relatedProjects))}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {loadingAnalysis ? (
            <div>Cargando métodos de análisis...</div>
          ) : analysisMethods.length === 0 ? (
            <div className="text-center text-h4 py-12">
              No hay métodos de análisis vinculados a este proyecto actualmente
            </div>
          ) : (
            <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <span className="text-sm text-gray-600">Mostrar:</span>
              <select value={analysisItemsPerPage} onChange={e => { setAnalysisItemsPerPage(Number(e.target.value)); setAnalysisCurrentPage(1); }} className="cursor-pointer">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">elementos por página</span>
              <span className="text-sm text-gray-600">Mostrando {analysisStartIndex + 1} a {Math.min(analysisEndIndex, analysisTotalItems)} de {analysisTotalItems} resultados</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Matriz</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Laboratorio</TableHead>
                  <TableHead>Costo Actual (UF)</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAnalysisMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell>{method.name}</TableCell>
                    <TableCell>{method.matrixType}</TableCell>
                    <TableCell>{method.source}</TableCell>
                    <TableCell>{method.labName}</TableCell>
                    <TableCell>{method.projectCost}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-500 hover:text-blue-700 cursor-pointer"
                          onClick={() => {
                            setEditingMethod(method);
                            setShowEditModal(true);
                            setEditCost(method.projectCost.toString());
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                          onClick={() => handleOpenDeleteModal(method)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {analysisTotalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setAnalysisCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={`${analysisCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                      />
                    </PaginationItem>
                    {generateAnalysisPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === 'ellipsis' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => setAnalysisCurrentPage(page)}
                            isActive={analysisCurrentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setAnalysisCurrentPage(prev => Math.min(prev + 1, analysisTotalPages))}
                        className={`${analysisCurrentPage === analysisTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
            </>
          )}
        </div>
      )}
      {showPointModal && (<CreatePoint 
        imageInfo={imageInfo} 
        handleCreatePoint={handleCreatePoint} 
        mapScale={mapScale} 
        setMapScale={setMapScale} 
        previewPoint={previewPoint} 
        setPreviewPoint={setPreviewPoint} 
        newPointData={newPointData} 
        setNewPointData={setNewPointData} 
        showPointModal={showPointModal} 
        setShowPointModal={setShowPointModal}/>)}

      {/* Modal para editar costo del método de análisis */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px] bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Editar Costo del Método de Análisis</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="methodName" className="text-gray-700">
                Método
              </Label>
              <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2">
                <span className="text-sm text-gray-900 font-medium">
                  {editingMethod?.name}
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cost" className="text-gray-700">
                Costo (UF) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={editCost}
                onChange={(e) => setEditCost(e.target.value)}
                placeholder="Ingrese el nuevo costo"
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseEditModal} className="border-gray-300 text-gray-700">
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateCost} 
              disabled={isUpdatingCost || !editCost}
              className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUpdatingCost ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para confirmar desasociar el método de análisis */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[400px] bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Confirmar Desasociar Método de Análisis
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center text-gray-800 text-lg">
            ¿Deseas desasociar el método <span className="font-bold">{deletingMethod?.name}</span> de este proyecto?
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleCloseDeleteModal} 
              className="border-gray-300 text-gray-700"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleDisassociateProject}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {isDeleting ? 'Desasociando...' : 'Confirmar desasociar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para vincular método de análisis */}
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent className="sm:max-w-[425px] bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Vincular Método de Análisis</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="linkMethodName" className="text-gray-700">
                Método
              </Label>
              <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2">
                <span className="text-sm text-gray-900 font-medium">
                  {selectedLinkMethod?.name}
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="linkCost" className="text-gray-700">
                Costo (UF) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="linkCost"
                type="number"
                step="0.01"
                min="0"
                value={linkCost}
                onChange={e => setLinkCost(e.target.value)}
                placeholder="Ingrese el costo"
                className="bg-white border-gray-300 text-gray-900"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setShowLinkModal(false); setSelectedLinkMethod(null); setLinkCost(''); }} className="border-gray-300 text-gray-700">
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!selectedLinkMethod || !linkCost) return;
                setIsLinking(true);
                const payload = {
                  analysisMethodId: selectedLinkMethod.id,
                  projectId: parseInt(id),
                  cost: parseFloat(linkCost)
                };
                try {
                  console.log('Payload enviado:', payload);
                  await api.post('/analysisMethods/assignProjectCost', payload);
                  setShowLinkModal(false);
                  setSelectedLinkMethod(null);
                  setLinkCost('');
                  setAlertMessage('Método vinculado correctamente');
                  setShowAlert(true);
                  // Refrescar métodos de análisis vinculados
                  fetchAnalysisMethods();
                } catch (error) {
                  console.error('❌ Error al vincular método:', error?.response?.data || error);
                  setAlertMessage(error.response?.data?.error || 'Error al vincular el método');
                  setShowAlert(true);
                } finally {
                  setIsLinking(false);
                }
              }}
              disabled={isLinking || !linkCost}
              className="bg-primary hover:bg-green-800 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLinking ? 'Vinculando...' : 'Vincular'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <UnlinkUsers />
    </div>
    </WithSidebarLayout>
  );
} 

function UnlinkUsers() {
  const { user } = UserAuth();
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        const token = await getIdToken(user);
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const response = await api.get('/users/verify-admin', { headers });
        console.log('❕ Respuesta del backend:', response.data);
        if (response.data.success) {
          setAdmin(true);
        }
      } catch (error) {
        console.log('❌ Error en validación del token:', error);
        setAdmin(false);
      }
    });
    return () => unsubscribe();
  }, [user])

  if (admin) {
    return (
      <div className='flex justify-center'>
        <Dialog>
          <DialogTrigger asChild>
            <ButtonComponent label={'Desligar usuarios del proyecto'} isDelete />
          </DialogTrigger>
          <DialogContent className={'bg-base border-red-600'}>
            <DialogHeader>
              <DialogTitle>Desligar todos los usuarios del proyecto</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Se desligarán todos los permisos de jerarquía asociados al proyecto, es decir, ningún usuario estará asignado a un recurso. Esto no borrará los datos asociados a los recursos, solo libera a los usuarios del recurso asignado.
            </DialogDescription>
            <DialogFooter className="justify-self-center">
                <DialogClose asChild>
                    <ButtonComponent label={'Desligar usuarios'} isDelete={true} />
                </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}