'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/utils/axios';
import "./projects.css";

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
        const response = await api.get('/projects');
        console.log('✅ Proyectos cargados exitosamente:', response.data);
        setProjects(response.data.projects);
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
      
      const response = await api.post('/projects', {
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
    <div className="projects-bg">
      <div className="projects-container">
        <h1 className="projects-title">Proyectos</h1>
        {/* Create Project Form */}
        <div className="create-project-form">
          <h2 className="projects-subtitle">Crear Nuevo Proyecto</h2>
          <form onSubmit={handleSubmit} className="form-fields">
            <div>
              <label>Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-dates">
              <div>
                <label>Fecha de Inicio</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Fecha de Fin</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="project-map-btn project-create-btn"
            >
              Crear Proyecto
            </button>
          </form>
        </div>
        {/* Projects List */}
        <div className="projects-list">
          <h2 className="projects-subtitle">Proyectos Existentes</h2>
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-content">
                <div>
                  <h3 className="project-card-title">{project.name}</h3>
                  <p className="project-card-desc">{project.description}</p>
                  <p className="project-card-dates">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/projects/${project.id}/map`}
                  className="project-map-btn"
                >
                  Ver Mapa
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 