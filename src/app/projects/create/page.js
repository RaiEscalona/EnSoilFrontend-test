"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
import Button from '@/components/utils/button';
import Alert from '@/components/Alert/Alert';
import '../projects.css';

export default function CreateProjectPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'startDate' || name === 'endDate') {
      if (alert.type === 'error') setAlert({ show: false, message: '', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validación de fechas
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        setAlert({ show: true, message: 'La fecha de inicio debe ser anterior a la fecha de fin.', type: 'error' });
        return;
      }
    }
    try {
      console.log('🔄 Creando nuevo proyecto:', formData);
      const response = await api.post('/projects', {
        name: formData.name,
        description: formData.description,
        startDate: `${formData.startDate}T00:00:00-03:00`,
        endDate: `${formData.endDate}T00:00:00-03:00`
      });
      console.log('✅ Proyecto creado exitosamente:', response.data);
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: ''
      });
      setAlert({ show: true, message: 'Proyecto creado exitosamente.', type: 'success' });
      // Redirigir a la página del proyecto recién creado
      if (response.data && response.data.id) {
        setIsRedirecting(true);
        setTimeout(() => {
          router.push(`/projects/${response.data.id}/map`);
        }, 1200);
      }
    } catch (error) {
      setAlert({ show: true, message: 'Error creando proyecto.', type: 'error' });
      console.error('❌ Error creando proyecto:', error.response?.data || error.message);
    }
  };

  return (
    <WithSidebarLayout>
      <div className="projects-container">
        <div className="create-project-form">
          <div className="text-h3">Crear Nuevo Proyecto</div>
          {alert.show && (
            <Alert
              message={alert.message}
              onClose={() => setAlert({ ...alert, show: false })}
              duration={5000}
              type={alert.type}
            />
          )}
          {isRedirecting && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="loader mb-4" style={{ border: '4px solid #e5e7eb', borderTop: '4px solid #22c55e', borderRadius: '50%', width: 48, height: 48, animation: 'spin 1s linear infinite' }}></div>
              <div className="text-green-700 text-lg font-semibold">Redirigiendo al nuevo proyecto...</div>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            </div>
          )}
          {!isRedirecting && (
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
          )}
        </div>
      </div>
    </WithSidebarLayout>
  );
} 