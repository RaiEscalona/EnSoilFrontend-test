'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/utils/axios';

// Simulated projects data
const initialProjects = [
  {
    id: 1,
    name: "Proyecto Norte",
    description: "Estudio geológico 2025",
    startDate: "2025-05-01",
    endDate: "2025-10-30",
    drillingPointsCount: 5,
    zones: [
      { id: 1, name: "Zona A" },
      { id: 2, name: "Zona B" }
    ]
  }
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log('🔄 Cargando lista de proyectos');
        const response = await api.get('/api/projects');
        console.log('✅ Proyectos cargados exitosamente:', response.data);
        setProjects(response.data);
      } catch (error) {
        console.error('❌ Error cargando proyectos:', error.response?.data || error.message);
      }
    };

    fetchProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('🔄 Creando nuevo proyecto:', formData);
      
      const response = await api.post('/api/projects', {
        name: formData.name,
        description: formData.description,
        startDate: `${formData.startDate}T00:00:00-03:00`,
        endDate: `${formData.endDate}T00:00:00-03:00`
      });

      console.log('✅ Proyecto creado exitosamente:', response.data);
      
      setProjects([...projects, response.data]);
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: ''
      });
    } catch (error) {
      console.error('❌ Error creando proyecto:', error.response?.data || error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Proyectos</h1>
      
      {/* Create Project Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Crear Nuevo Proyecto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Crear Proyecto
          </button>
        </form>
      </div>
      
      {/* Projects List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Proyectos Existentes</h2>
        {projects.map((project) => (
          <div key={project.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <p className="text-gray-600">{project.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                </p>
              </div>
              <Link
                href={`/projects/${project.id}/map`}
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Ver Mapa
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 