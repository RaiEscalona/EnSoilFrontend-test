import { NextResponse } from 'next/server';
import api from '@/utils/axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('🔄 Creando nuevo proyecto:', body);
    
    const response = await api.post('/projects/', body);
    console.log('✅ Proyecto creado exitosamente:', response.data);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('❌ Error creando proyecto:', error.response?.data || error.message);
    return NextResponse.json(
      error.response?.data || { error: 'Internal server error' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function GET(request) {
  try {
    console.log('🔄 Obteniendo lista de proyectos');
    const response = await api.get('/projects/');
    console.log('✅ Proyectos obtenidos exitosamente:', response.data);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('❌ Error obteniendo proyectos:', error.response?.data || error.message);
    return NextResponse.json(
      error.response?.data || { error: 'Internal server error' },
      { status: error.response?.status || 500 }
    );
  }
} 