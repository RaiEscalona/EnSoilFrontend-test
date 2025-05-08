'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  const [projects, setProjects] = useState(initialProjects);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simulate API call
    // TODO: Replace with actual API call when backend is ready
    /*
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    const newProject = await response.json();
    */
    
    // Simulated response
    const newProject = {
      id: projects.length + 1,
      ...formData,
      drillingPointsCount: 0,
      zones: []
    };
    
    setProjects([...projects, newProject]);
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: ''
    });
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
                  {project.startDate} - {project.endDate}
                </p>
                <p className="text-sm text-gray-500">
                  Puntos de perforación: {project.drillingPointsCount}
                </p>
                <div className="mt-2">
                  <span className="text-sm font-medium">Zonas:</span>
                  {project.zones.map(zone => (
                    <span key={zone.id} className="ml-2 text-sm text-gray-600">
                      {zone.name}
                    </span>
                  ))}
                </div>
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