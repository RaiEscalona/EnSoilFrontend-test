'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/utils/axios';
import "./projects.css";
import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
import Button from '@/components/button';

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
        console.log(process.env.NEXT_PUBLIC_BACKEND_URL);
        console.log(api.defaults.baseURL);
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
    <WithSidebarLayout>
    <div className="dark:bg-secondary">

      <div className="projects-container">
        <div className="text-h2">Proyectos</div>
        <br />
        {/* Create Project Form */}
        <div className="create-project-form">
          <div className="text-h3">Crear Nuevo Proyecto</div>
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
              <label>Descripción del Proyecto</label>
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
            <Button label="Crear Proyecto" type="submit" size="h4" fullWidth={true}></Button>
          </form>
        </div>
        {/* Projects List */}
        <div className="projects-list">
          <br />
          <div className='text-h3 text-black dark:text-white'>Proyectos Existentes</div>
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-content">
                <div>
                  <div className="project-card-title text-black dark:text-white">{project.name}</div>
                  <p className="project-card-desc text-base dark:text-quaternary">{project.description}</p>
                  <p className="project-card-dates">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </div>
                <Button label="Ver Mapa" route={`/projects/${project.id}/map`}></Button>
                {/* <Link
                  href={`/projects/${project.id}/map`}
                  className="project-map-btn"
                >
                  Ver Mapa
                </Link> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </WithSidebarLayout>
  );
} 