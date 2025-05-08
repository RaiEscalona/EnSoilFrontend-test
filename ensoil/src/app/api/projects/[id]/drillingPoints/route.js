import { NextResponse } from 'next/server';
import api from '@/utils/axios';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log(`🔄 Obteniendo puntos de perforación para el proyecto ${id}`);
    
    const response = await api.get(`/projects/${id}/drillingPoints`);
    console.log(`✅ Puntos de perforación obtenidos exitosamente para el proyecto ${id}:`, response.data);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`❌ Error obteniendo puntos de perforación para el proyecto ${id}:`, error.response?.data || error.message);
    return NextResponse.json(
      error.response?.data || { error: 'Internal server error' },
      { status: error.response?.status || 500 }
    );
  }
} 