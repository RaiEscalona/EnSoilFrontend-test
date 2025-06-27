import { NextResponse } from 'next/server';
import api from '@/utils/axios';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('🔄 Creando nuevo punto de perforación:', body);
    
    const response = await api.post('/drillingPoints/', body);
    console.log('✅ Punto de perforación creado exitosamente:', response.data);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('❌ Error creando punto de perforación:', error.response?.data || error.message);
    return NextResponse.json(
      error.response?.data || { error: 'Internal server error' },
      { status: error.response?.status || 500 }
    );
  }
} 