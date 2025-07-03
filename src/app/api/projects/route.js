import { NextResponse } from 'next/server';
import api from '@/utils/axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('🔄 Creando nuevo proyecto:');
    
    const response = await api.post('/projects/', body);
    console.log('✅ Proyecto creado exitosamente:');
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('❌ Error creando proyecto:', error.message);
    return NextResponse.json(
      error.response?.data || { error: 'Internal server error' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function GET(request) {
  try {
    const response = await api.get('/projects/');
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      error.response?.data || { error: 'Internal server error' },
      { status: error.response?.status || 500 }
    );
  }
} 